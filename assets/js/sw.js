const CACHE_NAME = 'localpro-cache-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/submit.html',
    '/404.html',
    '/assets/css/main.css',
    '/assets/css/dark-mode.css',
    '/assets/js/app.js',
    '/data/services.json',
    '/assets/images/logo.svg',
    '/assets/images/placeholder.jpg',
    '/assets/images/icons/icon-192.png',
    '/assets/images/icons/icon-512.png',
    '/favicon.ico'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});