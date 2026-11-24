/** 首页右栏广告位：数组顺序即显示顺序，换广告只改这个文件。 */
export type Ad = {
  badge: string;
  title: string;
  subtitle: string;
  points: string[];
  ctaLabel: string;
  href: string;
  note?: string;
  /** 次要卡片：不加投影，视觉上弱一档 */
  quiet?: boolean;
};

export const ADS: Ad[] = [
  {
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
  },
  {
    badge: '一对一',
    title: 'comfyui一对一陪练课',
    subtitle: '入门 500 元 · 终身陪练 2000 元',
    points: [
      '3 天手把手：部署、插件、基础工作流',
      '终身版有问题随时问，不再续费',
      '零基础也能上手，问题当场解决',
    ],
    ctaLabel: '看课程与报名',
    href: '/vip/',
    note: '微信 qrock168 · QQ 1416655191',
    quiet: true,
  },
];
