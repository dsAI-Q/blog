// Cloudflare Pages 高级模式 Worker：静态站原样返回，只给 /edit/ 加一道 Basic 登录。
// 注意：用了 _worker.js 之后 _headers 不再生效，所以缓存头在这里手动补。

const REALM = 'Basic realm="dashai-edit", charset="UTF-8"';

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
    // 没配密码就关掉，避免默认放行
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

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const isEdit = url.pathname === '/edit' || url.pathname.startsWith('/edit/');

      if (isEdit) {
        const denied = guardEdit(request, env);
        if (denied) return denied;
      }

      const response = await env.ASSETS.fetch(request);
      const headers = new Headers(response.headers);
      if (!headers.has('cache-control')) {
        headers.set('Cache-Control', cacheControlFor(url.pathname));
      }
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
