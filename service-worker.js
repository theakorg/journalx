const CACHE_VERSION = "1.0.0";
const CACHE_NAME = `JournalX-V${CACHE_VERSION}`;
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/css/main.css",
  "./assets/js/app.js",
  "./assets/logos/logo.svg",
  "./assets/i18n/en.json",
  "./assets/i18n/fa.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("JournalX-V") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const cloned = response.clone();
          const isValid = response.ok && response.type === "basic";
          if (isValid) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
