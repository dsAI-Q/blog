const dateFmt = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  // frontmatter 里的 2026-01-02 会被解析成 UTC 零点，用 UTC 格式化才不会差一天
  timeZone: 'UTC',
});

export function formatDate(date: Date): string {
  return dateFmt.format(date);
}

/** 给 <time datetime> 用的机器可读格式 */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function sortByDateDesc<T extends { data: { date: Date } }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function groupByYear<T extends { data: { date: Date } }>(items: T[]) {
  const groups = new Map<number, T[]>();
  for (const item of items) {
    const year = item.data.date.getUTCFullYear();
    const bucket = groups.get(year);
    if (bucket) bucket.push(item);
    else groups.set(year, [item]);
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0]);
}
