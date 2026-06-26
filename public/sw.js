// این فایل به صورت خودکار توسط next-pwa در کنار فایل‌های کش لود می‌شود.
// وظیفه این بخش، گوش دادن به رویدادهای Push از سمت سرور است.

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url || '/', // لینکی که کاربر با کلیک روی نوتیفیکیشن به آن هدایت می‌شود
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data.url));
});