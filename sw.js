/* ============================================================================
   AREKAS ARENA — SERVICE WORKER
   Makes the site installable and usable offline.
   · Pages: network first, falling back to the cached copy, then /offline.html.
   · Images, CSS, JS, fonts: served from cache, refreshed in the background.
   · Videos and cross-origin requests (analytics, maps) are never touched.
   Bump VERSION whenever PRECACHE changes or to force every client to refresh.
   ========================================================================== */
var VERSION = 'v4';
var SHELL = 'arekas-shell-' + VERSION;
var PAGES = 'arekas-pages-' + VERSION;
var ASSETS = 'arekas-assets-' + VERSION;
var MAX_ASSETS = 120;

var PRECACHE = [
  '/',
  '/offline.html',
  '/assets/theme.css',
  '/assets/bootstrap.subset.css',
  '/assets/theme.js',
  '/site.webmanifest',
  '/favicon.ico',
  '/favicon-32.png',
  '/favicon-192.png',
  '/favicon-512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL)
      .then(function (cache) {
        // Bypass the HTTP cache so a VERSION bump never precaches stale files.
        return cache.addAll(PRECACHE.map(function (url) {
          return new Request(url, { cache: 'reload' });
        }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  var keep = [SHELL, PAGES, ASSETS];
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) {
          if (k.indexOf('arekas-') === 0 && keep.indexOf(k) === -1) return caches.delete(k);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

function trim(cacheName, max) {
  return caches.open(cacheName).then(function (cache) {
    return cache.keys().then(function (keys) {
      if (keys.length <= max) return;
      return cache.delete(keys[0]).then(function () { return trim(cacheName, max); });
    });
  });
}

function networkFirstPage(request) {
  return fetch(request)
    .then(function (res) {
      if (res.ok) {
        var copy = res.clone();
        caches.open(PAGES).then(function (c) { c.put(request, copy); });
      }
      return res;
    })
    .catch(function () {
      return caches.match(request, { ignoreSearch: true }).then(function (hit) {
        return hit || caches.match('/offline.html');
      });
    });
}

function staleWhileRevalidate(request) {
  // /assets/ has a 1-day HTTP cache (vercel.json); revalidate so edits show next visit.
  var fresh = new URL(request.url).pathname.indexOf('/assets/') === 0
    ? new Request(request, { cache: 'no-cache' })
    : request;
  return caches.open(ASSETS).then(function (cache) {
    // Fall back to any cache so the precached shell is used too.
    return cache.match(request).then(function (hit) {
      return hit || caches.match(request);
    }).then(function (hit) {
      var refresh = fetch(fresh).then(function (res) {
        if (res.ok && res.type === 'basic') {
          cache.put(request, res.clone()).then(function () { trim(ASSETS, MAX_ASSETS); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || refresh;
    });
  });
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Large media streams with range requests; leave it to the browser.
  if (/\.(mp4|webm|mov)$/i.test(url.pathname) || req.headers.has('range')) return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirstPage(req));
    return;
  }

  if (/\.(webp|png|jpe?g|gif|svg|ico|css|js|woff2?|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(req));
  }
});
