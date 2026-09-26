/* Service Worker — Radio Voz Cristiana PWA */
const CACHE_NAME = 'voz-cristiana-shell-v2';
const OFFLINE_URL = './offline.html';

// Solo se precachean recursos propios y estables. El streaming y la metadata
// siempre deben solicitarse a la red para que la radio siga siendo en vivo.
const APP_SHELL = [
  './',
  './index.html',
  './offline.html',
  './css/style.css',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-mask.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(APP_SHELL.map(url => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function isLiveResource(url) {
  return url.hostname === 'radioserver.radiovozdelcielo.com'
    || url.hostname.includes('zeno.fm')
    || url.hostname.includes('surfernetwork.com')
    || url.pathname.endsWith('.mp3');
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isLiveResource(url)) return;

  // Las navegaciones funcionan offline mostrando una pantalla informativa.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html').then(
        response => response || caches.match(OFFLINE_URL)
      ))
    );
    return;
  }

  // Para CSS, JS, manifiesto e iconos: cache-first con actualización de red.
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
      return cached || network.catch(() => caches.match(OFFLINE_URL));
    })
  );
});
