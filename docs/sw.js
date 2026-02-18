const CACHE_NAME = "crmcrops-static-v3";
// Derive the base path from the service worker scope so it works for web (/CRMCORPS/) and native (/).
const scopePath = new URL(self.registration.scope).pathname;
const base = scopePath.endsWith("/") ? scopePath : `${scopePath}/`;
const OFFLINE_URL = `${base}index.html`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([OFFLINE_URL, base, `${base}manifest.webmanifest`])
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // App shell for navigations
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return resp;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Cache-first for static assets
  if (
    request.method === "GET" &&
    ["style", "script", "image", "font"].includes(request.destination)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((resp) => {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return resp;
          })
          .catch(() => cached);
      })
    );
  }
});
