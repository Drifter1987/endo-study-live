(function () {
  "use strict";

  var TABS = [
    ["today", "\u25C9", "Today"],
    ["study", "\u25B6", "Study"],
    ["bank", "\u25A4", "Questions"],
    ["learn", "\u25A3", "Learn"],
    ["more", "\u22EF", "More"]
  ];

  var scenes = Array.prototype.slice.call(document.querySelectorAll(".scene"));

  /* build the little tab bar at the foot of every screen mock-up */
  scenes.forEach(function (sc) {
    var holder = sc.querySelector(".scr-tabs");
    if (!holder) return;
    var active = sc.getAttribute("data-tab") || "";
    holder.innerHTML = TABS.map(function (t) {
      return '<span class="mini-tab' + (t[0] === active ? " act" : "") + '">' +
        "<i>" + t[1] + "</i>" + t[2] + "</span>";
    }).join("");
  });

  var plan = [];
  var total = 0;

  scenes.forEach(function (sc) {
    var dur = parseFloat(sc.getAttribute("data-dur")) || 10;
    plan.push({
      el: sc,
      start: total,
      dur: dur,
      name: sc.getAttribute("data-name") || "",
      caption: sc.getAttribute("data-caption") || "",
      items: Array.prototype.slice.call(sc.querySelectorAll("[data-at]"))
    });
    total += dur;
  });

  var barFill = document.getElementById("bar-fill");
  var clockEl = document.getElementById("clock");
  var capEl = document.getElementById("caption");
  var nameEl = document.getElementById("chapter-name");
  var chaptersEl = document.getElementById("chapters");
  var playBtn = document.getElementById("play");
  var restartBtn = document.getElementById("restart");
  var stage = document.querySelector(".stage");

  /* the mock-up is drawn at a fixed 300 x 566 and scaled to whatever room the
     screen gives it, so nothing inside it reflows or gets clipped */
  function fit() {
    if (!stage) return;
    var w = stage.clientWidth;
    var h = stage.clientHeight;
    if (!w || !h) return;
    var s = Math.min(w / 300, h / 566, 1);
    stage.style.setProperty("--scale", String(s));
  }


  chaptersEl.innerHTML = plan.map(function (p, i) {
    return '<button class="chapter" data-i="' + i + '">' + p.name + "</button>";
  }).join("");

  var chapterBtns = Array.prototype.slice.call(chaptersEl.querySelectorAll(".chapter"));

  var t = 0;
  var playing = true;
  var last = 0;
  var current = -1;
  var capDone = false;

  function fmt(sec) {
    var s = Math.max(0, Math.round(sec));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  function sceneAt(time) {
    for (var i = plan.length - 1; i >= 0; i--) {
      if (time >= plan[i].start) return i;
    }
    return 0;
  }

  function resetScene(p) {
    p.el.classList.remove("active");
    p.items.forEach(function (el) { el.classList.remove("on"); });
  }

  function draw() {
    var idx = sceneAt(Math.min(t, total - 0.001));

    if (idx !== current) {
      plan.forEach(resetScene);
      plan[idx].el.classList.add("active");
      current = idx;
      capDone = false;
      nameEl.textContent = plan[idx].name;
      chapterBtns.forEach(function (b, i) { b.classList.toggle("act", i === idx); });
    }

    var p = plan[idx];
    var into = Math.max(0, t - p.start);

    p.items.forEach(function (el) {
      var at = parseFloat(el.getAttribute("data-at")) || 0;
      var want = into >= at;
      var has = el.classList.contains("on");
      if (want && !has) el.classList.add("on");
      else if (!want && has) el.classList.remove("on");
    });

    if (capDone || !playing) {
      capDone = true;
      capEl.textContent = p.caption;
    } else {
      var shown = Math.floor(into * 38);
      if (shown >= p.caption.length) {
        capDone = true;
        capEl.textContent = p.caption;
      } else {
        capEl.textContent = p.caption.slice(0, shown);
      }
    }

    barFill.style.width = (total > 0 ? (t / total) * 100 : 0) + "%";
    clockEl.textContent = fmt(t) + " / " + fmt(total);
  }

  function setPlayLabel() {
    playBtn.innerHTML = playing ? "&#10074;&#10074;" : "&#9654;";
    playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
  }

  function loop(now) {
    if (!last) last = now;
    var dt = (now - last) / 1000;
    last = now;
    if (dt > 0.4) dt = 0.04;

    if (playing) {
      t += dt;
      if (t >= total) {
        t = total;
        playing = false;
        setPlayLabel();
      }
    }

    draw();
    window.requestAnimationFrame(loop);
  }

  playBtn.addEventListener("click", function () {
    if (!playing && t >= total) {
      t = 0;
      current = -1;
    }
    playing = !playing;
    last = 0;
    setPlayLabel();
    draw();
  });

  restartBtn.addEventListener("click", function () {
    t = 0;
    current = -1;
    playing = true;
    last = 0;
    setPlayLabel();
    draw();
  });

  chaptersEl.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".chapter") : null;
    if (!btn) return;
    var i = parseInt(btn.getAttribute("data-i"), 10) || 0;
    t = plan[i].start;
    current = -1;
    capDone = false;
    playing = true;
    last = 0;
    setPlayLabel();
    draw();
  });

  window.addEventListener("resize", fit);
  window.addEventListener("orientationchange", fit);

  document.addEventListener("visibilitychange", function () {
    last = 0;
    fit();
  });

  fit();
  setPlayLabel();
  draw();
  window.requestAnimationFrame(loop);
  window.requestAnimationFrame(fit);
})();
