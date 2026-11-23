// 快速验收：拿线上页面确认 canonical / og:image / 关键页面都在
const BASE = 'https://dashengai.pages.dev';

const pages = ['/', '/edit/', '/archive/', '/tags/', '/links/', '/posts/post-20261123-2028/', '/rss.xml', '/sitemap-0.xml'];

for (const path of pages) {
  try {
    const res = await fetch(BASE + path);
    const body = await res.text();
    const title = body.match(/<title>([^<]*)/)?.[1] ?? '';
    console.log(res.status, path.padEnd(34), title.slice(0, 30));
  } catch (error) {
    console.log('ERR', path, error.message);
  }
}

const html = await (await fetch(BASE + '/')).text();
console.log('\ncanonical:', html.match(/rel="canonical" href="([^"]+)/)?.[1]);
console.log('og:image :', html.match(/property="og:image" content="([^"]+)/)?.[1]);
console.log('脚本数   :', (html.match(/<script/g) ?? []).length);
