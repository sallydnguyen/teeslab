const CACHE_NAME = 'tees-lab-shell-v212';
const CORE_FILES = [
  './', './index.html', './manifest.json', './logo.jpg', './version.json',
  './assets/samples/coffee.jpg',
  './assets/fonts/Caveat-TeeLab.woff2',
  './assets/gear/bodies/slr.webp',
  './assets/gear/bodies/rangefinder.webp',
  './assets/gear/bodies/half-frame.webp',
  './assets/gear/bodies/pns.webp',
  './assets/gear/bodies/disposable.webp',
  './assets/gear/bodies/medium-format.webp'
];
const WARM_FILES = [
  './assets/gear/films/fuji-pro-400h.webp',
  './assets/gear/films/fuji-superia-400.webp',
  './assets/gear/films/fuji-superia-premium-400.webp',
  './assets/gear/films/fuji-fujicolor-100.webp',
  './assets/gear/films/fuji-classic-chrome.webp',
  './assets/gear/films/kodak-portra-160.webp',
  './assets/gear/films/kodak-portra-400.webp',
  './assets/gear/films/kodak-portra-800.webp',
  './assets/gear/films/kodak-gold-200.webp',
  './assets/gear/films/kodak-colorplus-200.webp',
  './assets/gear/films/kodak-ultramax-400.webp',
  './assets/gear/films/kodak-ektar-100.webp',
  './assets/gear/films/kodak-vision3-250d.webp',
  './assets/gear/films/kodak-vision3-500t.webp',
  './assets/gear/films/cinestill-800t.webp',
  './assets/gear/films/lomo-800.webp',
  './assets/gear/films/popho-luminar-100.webp',
  './assets/gear/films/ilford-hp5.webp',
  './assets/gear/films/agfa-apx-400.webp',
  './assets/samples/golden-hour.jpg',
  './assets/samples/neon-street.jpg',
  './assets/samples/forest.jpg',
  './assets/samples/portrait.jpg',
  './assets/samples/ocean.jpg',
  './assets/samples/tokyo-alley.jpg',
  './assets/samples/mountains.jpg',
  './assets/samples/architecture.jpg',
  './assets/samples/flower.jpg',
  './assets/samples/venice.jpg',
  './assets/samples/night-car.jpg',
  './assets/samples/galaxy.jpg',
  './assets/film-samples/kodak-gold-200-1.jpg',
  './assets/film-samples/kodak-gold-200-2.jpg',
  './assets/film-samples/kodak-colorplus-200-1.jpg',
  './assets/film-samples/kodak-colorplus-200-2.jpg',
  './assets/film-samples/fuji-superia-400-1.jpg',
  './assets/film-samples/fuji-superia-400-2.jpg',
  './assets/film-samples/kodak-ultramax-400-1.jpg',
  './assets/film-samples/kodak-ultramax-400-2.jpg',
  './assets/film-samples/fuji-classic-chrome-1.jpg',
  './assets/film-samples/fuji-classic-chrome-2.jpg',
  './assets/film-samples/kodak-vision3-250d-1.jpg',
  './assets/film-samples/kodak-vision3-250d-2.jpg',
  './assets/film-samples/kodak-portra-400-1.jpg',
  './assets/film-samples/kodak-portra-400-2.jpg',
  './assets/film-samples/kodak-portra-160-1.jpg',
  './assets/film-samples/kodak-portra-160-2.jpg',
  './assets/film-samples/fuji-pro-400h-1.jpg',
  './assets/film-samples/fuji-pro-400h-2.jpg',
  './assets/film-samples/fuji-superia-premium-400-1.jpg',
  './assets/film-samples/fuji-superia-premium-400-2.jpg',
  './assets/film-samples/kodak-portra-800-1.jpg',
  './assets/film-samples/kodak-portra-800-2.jpg',
  './assets/film-samples/kodak-ektar-100-1.jpg',
  './assets/film-samples/kodak-ektar-100-2.jpg',
  './assets/film-samples/fuji-fujicolor-100-1.jpg',
  './assets/film-samples/fuji-fujicolor-100-2.jpg',
  './assets/film-samples/popho-luminar-100-1.jpg',
  './assets/film-samples/popho-luminar-100-2.jpg',
  './assets/film-samples/cinestill-800t-1.jpg',
  './assets/film-samples/cinestill-800t-2.jpg',
  './assets/film-samples/kodak-vision3-500t-1.jpg',
  './assets/film-samples/kodak-vision3-500t-2.jpg',
  './assets/film-samples/lomo-800-1.jpg',
  './assets/film-samples/lomo-800-2.jpg',
  './assets/film-samples/ilford-hp5-1.jpg',
  './assets/film-samples/ilford-hp5-2.jpg',
  './assets/film-samples/agfa-apx-400-1.jpg',
  './assets/film-samples/agfa-apx-400-2.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(CORE_FILES.map(url => cache.add(new Request(url, { cache: 'no-cache' })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('tees-lab-shell-') && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => {
        caches.open(CACHE_NAME).then(async cache => {
          for (const url of WARM_FILES) {
            try {
              const hit = await cache.match(url);
              if (!hit) await cache.add(new Request(url, { cache: 'no-cache' }));
            } catch (e) {}
          }
        }).catch(() => {});
      })
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const reqUrl = new URL(request.url);
  if (request.method !== 'GET' || reqUrl.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(new Request(request, { cache: 'no-cache' })).then(async response => {
      if (response.ok) await caches.open(CACHE_NAME).then(cache => cache.put('./index.html', response.clone()));
      return response;
    }).catch(async () => (await caches.match('./index.html')) || (await caches.match('./')) || Response.error()));
    return;
  }

  if (reqUrl.pathname.endsWith('/version.json')) {
    event.respondWith(fetch(new Request(request, { cache: 'no-cache' })).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(async response => {
    if (response.ok) await caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
    return response;
  })));
});
