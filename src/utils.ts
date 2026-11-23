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

type Orderable = { data: { date: Date; pinned?: boolean; order?: number } };

/**
 * 列表顺序：置顶 → 权重（大的在前）→ 日期（新的在前）
 * 都没设的时候等价于按日期排，不会打乱现有文章。
 */
export function sortPosts<T extends Orderable>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const pin = Number(b.data.pinned ?? false) - Number(a.data.pinned ?? false);
    if (pin !== 0) return pin;

    const weight = (b.data.order ?? 0) - (a.data.order ?? 0);
    if (weight !== 0) return weight;

    return b.data.date.valueOf() - a.data.date.valueOf();
  });
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
