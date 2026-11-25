export const SITE = {
  /** 站点名：显示在页头、标题后缀和 RSS 里，改这一处即可 */
  title: '大圣Ai自习室',
  /** 一句话简介，首页副标题和 meta description 用 */
  description: '大圣Ai自习室：Ai 整合包、ComfyUI 工作流与学习资源分享。',
  /** 作者名，显示在文章页和页脚 */
  author: '大圣Ai',
  /** 语言，影响浏览器断词和读屏 */
  lang: 'zh-CN',
  /** 页头与分享用的图标 */
  avatar: '/images/avatar.webp',
  /** 首页顶部横幅：文件名带尺寸，换图时一起改名字（否则浏览器 7 天缓存看不到新图） */
  banner: {
    src: '/images/banner-2944x1024.webp',
    width: 2944,
    height: 1024,
    alt: '大圣Ai自习室：专注 Ai 知识、工具、资料分享',
  },
  /** 页头导航：编辑器 /edit/ 不在导航里露出，只留直链 */
  nav: [
    { href: '/', label: '首页' },
    { href: '/archive/', label: '归档' },
    { href: '/tags/', label: '标签' },
    { href: '/links/', label: '外链' },
    { href: '/prompts/', label: '提示词' },
    { href: '/discuss/', label: '讨论' },
    { href: '/vip/', label: 'Ai陪练' },
    { href: '/about/', label: '关于' },
  ],
} as const;

/** 社交与视频账号，显示在关于页和页脚；不需要的留空数组 */
export const SOCIALS = [
  { label: 'B 站', href: 'https://space.bilibili.com/2083795366' },
  { label: 'Telegram', href: 'https://t.me/xiaozcomfyui' },
  { label: 'X', href: 'https://x.com/dashengai_comfy' },
  { label: 'GitHub', href: 'https://github.com/dsAI-Q' },
] as const;
