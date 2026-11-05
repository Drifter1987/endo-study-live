(function () {
  "use strict";

  const FILE = "ESAP_2026_fk39g9hhj.pdf";
  const CACHE_KEY = "esap-page-map-v1";
  const params = new URLSearchParams(location.search);
  const phrase = (params.get("w") || "").trim();
  const want = parseInt(params.get("n") || "0", 10) || 0;

  const pagesEl = document.getElementById("pages");
  const strip = document.getElementById("strip");
  const label = document.getElementById("label");
  const ind = document.getElementById("page-ind");

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
    return String(t || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  const pageMap = loadCache();

  function saveCache() {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(pageMap)); } catch (e) { /* ignore */ }
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

  function applyHighlight(view, first, last) {
    if (first === -1 || last === -1) return;
    view.hit = { first: first, last: last };
    if (view.rendered) markSheet(view);
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

  /* Finds the page holding "Question N" (or "QN", or "N.") and remembers it. */
  async function pageForNumber(n) {
    const patterns = [
      new RegExp("question\\s*#?\\s*" + n + "\\b", "i"),
      new RegExp("\\bq\\.?\\s*" + n + "\\b", "i"),
      new RegExp("(^|\\s)" + n + "\\.\\s", "i")
    ];

    const start = Math.max(1, Math.min(doc.numPages,
      Math.round(((n - 1) / 120) * doc.numPages) || 1));

    const order = [];
    for (let p = start; p <= doc.numPages; p++) order.push(p);
    for (let p = 1; p < start; p++) order.push(p);

    for (let i = 0; i < order.length; i++) {
      const p = order[i];
      strip.textContent = "Finding question " + n + "… page " + p + " of " + doc.numPages;
      let page;
      try {
        page = await doc.getPage(p);
      } catch (e) {
        continue;
      }
      const items = await itemsFor(page);
      const text = items.map(function (it) { return it.str; }).join("\n");
      for (let k = 0; k < patterns.length; k++) {
        const m = patterns[k].exec(text);
        if (!m) continue;
        pageMap[n] = p;
        saveCache();
        return { page: p, items: items };
      }
    }
    return null;
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
    if (!sheet) return;
    if (range) applyHighlight(sheet, range.first, range.last);
    sheet.wrap.scrollIntoView({ block: "start" });
    if (!sheet.rendered) renderSheet(sheet);
    [200, 700, 1500].forEach(function (t) {
      setTimeout(function () {
        try { sheet.wrap.scrollIntoView({ block: "start" }); } catch (e) { /* ignore */ }
      }, t);
    });
    ind.textContent = pageNo + " / " + doc.numPages;
  }

  async function findByPhrase() {
    const words = phrase.split(/\s+/).filter(Boolean);
    if (!words.length) return false;

    const sizes = [9, 7, 5, 4].filter(function (k, i, a) {
      return k <= words.length && a.indexOf(k) === i;
    });

    for (let t = 0; t < sizes.length; t++) {
      const needle = norm(words.slice(0, sizes[t]).join(" "));
      for (let n = 1; n <= doc.numPages; n++) {
        strip.textContent = "Searching the text… (" + sizes[t] + " words, page " + n + ")";
        let page;
        let items;
        try {
          page = await doc.getPage(n);
          items = await itemsFor(page);
        } catch (e) {
          continue;
        }
        const normed = items.map(function (i) { return { str: norm(i.str) }; });
        const text = normed.map(function (i) { return i.str; }).join(" ");
        const at = text.indexOf(needle);
        if (at === -1) continue;

        const sheet = sheets[n - 1];
        if (sheet) sheet.raw = sheet.raw || items;
        jump(n, rangeFor(normed, at, needle.length));
        return true;
      }
    }
    return false;
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

    if (!want) {
      strip.textContent = doc.numPages + " pages, opened in " + opened + " ms.";
      return;
    }

    if (pageMap[want]) {
      jump(pageMap[want], null);
      strip.textContent = "Question " + want + " · page " + pageMap[want] + " (remembered) · opened in " + opened + " ms.";
      return;
    }

    const found = await pageForNumber(want);
    if (found) {
      const needle = norm(phrase.split(/\s+/).slice(0, 5).join(" "));
      const normed = found.items.map(function (i) { return { str: norm(i.str) }; });
      const at = normed.map(function (i) { return i.str; }).join(" ").indexOf(needle);
      const range = at === -1 ? null : rangeFor(normed, at, needle.length);
      const sheet = sheets[found.page - 1];
      if (sheet) sheet.raw = sheet.raw || found.items;
      jump(found.page, range);
      strip.textContent = "Question " + want + " · page " + found.page + " · opened in " + opened + " ms.";
      return;
    }

    const viaText = await findByPhrase();
    strip.textContent = viaText
      ? "Found by its words · opened in " + opened + " ms."
      : "Question " + want + " was not found — use the PDF's search for the same words.";
  }

  start();
})();
