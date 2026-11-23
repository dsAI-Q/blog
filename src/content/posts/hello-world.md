---
title: 开张
description: 这个站要放什么、为什么用静态站，以及怎么订阅。
date: 2026-11-23
tags: [公告]
draft: false
---

这是第一篇文章，用来验证排版：标题、正文、代码块、列表、引用都能正常显示。

## 这个站放什么

- 长一点的文字，比如教程和踩坑记录
- 视频的配套说明，视频本身在 B 站
- 网盘资源链接，集中在[外链页](/links/)维护

## 为什么不用 WordPress

因为现阶段只有「写字」和「放链接」两件事。静态站没有数据库、没有后台登录，也就没有会被扫的漏洞，托管还是免费的。

## 代码块看起来是这样

```ts
const site = {
  title: '我的博客',
  framework: 'astro',
};
```

## 引用和列表

> 写完 Markdown 提交，构建就发布，没有第二步。

1. 新建 `src/content/posts/xxx.md`
2. 填 frontmatter（标题、描述、日期、标签）
3. `git push`

订阅：[RSS](/rss.xml)。
