const CACHE_NAME = 'sasc-morelos-v1';
const urlsToCache = [
    'admin.index.html',
    'admin.style.css',
    'admin.js',
    'admin.json',
    'escudomor.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});