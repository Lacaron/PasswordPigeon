const CACHE = 'passwordpigeon-v1';

const PRECACHE = [
	'./',
	'./index.html',
	'./styles.css',
	'./manifest.json',
	'./logo.svg',
	'./js/ui.js',
	'./js/generator.js',
	'./js/dict.js',
	'./js/params.js',
	'./data/mots-fr.txt',
	'./data/mots-en.txt',
];

// Pre-cache everything on install
self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
	);
	self.skipWaiting();
});

// Clean up old caches on activate
self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(keys =>
			Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
		)
	);
	self.clients.claim();
});

// Cache-first: serve from cache, fall back to network
self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request).then(cached => cached ?? fetch(event.request))
	);
});
