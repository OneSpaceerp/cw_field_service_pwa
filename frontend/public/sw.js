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
	if (event.data && event.data.type === "SHOW_NOTIFICATION") {
		const { title, options } = event.data.payload || {};
		self.registration.showNotification(title || "C-Water Field Service", {
			icon: "/manifest/manifest-icon-192.maskable.png",
			badge: "/manifest/manifest-icon-192.maskable.png",
			vibrate: [100, 50, 100],
			...options,
		});
	}
});

self.addEventListener("activate", () => {
	clientsClaim();
});

// 5. Background Push Notification Handling (Web Push / FCM)
self.addEventListener("push", (event) => {
	let payload = {
		title: "C-Water Field Service",
		body: "You have an update on your scheduled visits.",
		icon: "/manifest/manifest-icon-192.maskable.png",
		badge: "/manifest/manifest-icon-192.maskable.png",
		data: { url: "/visits" },
		tag: "cw-notification",
		vibrate: [100, 50, 100],
	};

	if (event.data) {
		try {
			const json = event.data.json();
			payload = { ...payload, ...json };
		} catch (_) {
			payload.body = event.data.text() || payload.body;
		}
	}

	event.waitUntil(
		self.registration.showNotification(payload.title, {
			body: payload.body,
			icon: payload.icon || "/manifest/manifest-icon-192.maskable.png",
			badge: payload.badge || "/manifest/manifest-icon-192.maskable.png",
			vibrate: payload.vibrate || [100, 50, 100],
			data: payload.data || { url: "/visits" },
			tag: payload.tag || "cw-notification",
			renotify: true,
		})
	);
});

// 6. Push Notification click handling (focus existing window or open target URL)
self.addEventListener("notificationclick", (event) => {
	event.stopImmediatePropagation();
	event.notification.close();
	const targetUrl = event.notification.data?.url || "/visits";

	event.waitUntil(
		clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
			for (let client of windowClients) {
				if (client.url && client.url.includes(self.location.origin) && "focus" in client) {
					client.navigate(targetUrl);
					return client.focus();
				}
			}
			if (clients.openWindow) {
				return clients.openWindow(targetUrl);
			}
		})
	);
});
