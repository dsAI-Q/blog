// Cloudflare Pages 高级模式 Worker：
//   1) 静态资源原样返回，并手动补缓存头（用了 _worker.js 后 _headers 失效）
//   2) /edit/ 与 /edit/api/* 走 Basic 认证
//   3) /api/discuss/* 讨论区与阅读量接口，数据存 D1（不进 GitHub 仓库）

const REALM = 'Basic realm="dashai-edit", charset="UTF-8"';
const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
const nowSec = () => Math.floor(Date.now() / 1000);

function unauthorized() {
  return new Response('需要登录才能打开编辑器。', {
    status: 401,
    headers: { 'WWW-Authenticate': REALM, 'content-type': 'text/plain; charset=utf-8' },
  });
}

function guardEdit(request, env) {
  const password = env.EDIT_PASSWORD;
  const user = env.EDIT_USER || 'dashai';

  if (!password) {
    return new Response('编辑器未启用：Cloudflare 里没有配置 EDIT_PASSWORD。', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const header = request.headers.get('Authorization') || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    let decoded = '';
    try {
      decoded = atob(encoded);
    } catch {
      decoded = '';
    }
    const split = decoded.indexOf(':');
    if (split > 0) {
      const name = decoded.slice(0, split);
      const pass = decoded.slice(split + 1);
      if (name === user && pass === password) return null;
    }
  }
  return unauthorized();
}

function cacheControlFor(pathname) {
  if (pathname.startsWith('/_astro/')) return 'public, max-age=31536000, immutable';
  if (pathname.startsWith('/images/') || pathname.startsWith('/uploads/')) {
    return 'public, max-age=86400';
  }
  if (pathname === '/prompts-data.json') return 'public, max-age=600';
  if (pathname === '/rss.xml') return 'public, max-age=600';
  if (pathname.startsWith('/sitemap')) return 'public, max-age=3600';
  return 'public, max-age=0, must-revalidate';
}

/* ---------------- 讨论区工具 ---------------- */

const clean = (text, max) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
    .slice(0, max);
};

const cleanNick = (text) => clean(text, 24).replace(/[<>\n]/g, ' ').trim() || '匿名';

async function ipHash(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  const salt = env.DISCUSS_SALT || 'dashengai-discuss';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${ip}:${salt}`));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

async function hitBanned(env, text) {
  const { results } = await env.DB.prepare('SELECT word FROM discuss_banned').all();
  const lower = text.toLowerCase();
  return (results || []).some((row) => row.word && lower.includes(String(row.word).toLowerCase()));
}

async function checkRate(env, hash) {
  const t = nowSec();
  const recent = await env.DB.prepare('SELECT ts FROM discuss_rate WHERE ip_hash = ? ORDER BY ts DESC LIMIT 1')
    .bind(hash)
    .first();
  if (recent && t - recent.ts < 30) return '发得太快了，等 30 秒再试。';
  const day = await env.DB.prepare('SELECT COUNT(*) AS c FROM discuss_rate WHERE ip_hash = ? AND ts > ?')
    .bind(hash, t - 86400)
    .first();
  if ((day?.c ?? 0) >= 30) return '今天发得有点多，明天再来吧。';
  return null;
}

async function recordRate(env, hash) {
  const t = nowSec();
  await env.DB.prepare('INSERT INTO discuss_rate (ip_hash, ts) VALUES (?, ?)').bind(hash, t).run();
  if (Math.random() < 0.1) {
    await env.DB.prepare('DELETE FROM discuss_rate WHERE ts < ?').bind(t - 172800).run();
  }
}

async function submitEntry(request, env, kind) {
  if (!env.DB) return json({ error: '讨论区还没启用：数据库未绑定' }, 503);

  const raw = await request.text();
  if (raw.length > 20000) return json({ error: '内容太长' }, 413);
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ error: '请求格式不对' }, 400);
  }

  if (clean(payload.hp, 50)) return json({ error: '提交失败' }, 400); // 蜜罐字段

  const hash = await ipHash(request, env);
  const limited = await checkRate(env, hash);
  if (limited) return json({ error: limited }, 429);

  const nickname = cleanNick(payload.nickname);
  let ref = '';
  let title = '';
  let body = '';

  if (kind === 'thread') {
    title = clean(payload.title, 80);
    body = clean(payload.body, 4000);
    if (title.length < 4) return json({ error: '标题至少 4 个字' }, 400);
  } else if (kind === 'reply') {
    const threadId = Number.parseInt(payload.threadId, 10);
    const target = Number.isFinite(threadId)
      ? await env.DB.prepare("SELECT id FROM discuss_entries WHERE kind = 'thread' AND status = 'visible' AND id = ?")
          .bind(threadId)
          .first()
      : null;
    if (!target) return json({ error: '帖子不存在或已被删除' }, 404);
    ref = String(threadId);
    body = clean(payload.body, 2000);
  } else {
    ref = clean(payload.slug, 120).replace(/[^\w-]/g, '');
    if (!ref) return json({ error: '文章标识不对' }, 400);
    body = clean(payload.body, 1200);
  }

  if (body.length < 2) return json({ error: '内容太短' }, 400);

  const pending = env.DISCUSS_MODERATE === 'true' || (await hitBanned(env, `${title} ${body}`));
  const status = pending ? 'pending' : 'visible';
  const t = nowSec();

  const result = await env.DB.prepare(
    'INSERT INTO discuss_entries (kind, ref, title, nickname, body, created_at, status, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(kind, ref, title, nickname, body, t, status, hash)
    .run();

  await recordRate(env, hash);

  return json({
    ok: true,
    id: result.meta?.last_row_id ?? null,
    status,
    message: pending ? '已提交，审核通过后显示。' : '发布成功。',
  });
}

async function listThreads(env, url) {
  if (!env.DB) return json({ error: '讨论区还没启用' }, 503);
  const limit = Math.min(Math.max(Number.parseInt(url.searchParams.get('limit') ?? '30', 10) || 30, 1), 100);
  const { results } = await env.DB.prepare(
    `SELECT t.id, t.title, t.body, t.nickname, t.created_at,
            (SELECT COUNT(*) FROM discuss_entries r
              WHERE r.kind = 'reply' AND r.ref = CAST(t.id AS TEXT) AND r.status = 'visible') AS replies
       FROM discuss_entries t
      WHERE t.kind = 'thread' AND t.status = 'visible'
      ORDER BY t.id DESC
      LIMIT ?`,
  )
    .bind(limit)
    .all();
  return json({ threads: results ?? [] });
}

async function getThread(env, url) {
  if (!env.DB) return json({ error: '讨论区还没启用' }, 503);
  const id = Number.parseInt(url.searchParams.get('id') ?? '', 10);
  if (!Number.isFinite(id)) return json({ error: '参数不对' }, 400);

  const thread = await env.DB.prepare(
    "SELECT id, title, body, nickname, created_at FROM discuss_entries WHERE kind = 'thread' AND status = 'visible' AND id = ?",
  )
    .bind(id)
    .first();
  if (!thread) return json({ error: '帖子不存在或已被删除' }, 404);

  const { results } = await env.DB.prepare(
    "SELECT id, nickname, body, created_at FROM discuss_entries WHERE kind = 'reply' AND ref = ? AND status = 'visible' ORDER BY id ASC LIMIT 300",
  )
    .bind(String(id))
    .all();

  return json({ thread, replies: results ?? [] });
}

async function listComments(env, url) {
  if (!env.DB) return json({ error: '讨论区还没启用' }, 503);
  const slug = clean(url.searchParams.get('slug') ?? '', 120).replace(/[^\w-]/g, '');
  if (!slug) return json({ error: '参数不对' }, 400);

  const { results } = await env.DB.prepare(
    "SELECT id, nickname, body, created_at FROM discuss_entries WHERE kind = 'comment' AND ref = ? AND status = 'visible' ORDER BY id ASC LIMIT 300",
  )
    .bind(slug)
    .all();

  return json({ comments: results ?? [] });
}

async function bumpView(request, env) {
  if (!env.DB) return json({ error: '统计还没启用' }, 503);
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: '请求格式不对' }, 400);
  }

  const slug = clean(payload.slug ?? '', 120).replace(/[^\w-]/g, '');
  if (!slug) return json({ error: '参数不对' }, 400);

  // 优先用浏览器生成的访客 ID 去重（IP 会因 IPv4/IPv6 切换而变化，计数会虚高）
  const visitor = clean(payload.visitor ?? '', 64).replace(/[^\w-]/g, '');
  const hash = await ipHash(request, env);
  const key = visitor.length >= 8 ? `v:${visitor}` : hash;
  const t = nowSec();
  const hit = await env.DB.prepare('SELECT ts FROM view_hits WHERE slug = ? AND ip_hash = ?').bind(slug, key).first();

  if (!hit || t - hit.ts >= 86400) {
    await env.DB.prepare(
      'INSERT INTO page_views (slug, views) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET views = views + 1',
    )
      .bind(slug)
      .run();
    await env.DB.prepare(
      'INSERT INTO view_hits (slug, ip_hash, ts) VALUES (?, ?, ?) ON CONFLICT(slug, ip_hash) DO UPDATE SET ts = excluded.ts',
    )
      .bind(slug, key, t)
      .run();
  }

  const row = await env.DB.prepare('SELECT views FROM page_views WHERE slug = ?').bind(slug).first();
  return json({ views: row?.views ?? 0 });
}

async function getViews(env, url) {
  if (!env.DB) return json({ views: {} }, 200);
  const slugs = (url.searchParams.get('slugs') ?? '')
    .split(',')
    .map((s) => s.replace(/[^\w-]/g, ''))
    .filter(Boolean)
    .slice(0, 100);
  if (!slugs.length) return json({ views: {} });

  const placeholders = slugs.map(() => '?').join(',');
  const { results } = await env.DB.prepare(`SELECT slug, views FROM page_views WHERE slug IN (${placeholders})`)
    .bind(...slugs)
    .all();
  const map = {};
  for (const row of results ?? []) map[row.slug] = row.views;
  return json({ views: map });
}

/* ---------------- 管理接口（/edit/api/discuss/*，已过 Basic 认证） ---------------- */

async function adminList(env, url) {
  const status = url.searchParams.get('status') ?? 'all';
  const limit = Math.min(Math.max(Number.parseInt(url.searchParams.get('limit') ?? '100', 10) || 100, 1), 300);
  const where = status === 'all' ? '' : 'WHERE status = ?';
  const stmt = `SELECT id, kind, ref, title, nickname, body, created_at, status FROM discuss_entries ${where} ORDER BY id DESC LIMIT ?`;
  const bound = status === 'all' ? env.DB.prepare(stmt).bind(limit) : env.DB.prepare(stmt).bind(status, limit);
  const { results } = await bound.all();
  return json({ entries: results ?? [] });
}

async function adminModerate(request, env) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: '请求格式不对' }, 400);
  }

  const id = Number.parseInt(payload.id, 10);
  if (!Number.isFinite(id)) return json({ error: '参数不对' }, 400);

  if (payload.action === 'delete') {
    const row = await env.DB.prepare('SELECT kind FROM discuss_entries WHERE id = ?').bind(id).first();
    await env.DB.prepare('DELETE FROM discuss_entries WHERE id = ?').bind(id).run();
    if (row?.kind === 'thread') {
      await env.DB.prepare("DELETE FROM discuss_entries WHERE kind = 'reply' AND ref = ?").bind(String(id)).run();
    }
    return json({ ok: true });
  }

  const status = payload.action === 'hide' ? 'hidden' : 'visible';
  await env.DB.prepare('UPDATE discuss_entries SET status = ? WHERE id = ?').bind(status, id).run();
  return json({ ok: true, status });
}

async function adminWords(request, env) {
  if (request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT word FROM discuss_banned ORDER BY word').all();
    return json({ words: (results ?? []).map((r) => r.word) });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: '请求格式不对' }, 400);
  }

  const word = clean(payload.word, 40).toLowerCase().trim();
  if (!word) return json({ error: '屏蔽词不能为空' }, 400);

  if (payload.action === 'remove') {
    await env.DB.prepare('DELETE FROM discuss_banned WHERE word = ?').bind(word).run();
  } else {
    await env.DB.prepare('INSERT OR IGNORE INTO discuss_banned (word, created_at) VALUES (?, ?)')
      .bind(word, nowSec())
      .run();
  }
  return json({ ok: true });
}

async function handleApi(request, env, url, isEditApi) {
  const path = url.pathname;
  const method = request.method;

  if (isEditApi) {
    if (path === '/edit/api/discuss/list' && method === 'GET') return adminList(env, url);
    if (path === '/edit/api/discuss/moderate' && method === 'POST') return adminModerate(request, env);
    if (path === '/edit/api/discuss/words') return adminWords(request, env);
    return json({ error: '接口不存在' }, 404);
  }

  if (path === '/api/discuss/threads' && method === 'GET') return listThreads(env, url);
  if (path === '/api/discuss/thread' && method === 'GET') return getThread(env, url);
  if (path === '/api/discuss/comments' && method === 'GET') return listComments(env, url);
  if (path === '/api/discuss/thread' && method === 'POST') return submitEntry(request, env, 'thread');
  if (path === '/api/discuss/reply' && method === 'POST') return submitEntry(request, env, 'reply');
  if (path === '/api/discuss/comment' && method === 'POST') return submitEntry(request, env, 'comment');
  if (path === '/api/views' && method === 'POST') return bumpView(request, env);
  if (path === '/api/views' && method === 'GET') return getViews(env, url);

  return json({ error: '接口不存在' }, 404);
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const isEdit = url.pathname === '/edit' || url.pathname.startsWith('/edit/');
      const isEditApi = url.pathname.startsWith('/edit/api/');
      const isApi = url.pathname.startsWith('/api/');

      if (isEdit) {
        const denied = guardEdit(request, env);
        if (denied) return denied;
      }

      if (isApi || isEditApi) {
        return await handleApi(request, env, url, isEditApi);
      }

      const response = await env.ASSETS.fetch(request);
      const headers = new Headers(response.headers);
      // Pages 的静态资源自带 cache-control，必须无条件覆盖才能生效
      headers.set('Cache-Control', cacheControlFor(url.pathname));
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      return new Response(`站点出错：${error.message}`, {
        status: 500,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
  },
};
