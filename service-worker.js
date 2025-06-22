self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('panda-badge-cache').then(cache => {
	return cache.addAll([
	  './',
	  './index.html',
	  './manifest.json',
	  './icon-192.png',
	  './icon-512.png',
	  './badge1.png',
	  './badge2.png',
	  './badge3.png',
	  './badge4.png',
	  './badge5.png',
	  './badge6.png'
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
