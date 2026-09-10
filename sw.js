/* iCareU — service worker: ทำให้เปิดใช้ได้แม้ไม่มีอินเทอร์เน็ต */
const CACHE = 'icareu-v11';
const SHELL = ['./', './index.html', './data.json', './manifest.json',
               './icon.svg', './favicon.svg', './icon-32.png', './icon-180.png', './icon-512.png', './logo.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(e.request.method !== 'GET') return;
  /* openFDA ต้องสดเสมอ ไม่เก็บลงแคช */
  if(url.hostname.endsWith('api.fda.gov')) return;
  if(url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if(res && res.status === 200 && res.type === 'basic'){
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
