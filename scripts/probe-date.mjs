// 探查公众号页面里真正的发布时间字段
const url = process.argv[2];
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

const html = await (await fetch(url, { headers: { 'User-Agent': UA, Referer: 'https://mp.weixin.qq.com/' } })).text();

const patterns = [
  /publish_time[^\n]{0,120}/i,
  /var\s+ct\s*=\s*"(\d+)"/i,
  /create_time["'\s:]+([\d\-:\s]{10,20})/i,
  /"publish_time"\s*:\s*"([^"]+)"/i,
  /og:release_date[^>]*content="([^"]+)"/i,
  /publish_date[^\n]{0,80}/i,
];

for (const pattern of patterns) {
  const match = pattern.exec(html);
  console.log(String(pattern).slice(0, 40).padEnd(42), match ? match[0].slice(0, 120) : '-');
}

// 顺手看看页面里有没有 10 位数字时间戳
const stamps = [...html.matchAll(/\b(1[6-9]\d{8})\b/g)].map((m) => m[1]).slice(0, 8);
console.log('\n可能的时间戳:', stamps);
for (const s of stamps.slice(0, 4)) {
  console.log('  ', s, '->', new Date(Number(s) * 1000).toISOString());
}
