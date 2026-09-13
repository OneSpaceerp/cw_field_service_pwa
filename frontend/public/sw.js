import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

// 1. Precaching injected by Vite
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// 2. Safe Runtime Caching for Read APIs (GET only, never POST/mutations)
registerRoute(
	({ url, request }) =>
		request.method === "GET" &&
		url.pathname.startsWith("/api/") &&
		!url.pathname.includes("/login") &&
		!url.pathname.includes("/logout"),
	new NetworkFirst({
		cacheName: "cwater-api-cache-v1",
		networkTimeoutSeconds: 4,
		plugins: [new ExpirationPlugin({ maxEntries: 150, maxAgeSeconds: 86400 })],
	})
);

// 3. User-uploaded files and static assets
registerRoute(
	({ url, request }) =>
		request.method === "GET" &&
		(url.pathname.startsWith("/assets/") || url.pathname.startsWith("/files/")),
	new StaleWhileRevalidate({
		cacheName: "cwater-assets-cache-v1",
		plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 86400 })],
	})
);

// 4. Safe update lifecycle: user/app triggers skipWaiting, preventing mid-session white screens
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});

self.addEventListener("activate", () => {
	clientsClaim();
});

// 5. Push Notification click handling
self.addEventListener("notificationclick", (event) => {
	event.stopImmediatePropagation();
	event.notification.close();
	if (event.notification.data && event.notification.data.url) {
		event.waitUntil(clients.openWindow(event.notification.data.url));
	}
});
