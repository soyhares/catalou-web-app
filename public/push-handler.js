// Push notification handler — imported by the Workbox-generated service worker
// via importScripts(). Must use classic SW syntax (no ES module imports).
// See: src/shared/sw/push-handler.ts for documentation.

/* global self */

self.addEventListener('push', function (event) {
  var data = event.data ? event.data.json() : null;
  if (!data) return;

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icon-light.png',
      badge: '/icon-light.png',
    }),
  );
});
