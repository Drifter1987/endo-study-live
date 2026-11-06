/* Keeps the app and the ESAP book on the device so later opens are instant.
   The app's own files come from the network first, so a new build shows up on
   the next visit; the heavy, never-changing files (the book, PDF.js) are
   served from the cache first. */
const CACHE = "endo-study-cache-v2";

const NETWORK_FIRST = /\.(html|js|css)$/i;

self.addEventListener("install", function () {
  self.skipWaiting();
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

function keep(req, res) {
  if (res && res.status === 200 && res.type === "basic") {
    const copy = res.clone();
    caches.open(CACHE).then(function (c) {
      c.put(req, copy);
    });
  }
  return res;
}

self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  /* Pages and code: try the network, fall back to the cached copy offline.
     The PDF.js library under vendor/ never changes, so it stays cache first. */
  const fromVendor = url.pathname.indexOf("/vendor/") !== -1;
  if (!fromVendor && (req.mode === "navigate" || NETWORK_FIRST.test(url.pathname))) {
    event.respondWith(
      fetch(req)
        .then(function (res) {
          return keep(req, res);
        })
        .catch(function () {
          return caches.match(req).then(function (hit) {
            if (hit) return hit;
            return req.mode === "navigate"
              ? caches.match("./index.html")
              : Response.error();
          });
        })
    );
    return;
  }

  /* Everything else (the book, PDF.js, images): cache first, refresh quietly. */
  event.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) {
        fetch(req)
          .then(function (res) {
            keep(req, res);
          })
          .catch(function () {});
        return hit;
      }
      return fetch(req)
        .then(function (res) {
          return keep(req, res);
        })
        .catch(function () {
          return Response.error();
        });
    })
  );
});
