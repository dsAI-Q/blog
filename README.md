# 博客（Astro）

静态博客骨架：文章是 Markdown，构建时生成纯静态 HTML，没有数据库和后台。

## 本地跑

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # 输出到 dist/
npm run preview  # 本地预览构建结果
```

> 受限环境（沙箱、CI）里先 `$env:ASTRO_TELEMETRY_DISABLED='1'`，否则 Astro 遥测会试着写 `%APPDATA%\astro` 然后报 EPERM。

## 改站点信息

`src/consts.ts` 里改四处：站点名、简介、作者、导航。域名在 `astro.config.mjs` 的 `site`，它决定 canonical、sitemap 和 RSS 里的绝对地址。

## 用编辑器写（`/edit/`）

跑 `npm run dev` 后打开 <http://localhost:4321/edit/>，左边贴稿件、右边实时预览，公众号习惯的那套。

- **粘贴 Markdown**：从剪贴板读；如果带 `---` frontmatter，会自动拆到上面的表单里
- **选择博客文件夹**：选一次博客根目录（含 `src/` 的那个），之后「保存到仓库」会把 `.md` 直接写进 `src/content/posts/`，插图会写进 `public/uploads/`。选过一次会记住（IndexedDB）；这是浏览器权限，隔一段时间会再要一次
- **插入图片**：多选、自动改名、落到 `public/uploads/` 并插入 `/uploads/...` 链接；没连文件夹时不会伪造路径，会提示你改用图床
- **复制网页 HTML**：把预览转成内联样式的 HTML，直接粘进公众号编辑器（它会剥 `<style>`，所以只能内联）
- **保存到仓库**：写完回终端 `git add . && git commit -m "post: 名字" && git push`
- **发布到 GitHub**：在「发布设置」里填 owner/repo/分支/Token，一键提交到仓库，推送后自动触发部署。Token 只存在本机 localStorage，需要 `contents: write` 权限；不想碰 Token 就用手动 push

编辑器页面带 `noindex`，也不进 sitemap。

## 素材

`public/images/` 里的横幅、头像、图标由 `scripts/make_assets.py` 从原图生成：

```sh
python scripts/make_assets.py
```

- `banner.webp`（151 KB，首页横幅）、`banner.jpg`（1200 宽，og:image 用）
- `avatar.webp`（页头小图标）、`icon-180.png`（apple-touch-icon）、`favicon-32.png`

换图就替换脚本里的源文件路径再跑一遍。

## 写文章

新建 `src/content/posts/随便一个名字.md`：

```yaml
---
title: 标题
description: 一两句摘要，会出现在首页列表和搜索结果里
date: 2026-11-23
tags: [标签1, 标签2]
draft: false   # true 时只在本地可见，不构建上线
pinned: false  # true 时排在列表最前，带「置顶」标记
order: 0       # 排序权重，越大越靠前；同权重按日期倒序
---
```

列表顺序规则：**置顶 → 权重（大在前）→ 日期（新在前）**。只想换两篇文章的前后，给想靠前的那篇把 `order` 设成 `1` 即可，不用改日期。

文件名就是 URL：`src/content/posts/resources-guide.md` → `/posts/resources-guide/`。**上线后不要改名**，改了就是死链。

## 维护外链

`src/data/links.ts` 里按组维护：`INTRO` 是首页欢迎区的标题和主按钮，`RESOURCE_GROUPS` 是网盘、平台、学习渠道三组卡片。首页和 `/links/` 用的是同一份数据，改一处两边都变。

没有链接的条目（公众号、QQ 群号）写成只有 `note`，页面上会渲染成可整段点选复制的文字。

## 目录

```
src/
  consts.ts              站点配置
  content.config.ts      文章字段校验
  content/posts/         Markdown 文章
  data/links.ts          外链数据
  layouts/Base.astro     全站骨架、SEO 元数据
  components/            PostCard 等
  pages/                 首页、文章页、归档、标签、外链、关于、404、rss.xml
  styles/global.css      全部样式（含深色模式与排版）
public/favicon.svg
```

## 部署（任选一个，都免费）

- **Cloudflare Pages**：连 GitHub 仓库，构建命令 `npm run build`，输出目录 `dist`
- **GitHub Pages**：推到 `gh-pages` 或以 Actions 构建，注意在 `astro.config.mjs` 里设 `base` 如果你是项目页（不是 `用户名.github.io` 仓库）
- **Vercel / Netlify**：同上，自动识别 Astro

## 已知取舍

- 没有评论：真有人留言了再接 giscus（挂在 GitHub Discussions 上），别自建数据库
- 没有站内搜索：先靠标签页和搜索引擎
- 深色模式跟随系统，没做手动开关：需要时再加，参考 `dark-mode-toggle` 指南
