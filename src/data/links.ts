export type ResourceItem = {
  label: string;
  /** 没有链接的就是纯文字（比如群号、公众号名） */
  href?: string;
  note?: string;
};

export type ResourceGroup = {
  key: string;
  title: string;
  note?: string;
  /** 首页侧栏面板的强调色 */
  tone?: 'sky' | 'amber' | 'violet';
  items: ResourceItem[];
};

/** 首页顶部欢迎区；改这里，首页和外链页同时生效 */
export const INTRO = {
  headline: '大圣Ai自习室',
  subhead: 'Ai 资源分享',
  lead: '整合包、工作流、平台邀请和学习渠道都汇总在这里。网盘长期更新，失效了在文章下面留个言。',
  primary: [
    { label: '大圣AI整合包 + 解密工具', href: 'https://pan.quark.cn/s/c3844448249d' },
    { label: 'MiniMax-H3 整合包', href: 'https://pan.quark.cn/s/b2144e44781c' },
  ],
  secondary: {
    label: '更多高质量工作流',
    href: 'https://docs.qq.com/doc/p/425ff71f35534e92d83b857d6a2b576f147a3215',
  },
  /** 首页横幅右下角那行联系方式 */
  contact: { wechat: 'qrock168', qq: '1416655191' },
};

/** 首页左侧栏：学习渠道 */
const STUDY: ResourceGroup = {
  key: 'study',
  title: 'Ai学习基地',
  note: '教程、直播和答疑',
  tone: 'sky',
  items: [
    { label: 'YouTube 频道', href: 'https://youtu.be/p0uEXwDDAeI' },
    { label: 'B 站 UP 主', href: 'https://space.bilibili.com/2083795366' },
    { label: 'Telegram 电报', href: 'https://t.me/xiaozcomfyui' },
    { label: 'X / 推特', href: 'https://x.com/dashengai_comfy' },
    { label: '公众号 大时代Ai', note: '大时代Ai' },
    { label: 'QQ 学习群', note: '1051067251' },
  ],
};

/** 首页右侧栏：平台福利 */
const PLATFORMS: ResourceGroup = {
  key: 'platforms',
  title: '平台福利',
  note: 'RH 双平台，注册送 1000 积分',
  tone: 'amber',
  items: [
    {
      label: 'RunningHub 国内 CN 站',
      href: 'https://www.runninghub.cn?inviteCode=cn-v1038',
      note: '注册送 1000 积分',
    },
    {
      label: 'RunningHub Ai 自由站',
      href: 'https://www.runninghub.ai?inviteCode=rh-v1079',
      note: '海外线路',
    },
    { label: '低价模型网站', href: 'https://api.seedance.nz/?aff=eWa9', note: '模型 API 折扣' },
  ],
};

/** 首页右侧栏：网盘资源 */
const DRIVES: ResourceGroup = {
  key: 'drives',
  title: '网盘资源',
  note: '夸克网盘，长期更新',
  tone: 'violet',
  items: [
    { label: '大圣AI整合包 + 解密工具', href: 'https://pan.quark.cn/s/c3844448249d' },
    { label: 'MiniMax-H3 整合包', href: 'https://pan.quark.cn/s/b2144e44781c' },
    {
      label: '更多高质量工作流',
      href: 'https://docs.qq.com/doc/p/425ff71f35534e92d83b857d6a2b576f147a3215',
      note: '腾讯文档',
    },
  ],
};

export const GROUPS = { study: STUDY, platforms: PLATFORMS, drives: DRIVES };

/** 外链页按这个顺序展示全部 */
export const GROUP_LIST: ResourceGroup[] = [DRIVES, PLATFORMS, STUDY];
