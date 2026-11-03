/* ============================================================
   Endo Study — offline study app for the endocrinology in-training exam
   Plain JS, no build step, state in localStorage.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------------------------------------------------- blueprint */
  const SECTIONS = [
    { id: "diabetes", name: "Diabetes", weight: 24 },
    { id: "thyroid", name: "Thyroid", weight: 15 },
    { id: "bone", name: "Bone & calcium", weight: 15 },
    { id: "lipids", name: "Lipids & obesity", weight: 12 },
    { id: "adrenal", name: "Adrenal", weight: 10 },
    { id: "pituitary", name: "Pituitary", weight: 10 },
    { id: "female", name: "Reproduction (F)", weight: 7 },
    { id: "male", name: "Reproduction (M)", weight: 7 },
    { id: "unknown", name: "Unfiled", weight: 0 }
  ];

  const SECTION_BY_ID = SECTIONS.reduce(function (m, s) {
    m[s.id] = s;
    return m;
  }, {});

  const LETTERS = ["A", "B", "C", "D", "E"];
  const STORE_KEY = "endo-study-v1";
  const APP_VERSION = 2;
  const BUILD = "20261104e";
  const MS_DAY = 86400000;

  const DEFAULT_SETTINGS = {
    examDate: "2027-01-15",
    dailyNew: 10,
    sessionSize: 15,
    mockSize: 40,
    mockMinutesPerQ: 2.5
  };

  /* ---------------- helpers ---------------- */
  function $(sel) {
    return document.querySelector(sel);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function todayKey(d) {
    const x = d || new Date();
    return x.getFullYear() + "-" + pad2(x.getMonth() + 1) + "-" + pad2(x.getDate());
  }

  function parseKey(k) {
    const p = String(k || "").split("-").map(Number);
    if (p.length !== 3 || p.some(function (n) { return isNaN(n); })) return null;
    return new Date(p[0], p[1] - 1, p[2], 12, 0, 0, 0);
  }

  function addDays(k, n) {
    const d = parseKey(k) || new Date();
    d.setDate(d.getDate() + n);
    return todayKey(d);
  }

  function daysBetween(a, b) {
    const da = parseKey(a);
    const db = parseKey(b);
    if (!da || !db) return NaN;
    return Math.round((db - da) / MS_DAY);
  }

  function fmtDate(k) {
    const d = parseKey(k);
    if (!d) return "not set";
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  function dateLabel(k) {
    const d = daysBetween(todayKey(), k);
    if (isNaN(d)) return "";
    if (d < 0) return "overdue";
    if (d === 0) return "today";
    if (d === 1) return "tomorrow";
    return "in " + d + "d";
  }

  /* Three phases between today and the exam date, shown on Today. */
  function planPhases() {
    const today = todayKey();
    const exam = state.settings.examDate;
    const days = daysBetween(today, exam);
    if (isNaN(days) || days <= 3) return [];

    const p1 = Math.max(1, Math.round(days * 0.55));
    const p2 = Math.max(1, Math.round(days * 0.30));

    return [
      {
        name: "1 · Cover the bank",
        from: today,
        to: addDays(today, p1),
        what: "10 new questions a day; 2-3 JCEM cases a week; tick one reading a week."
      },
      {
        name: "2 · Weak areas",
        from: addDays(today, p1 + 1),
        to: addDays(today, p1 + p2),
        what: "Only sections under 60% in Stats: the guideline first, then the named Endotext chapter, then re-test."
      },
      {
        name: "3 · Mock season",
        from: addDays(today, p1 + p2 + 1),
        to: exam,
        what: "One 40-question timed mock a week, then review every missed question."
      }
    ];
  }

  function planRows() {
    const phases = planPhases();
    if (!phases.length) return '<p class="muted small" style="margin:0">Set an exam date in More to see the plan.</p>';

    let html = "";
    phases.forEach(function (ph) {
      html += '<div class="plan-row">' +
        '<div class="plan-name">' + esc(ph.name) + '</div>' +
        '<div class="plan-date">' + esc(fmtDate(ph.from)) + ' – ' + esc(fmtDate(ph.to)) + '</div>' +
        '<div class="plan-what">' + esc(ph.what) + '</div>' +
        '</div>';
    });
    return html;
  }

  function snippet(text, max) {
    const t = String(text || "").replace(/\s+/g, " ").trim();
    return t.length > max ? t.slice(0, max - 1).trim() + "…" : t;
  }

  /* Only the opening words, for collapsed cards. */
  function firstWords(text, n) {
    const words = String(text || "").replace(/\s+/g, " ").trim().split(" ");
    if (words.length <= n) return words.join(" ");
    return words.slice(0, n).join(" ") + "…";
  }

  /* ---------- flash cards ---------- */
  function findCard(qid) {
    const list = state.cards || [];
    return list.filter(function (c) { return c.qid === qid; })[0] || null;
  }

  function toggleCard(qid) {
    const q = getQuestion(qid);
    if (!q) return;
    state.cards = state.cards || [];
    const at = state.cards.findIndex(function (c) { return c.qid === q.id; });
    if (at !== -1) {
      state.cards.splice(at, 1);
      toast("Flash card removed");
    } else {
      state.cards.unshift({
        id: "c-" + q.id,
        qid: q.id,
        section: q.section,
        vignette: q.vignette,
        options: (q.options || []).slice(0, 5),
        answer: q.answer,
        why: q.why || "",
        ref: q.ref || "",
        at: Date.now()
      });
      toast("Added to flash cards");
    }

    save();

    const on = !!findCard(q.id);
    const buttons = document.querySelectorAll(".card-btn");
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute("data-id") === q.id) {
        buttons[i].textContent = on ? "✓" : "+";
        buttons[i].classList.toggle("on", on);
      }
    }

    /* only the Study list needs redrawing, to add or drop the card itself */
    if (ui.tab === "study" && !ui.session) render();
  }

  function cardButton(qid) {
    const on = !!findCard(qid);
    return '<button class="card-btn' + (on ? " on" : "") + '" data-action="card-toggle" data-id="' +
      esc(qid) + '" aria-label="Flash card">' + (on ? "✓" : "+") + '</button>';
  }

  function cardHtml(c) {
    let opts = "";
    (c.options || []).forEach(function (text, k) {
      const L = LETTERS[k];
      opts += '<div class="flash-opt"><span class="opt-letter">' + L + '</span>' +
        '<span class="opt-text">' + esc(text) + '</span></div>';
    });

    const answerText = (c.options || [])[LETTERS.indexOf(c.answer)] || "";

    return '<div class="flash" data-action="flash-flip">' +
      '<div class="flash-front">' +
      '<div class="flash-top"><span class="tag">' + esc(sectionName(c.section)) + '</span>' +
      '<button class="card-btn on" data-action="card-toggle" data-id="' + esc(c.qid) + '">✓</button></div>' +
      '<div class="flash-vignette">' + esc(c.vignette) + '</div>' +
      '<div class="flash-opts">' + opts + '</div>' +
      '<p class="flash-hint">Tap to see the answer</p>' +
      '</div>' +
      '<div class="flash-back">' +
      '<div class="flash-top"><span class="tag">Answer ' + esc(c.answer) + '</span>' +
      '<button class="card-btn on" data-action="card-toggle" data-id="' + esc(c.qid) + '">✓</button></div>' +
      '<p class="flash-answer"><b>' + esc(c.answer) + ')</b> ' + esc(answerText) + '</p>' +
      (c.why ? '<p class="why">' + esc(c.why) + '</p>' : '') +
      (c.ref ? '<p class="ref">' + esc(c.ref) + '</p>' : '') +
      '<p class="flash-hint">Tap to go back</p>' +
      '</div></div>';
  }


  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function sectionName(id) {
    return (SECTION_BY_ID[id] || SECTION_BY_ID.unknown).name;
  }

  /* ---------------- state ---------------- */
  function defaultSync() {
    return {
      url: "",
      off: false,
      deviceId: "d-" + Math.random().toString(36).slice(2, 10),
      lastSyncAt: 0,
      lastError: ""
    };
  }

  function defaultState() {
    return {
      version: APP_VERSION,
      seeded: false,
      settings: Object.assign({}, DEFAULT_SETTINGS),
      questions: [],
      progress: {},
      days: {},
      totalAnswered: 0,
      deletedBankIds: [],
      learn: { done: {} },
      history: [],
      cards: [],
      meta: { createdAt: Date.now(), lastSavedAt: 0, settingsAt: 0, lastPushAt: 0 },
      sync: defaultSync()
    };
  }

  function normalizeSeeds() {
    const raw = window.SEED_QUESTIONS || [];
    return raw.map(function (q, i) {
      return {
        id: "seed-" + (i + 1),
        section: SECTION_BY_ID[q.section] ? q.section : "unknown",
        vignette: String(q.vignette || ""),
        options: (q.options || []).map(String),
        answer: String(q.answer || "A").toUpperCase(),
        why: String(q.why || ""),
        ref: String(q.ref || ""),
        source: "sample",
        created: "seed"
      };
    });
  }

  /* The ESAP 2026 bank ships with the app as window.ESAP_QUESTIONS (data/esap-*.js).
     Ids are stable (esap-<question number>) so scheduling survives code updates. */
  function normalizeEsapBank() {
    const raw = window.ESAP_QUESTIONS || [];
    const out = [];
    raw.forEach(function (q) {
      const n = Number(q.n) || 0;
      const options = (q.options || []).map(String).filter(function (o) { return o.trim().length > 0; });
      const answer = String(q.answer || "").trim().toUpperCase().slice(0, 1);
      if (!n || !q.vignette || options.length < 2) return;
      if (LETTERS.indexOf(answer) === -1 || LETTERS.indexOf(answer) >= options.length) return;
      out.push({
        id: "esap-" + n,
        section: SECTION_BY_ID[q.section] ? q.section : "unknown",
        vignette: String(q.vignette),
        options: options,
        answer: answer,
        why: String(q.why || ""),
        ref: String(q.ref || ""),
        source: "ESAP 2026",
        created: "bank"
      });
    });
    return out;
  }

  /* Second set: written to the ITE blueprint from free guidelines (data/free-01.js). */
  function normalizeFreeBank() {
    const raw = window.FREE_QUESTIONS || [];
    const out = [];
    raw.forEach(function (q) {
      const n = Number(q.n) || 0;
      const options = (q.options || []).map(String).filter(function (o) { return o.trim().length > 0; });
      const answer = String(q.answer || "").trim().toUpperCase().slice(0, 1);
      if (!n || !q.vignette || options.length < 2) return;
      if (LETTERS.indexOf(answer) === -1 || LETTERS.indexOf(answer) >= options.length) return;
      out.push({
        id: "free-" + n,
        section: SECTION_BY_ID[q.section] ? q.section : "unknown",
        vignette: String(q.vignette),
        options: options,
        answer: answer,
        why: String(q.why || ""),
        ref: String(q.ref || ""),
        source: "Written set",
        created: "bank"
      });
    });
    return out;
  }

  function mergeBankInto(s, list) {
    const have = {};
    s.questions.forEach(function (q) { have[q.id] = true; });
    s.deletedBankIds.forEach(function (id) { have[id] = true; });
    list.forEach(function (q) {
      if (!have[q.id]) {
        s.questions.push(q);
        have[q.id] = true;
      }
    });
  }

  function loadState() {
    let parsed = null;
    let raw = null;

    try {
      raw = localStorage.getItem(STORE_KEY);
      if (raw) parsed = JSON.parse(raw);
    } catch (e) {
      /* keep the unreadable copy rather than throwing it away */
      parsed = null;
      try {
        if (raw) localStorage.setItem(STORE_KEY + "-corrupt-" + Date.now(), raw);
      } catch (err) { /* nothing else we can do */ }
    }

    const s = parsed && Array.isArray(parsed.questions) ? parsed : defaultState();

    s.settings = Object.assign({}, DEFAULT_SETTINGS, state_settingsOf(s));
    if (!Array.isArray(s.questions)) s.questions = [];
    if (!s.progress || typeof s.progress !== "object") s.progress = {};
    if (!s.days || typeof s.days !== "object") s.days = {};
    s.totalAnswered = s.totalAnswered || 0;

    /* v1 -> v2: metadata for timestamps and the live copy */
    s.meta = Object.assign({ createdAt: Date.now(), lastSavedAt: 0, settingsAt: 0, lastPushAt: 0 }, s.meta || {});
    s.sync = Object.assign(defaultSync(), s.sync || {});
    s.version = APP_VERSION;

    if (!s.seeded) {
      s.questions = s.questions.concat(normalizeSeeds());
      s.seeded = true;
    }

    if (!Array.isArray(s.deletedBankIds)) s.deletedBankIds = [];

    if (!s.learn || typeof s.learn !== "object") s.learn = { done: {} };
    if (!s.learn.done || typeof s.learn.done !== "object") s.learn.done = {};
    if (!Array.isArray(s.history)) s.history = [];
    if (!Array.isArray(s.cards)) s.cards = [];

    const bank = normalizeEsapBank().concat(normalizeFreeBank());
    if (bank.length) {
      /* Once a full bank is available the starter samples are redundant:
         drop them unless they have been studied. */
      s.questions = s.questions.filter(function (q) {
        if (!/^seed-/.test(q.id)) return true;
        const p = s.progress[q.id];
        return !!(p && p.attempts);
      });

      mergeBankInto(s, bank);
    }

    return s;
  }

  function state_settingsOf(s) {
    return s && s.settings ? s.settings : {};
  }

  let state = loadState();

  /* Write to this device. Never schedules a push on its own. */
  function persist() {
    state.meta = state.meta || {};
    state.meta.lastSavedAt = Date.now();
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      toast("Could not save — storage may be full. Export a backup.");
      return false;
    }
  }

  /* Every change the user makes goes through save(): write to this device, then
     push to the live copy a moment later if it is on. */
  function save() {
    persist();
    scheduleSync();
  }

  function storageOk() {
    try {
      localStorage.setItem(STORE_KEY + "-probe", "1");
      localStorage.removeItem(STORE_KEY + "-probe");
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- progress ---------- */
  function prog(id) {
    let p = state.progress[id];
    if (!p) {
      p = {
        ease: 2.5,
        interval: 0,
        due: todayKey(),
        reps: 0,
        lapses: 0,
        attempts: 0,
        correct: 0,
        flagged: false,
        last: null,
        lastGrade: null,
        firstSeen: null,
        day: null,
        repeatToday: false
      };
      state.progress[id] = p;
    }
    if (!p.due) p.due = todayKey();
    if (typeof p.ease !== "number") p.ease = 2.5;
    if (typeof p.reps !== "number") p.reps = 0;
    if (typeof p.attempts !== "number") p.attempts = 0;
    if (typeof p.correct !== "number") p.correct = 0;
    if (typeof p.lapses !== "number") p.lapses = 0;
    return p;
  }

  function getQuestion(id) {
    return state.questions.find(function (q) { return q.id === id; }) || null;
  }

  function newDoneToday() {
    const t = todayKey();
    return Object.keys(state.progress).filter(function (k) {
      return state.progress[k].firstSeen === t;
    }).length;
  }

  /* What is left: unseen cards (what a session serves, capped by the daily
     limit) and how many have been answered at least once. */
  function dueCounts() {
    let fresh = 0;
    let answered = 0;
    let flagged = 0;
    let seen = 0;
    let solid = 0;

    state.questions.forEach(function (q) {
      const p = prog(q.id);
      if (p.attempts === 0) fresh++;
      else answered++;
      if (p.reps > 0) seen++;
      if (p.interval >= 21) solid++;
      if (p.flagged) flagged++;
    });

    const room = ui.ignoreLimit
      ? fresh
      : Math.max(0, (state.settings.dailyNew || 0) - newDoneToday());
    const newToday = Math.min(fresh, room);

    return {
      fresh: fresh,
      answered: answered,
      flagged: flagged,
      seen: seen,
      solid: solid,
      room: room,
      newToday: newToday,
      total: state.questions.length,
      due: newToday
    };
  }

  /* How much of the bank has been answered at least once. */
  function progressState() {
    const total = state.questions.length;
    const answered = state.questions.filter(function (q) {
      return prog(q.id).attempts > 0;
    }).length;
    return {
      total: total,
      answered: answered,
      pct: total ? Math.round((answered / total) * 100) : 0,
      finished: total > 0 && answered >= total
    };
  }

  function dayReviews(k) {
    const d = state.days[k];
    return d ? (d.reviews || 0) : 0;
  }

  function streak() {
    let n = 0;
    let k = todayKey();
    if (!(dayReviews(k) > 0)) k = addDays(k, -1);
    while (dayReviews(k) > 0 && n < 3650) {
      n++;
      k = addDays(k, -1);
    }
    return n;
  }

  function bumpDay(isNew) {
    const k = todayKey();
    const d = state.days[k] || { reviews: 0, newQ: 0 };
    d.reviews = (d.reviews || 0) + 1;
    if (isNew) d.newQ = (d.newQ || 0) + 1;
    state.days[k] = d;
  }

  function recordAnswer(id, correct) {
    const p = prog(id);
    const wasNew = p.reps === 0 && !p.firstSeen;
    p.attempts += 1;
    if (correct) p.correct += 1;
    if (wasNew) p.firstSeen = todayKey();
    /* used to keep a card out of later sessions on the same day */
    p.day = todayKey();
    p.repeatToday = false;
    bumpDay(wasNew);
    state.totalAnswered += 1;
  }

  /* ---------- spaced repetition ---------- */
  function nextInterval(p, grade) {
    if (grade === "again") return 0;
    if (grade === "hard") return Math.max(1, Math.round((p.interval || 1) * 1.2));
    if (grade === "easy") {
      const ease = Math.min(3.2, p.ease + 0.15);
      return p.reps === 0 ? 2 : Math.round(Math.max(p.interval, 1) * ease * 1.3);
    }
    if (p.reps === 0) return 1;
    if (p.reps === 1) return 3;
    return Math.round(Math.max(p.interval, 1) * p.ease);
  }

  function schedule(id, grade) {
    const p = prog(id);
    const today = todayKey();

    if (grade === "again") {
      p.interval = 0;
      p.due = today;
      p.lapses += 1;
      p.ease = Math.max(1.3, p.ease - 0.2);
    } else if (grade === "hard") {
      p.interval = nextInterval(p, "hard");
      p.ease = Math.max(1.3, p.ease - 0.15);
      p.due = addDays(today, p.interval);
    } else if (grade === "easy") {
      p.ease = Math.min(3.2, p.ease + 0.15);
      p.interval = nextInterval(p, "easy");
      p.due = addDays(today, p.interval);
    } else {
      p.interval = nextInterval(p, "good");
      p.due = addDays(today, p.interval);
    }

    if (grade !== "again") p.reps += 1;
    if (!p.firstSeen) p.firstSeen = today;
    p.last = today;
    p.lastGrade = grade;
    p.day = today;
    p.repeatToday = (grade === "again");
    save();
  }

  /* ---------------- ui state ---------------- */
  const ui = {
    tab: "today",
    section: "all",
    mode: "new",
    catchupPrompt: false,
    startTraining: false,
    size: 20,
    ignoreLimit: false,
    learnFilter: "all",
    detailId: null,
    editingId: null,
    bankQuery: "",
    bankFilter: "all",
    bankSection: "all",
    session: null,
    clock: null
  };

  let toastTimer = null;

  function toast(msg) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.hidden = true;
    }, 2600);
  }

  /* ---------------- chrome ---------------- */
  function renderChrome() {
    document.querySelectorAll("#tabbar .tab").forEach(function (b) {
      b.classList.toggle("active", b.dataset.tab === ui.tab);
    });

    const meta = $("#topbar-meta");
    if (!meta) return;
    const d = daysBetween(todayKey(), state.settings.examDate);
    let line;
    if (isNaN(d)) line = "set your exam date";
    else if (d > 0) line = d + (d === 1 ? " day to exam" : " days to exam");
    else if (d === 0) line = "exam day";
    else line = "exam date passed";

    meta.textContent = line;
  }

  function render() {
    const v = $("#view");
    if (!v) return;

    if (ui.session) {
      v.innerHTML = renderSession();
    } else if (ui.tab === "today") {
      v.innerHTML = renderToday();
    } else if (ui.tab === "study") {
      v.innerHTML = renderStudySetup();
    } else if (ui.tab === "bank") {
      v.innerHTML = ui.detailId ? renderDetail() : renderBank();
    } else if (ui.tab === "learn") {
      v.innerHTML = renderLearn();
    } else {
      v.innerHTML = renderMore();
    }

    renderChrome();
    syncClock();
    refreshSyncUI();
  }

  function formatStamp(ms) {
    const d = new Date(ms);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) + " · " +
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  function historyHtml() {
    const list = state.history || [];
    if (!list.length) {
      return '<p class="muted small" style="margin:0">No sessions yet. Finish one and it is kept here with every answer.</p>';
    }

    let html = '<div class="hist">';
    list.forEach(function (sess) {
      const pct = sess.count ? Math.round((sess.correct / sess.count) * 100) : 0;
      const label = (sess.kind === "mock" ? "Timed mock" : "Practice") +
        " · " + sess.count + " questions · " + pct + "%";

      html += '<details class="hist-session">' +
        '<summary><span>' + esc(formatStamp(sess.at)) + '</span>' +
        '<span class="muted small">' + esc(label) + '</span></summary>';

      sess.items.forEach(function (it, i) {
        let opts = "";
        (it.options || []).forEach(function (text, k) {
          const L = LETTERS[k];
          let cls = "option";
          if (L === it.answer) cls += " correct";
          else if (L === it.letter) cls += " wrong";
          opts += '<div class="' + cls + '">' +
            '<span class="opt-letter">' + L + '</span>' +
            '<span class="opt-text">' + esc(text) + '</span></div>';
        });

        html += '<div class="hist-item">' +
          '<div class="hist-head" data-action="hist-toggle">' +
          '<span class="tag">' + esc(sectionName(it.section)) + '</span>' +
          '<span class="snippet">' + esc(firstWords(it.vignette, 5)) + '</span>' +
          '<span class="mark ' + (it.correct ? "ok" : "no") + '">' + (it.correct ? "✓" : "✗") + '</span>' +
          cardButton(it.id) +
          '</div>' +
          '<div class="hist-body">' +
          '<div class="vignette">' + esc(it.vignette) + '</div>' +
          '<div class="options">' + opts + '</div>' +
          '<p class="hist-choice">You chose <b>' + esc(it.letter) + '</b> · answer <b>' + esc(it.answer) + '</b></p>' +
          (it.why ? '<p class="why">' + esc(it.why) + '</p>' : '') +
          (it.ref ? '<p class="ref">' + esc(it.ref) + '</p>' : '') +
          '</div></div>';
      });

      html += '</details>';
    });
    html += '</div>';
    return html;
  }

  /* ---------------- today ---------------- */
  function renderToday() {
    const today = todayKey();
    const qs = state.questions;
    const total = qs.length;

    const counts = dueCounts();
    const fresh = counts.fresh;
    const flagged = counts.flagged;
    const seen = counts.seen;

    let att = 0, cor = 0;
    qs.forEach(function (q) {
      const p = prog(q.id);
      att += p.attempts || 0;
      cor += p.correct || 0;
    });

    const dLeft = daysBetween(today, state.settings.examDate);
    const room = counts.room;
    const acc = att ? Math.round((cor / att) * 100) : null;

    let html = "";

    /* exam card */
    html += '<section class="card">';
    if (isNaN(dLeft)) {
      html += '<div class="hero"><div><div class="h3">Exam date</div><div class="big-num">—</div>' +
        '<div class="muted small">Set target date in More</div></div></div>';
    } else if (dLeft >= 0) {
      html += '<div class="hero"><div class="grow"><div class="h3">' + esc(fmtDate(state.settings.examDate)) + '</div>' +
        '<div class="big-num">' + dLeft + '<span>days left</span></div></div>' +
        '<div class="pill-count">' + streak() + ' day streak</div></div>';
    } else {
      html += '<div class="hero"><div><div class="h3">Exam date passed</div>' +
        '<div class="big-num">' + Math.abs(dLeft) + '<span>days ago</span></div></div></div>';
    }
    html += '</section>';

    /* today's work */
    const notYet = Math.max(0, total - counts.answered);
    const allDone = total > 0 && counts.answered >= total;
    const unseenNow = counts.newToday;

    let primaryBtn;
    if (unseenNow > 0) {
      primaryBtn = '<button class="btn primary wide" data-action="quick-start">Start today\'s session · ' +
        (ui.size > 0 ? Math.min(unseenNow, ui.size) : unseenNow) + ' new</button>';
    } else if (allDone) {
      primaryBtn = '<button class="btn primary wide" data-action="quick-repeat">Repeat the full bank · ' +
        total + ' questions</button>';
    } else if (counts.answered > 0) {
      primaryBtn = '<button class="btn primary wide" data-action="quick-catchup">Catch up on answered · ' +
        (ui.size > 0 ? Math.min(counts.answered, ui.size) : counts.answered) + ' questions</button>';
    } else {
      primaryBtn = '<button class="btn primary wide" data-action="quick-start">Nothing left in this section</button>';
    }

    const catchupBtn = (counts.answered > 0 && unseenNow > 0)
      ? '<button class="btn ghost wide" data-action="quick-catchup">Catch up on answered · ' + counts.answered + '</button>'
      : '';

    html += '<section class="card">' +
      '<div class="row between"><h3 style="margin:0">Today</h3>' +
      '<span class="muted small">' +
      (allDone ? "bank finished" : room > 0 ? room + " new left today" : "daily limit reached") + '</span></div>' +
      '<div class="row" style="margin:12px 0 14px">' +
      '<div class="stat"><b>' + notYet + '</b><span>not yet answered</span></div>' +
      '<div class="stat"><b>' + counts.answered + '</b><span>answered</span></div>' +
      '<div class="stat"><b>' + flagged + '</b><span>flagged</span></div>' +
      '</div>' +
      '<div class="stack">' + primaryBtn + catchupBtn +
      '<button class="btn ghost wide" data-action="start-mock">' + mockLabel() + '</button>' +
      '</div></section>';

    /* study plan, coverage, load and reading, folded away */
    let cov = "";
    SECTIONS.forEach(function (s) {
      const list = qs.filter(function (q) { return q.section === s.id; });
      if (!list.length) return;
      let st = 0, a = 0, c = 0;
      list.forEach(function (q) {
        const p = prog(q.id);
        if (p.reps > 0) st++;
        a += p.attempts || 0;
        c += p.correct || 0;
      });
      const pct = Math.round((st / list.length) * 100);
      const plan = Math.round(((s.weight || 0) / 100) * total);
      const sAcc = a ? Math.round((c / a) * 100) : null;
      cov += '<div class="section-row">' +
        '<div class="row between small"><span>' + esc(s.name) + '</span>' +
        '<span class="muted">' + st + '/' + list.length +
        (plan ? ' · plan ' + plan : '') +
        (sAcc === null ? '' : ' · ' + sAcc + '%') + '</span></div>' +
        '<div class="bar' + (sAcc !== null && sAcc < 60 ? ' warm' : '') + '"><i style="width:' + pct + '%"></i></div></div>';
    });
    if (!cov) cov = '<div class="empty">No questions yet.</div>';

    const fc = [];
    for (let i = 0; i < 14; i++) {
      const k = addDays(today, i);
      let n = 0;
      qs.forEach(function (q) {
        const p = prog(q.id);
        if (p.reps === 0) return;
        if (p.due === k) n++;
        if (i === 0 && p.due < today) n++;
      });
      fc.push({ k: k, n: n });
    }
    const maxF = fc.reduce(function (m, f) { return Math.max(m, f.n); }, 1);

    let load = '<div class="forecast">';
    fc.forEach(function (f) {
      const d = parseKey(f.k);
      const label = d ? d.getDate() : "";
      const h = f.n ? Math.max(8, Math.round((f.n / maxF) * 100)) : 3;
      load += '<div class="fc"><i style="height:' + h + '%"></i><span>' + label + '</span></div>';
    });
    load += '</div>';

    html += '<section class="card">' +
      '<h3 style="margin:0 0 12px">Overview</h3>' +
      '<div class="row">' +
      '<div class="stat"><b>' + counts.answered + '/' + total + '</b><span>answered</span></div>' +
      '<div class="stat"><b>' + (acc === null ? "—" : acc + "%") + '</b><span>accuracy</span></div>' +
      '<div class="stat"><b>' + streak() + '</b><span>day streak</span></div>' +
      '</div>' +
      '<details class="fold"><summary>Study plan</summary>' + planRows() + '</details>' +
      '<details class="fold"><summary>Blueprint coverage</summary>' + cov + '</details>' +
      '<details class="fold"><summary>Review load · next 14 days</summary>' + load + '</details>' +
      '<details class="fold"><summary>Reading list</summary>' +
      '<p class="muted small" style="margin:0 0 10px">' + learnDoneCount() + ' of ' + learnItems().length + ' sources ticked off.</p>' +
      '<button class="btn ghost wide" data-action="go-learn">Open Learn</button></details>' +
      '<details class="fold"><summary>History' +
      ((state.history || []).length ? ' · ' + state.history.length + ' sessions' : '') +
      '</summary>' + historyHtml() + '</details>' +
      '</section>';

    html += '<p class="center" style="margin:16px 0 0"><a class="tour-link" href="tour.html">&#9654; Watch the 2-minute app tour</a></p>';

    return html;
  }

  /* ---------------- study setup ---------------- */
  function renderStudySetup() {
    const counts = {};
    SECTIONS.forEach(function (s) { counts[s.id] = 0; });
    state.questions.forEach(function (q) {
      const k = SECTION_BY_ID[q.section] ? q.section : "unknown";
      counts[k] = (counts[k] || 0) + 1;
    });

    const dueState = dueCounts();
    const fresh = dueState.fresh;

    let html = '<h2>Study</h2>';

    const ps = progressState();
    const mode = ui.mode || "new";
    const unseen = Math.max(0, ps.total - ps.answered);

    let modeLine;
    if (mode === "catchup") {
      modeLine = "Only questions you have already answered, weakest first. This is the catch-up pass.";
    } else if (mode === "full") {
      modeLine = "The whole bank again in a fresh order, as a full run.";
    } else {
      modeLine = "Only questions you have never answered. Once answered, a card stays out of the way until you ask to catch up or repeat.";
    }

    html += '<section class="card">' +
      '<div class="row between"><h3 style="margin:0">What to study</h3>' +
      '<span class="muted small">' + ps.answered + ' of ' + ps.total + ' answered · ' + ps.pct + '%</span></div>' +
      '<div class="chips" style="margin-top:10px">' +
      '<button class="chip' + (mode === "new" ? " on" : "") + '" data-action="pick-mode" data-mode="new">New (' + unseen + ')</button>' +
      '<button class="chip' + (mode === "catchup" ? " on" : "") + '" data-action="pick-mode" data-mode="catchup">Catch up (' + ps.answered + ')</button>' +
      '<button class="chip' + (mode === "full" ? " on" : "") + (ps.finished ? "" : " disabled") +
      '" data-action="pick-mode" data-mode="full">Full repeat</button>' +
      '</div>' +
      '<div class="bar" style="margin-top:12px"><i style="width:' + ps.pct + '%"></i></div>' +
      '<p class="muted small" style="margin:10px 0 0">' + modeLine + '</p>' +
      '</section>';

    /* retake catch-up, with a choice of training or graded */
    html += '<section class="card"><h3>Catch up retake</h3>';
    if (ps.answered === 0) {
      html += '<p class="muted small" style="margin:0">Answer a few questions first — they come back here.</p>';
    } else if (ui.catchupPrompt) {
      html += '<p class="muted small" style="margin:0 0 10px">Retake the ' + ps.answered +
        ' questions you have already answered. <b>Training</b> changes nothing at all — no answers, no stats, no history. <b>Graded</b> counts everywhere.</p>' +
        '<div class="stack">' +
        '<button class="btn primary wide" data-action="catchup-training">Training only — no progress changes</button>' +
        '<button class="btn wide" data-action="catchup-graded">Graded — counts in your stats</button>' +
        '<button class="btn ghost wide" data-action="catchup-cancel">Cancel</button>' +
        '</div>';
    } else {
      html += '<button class="btn wide" data-action="catchup-ask">Retake catch-up · ' +
        ps.answered + ' questions</button>';
    }
    html += '</section>';

    /* flash cards */
    const cards = state.cards || [];
    html += '<details class="fold card"><summary>Flash cards · ' + cards.length + '</summary>';
    if (!cards.length) {
      html += '<p class="muted small" style="margin:0">None yet. Tap <b>+</b> on any question — in a session, in Questions, or in the history — and it lands here.</p>';
    } else {
      cards.forEach(function (c) { html += cardHtml(c); });
    }
    html += '</details>';

    html += '<section class="card"><h3>Section</h3><div class="chips">' +
      '<button class="chip' + (ui.section === "all" ? " on" : "") + '" data-action="pick-section" data-section="all">' +
      'All (' + state.questions.length + ')</button>';
    SECTIONS.forEach(function (s) {
      if (!counts[s.id]) return;
      html += '<button class="chip' + (ui.section === s.id ? " on" : "") + '" data-action="pick-section" data-section="' + s.id + '">' +
        esc(s.name) + ' (' + counts[s.id] + ')</button>';
    });
    html += '</div>';

    html += '<hr class="div" /><h3>Cards per session</h3><div class="chips">' +
      [10, 20, 40].map(function (n) {
        return '<button class="chip' + (ui.size === n ? " on" : "") + '" data-action="pick-size" data-size="' + n + '">' + n + '</button>';
      }).join("") +
      '<button class="chip' + (ui.size === 0 ? " on" : "") + '" data-action="pick-size" data-size="0">Full set</button>' +
      '</div>';

    html += '<p class="muted small" style="margin:14px 0 0">New today: ' + newDoneToday() + ' used of ' +
      (state.settings.dailyNew || 0) + ' allowed · ' + fresh + ' never seen</p>' +
      '<div class="chips" style="margin-top:8px">' +
      '<button class="chip' + (ui.ignoreLimit ? " on" : "") + '" data-action="toggle-limit">Ignore daily cap</button>' +
      '</div>';

    const modeName = mode === "catchup" ? "catch up" : mode === "full" ? "full repeat" : "new questions";

    html += '<div class="stack" style="margin-top:16px">' +
      '<button class="btn primary wide" data-action="start-practice">Start ' + modeName + ' · ' +
      esc(ui.section === "all" ? "all sections" : sectionName(ui.section)) + ' · ' + sessionSizeLabel() + '</button>' +
      '<button class="btn ghost wide" data-action="start-mock">' + mockLabel() + '</button>' +
      '</div>';

    html += '<p class="muted small" style="margin:12px 0 0">Practice shows the answer and explanation immediately. The mock hides feedback until the end and draws on the whole bank at the blueprint weights.</p>';
    html += '</section>';

    html += '<details class="fold card"><summary>Your progress</summary>' + renderStats() + '</details>';

    return html;
  }

  /* ---------------- session ---------------- */
  function startPractice() {
    const today = todayKey();
    const sec = ui.section;
    const mode = ui.mode || "new";

    const allInSection = state.questions.filter(function (q) {
      return sec === "all" || q.section === sec;
    });

    let pool;

    if (mode === "catchup") {
      /* only questions already answered, weakest first, then longest overdue */
      const trainingOnly = !!ui.startTraining;
      pool = allInSection.filter(function (q) {
        const p = prog(q.id);
        if (p.attempts === 0) return false;
        if (trainingOnly) return true;
        return !(p.day === today && !p.repeatToday);
      });
      pool.sort(function (a, b) {
        const pa = prog(a.id);
        const pb = prog(b.id);
        const ra = pa.attempts ? pa.correct / pa.attempts : 1;
        const rb = pb.attempts ? pb.correct / pb.attempts : 1;
        if (ra !== rb) return ra - rb;
        return String(pa.due).localeCompare(String(pb.due));
      });
    } else if (mode === "full") {
      /* the whole bank again, in a fresh order */
      pool = shuffle(allInSection);
    } else {
      /* only questions that have never been answered */
      pool = allInSection.filter(function (q) { return prog(q.id).attempts === 0; });
      if (!ui.ignoreLimit) {
        const room = Math.max(0, (state.settings.dailyNew || 0) - newDoneToday());
        pool = pool.slice(0, room);
      }
    }

    let queue = pool;
    if (ui.size > 0) queue = queue.slice(0, ui.size);

    if (!queue.length) {
      const ps = progressState();

      if (mode === "new") {
        if (ps.answered > 0 && ps.answered >= ps.total) {
          if (window.confirm("You have answered all " + ps.total + " questions. Repeat the full bank?")) {
            ui.mode = "full";
            startPractice();
          }
        } else if (!ui.ignoreLimit && ps.total > ps.answered) {
          if (window.confirm("Today's new-card limit is used up. Keep going with new questions?")) {
            ui.ignoreLimit = true;
            startPractice();
          }
        } else if (ps.answered > 0) {
          if (window.confirm("No new questions left in this section. Catch up on the ones you have answered?")) {
            ui.mode = "catchup";
            startPractice();
          }
        } else {
          toast("No questions in this section");
        }
        return;
      }

      if (mode === "catchup") {
        toast("Nothing answered in this section yet");
        return;
      }

      toast("Nothing to study");
      return;
    }

    ui.session = {
      kind: "practice",
      mode: mode,
      training: !!ui.startTraining,
      ids: queue.map(function (q) { return q.id; }),
      i: 0,
      answered: {},
      log: [],
      startedAt: Date.now(),
      finished: false
    };
    ui.startTraining = false;
    ui.tab = "study";
    render();
    window.scrollTo({ top: 0 });
  }

  function buildMock(size) {
    const qs = state.questions;
    if (!qs.length) return [];

    const groups = {};
    SECTIONS.forEach(function (s) {
      groups[s.id] = shuffle(qs.filter(function (q) { return q.section === s.id; }));
    });

    const order = SECTIONS.filter(function (s) { return groups[s.id].length > 0; });
    const totalWeight = order.reduce(function (a, s) { return a + (s.weight || 1); }, 0) || 1;

    let picks = [];
    order.forEach(function (s) {
      const want = Math.max(1, Math.round(size * ((s.weight || 1) / totalWeight)));
      picks = picks.concat(groups[s.id].slice(0, want));
    });

    if (picks.length < size) {
      const taken = picks.map(function (q) { return q.id; });
      const rest = shuffle(qs.filter(function (q) { return taken.indexOf(q.id) === -1; }));
      picks = picks.concat(rest.slice(0, size - picks.length));
    }

    return shuffle(picks).slice(0, size);
  }

  function startMock() {
    const picks = buildMock(state.settings.mockSize || 30);
    if (!picks.length) {
      toast("Add questions first");
      return;
    }
    const minutes = Math.max(5, Math.round(picks.length * (state.settings.mockMinutesPerQ || 1.5)));

    ui.session = {
      kind: "mock",
      ids: picks.map(function (q) { return q.id; }),
      i: 0,
      answered: {},
      log: [],
      startedAt: Date.now(),
      endsAt: Date.now() + minutes * 60000,
      minutes: minutes,
      finished: false
    };
    ui.tab = "study";
    render();
    window.scrollTo({ top: 0 });
  }

  /* Keeps a snapshot of a finished session for the History fold on Today. */
  function archiveSession() {
    const s = ui.session;
    if (!s) return;

    const order = [];
    const last = {};
    s.log.forEach(function (e) {
      if (!(e.id in last)) order.push(e.id);
      last[e.id] = e;
    });
    if (!order.length) return;

    const items = [];
    let correct = 0;

    order.forEach(function (id) {
      const q = getQuestion(id);
      const e = last[id];
      if (!q || !e) return;
      if (e.correct) correct++;
      items.push({
        id: id,
        section: q.section,
        vignette: q.vignette,
        options: (q.options || []).slice(0, 5),
        answer: q.answer,
        why: q.why || "",
        ref: q.ref || "",
        letter: e.letter,
        correct: !!e.correct
      });
    });

    if (!items.length) return;

    state.history = state.history || [];
    state.history.unshift({
      id: "s-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      at: Date.now(),
      startedAt: s.startedAt || Date.now(),
      kind: s.kind,
      mode: s.mode || ui.mode || "new",
      count: items.length,
      correct: correct,
      items: items
    });

    if (state.history.length > 40) state.history.length = 40;
  }

  function finishSession() {
    const s = ui.session;
    if (!s || s.finished) return;
    s.finished = true;

    if (s.kind === "mock") {
      const first = {};
      s.log.forEach(function (e) {
        if (!(e.id in first)) first[e.id] = e.correct;
      });
      Object.keys(first).forEach(function (id) {
        schedule(id, first[id] ? "good" : "again");
      });
    }

    if (!s.training) archiveSession();

    if (ui.clock) {
      clearInterval(ui.clock);
      ui.clock = null;
    }
    save();
  }

  function syncClock() {
    if (ui.clock) {
      clearInterval(ui.clock);
      ui.clock = null;
    }
    const s = ui.session;
    if (!s || s.kind !== "mock" || s.finished) return;
    if (!document.getElementById("mock-clock")) return;

    const tick = function () {
      const cur = ui.session;
      if (!cur || cur.kind !== "mock" || cur.finished) {
        if (ui.clock) clearInterval(ui.clock);
        ui.clock = null;
        return;
      }
      const left = Math.max(0, cur.endsAt - Date.now());
      const node = document.getElementById("mock-clock");
      const totalSec = Math.round(left / 1000);
      if (node) node.textContent = Math.floor(totalSec / 60) + ":" + pad2(totalSec % 60);
      if (left <= 0) {
        finishSession();
        render();
      }
    };

    tick();
    ui.clock = setInterval(tick, 1000);
  }

  function renderSession() {
    const s = ui.session;
    if (!s) return "";

    if (s.i >= s.ids.length) {
      if (!s.finished) finishSession();
      return renderSummary();
    }

    const q = getQuestion(s.ids[s.i]);
    if (!q) {
      s.i++;
      return renderSession();
    }

    const isMock = s.kind === "mock";
    const a = s.answered[q.id];
    const p = prog(q.id);

    let html = '<section class="card">' +
      '<div class="row between">' +
      '<span class="tag">' + esc(sectionName(q.section)) + '</span>' +
      '<div class="row" style="gap:8px">' +
      '<span class="muted small mono">' + (s.i + 1) + ' / ' + s.ids.length + '</span>' +
      cardButton(q.id) +
      '</div></div>';

    if (s.kind === "mock") {
      html += '<div class="row between" style="margin-top:8px">' +
        '<span class="muted small">Mock · ' + (s.minutes || 0) + ' min</span>' +
        '<span class="mono small" id="mock-clock">--:--</span></div>';
    }

    html += '<div class="vignette">' + esc(q.vignette) + '</div>';

    let opts = "";
    q.options.slice(0, 5).forEach(function (text, i) {
      const L = LETTERS[i];
      let cls = "option";
      if (a) {
        if (L === q.answer) cls += " correct";
        else if (L === a.letter) cls += " wrong";
      }
      opts += '<button class="' + cls + '" data-action="answer" data-letter="' + L + '"' + (a ? " disabled" : "") + '>' +
        '<span class="opt-letter">' + L + '</span><span class="opt-text">' + esc(text) + '</span></button>';
    });
    html += '<div class="options">' + opts + '</div>';

    if (!isMock && a) html += renderFeedback(q, a, !!s.training);

    if (isMock) {
      html += '<p class="muted small" style="margin:12px 0 0">Pick one answer to move on. Feedback comes at the end.</p>';
    }

    html += '<div class="row between" style="margin-top:14px">' +
      '<button class="btn ghost small" data-action="end-session">End session</button>' +
      '<button class="btn ghost small" data-action="toggle-flag" data-id="' + esc(q.id) + '">' +
      (p.flagged ? "Unflag" : "Flag") + '</button>' +
      '</div>';

    html += '</section>';
    return html;
  }

  function renderFeedback(q, a, training) {
    const p = prog(q.id);
    const correctText = (q.options || [])[LETTERS.indexOf(q.answer)] || "";
    const suggested = a.correct ? "good" : "again";
    const labels = { again: "Again", hard: "Hard", good: "Good", easy: "Easy" };

    const btns = ["again", "hard", "good", "easy"].map(function (g) {
      const n = nextInterval(p, g);
      const d = n === 0 ? "now" : (n === 1 ? "1 day" : n + " days");
      return '<button class="btn grade' + (g === suggested ? " primary" : "") + '" data-action="grade" data-grade="' + g + '">' +
        labels[g] + '<small>' + d + '</small></button>';
    }).join("");

    return '<div class="explain">' +
      '<p class="verdict ' + (a.correct ? "ok" : "no") + '">' + (a.correct ? "Correct" : "Incorrect") + '</p>' +
      '<p class="answer-line"><b>' + esc(q.answer) + ')</b> ' + esc(correctText) + '</p>' +
      (q.why ? '<p class="why">' + esc(q.why) + '</p>' : '') +
      (q.ref ? '<p class="ref">' + esc(q.ref) + '</p>' : '') +
      (training
        ? '<button class="btn primary wide" data-action="next-question">Next question</button>'
        : '<div class="grade-row">' + btns + '</div>' +
        '<button class="btn ghost wide" data-action="grade" data-grade="skip">Next without grading</button>') +
      '</div>';
  }

  function renderSummary() {
    const s = ui.session;
    const first = {};
    s.log.forEach(function (e) {
      if (!(e.id in first)) first[e.id] = e.correct;
    });
    const ids = Object.keys(first);
    const correct = ids.filter(function (id) { return first[id]; }).length;
    const pct = ids.length ? Math.round((correct / ids.length) * 100) : 0;

    const bySec = {};
    ids.forEach(function (id) {
      const q = getQuestion(id);
      if (!q) return;
      const k = q.section;
      bySec[k] = bySec[k] || { n: 0, c: 0 };
      bySec[k].n++;
      if (first[id]) bySec[k].c++;
    });

    const missed = ids.filter(function (id) { return !first[id] && getQuestion(id); });

    let html = '<section class="card center">' +
      '<h3>' + (s.training ? "Training complete" : s.kind === "mock" ? "Mock result" : "Session complete") + '</h3>' +
      '<div class="big-num">' + pct + '<span>%</span></div>' +
      '<p class="muted small" style="margin-bottom:0">' + correct + ' of ' + ids.length + ' correct' +
      (missed.length ? ' · ' + missed.length + ' to revisit' : '') + '</p>' +
      (s.training ? '<p class="muted small" style="margin:6px 0 0;color:var(--muted)">Training only — nothing was recorded.</p>' : '') +
      '</section>';

    if (ids.length) {
      html += '<section class="card"><h3>By section</h3>';
      Object.keys(bySec).forEach(function (k) {
        const r = bySec[k];
        const pc = Math.round((r.c / r.n) * 100);
        html += '<div class="section-row">' +
          '<div class="row between small"><span>' + esc(sectionName(k)) + '</span>' +
          '<span class="muted">' + r.c + '/' + r.n + ' · ' + pc + '%</span></div>' +
          '<div class="bar' + (pc < 60 ? " warm" : "") + '"><i style="width:' + pc + '%"></i></div></div>';
      });
      html += '</section>';
    }

    if (missed.length) {
      html += '<section class="card"><h3>Revisit</h3><div class="list">';
      missed.forEach(function (id) {
        const q = getQuestion(id);
        if (!q) return;
        html += '<button class="list-row" data-action="open-detail" data-id="' + esc(id) + '">' +
          '<span class="tag">' + esc(sectionName(q.section)) + '</span>' +
          '<span class="snippet">' + esc(snippet(q.vignette, 80)) + '</span></button>';
      });
      html += '</div></section>';
    }

    html += '<div class="stack">' +
      '<button class="btn primary wide" data-action="another-session">Study another session</button>' +
      (progressState().finished ? '<button class="btn ghost wide" data-action="quick-repeat">Repeat the full bank</button>' : '') +
      (missed.length ? '<button class="btn ghost wide" data-action="study-missed">Study missed again</button>' : '') +
      '<button class="btn ghost wide" data-action="end-session">Done — back to Today</button>' +
      '</div>';

    return html;
  }

  /* ---------------- bank ---------------- */
  function renderBank() {
    const today = todayKey();
    const query = ui.bankQuery.trim().toLowerCase();

    const list = state.questions.filter(function (item) {
      const p = prog(item.id);
      if (ui.bankSection !== "all" && item.section !== ui.bankSection) return false;
      if (ui.bankFilter === "new" && p.reps !== 0) return false;
      if (ui.bankFilter === "due" && p.due > today) return false;
      if (ui.bankFilter === "flagged" && !p.flagged) return false;
      if (query) {
        const hay = (item.vignette + " " + (item.options || []).join(" ") + " " + (item.why || "")).toLowerCase();
        if (hay.indexOf(query) === -1) return false;
      }
      return true;
    });

    let html = '<div class="row between"><h2 style="margin:0">Questions</h2>' +
      '<button class="btn" data-action="new-question">+ New</button></div>' +
      '<p class="muted small" style="margin:4px 0 14px">' + bankAudit().esap + ' ESAP + ' +
      bankAudit().free + ' written · ' + list.length + ' shown</p>';

    html += '<section class="card tight">' +
      '<input class="input" id="bank-search" type="search" placeholder="Search stem, options, explanation" value="' + esc(ui.bankQuery) + '" />' +
      '</section>';

    const filterLabel = (ui.bankFilter === "all" ? "All" : ui.bankFilter.charAt(0).toUpperCase() + ui.bankFilter.slice(1)) +
      " · " + (ui.bankSection === "all" ? "all sections" : sectionName(ui.bankSection));

    html += '<details class="fold"><summary>Filters · ' + esc(filterLabel) + '</summary>' +
      '<div class="chips">' +
      [["all", "All"], ["due", "Due"], ["new", "New"], ["flagged", "Flagged"]].map(function (f) {
        return '<button class="chip' + (ui.bankFilter === f[0] ? " on" : "") + '" data-action="bank-filter" data-filter="' + f[0] + '">' + f[1] + '</button>';
      }).join("") +
      '</div>' +
      '<div class="chips" style="margin-top:10px">' +
      '<button class="chip' + (ui.bankSection === "all" ? " on" : "") + '" data-action="bank-section" data-section="all">All sections</button>' +
      SECTIONS.map(function (s) {
        if (!state.questions.some(function (q) { return q.section === s.id; })) return "";
        return '<button class="chip' + (ui.bankSection === s.id ? " on" : "") + '" data-action="bank-section" data-section="' + s.id + '">' +
          esc(s.name) + '</button>';
      }).join("") +
      '</div></details>';

    if (!list.length) {
      html += '<div class="empty">No questions match this filter.<br>Clear the search or pick another section.</div>';
      return html;
    }

    html += '<div class="list">';
    list.slice(0, 400).forEach(function (item) {
      const p = prog(item.id);
      const accTxt = p.attempts ? Math.round((p.correct / p.attempts) * 100) + "%" : (p.reps ? "—" : "new");
      html += '<button class="list-row" data-action="open-detail" data-id="' + esc(item.id) + '">' +
        '<span class="tag">' + esc(sectionName(item.section)) + '</span>' +
        '<span class="snippet">' + esc(snippet(item.vignette, 95)) +
        (p.flagged ? ' <span class="muted">⚑</span>' : '') + '</span>' +
        '<span class="row-meta">' + accTxt + '<br>' + esc(dateLabel(p.due)) + '</span>' +
        '</button>';
    });
    html += '</div>';

    return html;
  }

  function renderDetail() {
    if (ui.detailId === "new") return renderForm(null);

    const q = getQuestion(ui.detailId);
    if (!q) {
      ui.detailId = null;
      return renderBank();
    }
    if (ui.editingId === q.id) return renderForm(q);

    const p = prog(q.id);

    const opts = q.options.slice(0, 5).map(function (text, i) {
      const L = LETTERS[i];
      return '<div class="option ' + (L === q.answer ? "correct" : "") + '">' +
        '<span class="opt-letter">' + L + '</span><span class="opt-text">' + esc(text) + '</span></div>';
    }).join("");

    const accTxt = p.attempts
      ? Math.round((p.correct / p.attempts) * 100) + "% (" + p.correct + "/" + p.attempts + ")"
      : "not attempted";

    return '<div class="row between">' +
      '<button class="btn ghost" data-action="close-detail">‹ Questions</button>' +
      '<div class="row">' +
      cardButton(q.id) +
      '<button class="btn ghost" data-action="toggle-flag" data-id="' + esc(q.id) + '">' + (p.flagged ? "Unflag" : "Flag") + '</button>' +
      '<button class="btn" data-action="edit-question" data-id="' + esc(q.id) + '">Edit</button>' +
      '</div></div>' +
      '<section class="card" style="margin-top:10px">' +
      '<div class="row between"><span class="tag">' + esc(sectionName(q.section)) + '</span>' +
      '<span class="muted small">' + esc(q.source ? q.source + ' · ' : '') + esc(dateLabel(p.due)) + '</span></div>' +
      '<div class="vignette">' + esc(q.vignette) + '</div>' +
      '<div class="options">' + opts + '</div>' +
      (q.why || q.ref
        ? '<div class="explain">' +
        '<p class="verdict ok">Answer ' + esc(q.answer) + '</p>' +
        (q.why ? '<p class="why">' + esc(q.why) + '</p>' : '') +
        (q.ref ? '<p class="ref">' + esc(q.ref) + '</p>' : '') +
        '</div>'
        : '') +
      '</section>' +
      '<section class="card tight"><h3>Scheduling</h3>' +
      '<div class="kv"><span>Accuracy</span><span>' + esc(accTxt) + '</span></div>' +
      '<div class="kv"><span>Repetitions</span><span>' + p.reps + '</span></div>' +
      '<div class="kv"><span>Lapses</span><span>' + p.lapses + '</span></div>' +
      '<div class="kv"><span>Interval</span><span>' + (p.interval ? p.interval + " days" : "learning") + '</span></div>' +
      '<div class="kv"><span>Ease</span><span>' + p.ease.toFixed(2) + '</span></div>' +
      '<div class="kv"><span>Due</span><span>' + esc(fmtDate(p.due)) + '</span></div>' +
      '</section>' +
      '<div class="stack">' +
      '<button class="btn ghost wide danger" data-action="delete-question" data-id="' + esc(q.id) + '">Delete question</button>' +
      '</div>';
  }

  function renderForm(q) {
    const editing = !!q;

    const secOpts = SECTIONS.map(function (s) {
      return '<option value="' + s.id + '"' + (q && q.section === s.id ? " selected" : "") + '>' + esc(s.name) + '</option>';
    }).join("");

    const optFields = LETTERS.map(function (L, i) {
      return '<label class="field"><span>Option ' + L + '</span>' +
        '<textarea class="input ta-sm" id="f-opt-' + L + '">' + (q && q.options[i] ? esc(q.options[i]) : "") + '</textarea></label>';
    }).join("");

    const ansOpts = LETTERS.map(function (L) {
      return '<option value="' + L + '"' + (q && q.answer === L ? " selected" : "") + '>' + L + '</option>';
    }).join("");

    return '<div class="row between">' +
      '<button class="btn ghost" data-action="close-detail">‹ Back</button>' +
      '<span class="muted small">' + (editing ? "Edit question" : "New question") + '</span></div>' +
      '<section class="card" style="margin-top:10px">' +
      '<label class="field"><span>Section</span><select class="input" id="f-section">' + secOpts + '</select></label>' +
      '<label class="field"><span>Stem / vignette</span>' +
      '<textarea class="input" id="f-vignette" style="min-height:160px" placeholder="Paste the vignette, including lab blocks on their own lines">' +
      (q ? esc(q.vignette) : "") + '</textarea></label>' +
      optFields +
      '<label class="field"><span>Correct answer</span><select class="input" id="f-answer">' + ansOpts + '</select></label>' +
      '<label class="field"><span>Explanation</span>' +
      '<textarea class="input" id="f-why" style="min-height:120px">' + (q ? esc(q.why || "") : "") + '</textarea></label>' +
      '<label class="field"><span>Reference (optional)</span>' +
      '<input class="input" id="f-ref" type="text" value="' + (q ? esc(q.ref || "") : "") + '" /></label>' +
      '<button class="btn primary wide" data-action="save-question">' + (editing ? "Save changes" : "Add question") + '</button>' +
      '</section>';
  }

  function saveQuestionForm() {
    const secEl = $("#f-section");
    const stemEl = $("#f-vignette");
    const whyEl = $("#f-why");
    const refEl = $("#f-ref");
    const ansEl = $("#f-answer");

    const section = secEl ? secEl.value : "unknown";
    const vignette = stemEl ? stemEl.value.trim() : "";
    const why = whyEl ? whyEl.value.trim() : "";
    const ref = refEl ? refEl.value.trim() : "";
    const answer = ansEl ? ansEl.value : "A";

    const raw = LETTERS.map(function (L) {
      const n = document.getElementById("f-opt-" + L);
      return n ? n.value.trim() : "";
    });

    let last = -1;
    raw.forEach(function (t, i) { if (t) last = i; });

    if (last < 1) {
      toast("Add at least options A and B");
      return;
    }
    for (let i = 0; i <= last; i++) {
      if (!raw[i]) {
        toast("Fill options A–" + LETTERS[last] + " without gaps");
        return;
      }
    }
    if (vignette.length < 15) {
      toast("Stem looks too short");
      return;
    }
    if (LETTERS.indexOf(answer) > last) {
      toast("Correct answer is past the last option");
      return;
    }

    const options = raw.slice(0, last + 1);

    if (ui.editingId) {
      const q = getQuestion(ui.editingId);
      if (q) {
        q.section = section;
        q.vignette = vignette;
        q.options = options;
        q.answer = answer;
        q.why = why;
        q.ref = ref;
        q.updatedAt = Date.now();
      }
    } else {
      state.questions.push({
        id: "q-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1000),
        section: section,
        vignette: vignette,
        options: options,
        answer: answer,
        why: why,
        ref: ref,
        source: "custom",
        created: todayKey(),
        updatedAt: Date.now()
      });
    }

    ui.editingId = null;
    ui.detailId = null;
    save();
    render();
    toast("Saved");
  }

  /* ---------------- learn (reading checklist) ---------------- */
  function learnItems() {
    return window.LEARN_RESOURCES || [];
  }

  function linkHost(url) {
    return String(url || "").replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  }

  function learnDoneCount() {
    const done = (state.learn && state.learn.done) || {};
    return learnItems().filter(function (r) { return !!done[r.id]; }).length;
  }

  function mockLabel() {
    const n = state.settings.mockSize || 40;
    const mins = Math.round(n * (state.settings.mockMinutesPerQ || 2.5));
    return "Timed mock · " + n + " Q · " + mins + " min";
  }

  function sessionSizeLabel() {
    if (ui.size === 0) return "the whole set";
    return ui.size + " questions";
  }

  function esapLoadedCount() {
    const seen = {};
    state.questions.forEach(function (q) {
      if (/^esap-/.test(q.id)) seen[q.id] = true;
    });
    return Object.keys(seen).length;
  }

  /* Quick integrity check on the bank, shown in More. */  function bankAudit() {    const bank = state.questions.filter(function (q) { return /^(esap|free)-/.test(q.id); });
    return {
      total: bank.length,
      esap: state.questions.filter(function (q) { return /^esap-/.test(q.id); }).length,
      free: state.questions.filter(function (q) { return /^free-/.test(q.id); }).length,
      fiveOptions: bank.filter(function (q) { return Array.isArray(q.options) && q.options.length >= 5; }).length,
      withAnswer: bank.filter(function (q) { return !!q.answer; }).length
    };
  }

  function renderLearn() {
    const items = learnItems();
    const done = (state.learn && state.learn.done) || {};
    const total = items.length;
    const doneCount = learnDoneCount();
    const pct = total ? Math.round((doneCount / total) * 100) : 0;
    const filter = ui.learnFilter;

    const list = items.filter(function (r) {
      if (filter === "todo") return !done[r.id];
      if (filter !== "all" && (r.sections || []).indexOf(filter) === -1) return false;
      return true;
    });

    let html = '<div class="row between"><h2 style="margin:0">Learn</h2>' +
      '<span class="pill-count">' + doneCount + ' / ' + total + ' done</span></div>' +
      '<p class="muted small" style="margin:4px 0 10px">Ten sources mapped to the exam blueprint. Read only the sections named in each card, then tick it.</p>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div>';

    const filterName = filter === "all" ? "All sources"
      : filter === "todo" ? "To do"
      : sectionName(filter) + " · " + (SECTION_BY_ID[filter] ? SECTION_BY_ID[filter].weight + "%" : "");

    html += '<details class="fold"><summary>Filter · ' + esc(filterName) + '</summary>' +
      '<div class="chips">' +
      '<button class="chip' + (filter === "all" ? " on" : "") + '" data-action="learn-filter" data-filter="all">All</button>' +
      '<button class="chip' + (filter === "todo" ? " on" : "") + '" data-action="learn-filter" data-filter="todo">To do</button>' +
      SECTIONS.filter(function (s) { return s.id !== "unknown"; }).map(function (s) {
        return '<button class="chip' + (filter === s.id ? " on" : "") + '" data-action="learn-filter" data-filter="' + s.id + '">' +
          esc(s.name) + ' ' + s.weight + '%</button>';
      }).join("") +
      '</div></details>';

    html += '<p class="muted small" style="margin:0 0 14px">These eight areas are the whole paper. If a section is weak under <b>Your progress</b> below, filter to it here and read the sources tagged for it.</p>';

    if (!list.length) {
      html += '<div class="empty">Everything in this filter is ticked off.</div>';
      return html;
    }

    list.forEach(function (r) {
      const isDone = !!done[r.id];
      const costLabel = r.cost === "paid" ? "Paid" : (r.cost === "account" ? "Free account" : "Free");

      const secTags = (r.sections || []).map(function (id) {
        const s = SECTION_BY_ID[id];
        return '<span class="tag">' + esc(s ? s.name : id) + '</span>';
      }).join(" ");

      html += '<section class="card res-card' + (isDone ? " done" : "") + '">' +
        '<div class="row wrap between" style="gap:6px">' +
        '<span class="row wrap" style="gap:5px">' + secTags + '</span>' +
        '<span class="cost ' + esc(r.cost) + '">' + esc(costLabel) + '</span>' +
        '</div>' +
        '<h3 class="res-title">' + esc(r.title) + '</h3>' +
        '<p class="res-org">' + esc(r.org) + (r.url ? ' · <span class="res-link">' + esc(linkHost(r.url)) + '</span>' : '') + '</p>' +
        (r.about ? '<p class="res-about"><b>What it is:</b> ' + esc(r.about) + '</p>' : '') +
        '<details class="fold" style="margin:0 0 10px"><summary>What to read</summary>' +
        '<p class="res-read">' + esc(r.read) + '</p>' +
        (r.effort ? '<p class="res-effort"><b>Time:</b> ' + esc(r.effort) + '</p>' : '') +
        (r.note ? '<p class="res-note">' + esc(r.note) + '</p>' : '') +
        '</details>' +
        '<div class="res-actions">' +
        '<a class="btn primary" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">Open</a>' +
        '<button class="btn ghost' + (isDone ? " done-on" : "") + '" data-action="learn-toggle" data-id="' + esc(r.id) + '">' +
        (isDone ? "Completed" : "Mark done") + '</button>' +
        '</div></section>';
    });

    html += '<p class="muted small" style="margin:14px 0 0">Every link here was opened and checked. The Endocrine Society\u2019s own website was returning a server error when this list was built, so its material is reached through the education portal and Endotext instead.</p>';

    return html;
  }

  /* ---------------- stats ---------------- */
  function renderStats() {
    const qs = state.questions;
    let att = 0, cor = 0, seen = 0;
    qs.forEach(function (q) {
      const p = prog(q.id);
      att += p.attempts || 0;
      cor += p.correct || 0;
      if (p.reps > 0) seen++;
    });
    const acc = att ? Math.round((cor / att) * 100) : null;

    let html = '' +
      '<section class="card"><div class="row">' +
      '<div class="stat"><b>' + (acc === null ? "—" : acc + "%") + '</b><span>accuracy</span></div>' +
      '<div class="stat"><b>' + att + '</b><span>answers</span></div>' +
      '<div class="stat"><b>' + seen + '/' + qs.length + '</b><span>seen</span></div>' +
      '</div></section>';

    html += '<section class="card"><h3>By section</h3>';
    let any = false;
    SECTIONS.forEach(function (s) {
      const list = qs.filter(function (q) { return q.section === s.id; });
      if (!list.length) return;
      let a = 0, c = 0, st = 0;
      list.forEach(function (q) {
        const p = prog(q.id);
        a += p.attempts || 0;
        c += p.correct || 0;
        if (p.reps > 0) st++;
      });
      any = true;
      const pc = a ? Math.round((c / a) * 100) : 0;
      html += '<div class="section-row">' +
        '<div class="row between small"><span>' + esc(s.name) + '</span>' +
        '<span class="muted">' + (a ? pc + '% · ' + c + '/' + a : "no answers") + ' · seen ' + st + '/' + list.length + '</span></div>' +
        '<div class="bar' + (a && pc < 60 ? " warm" : "") + '"><i style="width:' + (a ? pc : 0) + '%"></i></div></div>';
    });
    if (!any) html += '<div class="empty">No questions yet.</div>';
    html += '</section>';

    const weakest = qs.filter(function (q) { return prog(q.id).attempts >= 1; })
      .map(function (q) {
        const p = prog(q.id);
        return { q: q, rate: p.correct / p.attempts, attempts: p.attempts };
      })
      .sort(function (a, b) { return a.rate - b.rate || b.attempts - a.attempts; })
      .slice(0, 6);

    if (weakest.length) {
      html += '<section class="card"><h3>Weakest questions</h3><div class="list">';
      weakest.forEach(function (w) {
        html += '<button class="list-row" data-action="open-detail" data-id="' + esc(w.q.id) + '">' +
          '<span class="snippet">' + esc(snippet(w.q.vignette, 80)) + '</span>' +
          '<span class="row-meta">' + Math.round(w.rate * 100) + '%<br>' + w.attempts + ' tries</span></button>';
      });
      html += '</div></section>';
    }

    const days = [];
    for (let i = 13; i >= 0; i--) {
      const k = addDays(todayKey(), -i);
      days.push({ k: k, n: dayReviews(k) });
    }
    const maxD = days.reduce(function (m, d) { return Math.max(m, d.n); }, 1);

    html += '<section class="card"><div class="row between"><h3 style="margin:0">Answers per day</h3>' +
      '<span class="muted small">last 14 days</span></div><div class="forecast">';
    days.forEach(function (d) {
      const dt = parseKey(d.k);
      const h = d.n ? Math.max(8, Math.round((d.n / maxD) * 100)) : 3;
      html += '<div class="fc"><i style="height:' + h + '%"></i><span>' + (dt ? dt.getDate() : "") + '</span></div>';
    });
    html += '</div></section>';

    return html;
  }

  /* ---------------- more ---------------- */
  function renderMore() {
    const st = state.settings;

    let html = '<h2>More</h2>';

    html += '<section class="card"><h3>Exam settings</h3>' +
      '<label class="field"><span>Exam / target date</span>' +
      '<input class="input" type="date" id="set-exam-date" value="' + esc(st.examDate) + '" /></label>' +
      '<label class="field"><span>New questions per day</span>' +
      '<input class="input" type="number" min="0" max="80" id="set-daily-new" value="' + st.dailyNew + '" /></label>' +
      '<div class="grid-2">' +
      '<label class="field"><span>Mock length (Q)</span>' +
      '<input class="input" type="number" min="10" max="120" id="set-mock-size" value="' + st.mockSize + '" /></label>' +
      '<label class="field"><span>Minutes per Q</span>' +
      '<input class="input" type="number" min="1" max="3" step="0.25" id="set-mock-min" value="' + st.mockMinutesPerQ + '" /></label>' +
      '</div>' +
      '<p class="muted small" style="margin:0">The real ITE window is roughly mid-January to mid-February. Default target is 15 January 2027 — adjust it to your scheduled date.</p>' +
      '</section>';

    html += renderSyncCard();

    html += '<details class="fold card"><summary>Backup and restore</summary>' +
      '<div class="stack">' +
      '<button class="btn wide" data-action="export-json">Export all (JSON)</button>' +
      '<button class="btn ghost wide" data-action="pick-json">Restore from a backup</button>' +
      '</div>' +
      '<textarea class="input ta-lg hidden" id="export-area" readonly style="margin-top:10px"></textarea>' +
      '<p class="muted small" style="margin:10px 0 0">A backup contains your questions, scheduling and reading list. Restoring merges a backup into what is already here.</p>' +
      '</details>';

    html += '<details class="fold card"><summary>Quick lab reference</summary>' +
      '<details class="ref-block"><summary>Thyroid</summary><p>TSH 0.5–5.0 mIU/L · free T4 0.8–1.8 ng/dL · total T4 5.5–12.5 µg/dL · free T3 2.3–4.2 pg/mL · total T3 70–200 ng/dL\nTRAb ≤1.75 IU/L · TPO Ab &lt;2.0 IU/mL · thyroglobulin 3–42 ng/mL (after surgery + RAI: &lt;0.1)\nRAIU 3–16% at 6 h, 15–30% at 24 h</p></details>' +
      '<details class="ref-block"><summary>Adrenal</summary><p>Cortisol 8 AM 5–25 µg/dL; 4 PM 2–14 µg/dL · midnight salivary cortisol &lt;0.13 µg/dL\nACTH 10–60 pg/mL · aldosterone 4–21 ng/dL · renin activity 0.6–4.3 ng/mL/h\nPlasma metanephrine &lt;99 pg/mL · normetanephrine &lt;165 pg/mL\nUrine free cortisol 4–50 µg/24 h; &lt;10 µg/24 h after 2-day low-dose dexamethasone</p></details>' +
      '<details class="ref-block"><summary>Bone &amp; calcium</summary><p>Calcium 8.2–10.2 mg/dL (ionised 4.6–5.08) · phosphate 2.3–4.7 mg/dL · magnesium 1.5–2.3 mg/dL\nIntact PTH 10–65 pg/mL · 25-OH vitamin D: deficient &lt;20, insufficient 21–29, optimal 30–80 ng/mL\nUrine calcium 100–300 mg/24 h · CTX 100–600 ng/L · bone-specific ALP ≤20 µg/L (adult male)</p></details>' +
      '<details class="ref-block"><summary>Pituitary &amp; reproduction</summary><p>IGF-1 age/sex dependent (see assay) · GH 0.01–0.97 ng/mL · prolactin 4–23 ng/mL (male), 4–30 (female)\nTestosterone total 300–900 ng/dL (male), 8–60 (female) · SHBG 1.1–6.7 µg/mL (male)\nFSH 1.0–13 mIU/mL and LH 1.0–9.0 (male); postmenopausal FSH &gt;30\nAMH 0.9–9.5 ng/mL (female 13–45 y)</p></details>' +
      '<details class="ref-block"><summary>Diabetes &amp; lipids</summary><p>Fasting glucose 70–99 mg/dL · HbA1c 4.0–5.6% (20–38 mmol/mol) · 2-h OGTT &lt;140 mg/dL\nLDL &lt;100 mg/dL (primary prevention), &lt;70 (high risk), &lt;55 (very high risk)\nTriglycerides &lt;150 mg/dL · HDL &gt;40 (male) / &gt;50 (female) mg/dL · Lp(a) &lt;75 nmol/L</p></details>' +
      '</details>';

    html += '<details class="fold card"><summary>Bank status</summary>' +
      '<div class="kv"><span>ESAP 2026 questions loaded</span><span>' +
      esapLoadedCount() + ' of ' + normalizeEsapBank().length + '</span></div>' +
      '<div class="kv"><span>Written questions (free guidelines)</span><span>' +
      bankAudit().free + ' of ' + normalizeFreeBank().length + '</span></div>' +
      '<div class="kv"><span>Questions with all 5 options</span><span>' +
      bankAudit().fiveOptions + ' of ' + bankAudit().total + '</span></div>' +
      '<div class="kv"><span>Questions with an answer key</span><span>' +
      bankAudit().withAnswer + ' of ' + bankAudit().total + '</span></div>' +
      '<div class="kv"><span>Reading list completed</span><span>' + learnDoneCount() + ' of ' + learnItems().length + '</span></div>' +
      '</details>';

    html += '<details class="fold card"><summary>How this app works</summary>' +
      '<p class="muted small" style="margin:0 0 8px"><b>Study</b> gives you a question, its answer and a short explanation, then asks how it felt. The app decides when to show it again.</p>' +
      '<p class="muted small" style="margin:0 0 8px"><b>Questions</b> lists all 144 so you can look one up, flag it, or read the explanation without grading yourself.</p>' +
      '<p class="muted small" style="margin:0 0 8px"><b>Learn</b> is a short reading list with the exact sections to read in each source.</p>' +
      '<p class="muted small" style="margin:0">Your progress is saved on this device, and to the shared copy while it is on.</p>' +
      '<details class="ref-block" style="margin-top:12px"><summary>How does grading work?</summary>' +
      '<p class="muted small" style="margin:8px 0 6px">After you answer, you grade yourself. That grade never changes what you already earned — it sets when the card is next due and how fast the gap grows.</p>' +
      '<p class="muted small" style="margin:0 0 6px"><b>Again</b> — you did not know it. The card comes back in this same session, about four questions later, it counts as a lapse, and its ease drops by 0.2 so the gap grows more slowly afterwards.</p>' +
      '<p class="muted small" style="margin:0 0 6px"><b>Hard</b> — right, but barely. The gap grows only slightly (current gap × 1.2, at least one day) and ease drops by 0.15.</p>' +
      '<p class="muted small" style="margin:0 0 6px"><b>Good</b> — right. One day for a first answer, three days for the second, then the current gap × its ease (2.5 by default).</p>' +
      '<p class="muted small" style="margin:0 0 6px"><b>Easy</b> — you knew it cold. Ease rises by 0.15, and the gap grows fastest (a first answer starts at two days).</p>' +
      '<p class="muted small" style="margin:0 0 6px"><b>Next without grading</b> — the answer is still recorded: attempts, accuracy, the section figures and the session history all count it. Nothing is scheduled, and the card still counts as answered.</p>' +
      '<p class="muted small" style="margin:0 0 6px"><b>What it changes</b> — attempts and correct answers (so accuracy and the weakest-questions list), repetitions, ease, and the next-due date that orders <b>Catch up</b>.</p>' +
      '<p class="muted small" style="margin:0 0 6px"><b>What it never does</b> — it cannot put a card back into <b>New</b>. Answered questions only return when you choose <b>Catch up</b> or, at 100%, <b>Full repeat</b>.</p>' +
      '<p class="muted small" style="margin:0"><b>In a timed mock</b> there is no grading while you work: every answer is logged, and at the end the missed ones are graded Again and the correct ones Good for you.</p>' +
      '</details>' +
      '<p class="muted small" style="margin:8px 0 0">Build ' + esc(BUILD) + '</p>' +
      '<p class="center" style="margin:12px 0 0"><a class="tour-link" href="tour.html">&#9654; Watch the app tour</a></p>' +
      '</details>';

    html += '<section class="card"><h3>Data</h3><div class="stack">' +
      '<button class="btn ghost wide danger" data-action="reset-progress">Reset all progress</button>' +
      '<button class="btn ghost wide danger" data-action="reset-all">Reset everything (reload the 144)</button>' +
      '</div></section>';

    html += '<p class="muted small center" style="margin:18px 0 0">Answer keys follow the ESAP 2026 answer key; the full discussions and references stay in the book.</p>';

    return html;
  }

  /* ---------------- import parser (kept for the JSON restore path only; the paste
     importer was removed from the UI by request) ---------------- */
  function matchSection(str) {
    const t = String(str || "").toLowerCase().trim();
    if (!t) return null;
    if (SECTION_BY_ID[t] && t !== "unknown") return t;

    /* explicit section names, male before female ("female" contains "male") */
    if (/\(m\)|\bmale\b|\bmen\b|androl/.test(t)) return "male";
    if (/\(f\)|\bfemale\b|\bwomen\b|gynaec|gynec/.test(t)) return "female";

    if (/diabet|glycaem|glycem|insulin/.test(t)) return "diabetes";
    if (/thyroid|thyro/.test(t)) return "thyroid";
    if (/bone|calcium|parath|osteop/.test(t)) return "bone";
    if (/lipid|obes|weight/.test(t)) return "lipids";
    if (/pituitary|prolactin|acromegal/.test(t)) return "pituitary";
    if (/adrenal|cortisol|aldosteron|cushing|pheo/.test(t)) return "adrenal";
    if (/reprod|ovary|ovarian|pcos|menstru/.test(t)) return "female";
    if (/testis|testicular|sperm/.test(t)) return "male";
    return null;
  }

  function guessSection(text) {
    const t = String(text || "").toLowerCase();
    const map = [
      ["diabetes", ["diabet", "hba1c", "a1c", "insulin", "glucose", "ketoacidosis", "sglt2", "metformin", "glp-1", "dka"]],
      ["thyroid", ["thyroid", "tsh", "levothyroxine", "methimazole", "graves", "thyrotoxic", "nodule", "papillary", "hypothyroid"]],
      ["bone", ["calcium", "parathyroid", "pth", "osteopor", "fracture", "vitamin d", "hypercalcaemia", "hypercalcemia", "bisphosphonate", "denosumab"]],
      ["lipids", ["cholesterol", "ldl", "triglycerid", "statin", "obesity", "weight loss", "bariatric", "tirzepatide"]],
      ["pituitary", ["pituitary", "prolactin", "acromegal", "igf-1", "igf-1", "macroadenoma", "hypophys", "craniopharyngioma"]],
      ["adrenal", ["adrenal", "cortisol", "aldosterone", "cushing", "pheochromocytoma", "metanephrine", "dexamethasone"]],
      ["female", ["pcos", "polycystic", "amenorrh", "menstru", "estradiol", "hirsut", "ovulat", "infertility"]],
      ["male", ["testosterone", "klinefelter", "sperm", "erectile", "gynaecomastia", "gynecomastia", "hypogonad"]]
    ];

    let best = "unknown";
    let bestScore = 0;
    map.forEach(function (entry) {
      let score = 0;
      entry[1].forEach(function (kw) {
        if (t.indexOf(kw) !== -1) score++;
      });
      if (score > bestScore) {
        bestScore = score;
        best = entry[0];
      }
    });
    return bestScore > 0 ? best : "unknown";
  }

  function parseBlock(block) {
    if (!block) return null;

    const lines = block.split("\n");
    let section = null;
    let start = 0;

    if (/^\s*#{2,4}\s/.test(lines[0])) {
      const header = lines[0].replace(/^\s*#{2,4}\s*/, "");
      const bits = header.split("|");
      if (bits.length > 1) section = matchSection(bits[1].trim());
      start = 1;
    }

    const optRe = /^\s*([A-E])\s*[.)]\s*(.*)$/;
    const ansRe = /^\s*(?:answer|correct\s+answer|ans|key)\s*[:\-.]?\s*\(?\s*([A-E])\b/i;
    const whyRe = /^\s*(?:why|explanation|discussion|rationale|educational\s+objective|key\s+point)\s*[:\-.]?\s*(.*)$/i;
    const refRe = /^\s*(?:refs?|references?(?:\(s\))?|source(?:s)?)\s*[:\-.]?\s*(.*)$/i;
    const secRe = /^\s*(?:section|topic)\s*[:\-.]\s*(.+)$/i;

    const stem = [];
    const opts = {};
    const whyParts = [];
    const refParts = [];
    let answer = null;
    let mode = "stem";
    let lastLetter = null;

    for (let i = start; i < lines.length; i++) {
      const raw = lines[i];
      const t = raw.trim();

      const mSec = secRe.exec(t);
      if (mSec) {
        section = matchSection(mSec[1]) || section;
        continue;
      }

      const mAns = ansRe.exec(t);
      if (mAns) {
        answer = mAns[1].toUpperCase();
        const rest = t.slice(mAns[0].length).replace(/^[)\s.:\-–]+/, "").trim();
        if (rest) whyParts.push(rest);
        mode = "why";
        lastLetter = null;
        continue;
      }

      const mWhy = whyRe.exec(t);
      if (mWhy) {
        mode = "why";
        lastLetter = null;
        if (mWhy[1].trim()) whyParts.push(mWhy[1].trim());
        continue;
      }

      const mRef = refRe.exec(t);
      if (mRef) {
        mode = "ref";
        lastLetter = null;
        if (mRef[1].trim()) refParts.push(mRef[1].trim());
        continue;
      }

      if (!answer && (mode === "stem" || mode === "options")) {
        const mOpt = optRe.exec(t);
        if (mOpt) {
          const L = mOpt[1];
          opts[L] = opts[L] ? opts[L] + " " + mOpt[2].trim() : mOpt[2].trim();
          lastLetter = L;
          mode = "options";
          continue;
        }
      }

      if (mode === "why") {
        if (t) whyParts.push(t);
        continue;
      }
      if (mode === "ref") {
        if (t) refParts.push(t);
        continue;
      }
      if (lastLetter) {
        if (t) opts[lastLetter] = (opts[lastLetter] + " " + t).trim();
        continue;
      }
      stem.push(raw);
    }

    let stemText = stem.join("\n").trim();
    stemText = stemText.replace(/^\s*(?:Q(?:uestion)?\s*)?\d{1,3}\s*[.):]?\s*\n/i, "").trim();

    const present = Object.keys(opts).filter(function (k) {
      return opts[k] && opts[k].trim().length > 0;
    }).sort();

    if (present.length < 2 || !answer) return null;
    if (present.indexOf(answer) === -1) return null;
    if (!stemText) return null;

    const options = present.map(function (L) { return opts[L].trim(); });
    const answerIdx = present.indexOf(answer);

    return {
      section: section || guessSection(stemText + " " + options.join(" ")),
      vignette: stemText,
      options: options,
      answer: LETTERS[answerIdx],
      why: whyParts.join("\n").trim(),
      ref: refParts.join("\n").trim()
    };
  }

  function parseImportText(raw) {
    const text = String(raw || "").replace(/\r\n?/g, "\n").trim();
    const out = { items: [], errors: [] };

    if (!text) {
      out.errors.push("Nothing to parse");
      return out;
    }

    let blocks = text.split(/\n\s*-{3,}\s*\n/);

    if (blocks.length === 1) {
      const lines = text.split("\n");
      const parts = [];
      let cur = [];
      lines.forEach(function (line) {
        const isHeader = /^\s*#{2,4}\s*\S/.test(line);
        if (isHeader && cur.join("").trim()) {
          parts.push(cur.join("\n"));
          cur = [line];
        } else {
          cur.push(line);
        }
      });
      if (cur.join("").trim()) parts.push(cur.join("\n"));
      if (parts.length > 1) blocks = parts;
    }

    blocks.forEach(function (block, i) {
      const item = parseBlock(block.trim());
      if (item) out.items.push(item);
      else out.errors.push("Block " + (i + 1) + " skipped — needs options A–E and an ANSWER line");
    });

    return out;
  }

  function importItems(items) {
    let n = 0;
    items.forEach(function (item, i) {
      state.questions.push({
        id: "q-" + Date.now().toString(36) + "-" + i,
        section: SECTION_BY_ID[item.section] ? item.section : "unknown",
        vignette: item.vignette,
        options: item.options,
        answer: item.answer,
        why: item.why || "",
        ref: item.ref || "",
        source: "imported",
        created: todayKey()
      });
      n++;
    });
    save();
    return n;
  }

  function importJsonText(text) {
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      toast("That file is not valid JSON");
      return;
    }
    const list = Array.isArray(data) ? data : (data && data.questions) || [];
    if (!Array.isArray(list) || !list.length) {
      toast("No questions in that file");
      return;
    }

    let added = 0;
    list.forEach(function (q) {
      if (!q || !q.vignette || !Array.isArray(q.options) || !q.answer) return;
      const answer = String(q.answer).trim().toUpperCase().slice(0, 1);
      if (LETTERS.indexOf(answer) === -1) return;
      const exists = q.id && state.questions.some(function (x) { return x.id === q.id; });
      state.questions.push({
        id: exists || !q.id ? "q-" + Date.now().toString(36) + "-" + added : q.id,
        section: SECTION_BY_ID[q.section] ? q.section : "unknown",
        vignette: String(q.vignette),
        options: q.options.map(String),
        answer: answer,
        why: String(q.why || q.explanation || ""),
        ref: String(q.ref || ""),
        source: "imported",
        created: todayKey()
      });
      added++;
    });

    if (data && data.progress && typeof data.progress === "object") {
      Object.keys(data.progress).forEach(function (k) {
        if (!state.progress[k]) state.progress[k] = data.progress[k];
      });
    }
    if (data && data.days && typeof data.days === "object") {
      Object.keys(data.days).forEach(function (k) {
        if (!state.days[k]) state.days[k] = data.days[k];
      });
    }

    if (data && data.learn && data.learn.done && typeof data.learn.done === "object") {
      Object.keys(data.learn.done).forEach(function (k) {
        if (data.learn.done[k]) state.learn.done[k] = Date.now();
      });
    }

    save();
    render();
    toast("Imported " + added + (added === 1 ? " question" : " questions"));
  }

  /* ---------------- navigation ---------------- */
  function goTab(tab) {
    if (ui.session && tab !== "study") {
      const ok = window.confirm("Leave this session? Unanswered questions are dropped.");
      if (!ok) return;
      ui.session = null;
      if (ui.clock) {
        clearInterval(ui.clock);
        ui.clock = null;
      }
    }
    ui.tab = tab;
    try {
      history.replaceState(null, "", "#" + tab);
    } catch (err) { /* file:// in some webviews forbids this */ }
    if (tab !== "bank") {
      ui.detailId = null;
      ui.editingId = null;
    }
    render();
    window.scrollTo({ top: 0 });
  }

  /* ---------------- events ---------------- */
  function onViewClick(e) {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.dataset.action;

    /* a flash-card tap inside a foldable row must not open the row */
    if (action === "card-toggle") {
      e.preventDefault();
      e.stopPropagation();
      toggleCard(el.dataset.id);
      return;
    }
    if (action === "flash-flip") {
      e.stopPropagation();
      el.classList.toggle("flipped");
      return;
    }
    if (action === "hist-toggle") {
      const item = el.parentNode;
      if (item) item.classList.toggle("open");
      return;
    }

    /* --- study setup --- */
    if (action === "pick-section") {
      ui.section = el.dataset.section;
      render();
      return;
    }
    if (action === "pick-size") {
      ui.size = Number(el.dataset.size);
      render();
      return;
    }
    if (action === "catchup-ask") {
      ui.catchupPrompt = true;
      render();
      return;
    }
    if (action === "catchup-cancel") {
      ui.catchupPrompt = false;
      render();
      return;
    }
    if (action === "catchup-training") {
      ui.catchupPrompt = false;
      ui.mode = "catchup";
      ui.startTraining = true;
      startPractice();
      return;
    }
    if (action === "catchup-graded") {
      ui.catchupPrompt = false;
      ui.mode = "catchup";
      startPractice();
      return;
    }
    if (action === "next-question") {
      const s = ui.session;
      if (!s) return;
      s.i++;
      render();
      window.scrollTo({ top: 0 });
      return;
    }
    if (action === "toggle-limit") {
      ui.ignoreLimit = !ui.ignoreLimit;
      render();
      return;
    }
    if (action === "pick-mode") {
      const next = el.dataset.mode;
      if (next === "full" && !progressState().finished) {
        toast("Full repeat opens once every question has been answered");
        return;
      }
      ui.mode = next;
      render();
      return;
    }
    if (action === "quick-start") {
      ui.section = "all";
      ui.mode = "new";
      startPractice();
      return;
    }
    if (action === "quick-catchup") {
      ui.section = "all";
      ui.mode = "catchup";
      startPractice();
      return;
    }
    if (action === "quick-repeat") {
      ui.section = "all";
      ui.mode = "full";
      startPractice();
      return;
    }
    if (action === "learn-filter") {
      ui.learnFilter = el.dataset.filter || "all";
      render();
      return;
    }
    if (action === "learn-toggle") {
      const id = el.dataset.id;
      if (!id) return;
      state.learn.done[id] = state.learn.done[id] ? 0 : Date.now();
      save();
      render();
      return;
    }
    if (action === "go-learn") {
      goTab("learn");
      return;
    }
    if (action === "quick-start-more") {
      ui.section = "all";
      ui.mode = "new";
      ui.ignoreLimit = true;
      startPractice();
      return;
    }
    if (action === "another-session") {
      ui.mode = "new";
      startPractice();
      return;
    }
    if (action === "start-practice") {
      startPractice();
      return;
    }
    if (action === "start-mock") {
      startMock();
      return;
    }

    /* --- session --- */
    if (action === "answer") {
      const s = ui.session;
      if (!s) return;
      const q = getQuestion(s.ids[s.i]);
      if (!q || s.answered[q.id]) return;
      const letter = el.dataset.letter;
      const correct = letter === q.answer;
      s.answered[q.id] = { letter: letter, correct: correct };

      if (s.training) {
        /* training only: nothing is recorded anywhere */
        render();
        window.scrollTo({ top: 0 });
        return;
      }

      s.log.push({ id: q.id, correct: correct, letter: letter });
      recordAnswer(q.id, correct);

      if (s.kind === "mock") {
        s.i++;
        save();
        render();
        window.scrollTo({ top: 0 });
      } else {
        save();
        render();
        const ex = document.querySelector(".explain");
        if (ex && ex.scrollIntoView) ex.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      return;
    }

    if (action === "grade") {
      const s = ui.session;
      if (!s) return;
      const q = getQuestion(s.ids[s.i]);
      if (!q) {
        s.i++;
        render();
        return;
      }
      const grade = el.dataset.grade;
      if (grade !== "skip") schedule(q.id, grade);

      if (grade === "again") {
        const at = Math.min(s.ids.length, s.i + 4);
        s.ids.splice(at, 0, q.id);
        delete s.answered[q.id];
      }

      s.i++;
      save();
      render();
      window.scrollTo({ top: 0 });
      return;
    }

    if (action === "end-session") {
      if (ui.session && !ui.session.finished) finishSession();
      if (ui.clock) {
        clearInterval(ui.clock);
        ui.clock = null;
      }
      ui.session = null;
      ui.tab = "today";
      render();
      window.scrollTo({ top: 0 });
      return;
    }

    if (action === "study-missed") {
      const s = ui.session;
      if (!s) return;
      const first = {};
      s.log.forEach(function (x) {
        if (!(x.id in first)) first[x.id] = x.correct;
      });
      const ids = Object.keys(first).filter(function (id) {
        return !first[id] && getQuestion(id);
      });
      if (!ids.length) return;
      ui.session = {
        kind: "practice",
        ids: ids,
        i: 0,
        answered: {},
        log: [],
        startedAt: Date.now(),
        finished: false
      };
      render();
      window.scrollTo({ top: 0 });
      return;
    }

    /* --- bank --- */
    if (action === "bank-filter") {
      ui.bankFilter = el.dataset.filter;
      render();
      return;
    }
    if (action === "bank-section") {
      ui.bankSection = el.dataset.section;
      render();
      return;
    }
    if (action === "new-question") {
      ui.detailId = "new";
      ui.editingId = null;
      ui.tab = "bank";
      render();
      window.scrollTo({ top: 0 });
      return;
    }
    if (action === "open-detail") {
      if (ui.session) {
        if (!ui.session.finished) finishSession();
        if (ui.clock) {
          clearInterval(ui.clock);
          ui.clock = null;
        }
        ui.session = null;
      }
      ui.detailId = el.dataset.id;
      ui.editingId = null;
      ui.tab = "bank";
      render();
      window.scrollTo({ top: 0 });
      return;
    }
    if (action === "close-detail") {
      ui.detailId = null;
      ui.editingId = null;
      render();
      return;
    }
    if (action === "edit-question") {
      ui.editingId = el.dataset.id;
      ui.detailId = el.dataset.id;
      render();
      window.scrollTo({ top: 0 });
      return;
    }
    if (action === "toggle-flag") {
      const id = el.dataset.id;
      if (!id) return;
      const p = prog(id);
      p.flagged = p.flagged ? 0 : Date.now();
      save();
      render();
      return;
    }
    if (action === "toggle-flag-current") {
      const s = ui.session;
      if (!s) return;
      const q = getQuestion(s.ids[s.i]);
      if (!q) return;
      const p = prog(q.id);
      p.flagged = p.flagged ? 0 : Date.now();
      save();
      render();
      return;
    }
    if (action === "delete-question") {
      const id = el.dataset.id;
      if (!window.confirm("Delete this question?")) return;
      if (/^(esap|free)-/.test(id)) {
        state.deletedBankIds = state.deletedBankIds || [];
        if (state.deletedBankIds.indexOf(id) === -1) state.deletedBankIds.push(id);
      }
      state.questions = state.questions.filter(function (q) { return q.id !== id; });
      delete state.progress[id];
      ui.detailId = null;
      ui.editingId = null;
      save();
      render();
      toast("Deleted");
      return;
    }
    if (action === "save-question") {
      saveQuestionForm();
      return;
    }





    /* --- live copy --- */
    if (action === "sync-link") {
      const urlEl = document.getElementById("sync-url");
      const url = urlEl ? urlEl.value.trim() : "";
      if (!/^https?:\/\/\S+$/i.test(url)) {
        toast("Paste the https address of your database");
        return;
      }
      const s = syncSettings();
      s.url = url.replace(/\/+$/, "");
      s.off = false;
      s.lastError = "";
      persist();
      syncNow("manual");
      startLiveFeed();
      render();
      return;
    }
    if (action === "sync-now") {
      syncNow("manual");
      return;
    }
    if (action === "sync-force") {
      if (!window.confirm("Overwrite the shared copy with what is on this device?")) return;
      pushLocal();
      return;
    }
    if (action === "sync-off") {
      if (!window.confirm("Disconnect this device? The database address is removed from this phone and progress stays on this device only.")) return;
      const s = syncSettings();
      s.off = true;
      s.url = "";
      s.lastError = "";
      s.lastSyncAt = 0;
      stopLiveFeed();
      persist();
      render();
      toast("Disconnected — this device is local only now");
      return;
    }

    /* --- more --- */
    if (action === "export-json") {
      const payload = {
        app: "endo-study",
        version: 1,
        exportedAt: new Date().toISOString(),
        settings: state.settings,
        questions: state.questions,
        progress: state.progress,
        days: state.days,
        learn: state.learn,
        history: state.history || [],
        cards: state.cards || []
      };
      const text = JSON.stringify(payload, null, 2);
      const box = document.getElementById("export-area");
      if (box) {
        box.classList.remove("hidden");
        box.value = text;
      }
      try {
        const blob = new Blob([text], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "endo-study-backup-" + todayKey() + ".json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      } catch (err) {
        /* the textarea is the fallback */
      }
      toast("Backup ready");
      return;
    }
    if (action === "pick-json") {
      const input = $("#file-input");
      if (input) input.click();
      return;
    }
    if (action === "reset-progress") {
      if (!window.confirm("Reset all progress? Every answer, streak, flag and reading tick is cleared and you start from question one again. The 144 questions stay.")) return;
      state.progress = {};
      state.days = {};
      state.totalAnswered = 0;
      state.learn = { done: {} };
      state.history = [];
      state.questions.forEach(function (q) { delete q.updatedAt; });
      ui.mode = "new";
      save();
      render();
      toast("All progress cleared");
      return;
    }
    if (action === "reset-all") {
      if (!window.confirm("Delete all questions and progress, and reload the full question bank? This cannot be undone.")) return;
      const settings = Object.assign({}, state.settings);
      state = defaultState();
      state.settings = settings;
      state.seeded = true;
      state.questions = normalizeEsapBank().concat(normalizeFreeBank());
      state.deletedBankIds = [];
      save();
      ui.detailId = null;
      ui.editingId = null;
      ui.tab = "today";
      render();
      toast("Back to the full bank");
      return;
    }
  }

  function onViewChange(e) {
    const t = e.target;
    if (!t) return;

    if (t.id === "set-exam-date") {
      state.settings.examDate = t.value || DEFAULT_SETTINGS.examDate;
    } else if (t.id === "set-daily-new") {
      state.settings.dailyNew = Math.max(0, Number(t.value) || 0);
    } else if (t.id === "set-mock-size") {
      state.settings.mockSize = Math.max(10, Number(t.value) || 30);
    } else if (t.id === "set-mock-min") {
      state.settings.mockMinutesPerQ = Math.max(1, Number(t.value) || 1.5);
    } else {
      return;
    }

    /* stamped so a merge knows this phone changed the settings last */
    state.meta.settingsAt = Date.now();
    save();
    render();
  }

  function onViewInput(e) {
    const t = e.target;
    if (!t) return;

    if (t.id === "bank-search") {
      ui.bankQuery = t.value;
      const pos = t.selectionStart;
      render();
      const again = document.getElementById("bank-search");
      if (again) {
        again.focus();
        try {
          again.setSelectionRange(pos, pos);
        } catch (err) { /* ignore */ }
      }
    }
  }

  function onFilePicked(e) {
    const input = e.target;
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      importJsonText(String(reader.result || ""));
      input.value = "";
    };
    reader.onerror = function () {
      toast("Could not read that file");
      input.value = "";
    };
    reader.readAsText(file);
  }

  /* ---------------- live copy (Firebase Realtime Database) ----------------
     One small JSON document holds the progress. The database address is public
     and the rules allow read and write on the "endo-study" node, so there is no
     key anywhere: every device with that address sees the same progress and
     writes back to it. */

  const LIVE_DB = { url: "" };
  const SYNC_TIMEOUT = 12000;
  const SYNC_DEBOUNCE = 2500;

  let syncBusy = false;
  let syncQueued = false;
  let syncTimer = null;
  let syncRetryMs = 0;

  function syncSettings() {
    if (!state.sync) state.sync = defaultSync();
    return state.sync;
  }

  function syncUrl() {
    const s = syncSettings();
    if (s.off) return "";
    return (s.url || LIVE_DB.url || "").replace(/\/+$/, "");
  }

  function syncReady() {
    return !!syncUrl();
  }

  function statePath() {
    return syncUrl() + "/endo-study/state.json";
  }

  function sinceLabel(ms) {
    const d = Math.max(0, Date.now() - ms);
    if (d < 60000) return "just now";
    const m = Math.round(d / 60000);
    if (m < 60) return m + " min ago";
    const h = Math.round(m / 60);
    if (h < 24) return h + " h ago";
    return Math.round(h / 24) + " days ago";
  }

  function syncLabel() {
    const s = syncSettings();
    if (!syncReady()) return "Off";
    if (syncBusy) return "Syncing…";
    if (s.lastError) return "Not saved";
    if (!s.lastSyncAt) return "On · not synced yet";
    return "Saved " + sinceLabel(s.lastSyncAt);
  }

  function syncStateClass() {
    const s = syncSettings();
    if (!syncReady()) return "off";
    if (syncBusy) return "busy";
    if (s.lastError) return "err";
    return "ok";
  }

  function refreshSyncUI() {
    const line = document.getElementById("sync-line");
    if (!line) return;
    line.textContent = syncLabel();
    line.className = "sync-line " + syncStateClass();
  }

  async function httpJson(url, opts) {
    const cfg = Object.assign({ method: "GET", cache: "no-store" }, opts || {});
    cfg.headers = Object.assign({ Accept: "application/json" }, cfg.headers || {});

    let timer = null;
    if (typeof AbortController !== "undefined") {
      const ctrl = new AbortController();
      cfg.signal = ctrl.signal;
      timer = setTimeout(function () { ctrl.abort(); }, SYNC_TIMEOUT);
    }

    try {
      const res = await fetch(url, cfg);
      const text = await res.text();
      let body = null;
      if (text) {
        try { body = JSON.parse(text); } catch (e) { body = null; }
      }
      if (!res.ok) {
        const msg = (body && (body.error || body.message)) || ("HTTP " + res.status);
        throw new Error(String(msg));
      }
      return body;
    } catch (err) {
      if (err && err.name === "AbortError") throw new Error("the database did not answer");
      throw err;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function syncReadRemote() {
    if (!syncReady()) return null;
    return await httpJson(statePath());
  }

  async function syncWriteRemote(doc) {
    if (!syncReady()) throw new Error("no live copy yet");
    await httpJson(statePath(), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc)
    });
  }

  /* The shipped bank is identical everywhere, so only local edits and written
     questions travel. */
  function shippedBank() {
    const m = {};
    normalizeEsapBank().concat(normalizeFreeBank()).forEach(function (q) { m[q.id] = q; });
    return m;
  }

  function changedQuestions() {
    const bank = shippedBank();
    const out = [];
    state.questions.forEach(function (q) {
      const b = bank[q.id];
      const differs = !b ||
        q.section !== b.section ||
        q.answer !== b.answer ||
        q.vignette !== b.vignette ||
        (q.why || "") !== (b.why || "") ||
        (q.ref || "") !== (b.ref || "") ||
        (q.options || []).join("\u0001") !== (b.options || []).join("\u0001");
      if (!differs) return;
      out.push({
        id: q.id,
        section: q.section,
        vignette: q.vignette,
        options: q.options,
        answer: q.answer,
        why: q.why || "",
        ref: q.ref || "",
        source: q.source || "local",
        updatedAt: q.updatedAt || 0
      });
    });
    return out;
  }

  function buildSyncDoc() {
    return {
      app: "endo-study",
      v: 2,
      device: syncSettings().deviceId,
      updatedAt: Date.now(),
      settings: state.settings,
      settingsAt: state.meta.settingsAt || 0,
      progress: state.progress,
      days: state.days,
      learn: { done: state.learn && state.learn.done ? state.learn.done : {} },
      history: (state.history || []).slice(0, 10),
      cards: state.cards || [],
      deletedBankIds: state.deletedBankIds || [],
      questions: changedQuestions()
    };
  }

  function mergeProgressRecord(a, b) {
    if (!a) return Object.assign({}, b);
    if (!b) return Object.assign({}, a);

    const ra = Number(a.reps) || 0;
    const rb = Number(b.reps) || 0;
    let winner;
    if (rb !== ra) {
      winner = rb > ra ? b : a;
    } else {
      const da = String(a.due || "");
      const db = String(b.due || "");
      winner = db && (!da || db < da) ? b : a;
    }

    const out = Object.assign({}, winner);
    out.attempts = Math.max(Number(a.attempts) || 0, Number(b.attempts) || 0);
    out.correct = Math.max(Number(a.correct) || 0, Number(b.correct) || 0);
    out.lapses = Math.max(Number(a.lapses) || 0, Number(b.lapses) || 0);
    out.reps = Math.max(ra, rb);
    out.interval = Math.max(Number(a.interval) || 0, Number(b.interval) || 0);
    out.flagged = Math.max(Number(a.flagged) || 0, Number(b.flagged) || 0);
    out.last = [a.last, b.last].filter(Boolean).sort().pop() || null;
    out.firstSeen = [a.firstSeen, b.firstSeen].filter(Boolean).sort()[0] || null;
    out.due = winner.due || todayKey();
    return out;
  }

  function mergeRemote(doc) {
    if (!doc || doc.app !== "endo-study") return false;
    let changed = false;

    /* settings: the phone that changed them last wins, and a phone that has
       never changed them adopts whatever the shared copy says */
    const remoteSet = Number(doc.settingsAt) || 0;
    const localSet = Number(state.meta.settingsAt) || 0;
    if (doc.settings && typeof doc.settings === "object" &&
      (remoteSet > localSet || !localSet)) {
      state.settings = Object.assign({}, DEFAULT_SETTINGS, doc.settings);
      state.meta.settingsAt = remoteSet;
      changed = true;
    }

    const remoteProgress = doc.progress && typeof doc.progress === "object" ? doc.progress : {};
    Object.keys(remoteProgress).forEach(function (id) {
      const merged = mergeProgressRecord(state.progress[id], remoteProgress[id]);
      if (!merged) return;
      if (JSON.stringify(state.progress[id] || null) !== JSON.stringify(merged)) {
        state.progress[id] = merged;
        changed = true;
      }
    });

    const remoteDays = doc.days && typeof doc.days === "object" ? doc.days : {};
    Object.keys(remoteDays).forEach(function (k) {
      const loc = state.days[k] || { reviews: 0, newQ: 0 };
      const rem = remoteDays[k] || {};
      const reviews = Math.max(Number(loc.reviews) || 0, Number(rem.reviews) || 0);
      const newQ = Math.max(Number(loc.newQ) || 0, Number(rem.newQ) || 0);
      if (reviews !== (Number(loc.reviews) || 0) || newQ !== (Number(loc.newQ) || 0)) {
        state.days[k] = { reviews: reviews, newQ: newQ };
        changed = true;
      }
    });

    if (!state.learn) state.learn = { done: {} };
    if (!state.learn.done) state.learn.done = {};

    /* session history travels too, one record per session id */
    if (!Array.isArray(state.history)) state.history = [];
    const remoteHistory = Array.isArray(doc.history) ? doc.history : [];
    remoteHistory.forEach(function (h) {
      if (!h || !h.id || !Array.isArray(h.items)) return;
      const known = state.history.some(function (x) { return x.id === h.id; });
      if (!known) {
        state.history.push(h);
        changed = true;
      }
    });
    if (state.history.length > 40) {
      state.history.sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
      state.history.length = 40;
    }

    /* flash cards travel too */
    if (!Array.isArray(state.cards)) state.cards = [];
    const remoteCards = Array.isArray(doc.cards) ? doc.cards : [];
    remoteCards.forEach(function (c) {
      if (!c || !c.qid || !c.vignette) return;
      const known = state.cards.some(function (x) { return x.qid === c.qid; });
      if (!known) {
        state.cards.push(c);
        changed = true;
      }
    });
    const remoteLearn = (doc.learn && doc.learn.done) || {};
    Object.keys(remoteLearn).forEach(function (id) {
      const cur = Number(state.learn.done[id]) || 0;
      const rem = Number(remoteLearn[id]) || 0;
      if (rem > cur) {
        state.learn.done[id] = rem;
        changed = true;
      }
    });

    if (!Array.isArray(state.deletedBankIds)) state.deletedBankIds = [];
    const remoteDeleted = Array.isArray(doc.deletedBankIds) ? doc.deletedBankIds : [];
    remoteDeleted.forEach(function (id) {
      if (state.deletedBankIds.indexOf(id) !== -1) return;
      state.deletedBankIds.push(id);
      state.questions = state.questions.filter(function (q) { return q.id !== id; });
      delete state.progress[id];
      changed = true;
    });

    const remoteQuestions = Array.isArray(doc.questions) ? doc.questions : [];
    remoteQuestions.forEach(function (q) {
      if (!q || !q.id || !q.vignette || !Array.isArray(q.options)) return;
      if (state.deletedBankIds.indexOf(q.id) !== -1) return;
      const local = getQuestion(q.id);
      if (!local) {
        state.questions.push(Object.assign({}, q));
        changed = true;
      } else if ((Number(q.updatedAt) || 0) > (Number(local.updatedAt) || 0)) {
        Object.assign(local, q);
        changed = true;
      }
    });

    state.totalAnswered = Object.keys(state.progress).reduce(function (n, id) {
      return n + (Number(state.progress[id].attempts) || 0);
    }, 0);

    return changed;
  }

  function softRender() {
    const a = document.activeElement;
    const typing = a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT");
    if (!typing) render();
  }

  function scheduleSync(delay) {
    if (!syncReady()) return;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(function () {
      syncTimer = null;
      syncNow("auto");
    }, typeof delay === "number" ? delay : SYNC_DEBOUNCE);
  }

  function scheduleRetry() {
    if (!syncReady()) return;
    syncRetryMs = syncRetryMs ? Math.min(syncRetryMs * 2, 300000) : 30000;
    scheduleSync(syncRetryMs);
  }

  async function syncNow(reason) {
    if (!syncReady()) return false;

    if (syncBusy) {
      syncQueued = true;
      return false;
    }

    syncBusy = true;
    refreshSyncUI();

    try {
      let merged = false;
      let remote = null;
      try {
        remote = await syncReadRemote();
      } catch (err) {
        /* an empty database answers null rather than failing; anything else
           is a real problem */
        if (!/404|not found/i.test(String(err && err.message ? err.message : err))) throw err;
      }
      if (remote) merged = mergeRemote(remote);

      await syncWriteRemote(buildSyncDoc());

      const s = syncSettings();
      s.lastError = "";
      s.lastSyncAt = Date.now();
      state.meta.lastPushAt = Date.now();
      persist();
      refreshSyncUI();
      if (merged) softRender();
      return true;
    } catch (err) {
      const s = syncSettings();
      s.lastError = String(err && err.message ? err.message : err);
      persist();
      refreshSyncUI();
      if (reason === "manual") toast("Could not save to the live copy");
      scheduleRetry();
      return false;
    } finally {
      syncBusy = false;
      refreshSyncUI();
      if (syncQueued) {
        syncQueued = false;
        scheduleSync(1500);
      }
    }
  }

  /* Writes this device's copy over the shared one, without merging first. The
     way out if the two ever disagree. */
  async function pushLocal() {
    if (!syncReady()) return;
    if (syncBusy) {
      toast("Still saving…");
      return;
    }

    syncBusy = true;
    refreshSyncUI();

    try {
      await syncWriteRemote(buildSyncDoc());
      state.meta.lastPushAt = Date.now();

      const s = syncSettings();
      s.lastError = "";
      s.lastSyncAt = Date.now();
      persist();
      refreshSyncUI();
      toast("This copy was sent");
    } catch (err) {
      const s = syncSettings();
      s.lastError = String(err && err.message ? err.message : err);
      persist();
      refreshSyncUI();
      toast("Could not send: " + s.lastError);
    } finally {
      syncBusy = false;
      refreshSyncUI();
    }
  }

  function renderSyncCard() {
    const s = syncSettings();
    const on = syncReady();

    let html = '<section class="card">' +
      '<div class="row between"><h3 style="margin:0">Live copy</h3>' +
      '<span class="sync-line ' + syncStateClass() + '" id="sync-line">' +
      esc(syncLabel()) + '</span></div>';

    if (on) {
      html += '<p class="muted small" style="margin:8px 0 10px">Every device on this address studies from the same progress. An answer saved here reaches the others a couple of seconds later.</p>' +
        '<p class="sync-err"' + (s.lastError ? "" : " hidden") + '>' + esc(s.lastError || "") + '</p>' +
        '<div class="row" style="gap:8px">' +
        '<button class="btn ghost grow" data-action="sync-now">Save now</button>' +
        '<button class="btn ghost grow" data-action="sync-off">Disconnect this device</button>' +
        '</div>' +
        '<button class="btn ghost wide" style="margin-top:8px" data-action="sync-force">Send this copy anyway</button></div>';
    } else {
      html += '<p class="muted small" style="margin:8px 0 10px">Point the app at a free Firebase Realtime Database and every phone on the same address shares one progress. Paste the database address — it is a URL, not a key.</p>' +
        '<label class="field"><span>Database address</span>' +
        '<input class="input" id="sync-url" type="url" autocomplete="off" spellcheck="false" value="' +
        esc(s.url || "") + '" placeholder="https://your-project-default-rtdb.firebaseio.com" /></label>' +
        '<button class="btn primary wide" data-action="sync-link">Use this copy</button>';
    }

    html += '</section>';
    return html;
  }

  /* While the app is open it listens to the database, so a change made on one
     phone lands on the other within a second or two rather than at the next
     reload. If the stream is unavailable it falls back to polling. */
  let liveFeed = null;
  let pollTimer = null;

  function stopLiveFeed() {
    if (liveFeed) {
      try { liveFeed.close(); } catch (e) { /* already gone */ }
      liveFeed = null;
    }
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function onLiveEvent(ev) {
    let msg = null;
    try { msg = JSON.parse(ev.data); } catch (e) { return; }
    if (!msg) return;

    if (msg.path && msg.path !== "/") {
      pullOnly();
      return;
    }
    if (!msg.data) return;

    if (mergeRemote(msg.data)) softRender();
    refreshSyncUI();
  }

  function startLiveFeed() {
    stopLiveFeed();
    if (!syncReady() || document.hidden) return;

    if (typeof EventSource === "undefined") {
      startPolling();
      return;
    }

    try {
      liveFeed = new EventSource(statePath());
    } catch (e) {
      startPolling();
      return;
    }

    liveFeed.addEventListener("put", onLiveEvent);
    liveFeed.addEventListener("patch", onLiveEvent);
    liveFeed.onerror = function () {
      /* the browser retries a dropped stream on its own; poll meanwhile */
      startPolling();
    };
  }

  function startPolling() {
    if (pollTimer) return;
    pollTimer = setInterval(function () {
      if (document.hidden || syncBusy) return;
      pullOnly();
    }, 12000);
  }

  async function pullOnly() {
    try {
      const remote = await syncReadRemote();
      if (remote && mergeRemote(remote)) {
        softRender();
        refreshSyncUI();
      }
    } catch (e) { /* stay quiet: the save path reports real errors */ }
  }

  function startSync() {
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopLiveFeed();
        return;
      }
      refreshSyncUI();
      if (!syncReady()) return;
      syncNow("auto");
      startLiveFeed();
    });

    window.addEventListener("online", function () {
      if (!syncReady()) return;
      syncNow("auto");
      startLiveFeed();
    });

    if (syncReady()) {
      syncNow("start");
      startLiveFeed();
    }
  }

  /* ---------------- theme ---------------- */
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  function applyTheme(next) {
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("endo-theme", next); } catch (e) { /* private mode */ }
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = next === "light" ? "☾" : "☀";
  }

  function toggleTheme() {
    applyTheme(currentTheme() === "light" ? "dark" : "light");
  }

  /* ---------------- init ---------------- */
  function init() {
    const startTab = String(window.location.hash || "").replace("#", "");
    if (["today", "learn", "study", "bank", "more"].indexOf(startTab) !== -1) {
      ui.tab = startTab;
    }

    const tabs = $("#tabbar");
    if (tabs) {
      tabs.addEventListener("click", function (e) {
        const b = e.target.closest(".tab");
        if (b) goTab(b.dataset.tab);
      });
    }

    const view = $("#view");
    if (view) {
      view.addEventListener("click", onViewClick);
      view.addEventListener("change", onViewChange);
      view.addEventListener("input", onViewInput);
    }

    const fileInput = $("#file-input");
    if (fileInput) fileInput.addEventListener("change", onFilePicked);

    if (!storageOk()) {
      toast("This browser is blocking storage, so progress will not be saved.");
    }

    applyTheme(currentTheme());
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.textContent = currentTheme() === "light" ? "☾" : "☀";
      themeBtn.addEventListener("click", toggleTheme);
    }

    const buildTag = document.getElementById("build-tag");
    if (buildTag) buildTag.textContent = "build " + BUILD;

    render();
    startSync();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
