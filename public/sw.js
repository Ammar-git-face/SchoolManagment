// public/sw.js  ← place in your Next.js /public folder
// Service Worker for push notifications

self.addEventListener("install", (e) => {
    self.skipWaiting()
})

self.addEventListener("activate", (e) => {
    e.waitUntil(self.clients.claim())
})

// ── Handle incoming push ───────────────────────────────────────────────────
self.addEventListener("push", (e) => {
    let data = {}
    try { data = e.data?.json() || {} } catch { data = { title: "New Notification", body: e.data?.text() || "" } }

    const title   = data.title || "EduManage"
    const options = {
        body:    data.body  || "You have a new notification",
        icon:    data.icon  || "/icon-192.png",
        badge:   "/badge-72.png",
        tag:     data.tag   || "edumanage-notif",
        data:    { url: data.url || "/" },
        actions: data.actions || [],
        vibrate: [200, 100, 200],
        requireInteraction: data.requireInteraction || false,
    }

    e.waitUntil(self.registration.showNotification(title, options))
})

// ── Handle notification click ──────────────────────────────────────────────
self.addEventListener("notificationclick", (e) => {
    e.notification.close()

    const targetUrl = e.notification.data?.url || "/"

    e.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
            // Focus existing tab if open
            for (const client of clients) {
                if (client.url.includes(targetUrl) && "focus" in client) {
                    return client.focus()
                }
            }
            // Otherwise open new tab
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl)
            }
        })
    )
})