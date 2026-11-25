// 用 Node 的原生 fetch 调 Cloudflare API（PowerShell/curl 在这台机器上 TLS 握手失败）
// 用法：node scripts/cf.mjs GET /accounts/<acct>/pages/projects/dashengai
//       node scripts/cf.mjs POST /accounts/<acct>/rum/site_info '{"host":"example.com"}'
const token = process.env.DSH_SECRET_CF_API_TOKEN;
if (!token) {
  console.error('缺少 DSH_SECRET_CF_API_TOKEN');
  process.exit(1);
}

const [method = 'GET', path, rawBody] = process.argv.slice(2);
if (!path) {
  console.error('用法：node scripts/cf.mjs <METHOD> <PATH> [JSON|@file]');
  process.exit(1);
}

let body = rawBody;
if (rawBody?.startsWith('@')) {
  const { readFile } = await import('node:fs/promises');
  body = await readFile(rawBody.slice(1), 'utf8');
}

const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
  method,
  headers: {
    Authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  },
  body: body ?? undefined,
});

const text = await response.text();
console.log(`HTTP ${response.status}`);
try {
  console.log(JSON.stringify(JSON.parse(text), null, 2));
} catch {
  console.log(text);
}
