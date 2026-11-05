(function () {
  "use strict";

  const FILE = "ESAP_2026_fk39g9hhj.pdf";
  const params = new URLSearchParams(location.search);
  const phrase = (params.get("w") || "").trim();

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

      if (!view.raw) view.raw = await itemsFor(page, base);
      if (view.hit) markSheet(view);
    } catch (e) {
      strip.textContent = "Page " + view.n + " could not be drawn.";
    }
  }

  async function itemsFor(page, base) {
    const tc = await page.getTextContent();
    return tc.items.map(function (it) {
      const tr = pdfjsLib.Util.transform(base.transform, it.transform);
      const h = Math.hypot(tr[2], tr[3]) || it.height || 10;
      return { str: it.str, x: tr[4], y: tr[5] - h, w: it.width, h: h * 1.25 };
    });
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
      setTimeout(function () {
        try { first.scrollIntoView({ block: "center" }); } catch (e) { /* ignore */ }
      }, 140);
    }
  }

  async function findPhrase() {
    const words = phrase.split(/\s+/).filter(Boolean).slice(0, 9);
    if (!words.length) {
      strip.textContent = doc.numPages + " pages. Scroll to read, or use the reference on any question.";
      return;
    }
    const needle = norm(words.join(" "));

    for (let n = 1; n <= doc.numPages; n++) {
      strip.textContent = "Looking for the question… page " + n + " of " + doc.numPages;
      let page;
      let info;
      try {
        page = await doc.getPage(n);
        info = await itemsFor(page, page.getViewport({ scale: 1 }));
      } catch (e) {
        continue;
      }

      const text = norm(info.map(function (i) { return i.str; }).join(" "));
      const at = text.indexOf(needle);
      if (at === -1) continue;

      let acc = 0;
      let first = -1;
      let last = -1;
      for (let k = 0; k < info.length; k++) {
        const part = norm(info[k].str);
        const start = acc;
        const end = acc + part.length;
        if (end > at && start < at + needle.length) {
          if (first === -1) first = k;
          last = k;
        }
        acc = end + 1;
      }

      const sheet = sheets[n - 1];
      if (!sheet) break;
      sheet.raw = sheet.raw || info;
      sheet.hit = { first: first, last: last };
      strip.textContent = "Question found on page " + n + " — highlighted below.";
      sheet.wrap.scrollIntoView({ block: "start" });
      if (sheet.rendered) markSheet(sheet);
      else renderSheet(sheet);
      return;
    }

    strip.textContent = "That question was not found by text — use your PDF viewer's search for the same words.";
  }

  async function start() {
    try {
      doc = await pdfjsLib.getDocument(FILE).promise;
    } catch (e) {
      strip.textContent = "Could not open the PDF: " + (e && e.message ? e.message : e);
      return;
    }

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

    findPhrase();
  }

  start();
})();
