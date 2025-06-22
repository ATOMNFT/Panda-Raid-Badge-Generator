self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('panda-badge-cache').then(cache => {
	return cache.addAll([
	  './',
	  './index.html',
	  './manifest.json',
	  './Images/icon-192.png',
	  './Images/icon-512.png',
	  './Images/badge1.png',
	  './Images/badge2.png',
	  './Images/badge3.png',
	  './Images/badge4.png',
	  './Images/badge5.png',
	  './Images/badge6.png'
	]);

    })
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
