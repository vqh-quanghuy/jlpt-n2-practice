const CACHE_NAME = 'n2-practice-v3';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/data-loader.js',
  './js/local-storage-utils.js',
  './js/quiz-vocab.js',
  './js/quiz-kanji.js',
  './js/quiz-grammar.js',
  './js/reminds.js',
  './js/list.js',
  './data/n2-vocab.tsv',
  './data/n2-kanji.tsv',
  './data/n2-grammar.tsv',
  './data/n2-other-vocabs.tsv',
  './data/n2-past-test-vocab.tsv',
  './data/n2-reduplicative.tsv'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If network request succeeds, update cache and return response
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        // If network fails, fall back to cache
        return caches.match(event.request);
      })
  );
});

// Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});