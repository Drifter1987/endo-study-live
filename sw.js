/* Keeps the app and the ESAP book on this device.

   Two kinds of file:
   - the app itself (pages, scripts, data): fetched from the network first, so an
     update shows up on the next visit, with the saved copy as the fallback when
     the connection is slow or missing;
   - the book and PDF.js: kept on the device and served from there, because they
     never change and the book is 16.7 MB.

   Works wherever service workers do: Safari on iOS 11.3 and later, Chrome and
   Edge on desktop and Android, Firefox and desktop Safari. */
const CACHE = "endo-study-v3";

const SHELL = [
  "index.html",
  "styles.css",
  "app.js",
  "reader.html",
  "reader.css",
  "reader.js",
  "tour.html",
  "tour.css",
  "tour.js",
  "data/questions.js",
  "data/resources.js",
  "data/esap-01.js",
  "data/esap-02.js",
  "data/esap-03.js",
  "data/esap-04.js",
  "data/free-01.js",
  "data/stems.js",
  "data/verbatim.js"
];

const VENDOR = ["vendor/pdf.min.js", "vendor/pdf.worker.min.js"];

const BOOK = new URL("ESAP_2026_fk39g9hhj.pdf", self.location).toString();
const CODE = /\.(html|css|js)$/i;
const TIMEOUT = 2500;

function absolute(rel) {
  return new URL(rel, self.location).toString();
}

/* Query strings are only cache busters (app.js?v=...), so a file is kept under
   its plain address and every version shares one entry. */
function keyFor(req) {
  const url = new URL(req.url);
  url.search = "";
  url.hash = "";
  return url.toString();
}

function keep(req, res) {
  if (!res || res.status !== 200 || res.type !== "basic") return res;
  const key = keyFor(req);
  caches.open(CACHE).then(function (c) {
    return c.put(key, res.clone());
  }).catch(function () {
    /* A full disk, or Safari refusing the entry: the network still answered. */
  });
  return res;
}

/* Saves the small files of the app as soon as it is installed, so it opens
   without a connection even if a page was never visited. */
function precache() {
  return caches.open(CACHE).then(function (c) {
    return Promise.all(SHELL.map(function (rel) {
      const url = absolute(rel);
      return c.match(url).then(function (hit) {
        if (hit) return null;
        return fetch(url).then(function (res) {
          if (res && res.ok) return c.put(url, res.clone());
          return null;
        });
      }).catch(function () {
        return null;
      });
    }));
  }).catch(function () {
    return null;
  });
}

self.addEventListener("install", function (event) {
  event.waitUntil(precache().then(function () {
    return self.skipWaiting();
  }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* The book, PDF.js and images: from the device, no network round trip. */
function cacheFirst(req) {
  return caches.match(keyFor(req)).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) {
      keep(req, res);
      return res;
    }).catch(function () {
      return Response.error();
    });
  });
}

/* Pages and code: the network, but never a wait longer than a couple of
   seconds — after that the saved copy answers and the network updates it. */
function freshFirst(req) {
  const saved = caches.match(keyFor(req));

  return new Promise(function (resolve) {
    let settled = false;
    let timer = null;

    const done = function (res) {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      resolve(res);
    };

    timer = setTimeout(function () {
      saved.then(function (hit) {
        if (hit) done(hit);
      });
    }, TIMEOUT);

    fetch(req).then(function (res) {
      keep(req, res);
      done(res);
    }).catch(function () {
      saved.then(function (hit) {
        if (hit) {
          done(hit);
          return;
        }
        if (req.mode === "navigate") {
          caches.match(absolute("index.html")).then(function (idx) {
            done(idx || Response.error());
          });
          return;
        }
        done(Response.error());
      });
    });
  });
}

self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }
  if (url.origin !== self.location.origin) return;

  /* Byte ranges must be answered by the server, never by a saved whole file. */
  if (req.headers.get("range")) return;

  if (req.mode === "navigate") {
    event.respondWith(freshFirst(req));
    return;
  }

  const path = url.pathname;

  if (path.indexOf("/vendor/") !== -1 || !CODE.test(path)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  event.respondWith(freshFirst(req));
});

self.addEventListener("message", function (event) {
  const data = event.data || {};
  const port = event.ports && event.ports[0];

  if (data.type === "book-status") {
    caches.match(BOOK).then(function (hit) {
      if (!port) return;
      port.postMessage({
        cached: !!hit,
        bytes: hit ? Number(hit.headers.get("content-length") || 0) : 0
      });
    });
    return;
  }

  /* Fetch PDF.js in the background so the first reference opens at once. */
  if (data.type === "warm-reader") {
    caches.open(CACHE).then(function (c) {
      VENDOR.forEach(function (rel) {
        const url = absolute(rel);
        c.match(url).then(function (hit) {
          if (hit) return;
          fetch(url).then(function (res) {
            if (res && res.ok) return c.put(url, res.clone());
            return null;
          }).catch(function () {
            return null;
          });
        }).catch(function () {
          return null;
        });
      });
    }).catch(function () {
      return null;
    });
  }
});
