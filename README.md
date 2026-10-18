# jinnn.xyz · 个人网站

> **Cute by default, useful by design.**
> jinnn 的个人网站 —— 把日常的小麻烦，做成顺手的小工具。

这是一个**纯静态**的网站：没有构建步骤、没有框架、没有运行时依赖。HTML + CSS + 原生 JS，打开即用，扔到任何静态托管上都能跑。

---

## 1. 本地预览

```powershell
# 方法 A：Python（推荐，脚本目录里用 Python 自带的 http.server）
cd "G:\deepseek harness\jinnn-site"
python -m http.server 4173
# 浏览器打开 http://localhost:4173
```

```powershell
# 方法 B：Node（如果装了 npx）
npx serve . -l 4173
```

> 直接双击 `index.html` 也能看，但浏览器对 `file://` 的字体/脚本限制较多，建议用本地服务器预览。

---

## 2. 目录结构

```
jinnn-site/
├── index.html               # 单页主站（Hero / About / Work / Lab / Contact）
├── 404.html                 # GitHub Pages 自定义 404（「这一页被猫叼走了」）
├── CNAME                    # GitHub Pages 自定义域名：jinnn.xyz
├── .nojekyll                # 关掉 GitHub Pages 的 Jekyll 处理
├── robots.txt / sitemap.xml
├── site.webmanifest         # PWA manifest
├── data/
│   └── projects.json        # 项目事实数据（调研底稿，页面卡片为手写 HTML）
└── assets/
    ├── css/style.css        # 全部样式（设计系统 + 响应式 + 深色模式）
    ├── js/main.js           # 全部交互（loader/光标/猫猫/终端/FM/抽签/彩蛋/命令面板）
    ├── js/data.js           # 站点小配置：邮箱、链接、终端文案、今日签
    ├── fonts/               # 自托管拉丁字体 woff2（Bodoni Moda / Space Grotesk / JetBrains Mono）
    └── img/
        ├── favicon.svg
        ├── icon-192.png / icon-512.png / icon-180.png
        ├── og-cover.png     # 社交分享图 1200×630
        └── upload/
            ├── avatar.jpg       # 头像（当前是站主的猫）
            └── wechat-qr.jpg    # 微信二维码
```

---

## 3. 内容与交互亮点

- **Hero**：巨型衬线标题 + 可交互白猫 SVG（眼睛跟随鼠标、蝴蝶结会动、点击撒爱心/彩纸）
- **作品 Bento**：7 个原创项目，每个卡片是一块 CSS 手绘的「微型界面」预览；支持分类筛选
- **实验室**：终端逐行打字（真实近况）、Kitty FM（Web Audio 现场合成的 8-bit 循环小曲，无版权问题）、今日签翻牌
- **彩蛋**：连点猫 5 下、在页面输入 `kitty`、`Ctrl/⌘ + K` 命令面板
- **深浅色**：右上角切换，跟随系统偏好，写入 localStorage
- **无障碍**：语义化结构、skip link、键盘可操作、`prefers-reduced-motion` 降级
- **实时数据**：GitHub 公开 API 拉取仓库数 / 最近推送；失败时静默回退静态值

---

## 4. 换成你自己的内容

| 想改什么 | 改哪里 |
| --- | --- |
| 头像 / 微信二维码 | 直接替换 `assets/img/upload/avatar.jpg`、`wechat-qr.jpg`（保持同名） |
| 邮箱、GitHub/CNB 链接、终端文案、今日签 | `assets/js/data.js` |
| 作品卡片文案、链接 | `index.html` 里 `#bento` 段落的 7 张 `.card` |
| 关于我、时间线、统计数字 | `index.html` 里 `#about` 段落 |
| 配色 / 字体 / 圆角 | `assets/css/style.css` 顶部 `:root` 变量 |
| 社交分享图 | 重新生成 `assets/img/og-cover.png`（1200×630） |

---

## 5. 部署到 GitHub Pages（jinnn.xyz）

> 完整步骤（含 DNS、HTTPS、排错）见 [`docs/deploy/部署指南.md`](../docs/deploy/部署指南.md)。

1. 把本目录**所有文件**推到 `luongthimydieu/luongthimydieu.github.io` 仓库的 `main` 分支根目录（保留 `CNAME` 和 `.nojekyll`）。
2. GitHub 仓库 **Settings → Pages**：
   - Source 选 `Deploy from a branch`
   - Branch 选 `main` + `/ (root)`，保存
3. 在域名 DNS（当前托管在腾讯云 DNSPod）添加记录：
   - 裸域 `@` 加 4 条 A 记录：`185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`
   - `www` 加 1 条 CNAME：`luongthimydieu.github.io`
4. 等 10 分钟~24 小时，证书签发后在 Pages 页面勾选 **Enforce HTTPS**。
5. 验证：

```powershell
nslookup jinnn.xyz
curl.exe -I https://jinnn.xyz
```

> 说明：GitHub Pages 不需要 ICP 备案；但国内访问速度一般。若追求国内速度，可改用腾讯云 EdgeOne Pages / 对象存储 + CDN（需 ICP 备案）。

---

## 6. 代码镜像

项目源码同时镜像到腾讯 CNB：[cnb.cool/jin.twelve](https://cnb.cool/jin.twelve)（组 `jin.twelve`）。
迁移与批量推送脚本见 [`docs/cnb/迁移指南.md`](../docs/cnb/迁移指南.md) 与 [`scripts/push-to-cnb.ps1`](../scripts/push-to-cnb.ps1)。

---

## 7. 字体与许可

- **Bodoni Moda**、**Space Grotesk**、**JetBrains Mono**：SIL Open Font License，自托管 woff2
- **霞鹜文楷 LXGW WenKai**（可选子集，`assets/fonts/lxgw-wenkai-subset.woff2`）：SIL Open Font License
- 站点内容（文字、项目介绍）© jinnn；页面的设计与代码可作参考，转载文字请先来信。
- 站内所有项目数据来自公开 GitHub 仓库，已按事实口径标注（设计目标 / 作者自测等）。

---

## 8. 隐私

- 无统计、无埋点、无第三方脚本、无 Cookie。
- 访客点击 Kitty FM 时才会在本地合成音频；不会上传任何数据。
- 联系邮箱与微信二维码由站主主动公开。

---

*Built quietly in Xuzhou. 🎀*
