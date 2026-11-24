/** 首页右栏广告位。换广告只改这个文件。 */
export type Ad = {
  badge: string;
  title: string;
  subtitle: string;
  points: string[];
  ctaLabel: string;
  href: string;
  note?: string;
};

export const AD: Ad = {
  badge: '团队指导',
  title: '加入「大圣Ai自习室」团队',
  subtitle: '39.9 元 / 账号 · 终身免费',
  points: [
    '团内工作流可调用、可下载',
    '持续更新最新高质量工作流',
    '可向群主推荐想部署的工作流',
    '一次缴费，后续不再收费',
  ],
  ctaLabel: '查看完整说明',
  href: '/team/',
  note: '细则、收款码与申请链路见完整说明',
};
