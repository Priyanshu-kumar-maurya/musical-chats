// Service Worker for automatic updates, offline fallback, PWA installation, and lock-screen media notifications
const CACHE_NAME = 'secret-bubble-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Lock Screen and Notification Tray Media Controls
self.addEventListener('message', (event) => {
  if (event.data?.type === 'UPDATE_MEDIA_NOTIFICATION') {
    const { title, artist, artwork, isPlaying } = event.data;

    if (self.Notification && Notification.permission === 'granted') {
      if (!isPlaying && event.data.action === 'close') {
        self.registration.getNotifications({ tag: 'secret-bubble-media' }).then((notifications) => {
          notifications.forEach((n) => n.close());
        });
        return;
      }

      self.registration.showNotification(title || 'Secret-Bubble Music', {
        body: artist ? `${artist} • Secret-Bubble` : 'Streaming Now',
        icon: artwork || '/app-logo.png',
        badge: '/favicon.png',
        tag: 'secret-bubble-media',
        silent: true,
        renotify: false,
        actions: [
          { action: 'prev', title: '⏮️ Prev' },
          { action: isPlaying ? 'pause' : 'play', title: isPlaying ? '⏸️ Pause' : '▶️ Play' },
          { action: 'next', title: '⏭️ Next' }
        ]
      }).catch(() => {});
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  const action = event.action;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (action) {
            client.postMessage({ type: 'MEDIA_NOTIFICATION_ACTION', action });
          } else {
            client.focus();
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
