import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

// 1. Workbox Pre-caching injected by Vite
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(clientsClaim());
});

self.addEventListener("notificationclick", (event) => {
	event.stopImmediatePropagation();
	event.notification.close();
	if (event.notification.data && event.notification.data.url) {
		event.waitUntil(clients.openWindow(event.notification.data.url));
	}
});
