(function () {
  "use strict";

  const FILE = "ESAP_2026_fk39g9hhj.pdf";
  const params = new URLSearchParams(location.search);
  const want = parseInt(params.get("n") || "0", 10) || 0;
  const answerText = (params.get("a") || "").trim();
  const stemText = (params.get("w") || "").trim();

  const pagesEl = document.getElementById("pages");
  const strip = document.getElementById("strip");
  const label = document.getElementById("label");
  const ind = document.getElementById("page-ind");
  const findInput = document.getElementById("find-input");
  const findBtn = document.getElementById("find-btn");

  document.getElementById("close").addEventListener("click", function () {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "endo-close-reader" }, "*");
    } else {
      location.href = "index.html";
    }
  });

  if (!window.pdfjsLib) {
    strip.textContent = "The PDF engine did not load.";
    return;
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdf.worker.min.js";

  let doc = null;
  const sheets = [];
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      const s = sheets.filter(function (x) { return x.wrap === e.target; })[0];
      if (s && !s.rendered) renderSheet(s);
    });
  }, { root: pagesEl, rootMargin: "900px 0px" });

  function norm(t) {
    return String(t || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function makeSheet(n) {
    const wrap = document.createElement("div");
    wrap.className = "sheet";
    const canvas = document.createElement("canvas");
    const marks = document.createElement("div");
    marks.className = "marks";
    const tag = document.createElement("div");
    tag.className = "pnum";
    tag.textContent = n;

    wrap.appendChild(canvas);
    wrap.appendChild(marks);
    wrap.appendChild(tag);
    pagesEl.appendChild(wrap);

    const s = { n: n, wrap: wrap, canvas: canvas, marks: marks, rendered: false, scale: 1, raw: null, hit: null };
    sheets.push(s);
    io.observe(wrap);
    return s;
  }

  async function itemsFor(page) {
    const base = page.getViewport({ scale: 1 });
    const tc = await page.getTextContent();
    return tc.items.map(function (it) {
      const tr = pdfjsLib.Util.transform(base.transform, it.transform);
      const h = Math.hypot(tr[2], tr[3]) || it.height || 10;
      return { str: it.str, x: tr[4], y: tr[5] - h, w: it.width, h: h * 1.25 };
    });
  }

  async function renderSheet(view) {
    view.rendered = true;
    try {
      const page = await doc.getPage(view.n);
      const base = page.getViewport({ scale: 1 });
      const width = Math.max(220, pagesEl.clientWidth - 16);
      const scale = width / base.width;
      const vp = page.getViewport({ scale: scale });
      view.scale = scale;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      view.canvas.width = Math.floor(vp.width * dpr);
      view.canvas.height = Math.floor(vp.height * dpr);
      view.canvas.style.width = "100%";
      view.canvas.style.height = "auto";
      view.wrap.style.height = vp.height + "px";

      const ctx = view.canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;

      if (!view.raw) view.raw = await itemsFor(page);
      if (view.hit) markSheet(view);
    } catch (e) {
      strip.textContent = "Page " + view.n + " could not be drawn.";
    }
  }

  function markSheet(view) {
    if (!view.hit || !view.raw) return;
    view.marks.innerHTML = "";
    const s = view.scale;
    view.raw.forEach(function (it, k) {
      if (k < view.hit.first || k > view.hit.last) return;
      if (!norm(it.str)) return;
      const d = document.createElement("div");
      d.className = "mark";
      d.style.left = (it.x * s) + "px";
      d.style.top = (it.y * s) + "px";
      d.style.width = (it.w * s) + "px";
      d.style.height = (it.h * s) + "px";
      view.marks.appendChild(d);
    });

    const first = view.marks.firstChild;
    if (first) {
      [160, 700, 1500].forEach(function (t) {
        setTimeout(function () {
          try { first.scrollIntoView({ block: "center" }); } catch (e) { /* ignore */ }
        }, t);
      });
    }
  }

  function rangeFor(items, at, length) {
    let acc = 0;
    let first = -1;
    let last = -1;
    for (let k = 0; k < items.length; k++) {
      const part = items[k].str;
      const start = acc;
      const end = acc + part.length;
      if (end > at && start < at + length) {
        if (first === -1) first = k;
        last = k;
      }
      acc = end + 1;
    }
    return { first: first, last: last };
  }

  function jump(pageNo, range) {
    const sheet = sheets[pageNo - 1];
    if (!sheet) return false;
    sheet.hit = range && range.first !== -1 ? range : null;
    sheet.wrap.scrollIntoView({ block: "start" });
    if (!sheet.rendered) renderSheet(sheet);
    else if (sheet.hit) markSheet(sheet);

    [200, 700, 1500].forEach(function (t) {
      setTimeout(function () {
        try { sheet.wrap.scrollIntoView({ block: "start" }); } catch (e) { /* ignore */ }
      }, t);
    });
    ind.textContent = pageNo + " / " + doc.numPages;
    return true;
  }

  async function pageInfo(p) {
    const page = await doc.getPage(p);
    const items = await itemsFor(page);
    return { page: p, items: items, text: items.map(function (i) { return i.str; }).join(" ") };
  }

  function mentionsNumber(rawText, n) {
    const head = String(rawText || "").slice(0, 900).toLowerCase();
    if (new RegExp("question\\s*#?\\s*" + n + "\\b").test(head)) return true;
    if (new RegExp("(^|\\n)\\s*" + n + "\\.\\s").test(head)) return true;
    return false;
  }

  /* Scans every page for a phrase; optionally demands the question number too. */
  async function findPhrase(phrase, needNumber, label2) {
    const needle = norm(phrase);
    if (needle.length < 8) return null;

    for (let p = 1; p <= doc.numPages; p++) {
      strip.textContent = label2 + " — page " + p + " of " + doc.numPages;
      let info;
      try {
        info = await pageInfo(p);
      } catch (e) {
        continue;
      }
      const text = norm(info.text);
      const at = text.indexOf(needle);
      if (at === -1) continue;
      if (needNumber && want && !mentionsNumber(info.text, want)) continue;

      const normed = info.items.map(function (i) { return { str: norm(i.str) }; });
      const at2 = normed.map(function (i) { return i.str; }).join(" ").indexOf(needle);
      const range = at2 === -1 ? null : rangeFor(normed, at2, needle.length);
      const sheet = sheets[p - 1];
      if (sheet) sheet.raw = sheet.raw || info.items;
      return { page: p, range: range };
    }
    return null;
  }

  async function goToQuestion() {
    const found = [];

    /* 1. the correct answer is printed verbatim in the book */
    if (answerText) {
      const byAnswer = await findPhrase(answerText, true, "Finding the answer text");
      if (byAnswer) found.push(byAnswer);
      else {
        const loose = await findPhrase(answerText, false, "Finding the answer text");
        if (loose) found.push(loose);
      }
    }

    /* 2. the opening words of the case */
    if (!found.length && stemText) {
      const words = stemText.split(/\s+/).filter(Boolean);
      for (let k = Math.min(9, words.length); k >= 5; k--) {
        const byStem = await findPhrase(words.slice(0, k).join(" "), false, "Finding the case");
        if (byStem) { found.push(byStem); break; }
      }
    }

    if (!found.length) return false;

    const hit = found[0];
    const sheet = sheets[hit.page - 1];
    if (sheet) sheet.raw = sheet.raw || null;
    jump(hit.page, hit.range);
    return true;
  }

  function wireSearch() {
    const run = function () {
      const q = (findInput.value || "").trim();
      if (!q || !doc) return;
      findBtn.disabled = true;
      findPhrase(q, false, "Searching").then(function (hit) {
        findBtn.disabled = false;
        if (!hit) {
          strip.textContent = "Nothing found for “" + q + "”.";
          return;
        }
        jump(hit.page, hit.range);
        strip.textContent = "Found on page " + hit.page + " — highlighted.";
      }, function () {
        findBtn.disabled = false;
        strip.textContent = "Search failed.";
      });
    };

    findBtn.addEventListener("click", run);
    findInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        run();
      }
    });
  }

  async function start() {
    const t0 = performance.now();
    try {
      doc = await pdfjsLib.getDocument(FILE).promise;
    } catch (e) {
      strip.textContent = "Could not open the PDF: " + (e && e.message ? e.message : e);
      return;
    }
    const opened = Math.round(performance.now() - t0);

    label.textContent = "ESAP 2026";
    ind.textContent = "1 / " + doc.numPages;
    for (let n = 1; n <= doc.numPages; n++) makeSheet(n);

    pagesEl.addEventListener("scroll", function () {
      const top = pagesEl.getBoundingClientRect().top;
      let cur = 1;
      sheets.forEach(function (s) {
        const r = s.wrap.getBoundingClientRect();
        if (r.top - top <= 60) cur = s.n;
      });
      ind.textContent = cur + " / " + doc.numPages;
    });

    wireSearch();

    if (!want && !answerText) {
      strip.textContent = doc.numPages + " pages, opened in " + opened + " ms. Use the search box.";
      return;
    }

    const ok = await goToQuestion();
    strip.textContent = ok
      ? "Question" + (want ? " " + want : "") + " found · opened in " + opened + " ms."
      : "Question" + (want ? " " + want : "") + " was not found — search the book for a phrase from it.";
  }

  start();
})();
