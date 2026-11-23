const CACHE_NAME = 'tees-lab-shell-v134';
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
  './assets/gear/films/cinestill-800t.webp',
  './assets/gear/films/cyberpunk-640t.webp',
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
  './assets/samples/night-car.jpg'
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
