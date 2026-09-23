const CACHE_NAME = 'sasc-admin-cache-v2';
const assetsToCache = [
    'admin.html',
    'admin.css',
    'admin.js',
    'manifest.json'
];
self.addEventListener('install', (e) => {
    console.log('Service Worker Admin instalado');
});
self.addEventListener('fetch', (e) => {
    // Modo offline básico
});

});