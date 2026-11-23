/* AgroVerde PWA — service worker: red primero, copia local sin conexión.
   Así las actualizaciones se ven en cuanto hay internet. */
const CACHE = 'agroverde-v11';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './codigo_barras_prueba.svg',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        if (resp && resp.ok && resp.type === 'basic') {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copia));
        }
        return resp;
      })
      .catch(() =>
        caches.match(e.request).then((guardado) => {
          if (guardado) return guardado;
          if (e.request.mode === 'navigate') return caches.match('./index.html');
          return Response.error();
        })
      )
  );
});
