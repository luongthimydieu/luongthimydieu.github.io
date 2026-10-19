/* ============================================================
   jinnn.xyz — 站点小配置 / 文案数据（供 main.js 使用）
   数据事实来源：docs/research/github-profile.md（2026-10-18 采集）
   ============================================================ */
window.JIN = {
  email: "wangzhiwen1224@126.com",

  links: {
    github: "https://github.com/luongthimydieu",
    githubRepos: "https://github.com/luongthimydieu?tab=repositories",
    cnb: "https://cnb.cool/jin.twelve",
    edgeStore: "https://microsoftedge.microsoft.com/addons/detail/afapjlkkkkkodlmamfeknfhnlkjaenih",
    chromeStore: "https://chromewebstore.google.com/detail/maolpkpomgdnmidbiejcogfgecfhhbcj",
    xxtDemo: "https://jinnn.xyz/xxt-copilot/",
    todoDemo: "https://luongthimydieu.github.io/taskbar-todo/"
  },

  githubUser: "luongthimydieu",

  /* 终端逐行内容：type = cmd / out */
  terminal: [
    { type: "cmd", text: "whoami" },
    { type: "out", text: "jinnn — 中国矿业大学 · 数据科学与大数据技术" },
    { type: "cmd", text: "cat now.txt" },
    { type: "out", text: "正在维护 XXT Copilot（Edge + Chrome）" },
    { type: "out", text: "正在给任务栏歌词打补丁" },
    { type: "out", text: "正在把 Hello Kitty 塞进 DSH 界面 🎀" },
    { type: "cmd", text: "git log --oneline -4" },
    { type: "out", text: "2026-10-19  XXT Copilot 上架 Chrome 应用商店" },
    { type: "out", text: "2026-10-18  XXT Copilot 上架 Edge 加载项商店" },
    { type: "out", text: "2026-10-17  任务栏歌词 v1.2.9 · 免安装版" },
    { type: "out", text: "2026-10-17  手机端待办 PWA 上线" },
    { type: "cmd", text: "echo \"人生海海，不过尔尔\"" },
    { type: "out", text: "人生海海，不过尔尔" }
  ],

  /* 今日签（仅供开心，不涉及任何预测） */
  fortunes: [
    "今日宜：把 TODO 改成 DONE，然后奖励自己一杯奶茶。",
    "今天的 bug 大概率会在洗澡时自己想通。",
    "适合重构，也适合什么都不做。二选一都不亏。",
    "粉色是生产力。今天可以多写一点界面。",
    "别急着优化，先让它跑起来。",
    "你会收到一颗 star——也许来自你自己。",
    "写注释的人，今天会被温柔以待。",
    "多喝热水，少改需求。",
    "今天适合早点睡。代码不会跑，猫会。",
    "灵感在晚上十一点后出现，记得留个便签。",
    "把「以后再说」改成「这周试试」。",
    "今天的运气藏在一次 git commit 里。",
    "如果卡住了，就去摸摸猫。科学无法解释，但有用。",
    "今天适合把旧项目重新打开看一眼。"
  ],

  /* 命令面板条目 */
  palette: [
    { icon: "✿", label: "关于我 About", kind: "SECTION", href: "#about" },
    { icon: "◆", label: "作品 Work", kind: "SECTION", href: "#work" },
    { icon: "▤", label: "实验室 Lab", kind: "SECTION", href: "#lab" },
    { icon: "✉", label: "联系 Contact", kind: "SECTION", href: "#contact" },
    { icon: "⌥", label: "GitHub · luongthimydieu", kind: "LINK", href: "https://github.com/luongthimydieu" },
    { icon: "◇", label: "腾讯 CNB · jin.twelve", kind: "LINK", href: "https://cnb.cool/jin.twelve" },
    { icon: "⊞", label: "Edge 加载项 · XXT Copilot", kind: "LINK", href: "https://microsoftedge.microsoft.com/addons/detail/afapjlkkkkkodlmamfeknfhnlkjaenih" },
    { icon: "◎", label: "Chrome 应用商店 · XXT Copilot", kind: "LINK", href: "https://chromewebstore.google.com/detail/maolpkpomgdnmidbiejcogfgecfhhbcj" },
    { icon: "◍", label: "XXT Copilot 产品页", kind: "LINK", href: "https://jinnn.xyz/xxt-copilot/" },
    { icon: "☰", label: "Taskbar Todo · 手机端", kind: "LINK", href: "https://luongthimydieu.github.io/taskbar-todo/" },
    { icon: "✎", label: "复制邮箱并写信", kind: "ACTION", action: "email" },
    { icon: "◐", label: "切换深浅色", kind: "ACTION", action: "theme" },
    { icon: "♪", label: "播放 / 暂停 Kitty FM", kind: "ACTION", action: "fm" },
    { icon: "签", label: "抽一张今日签", kind: "ACTION", action: "fortune" },
    { icon: "↑", label: "回到顶部", kind: "ACTION", action: "top" }
  ]
};
