/* Service Worker — Radio Estación Mix · Player PWA */
const CACHE = 'estacionmix-1';

const SHELL = [
  './',
  './index.html',
  './logo.png',
  './css/style.css',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-mask.png',
  './icons/icon-180.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  /* Nunca cachear el stream ni la API de Zeno */
  if (url.hostname.includes('stream.zeno.fm') || url.hostname.includes('api.zeno.fm') || url.hostname.includes('surfernetwork.com')) return;

  /* Solo manejar peticiones de la propia app */
  if (url.origin !== self.location.origin) return;

  /* Estrategia: cache-first para el shell, red si falla */
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(request, copy)).catch(() => {});
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});