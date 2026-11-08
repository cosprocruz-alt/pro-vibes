// PRO VIBES PWA SW V19 - Cache + FCM Background Push - VAPID in index.html, FCM handled here
const CACHE = 'pro-vibes-v19';
const CORE = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).catch(function(){}));
  self.skipWaiting();
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e){
  if(e.request.method!=='GET') return;
  // Don't cache Firebase / FCM requests
  if(e.request.url.indexOf('firebase')!==-1 || e.request.url.indexOf('googleapis')!==-1 || e.request.url.indexOf('fcm')!==-1) return;
  e.respondWith(
    fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(m){ return m || caches.match('/index.html'); });
    })
  );
});
// --- FCM Background Push ---
try{
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  firebase.initializeApp({
    apiKey: "AIzaSyAvwvug-vi4scbjdTXU6j6Tj63UnIt7S7A",
    authDomain: "prochat2026.firebaseapp.com",
    databaseURL: "https://prochat2026-default-rtdb.firebaseio.com",
    projectId: "prochat2026",
    storageBucket: "prochat2026.firebasestorage.app",
    messagingSenderId: "86013420955",
    appId: "1:86013420955:web:7ef3024577cbdb0374ed3e"
  });
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(function(payload){
    const title = (payload.notification && payload.notification.title) || 'PRO VIBES';
    const options = {
      body: (payload.notification && payload.notification.body) || (payload.data && payload.data.body) || 'New message in PRO VIBES',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: payload.data || {}
    };
    return self.registration.showNotification(title, options);
  });
  self.addEventListener('notificationclick', function(e){
    e.notification.close();
    e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list){
      for(var i=0;i<list.length;i++){ if('focus' in list[i]) return list[i].focus(); }
      if(clients.openWindow) return clients.openWindow('/');
    }));
  });
}catch(e){}
