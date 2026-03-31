const CACHE = 'bubblepop-v3';
const FILES = ['./game.html', './manifest.json', './icon.svg'];

// 설치: 핵심 파일 캐시
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(FILES); })
  );
  self.skipWaiting();
});

// 활성화: 구버전 캐시 삭제
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// 요청: 항상 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).then(function(res) {
      // 네트워크에서 받은 최신 파일을 캐시에도 저장
      var resClone = res.clone();
      caches.open(CACHE).then(function(c) { c.put(e.request, resClone); });
      return res;
    }).catch(function() {
      // 오프라인일 때만 캐시 사용
      return caches.match(e.request);
    })
  );
});
