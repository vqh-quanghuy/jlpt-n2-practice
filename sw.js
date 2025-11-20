const CACHE_NAME = 'n2-practice-v1';
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
  './data/n2-grammar.tsv'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});