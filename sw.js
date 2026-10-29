const CACHE_NAME = "tarot-pull-v28";

// The dice mode's three.js build. Cross-origin, so it isn't precached
// with the app (most visits never open the dice); it's kept once it has
// been fetched, so the dice also work offline after their first use.
const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js";
const FONT_CSS_HOST = "fonts.googleapis.com";
const FONT_FILE_HOST = "fonts.gstatic.com";

// How long a page load waits on the network before the cached copy is
// shown instead (the network copy still lands in the cache for next time).
const NAVIGATION_TIMEOUT_MS = 3000;

const ASSETS = [
  "./",
  "./index.html",
  "./style.css?v=20261029-3",
  "./dice.css?v=20261025-3",
  "./script.js?v=20261029-3",
  "./realms.css?v=20261025-8",
  "./realms.js?v=20261025-5",
  "./dice.js?v=20261025",
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

// Every load used to fetch every file from the network before the page
// could draw (and the fonts were never cached at all), so a slow
// connection meant a slow open every time. Now only the page itself goes
// to the network first; what it links to comes from the cache:
// - Versioned files (?v=...), the three.js build and font files never
//   change under the same URL: cache first, network only the first time.
// - The font stylesheet and the unversioned files (paintings, icons,
//   manifest): from the cache at once, refreshed in the background.
// A deploy bumps the ?v= of whatever changed, so the new page asks for
// new URLs and nothing stale is served.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  } else if ((sameOrigin && url.searchParams.has("v")) || url.href === THREE_URL || url.host === FONT_FILE_HOST) {
    event.respondWith(cacheFirst(request));
  } else if (sameOrigin || url.host === FONT_CSS_HOST) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// cache: "no-store" bypasses the browser's own HTTP cache, which could
// otherwise answer under GitHub Pages' max-age without a deploy showing.
function fetchAndCache(request) {
  return fetch(request, { cache: "no-store" }).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, copy);
        pruneOldVersions(cache, request.url);
      });
    }
    return response;
  });
}

// A new ?v= of a file makes the old one dead weight: drop it.
function pruneOldVersions(cache, href) {
  const url = new URL(href);
  if (url.origin !== self.location.origin || !url.searchParams.has("v")) {
    return;
  }
  cache.keys().then(keys => keys.forEach(key => {
    const old = new URL(key.url);
    if (old.pathname === url.pathname && old.search !== url.search) {
      cache.delete(key);
    }
  }));
}

function networkFirst(request) {
  const network = fetchAndCache(request);
  const timeout = new Promise(resolve => setTimeout(resolve, NAVIGATION_TIMEOUT_MS));
  const cachedAfterTimeout = timeout.then(() => caches.match(request, { ignoreSearch: true }));
  return Promise.race([
    network.catch(() => caches.match(request, { ignoreSearch: true })),
    cachedAfterTimeout.then(cached => cached || network)
  ]);
}

function cacheFirst(request) {
  return caches.match(request).then(cached => cached || fetchAndCache(request));
}

function staleWhileRevalidate(request) {
  return caches.match(request).then(cached => {
    const network = fetchAndCache(request).catch(() => cached);
    return cached || network;
  });
}
