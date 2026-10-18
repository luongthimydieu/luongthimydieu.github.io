/* ==========================================================================
   jinnn.xyz — interactions
   vanilla JS · no dependencies · 2026
   ========================================================================== */
(function () {
  "use strict";

  var html = document.documentElement;
  var site = window.JIN || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var shotMode = /(?:^|[?&])shot=1/.test(window.location.search);
  if (shotMode) html.classList.add("shot-mode");

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function on(el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  var store = {
    get: function (key, fallback) {
      try {
        var v = window.localStorage.getItem(key);
        return v === null ? fallback : v;
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, value); } catch (e) {}
    }
  };

  /* ------------------------------------------------------------------ *
   * 0. 主题
   * ------------------------------------------------------------------ */
  var themeBtn = $("#themeBtn");
  var theme = store.get("jin-theme", null);
  try {
    var themeParam = new URLSearchParams(window.location.search).get("theme");
    if (themeParam === "dark" || themeParam === "light") theme = themeParam;
  } catch (e) {}
  if (!theme) theme = "light";
  html.setAttribute("data-theme", theme);
  on(themeBtn, "click", function () {
    theme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", theme);
    store.set("jin-theme", theme);
    toast(theme === "dark" ? "晚安模式 · 粉色调暗了一点" : "早安模式 · 奶油粉又回来了");
  });

  /* ------------------------------------------------------------------ *
   * 1. 徐州时钟
   * ------------------------------------------------------------------ */
  var clock = $("#clock");
  function tickClock() {
    if (!clock) return;
    try {
      clock.textContent = new Intl.DateTimeFormat("zh-CN", {
        timeZone: "Asia/Shanghai",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).format(new Date());
    } catch (e) {
      var d = new Date();
      clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map(function (n) { return String(n).padStart(2, "0"); }).join(":");
    }
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ------------------------------------------------------------------ *
   * 2. 加载动画
   * ------------------------------------------------------------------ */
  var loader = $("#loader");
  var loaderBar = $("#loaderBar");
  var loaderPct = $("#loaderPct");
  var loaderNote = $("#loaderNote");
  var notes = ["waking the kitty…", "调亮粉色…", "把蝴蝶结扶正…", "整理小工具…", "ready!"];

  function heroReveal() {
    var items = $$(".hero [data-reveal]");
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i * 90) + "ms";
      el.classList.add("is-in");
    });
  }

  function finishLoader() {
    if (!loader) { heroReveal(); return; }
    loader.classList.add("is-done");
    document.body.classList.add("is-loaded");
    setTimeout(function () { heroReveal(); }, 160);
    setTimeout(function () { if (loader) loader.style.display = "none"; }, 1200);
  }

  if (reduceMotion || !loader || shotMode) {
    finishLoader();
  } else {
    var pct = 0;
    var noteIndex = 0;
    var loaderTimer = setInterval(function () {
      pct = Math.min(100, pct + Math.random() * 16 + 6);
      if (loaderBar) loaderBar.style.width = pct + "%";
      if (loaderPct) loaderPct.textContent = Math.round(pct) + "%";
      if (loaderNote) {
        var nextIndex = Math.min(notes.length - 1, Math.floor(pct / 26));
        if (nextIndex !== noteIndex) { noteIndex = nextIndex; loaderNote.textContent = notes[nextIndex]; }
      }
      if (pct >= 100) {
        clearInterval(loaderTimer);
        if (loaderBar) loaderBar.style.width = "100%";
        if (loaderNote) loaderNote.textContent = "ready!";
        setTimeout(finishLoader, 420);
      }
    }, 190);
    /* 兜底：3 秒后一定放行 */
    setTimeout(function () { clearInterval(loaderTimer); finishLoader(); }, 3000);
  }

  /* ------------------------------------------------------------------ *
   * 3. 自定义光标
   * ------------------------------------------------------------------ */
  var cursor = $("#cursor");
  if (cursor && finePointer && !reduceMotion) {
    html.classList.add("has-cursor");
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    var rx = cx, ry = cy;
    var cursorVisible = false;
    var cursorLabel = $(".cursor__label", cursor);

    on(window, "pointermove", function (e) {
      cx = e.clientX; cy = e.clientY;
      if (!cursorVisible) {
        cursorVisible = true;
        cursor.classList.add("is-visible");
      }
      cursor.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
    }, { passive: true });

    (function ringLoop() {
      rx += (cx - rx) * 0.16;
      ry += (cy - ry) * 0.16;
      var ring = $(".cursor__ring", cursor);
      if (ring) ring.style.transform = "translate3d(" + (rx - cx) + "px," + (ry - cy) + "px,0)";
      requestAnimationFrame(ringLoop);
    })();

    document.addEventListener("pointerover", function (e) {
      var target = e.target.closest("a, button, .card, .filter, .mascot, #emailBtn");
      cursor.classList.remove("is-hot", "is-card");
      if (!target) return;
      var card = e.target.closest(".card");
      if (card) {
        cursor.classList.add("is-card");
        if (cursorLabel) cursorLabel.textContent = "OPEN ↗";
      } else {
        cursor.classList.add("is-hot");
      }
    });

    document.addEventListener("pointerleave", function () {
      cursor.classList.remove("is-visible");
      cursorVisible = false;
    });
  }

  /* ------------------------------------------------------------------ *
   * 4. 页面进度 / 头部状态
   * ------------------------------------------------------------------ */
  var progress = $("#scrollProgress");
  var header = $("#siteHeader");
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var top = window.scrollY || window.pageYOffset;
      var height = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = (height > 0 ? (top / height) * 100 : 0) + "%";
      if (header) header.classList.toggle("is-scrolled", top > 24);
      ticking = false;
    });
  }
  on(window, "scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------ *
   * 5. 滚动出现 + 侧边导航
   * ------------------------------------------------------------------ */
  var revealEls = $$("[data-reveal], .reveal");
  revealEls.forEach(function (el) {
    var siblings = el.parentElement ? $$("[data-reveal], .reveal", el.parentElement) : [];
    var index = siblings.indexOf(el);
    if (index > 0) el.style.transitionDelay = (Math.min(index, 6) * 70) + "ms";
  });

  if (shotMode) { revealEls.forEach(function (el) { el.classList.add("is-in"); }); }
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });

    var rails = $$("[data-rail]");
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        rails.forEach(function (dot) { dot.classList.toggle("is-active", dot.getAttribute("data-rail") === id); });
      });
    }, { rootMargin: "-42% 0px -52% 0px", threshold: 0 });
    ["hero", "about", "work", "lab", "contact"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ------------------------------------------------------------------ *
   * 6. 移动端菜单
   * ------------------------------------------------------------------ */
  var menuBtn = $("#menuBtn");
  var mobileMenu = $("#mobileMenu");
  function openMenu() {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.hidden = false;
    requestAnimationFrame(function () { mobileMenu.classList.add("is-open"); });
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "关闭菜单");
    document.body.classList.add("menu-open");
  }
  function closeMenu() {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "打开菜单");
    document.body.classList.remove("menu-open");
    setTimeout(function () { if (menuBtn.getAttribute("aria-expanded") === "false") mobileMenu.hidden = true; }, 320);
  }
  on(menuBtn, "click", function () {
    if (menuBtn.getAttribute("aria-expanded") === "true") closeMenu(); else openMenu();
  });
  $$("[data-menu-link]").forEach(function (link) { on(link, "click", closeMenu); });
  on(document, "keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ------------------------------------------------------------------ *
   * 7. 猫猫：眼睛跟随 / 卡片倾斜 / 视差 / 点击彩蛋
   * ------------------------------------------------------------------ */
  var mascot = $("#mascot");
  var mascotCard = $("#mascotCard");
  var pupils = $$("[data-pupil]");

  if (mascot && finePointer && !reduceMotion) {
    var eyeTimer = null;
    on(window, "pointermove", function (e) {
      if (eyeTimer) return;
      eyeTimer = setTimeout(function () {
        eyeTimer = null;
        var rect = mascot.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height * 0.56;
        var dx = (e.clientX - centerX) / rect.width;
        var dy = (e.clientY - centerY) / rect.height;
        var max = 9;
        var tx = Math.max(-1, Math.min(1, dx * 2.2)) * max;
        var ty = Math.max(-1, Math.min(1, dy * 2.2)) * max * 0.75;
        pupils.forEach(function (p) { p.style.transform = "translate(" + tx + "px," + ty + "px)"; });
      }, 40);
    }, { passive: true });

    /* 卡片 3D 倾斜 + 贴纸视差 */
    var wrap = $("#mascotWrap");
    var stickers = $$("[data-parallax]");
    if (mascotCard && wrap) {
      on(wrap, "pointermove", function (e) {
        var rect = wrap.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        mascotCard.style.setProperty("--ry", (px * 9).toFixed(2) + "deg");
        mascotCard.style.setProperty("--rx", (-py * 9).toFixed(2) + "deg");
        stickers.forEach(function (s) {
          var f = parseFloat(s.getAttribute("data-parallax")) || 0;
          s.style.setProperty("--px", (px * f).toFixed(2) + "px");
          s.style.setProperty("--py", (py * f).toFixed(2) + "px");
        });
      });
      on(wrap, "pointerleave", function () {
        mascotCard.style.setProperty("--ry", "0deg");
        mascotCard.style.setProperty("--rx", "0deg");
        stickers.forEach(function (s) { s.style.setProperty("--px", "0px"); s.style.setProperty("--py", "0px"); });
      });
    }
  }

  var catClicks = 0;
  var catMessages = [
    "喵。",
    "再点一下试试？",
    "这里是 Hello Kitty 区。",
    "蝴蝶结是不是很可爱。",
    "喵！解锁隐藏成就：认证铲屎官 🎀"
  ];
  function catClick(e) {
    catClicks += 1;
    burst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, catClicks >= 5 ? 46 : 14);
    if (catClicks >= 5) {
      toast(catMessages[4], 3800);
      catClicks = 0;
    } else {
      toast(catMessages[catClicks - 1], 1800);
    }
  }
  on(mascot, "click", catClick);

  /* 其他倾斜卡片 */
  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach(function (card) {
      on(card, "pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "rotate(" + (py * 2).toFixed(2) + "deg) rotateY(" + (px * 7).toFixed(2) + "deg) rotateX(" + (-py * 7).toFixed(2) + "deg)";
      });
      on(card, "pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ------------------------------------------------------------------ *
   * 8. 作品筛选
   * ------------------------------------------------------------------ */
  var filters = $$(".filter");
  var cards = $$("#bento .card");
  filters.forEach(function (btn) {
    on(btn, "click", function () {
      filters.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      var filter = btn.getAttribute("data-filter");
      cards.forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-category") === filter;
        card.classList.toggle("is-filtered", !show);
        if (show && !reduceMotion) {
          card.classList.remove("is-in");
          void card.offsetWidth;
          card.classList.add("is-in");
        }
      });
    });
  });

  /* ------------------------------------------------------------------ *
   * 9. 终端打字机
   * ------------------------------------------------------------------ */
  var terminal = $("#terminal");
  var terminalBody = $("#terminalBody");
  var terminalPlayed = false;

  function renderTerminalInstant() {
    if (!terminalBody) return;
    terminalBody.innerHTML = "";
    (site.terminal || []).forEach(function (item) {
      var p = document.createElement("p");
      p.className = "terminal__line";
      p.setAttribute("data-line", item.type);
      p.textContent = item.text;
      terminalBody.appendChild(p);
    });
    var prompt = document.createElement("p");
    prompt.className = "terminal__line terminal__line--cursor";
    prompt.setAttribute("data-line", "prompt");
    terminalBody.appendChild(prompt);
  }

  async function playTerminal() {
    if (terminalPlayed || !terminalBody) return;
    terminalPlayed = true;
    if (reduceMotion) { renderTerminalInstant(); return; }
    terminalBody.innerHTML = "";
    var lines = site.terminal || [];
    for (var i = 0; i < lines.length; i++) {
      var item = lines[i];
      var p = document.createElement("p");
      p.className = "terminal__line";
      p.setAttribute("data-line", item.type);
      terminalBody.appendChild(p);
      if (item.type === "cmd") {
        for (var c = 0; c < item.text.length; c++) {
          p.textContent = item.text.slice(0, c + 1);
          await sleep(item.text.charAt(c) === " " ? 28 : 22);
        }
      } else {
        p.textContent = "";
        await sleep(60);
        p.textContent = item.text;
        await sleep(110);
      }
      await sleep(90);
    }
    var prompt = document.createElement("p");
    prompt.className = "terminal__line terminal__line--cursor";
    prompt.setAttribute("data-line", "prompt");
    terminalBody.appendChild(prompt);
  }

  if (terminal && terminalBody) {
    if (!shotMode && "IntersectionObserver" in window) {
      var termObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            termObserver.disconnect();
            setTimeout(playTerminal, 260);
          }
        });
      }, { threshold: 0.25 });
      termObserver.observe(terminal);
    } else {
      renderTerminalInstant();
    }
    setTimeout(function () {
      var rect = terminal.getBoundingClientRect();
      if (rect.top < window.innerHeight) { playTerminal(); }
    }, 2400);
  }

  /* ------------------------------------------------------------------ *
   * 10. Kitty FM —— 浏览器现场合成的 8-bit 循环小曲
   * ------------------------------------------------------------------ */
  var fm = $(".fm");
  var fmBtn = $("#fmBtn");
  var fmStatus = $("#fmStatus");
  var fmPlaying = false;
  var audioCtx = null;
  var fmTimer = null;
  var nextNoteTime = 0;
  var fmStep = 0;
  var STEP_DUR = 0.21;

  var MELODY = [
    587.33, 0, 739.99, 0, 880.0, 0, 739.99, 0,
    659.25, 0, 587.33, 0, 493.88, 0, 587.33, 0,
    440.0, 0, 587.33, 0, 739.99, 0, 880.0, 0,
    987.77, 0, 880.0, 0, 739.99, 0, 659.25, 0
  ];
  var BASS = { 0: 146.83, 8: 110.0, 16: 123.47, 24: 98.0 };

  function initAudio() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    return audioCtx;
  }

  function scheduleTone(freq, start, dur, type, volume) {
    if (!audioCtx) return;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  function scheduleStep(step, time) {
    var note = MELODY[step % MELODY.length];
    if (note) scheduleTone(note, time, 0.34, "triangle", 0.045);
    if (BASS[step % 32]) scheduleTone(BASS[step % 32], time, STEP_DUR * 4.4, "sine", 0.05);
  }

  function fmScheduler() {
    if (!audioCtx) return;
    while (nextNoteTime < audioCtx.currentTime + 0.22) {
      scheduleStep(fmStep, nextNoteTime);
      nextNoteTime += STEP_DUR;
      fmStep = (fmStep + 1) % 32;
    }
  }

  function setFmUI(playing) {
    if (fm) fm.classList.toggle("is-playing", playing);
    if (fmStatus) {
      fmStatus.textContent = playing ? "PLAYING" : "PAUSED";
      fmStatus.classList.toggle("is-on", playing);
    }
    if (fmBtn) fmBtn.setAttribute("aria-label", playing ? "暂停 Kitty FM" : "播放 Kitty FM");
  }

  function toggleFm() {
    if (!fmBtn) return;
    if (!audioCtx) {
      initAudio();
    }
    if (!audioCtx) { toast("这个浏览器不支持 Web Audio，换一个试试？"); return; }
    if (fmPlaying) {
      fmPlaying = false;
      clearInterval(fmTimer);
      fmTimer = null;
      setFmUI(false);
      if (audioCtx.state === "running") audioCtx.suspend();
      toast("Kitty FM 已暂停");
    } else {
      audioCtx.resume();
      fmPlaying = true;
      nextNoteTime = audioCtx.currentTime + 0.08;
      fmScheduler();
      fmTimer = setInterval(fmScheduler, 50);
      setFmUI(true);
      toast("现在播放：8-bit Lullaby for a Cat");
    }
  }
  on(fmBtn, "click", toggleFm);
  on(document, "visibilitychange", function () {
    if (document.hidden && fmPlaying) toggleFm();
  });

  /* ------------------------------------------------------------------ *
   * 11. 今日签
   * ------------------------------------------------------------------ */
  var fortuneBtn = $("#fortuneBtn");
  var fortuneCard = $("#fortuneCard");
  var fortuneText = $("#fortuneText");
  var fortuneNum = $("#fortuneNum");
  var lastFortune = -1;

  function drawFortune() {
    if (!fortuneCard) return;
    var list = site.fortunes || ["今天也要开心。"];
    var index = Math.floor(Math.random() * list.length);
    if (list.length > 1 && index === lastFortune) index = (index + 1) % list.length;
    lastFortune = index;
    if (fortuneText) fortuneText.textContent = list[index];
    if (fortuneNum) fortuneNum.textContent = "No." + String(index + 1).padStart(2, "0");
    if (fortuneCard.classList.contains("is-flipped")) {
      fortuneCard.classList.remove("is-flipped");
      setTimeout(function () { fortuneCard.classList.add("is-flipped"); }, 360);
    } else {
      fortuneCard.classList.add("is-flipped");
    }
  }
  on(fortuneBtn, "click", drawFortune);

  /* ------------------------------------------------------------------ *
   * 12. 复制邮箱
   * ------------------------------------------------------------------ */
  function copyEmail() {
    var email = (site.email || "wangzhiwen1224@126.com");
    function done() { toast("邮箱已复制 · " + email, 3200); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done, fallback);
    } else {
      fallback();
    }
    function fallback() {
      var input = document.createElement("textarea");
      input.value = email;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("复制失败，请手动选中：" + email); }
      document.body.removeChild(input);
    }
  }
  on($("#emailBtn"), "click", copyEmail);

  /* ------------------------------------------------------------------ *
   * 13. Toast
   * ------------------------------------------------------------------ */
  var toastEl = $("#toast");
  var toastTimer = null;
  function toast(message, duration) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-visible"); }, duration || 2600);
  }

  /* ------------------------------------------------------------------ *
   * 14. 彩带 / 爱心 / 小爪子
   * ------------------------------------------------------------------ */
  var canvas = $("#confetti");
  var ctx2d = null;
  var particles = [];
  var confettiRunning = false;
  var GLYPHS = ["🎀", "♡", "🐾", "✦", "🌸", "✿"];

  function resizeCanvas() {
    if (!canvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx2d = canvas.getContext("2d");
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  if (canvas) {
    resizeCanvas();
    on(window, "resize", resizeCanvas);
  }

  function burst(x, y, count) {
    if (!canvas || reduceMotion) return;
    count = count || 24;
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 2 + Math.random() * 7;
      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.4,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.24,
        size: 11 + Math.random() * 13,
        glyph: pick(GLYPHS),
        life: 1,
        decay: 0.008 + Math.random() * 0.012
      });
    }
    if (!confettiRunning) {
      confettiRunning = true;
      requestAnimationFrame(confettiLoop);
    }
  }

  function confettiLoop() {
    if (!ctx2d || !canvas) return;
    ctx2d.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.vy += 0.16;
      p.vx *= 0.995;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= p.decay;
      if (p.life <= 0 || p.y > window.innerHeight + 60) {
        particles.splice(i, 1);
        continue;
      }
      ctx2d.save();
      ctx2d.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx2d.translate(p.x, p.y);
      ctx2d.rotate(p.rot);
      ctx2d.font = p.size + "px serif";
      ctx2d.textAlign = "center";
      ctx2d.textBaseline = "middle";
      ctx2d.fillStyle = "#e8275d";
      ctx2d.fillText(p.glyph, 0, 0);
      ctx2d.restore();
    }
    if (particles.length > 0) {
      requestAnimationFrame(confettiLoop);
    } else {
      confettiRunning = false;
      ctx2d.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  /* ------------------------------------------------------------------ *
   * 15. 命令面板
   * ------------------------------------------------------------------ */
  var palette = $("#palette");
  var paletteInput = $("#paletteInput");
  var paletteList = $("#paletteList");
  var paletteItems = [];
  var paletteActive = 0;
  var lastFocused = null;

  function paletteRender(query) {
    if (!paletteList) return;
    var all = site.palette || [];
    var q = (query || "").trim().toLowerCase();
    paletteItems = all.filter(function (item) {
      return !q || item.label.toLowerCase().indexOf(q) > -1 || (item.kind || "").toLowerCase().indexOf(q) > -1;
    });
    paletteActive = 0;
    paletteList.innerHTML = "";
    if (!paletteItems.length) {
      var empty = document.createElement("li");
      empty.className = "palette__item";
      empty.textContent = "没有找到，换个关键词试试。";
      paletteList.appendChild(empty);
      return;
    }
    paletteItems.forEach(function (item, index) {
      var li = document.createElement("li");
      li.className = "palette__item" + (index === 0 ? " is-active" : "");
      li.innerHTML = '<span class="palette__icon"></span><span class="palette__label"></span><span class="palette__kind"></span>';
      li.children[0].textContent = item.icon || "•";
      li.children[1].textContent = item.label;
      li.children[2].textContent = item.kind || "";
      on(li, "click", function () { paletteExecute(item); });
      on(li, "pointerenter", function () { setPaletteActive(index); });
      paletteList.appendChild(li);
    });
  }

  function setPaletteActive(index) {
    var items = $$(".palette__item", paletteList);
    if (!items.length) return;
    paletteActive = (index + items.length) % items.length;
    items.forEach(function (li, i) { li.classList.toggle("is-active", i === paletteActive); });
  }

  function paletteExecute(item) {
    if (!item) return;
    closePalette();
    if (item.href) {
      if (item.href.charAt(0) === "#") {
        var target = document.querySelector(item.href);
        if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      } else {
        window.open(item.href, "_blank", "noopener");
      }
    } else if (item.action === "email") {
      copyEmail();
    } else if (item.action === "theme") {
      theme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", theme);
      store.set("jin-theme", theme);
      toast(theme === "dark" ? "晚安模式" : "早安模式");
    } else if (item.action === "fm") {
      toggleFm();
    } else if (item.action === "fortune") {
      drawFortune();
      var fortuneSection = document.getElementById("lab");
      if (fortuneSection) fortuneSection.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    } else if (item.action === "top") {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  function openPalette() {
    if (!palette) return;
    lastFocused = document.activeElement;
    palette.hidden = false;
    requestAnimationFrame(function () { palette.classList.add("is-open"); });
    document.body.classList.add("palette-open");
    if (paletteInput) { paletteInput.value = ""; paletteInput.focus(); }
    paletteRender("");
  }
  function closePalette() {
    if (!palette) return;
    palette.classList.remove("is-open");
    document.body.classList.remove("palette-open");
    setTimeout(function () { palette.hidden = true; }, 260);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  on(paletteInput, "input", function () { paletteRender(paletteInput.value); });
  on(document, "keydown", function (e) {
    var isOpen = palette && !palette.hidden;
    var cmdK = (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K");
    if (cmdK) {
      e.preventDefault();
      if (isOpen) closePalette(); else openPalette();
      return;
    }
    if (!isOpen) return;
    if (e.key === "Escape") { e.preventDefault(); closePalette(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setPaletteActive(paletteActive + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setPaletteActive(paletteActive - 1); }
    else if (e.key === "Enter") {
      e.preventDefault();
      var items = $$(".palette__item", paletteList);
      if (items[paletteActive] && paletteItems[paletteActive]) paletteExecute(paletteItems[paletteActive]);
    }
  });
  on(palette, "click", function (e) { if (e.target === palette) closePalette(); });

  /* ------------------------------------------------------------------ *
   * 16. 彩蛋：输入 kitty
   * ------------------------------------------------------------------ */
  var typedBuffer = "";
  on(document, "keydown", function (e) {
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || (e.target && e.target.isContentEditable)) return;
    if (e.key.length !== 1) return;
    typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-24);
    if (typedBuffer.indexOf("kitty") > -1) {
      typedBuffer = "";
      burst(window.innerWidth / 2, window.innerHeight * 0.42, 60);
      toast("喵～你发现了隐藏彩蛋。Hello Kitty 会记住你的 🎀", 3600);
    }
  });

  /* ------------------------------------------------------------------ *
   * 17. GitHub 实时小数据（失败就保持静态值）
   * ------------------------------------------------------------------ */
  function setLiveText(key, value) {
    $$('[data-live="' + key + '"]').forEach(function (el) { el.textContent = value; });
  }

  function fetchJson(url, timeout) {
    return new Promise(function (resolve, reject) {
      var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      var timer = setTimeout(function () {
        if (controller) controller.abort();
        reject(new Error("timeout"));
      }, timeout || 5000);
      fetch(url, {
        signal: controller ? controller.signal : undefined,
        headers: { Accept: "application/vnd.github+json" }
      }).then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error("http " + res.status);
        return res.json();
      }).then(resolve).catch(function (err) { clearTimeout(timer); reject(err); });
    });
  }

  (function liveStats() {
    if (!site.githubUser || shotMode) return;
    fetchJson("https://api.github.com/users/" + site.githubUser, 4500)
      .then(function (user) {
        if (user && typeof user.public_repos === "number") setLiveText("repos", user.public_repos);
        return fetchJson("https://api.github.com/users/" + site.githubUser + "/repos?sort=pushed&per_page=1", 4500);
      })
      .then(function (repos) {
        if (repos && repos[0]) {
          var latest = repos[0];
          var date = (latest.pushed_at || "").slice(5, 10).replace("-", ".");
          setLiveText("status", "最近推送：" + latest.name + (date ? " · " + date : ""));
        }
      })
      .catch(function () { /* 静默失败，保留静态文案 */ });
  })();

  /* ------------------------------------------------------------------ *
   * 18. 杂项
   * ------------------------------------------------------------------ */
  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  var consoleStyle = "background:#e8275d;color:#fff;padding:4px 10px;border-radius:99px;font-weight:700;font-family:monospace";
  try {
    console.log("%c jinnn.xyz ", consoleStyle);
    console.log("喵？你在看控制台。\n欢迎来信：" + (site.email || "wangzhiwen1224@126.com") + "\nGitHub: " + (site.links ? site.links.github : "https://github.com/luongthimydieu"));
  } catch (e) {}

  /* 首次进入时的小问候（只在主页且没有跳转到锚点时） */
  if (!window.location.hash && !reduceMotion && !shotMode) {
    setTimeout(function () { toast("欢迎来到 jinnn.xyz · 点一下那只猫试试", 3400); }, 3600);
  }
})();
