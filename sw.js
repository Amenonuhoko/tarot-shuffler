const CACHE_NAME = "tarot-pull-v6";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css?v=20260922",
  "./script.js?v=20260922",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Network-first: always serve the latest deployed files when online, so
  // a new version reaches users on their next reload without needing a
  // manual cache-name bump every time. cache: "no-store" makes that fetch
  // bypass the browser's own HTTP cache too - otherwise a same-origin
  // request can still be answered from disk cache under a Cache-Control
  // max-age from GitHub Pages without ever reaching this handler's logic,
  // which is what let a stale script.js/style.css survive past a deploy.
  // The cache only kicks in when the network request fails (offline
  // support).
  event.respondWith(
    fetch(event.request, { cache: "no-store" }).then(response => {
      if (response.ok && event.request.url.startsWith(self.location.origin)) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});