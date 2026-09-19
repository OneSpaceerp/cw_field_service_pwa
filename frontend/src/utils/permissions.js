import { reactive, computed } from "vue";
import { notificationsStore } from "@/data/notifications";

export const isIos = () => {
	if (typeof window === "undefined" || !navigator) return false;
	const ua = navigator.userAgent.toLowerCase();
	return /iphone|ipad|ipod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

export const isAndroid = () => {
	if (typeof window === "undefined" || !navigator) return false;
	return /android/.test(navigator.userAgent.toLowerCase());
};

export const isStandalone = () => {
	if (typeof window === "undefined") return false;
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		window.navigator.standalone === true ||
		document.referrer.includes("android-app://")
	);
};

export const permissionsState = reactive({
	location: "prompt", // 'prompt' | 'granted' | 'denied' | 'unsupported'
	camera: "prompt", // 'prompt' | 'granted' | 'denied' | 'unsupported'
	notifications: "default", // 'default' | 'granted' | 'denied' | 'unsupported' | 'requires_install'
	lastCoords: null,
	isChecking: false,
});

export const permissionsManager = {
	get state() {
		return permissionsState;
	},

	get allGranted() {
		return (
			permissionsState.location === "granted" &&
			permissionsState.camera === "granted" &&
			permissionsState.notifications === "granted"
		);
	},

	get missingCount() {
		let count = 0;
		if (permissionsState.location !== "granted") count++;
		if (permissionsState.camera !== "granted") count++;
		if (permissionsState.notifications !== "granted") count++;
		return count;
	},

	async checkAll() {
		permissionsState.isChecking = true;
		try {
			await Promise.all([
				this.checkLocation(),
				this.checkCamera(),
				this.checkNotifications(),
			]);
		} finally {
			permissionsState.isChecking = false;
		}
		return permissionsState;
	},

	async checkLocation() {
		if (typeof window === "undefined" || !("geolocation" in navigator)) {
			permissionsState.location = "unsupported";
			return "unsupported";
		}

		if (navigator.permissions && navigator.permissions.query) {
			try {
				const status = await navigator.permissions.query({ name: "geolocation" });
				permissionsState.location = status.state;
				status.onchange = () => {
					permissionsState.location = status.state;
				};
				return status.state;
			} catch (_) {
				// iOS Safari may throw on permissions.query({ name: 'geolocation' })
			}
		}

		// Fallback check: retrieve cached coords or keep prompt
		if (localStorage.getItem("cw_location_granted") === "true") {
			permissionsState.location = "granted";
		}
		return permissionsState.location;
	},

	async checkCamera() {
		if (typeof window === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			permissionsState.camera = "unsupported";
			return "unsupported";
		}

		if (navigator.permissions && navigator.permissions.query) {
			try {
				const status = await navigator.permissions.query({ name: "camera" });
				permissionsState.camera = status.state;
				status.onchange = () => {
					permissionsState.camera = status.state;
				};
				return status.state;
			} catch (_) {
				// iOS Safari does not support query for camera
			}
		}

		if (localStorage.getItem("cw_camera_granted") === "true") {
			permissionsState.camera = "granted";
		}
		return permissionsState.camera;
	},

	checkNotifications() {
		if (typeof window === "undefined" || !("Notification" in window)) {
			permissionsState.notifications = "unsupported";
			return "unsupported";
		}

		// iOS 16.4+ requires PWA to be installed to the Home Screen for Web Push
		if (isIos() && !isStandalone()) {
			permissionsState.notifications = "requires_install";
			return "requires_install";
		}

		permissionsState.notifications = Notification.permission;
		return Notification.permission;
	},

	async requestLocation() {
		if (!("geolocation" in navigator)) {
			permissionsState.location = "unsupported";
			throw new Error("Geolocation is not supported on this device.");
		}

		return new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					permissionsState.location = "granted";
					permissionsState.lastCoords = {
						latitude: pos.coords.latitude,
						longitude: pos.coords.longitude,
						accuracy: pos.coords.accuracy,
					};
					localStorage.setItem("cw_location_granted", "true");
					resolve(pos.coords);
				},
				(err) => {
					if (err.code === err.PERMISSION_DENIED) {
						permissionsState.location = "denied";
					}
					reject(err);
				},
				{
					enableHighAccuracy: true,
					timeout: 15000,
					maximumAge: 0,
				}
			);
		});
	},

	async requestCamera() {
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			permissionsState.camera = "unsupported";
			throw new Error("Camera is not supported on this device.");
		}

		try {
			// Trigger system camera prompt
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "environment" },
				audio: false,
			});
			// Immediately stop tracks to release hardware
			stream.getTracks().forEach((track) => track.stop());
			permissionsState.camera = "granted";
			localStorage.setItem("cw_camera_granted", "true");
			return true;
		} catch (err) {
			if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
				permissionsState.camera = "denied";
			}
			throw err;
		}
	},

	async requestNotifications() {
		if (!("Notification" in window)) {
			permissionsState.notifications = "unsupported";
			throw new Error("Push notifications are not supported on this browser.");
		}

		if (isIos() && !isStandalone()) {
			permissionsState.notifications = "requires_install";
			throw new Error(
				"On iPhone and iPad, notifications require installing the app to your Home Screen first (Tap Share ⎋ then 'Add to Home Screen')."
			);
		}

		try {
			const permission = await Notification.requestPermission();
			permissionsState.notifications = permission;
			if (permission === "granted") {
				localStorage.setItem("cw_notifications_granted", "true");
				this.sendTestNotification({
					title: "C-Water Notifications Enabled",
					body: "You will now receive instant dispatch alerts and report approvals.",
					url: "/notifications",
				});
			}
			return permission;
		} catch (err) {
			permissionsState.notifications = "denied";
			throw err;
		}
	},

	async requestAll() {
		const results = {
			location: false,
			camera: false,
			notifications: false,
		};

		try {
			await this.requestLocation();
			results.location = true;
		} catch (_) {}

		try {
			await this.requestCamera();
			results.camera = true;
		} catch (_) {}

		try {
			await this.requestNotifications();
			results.notifications = true;
		} catch (_) {}

		return results;
	},

	async sendTestNotification({ title, body, url = "/notifications" }) {
		const notifTitle = title || "C-Water Field Service Alert";
		const notifBody = body || "Test alert: Field technician dispatch and GPS verified.";

		// 1. Add to local in-app notifications store
		notificationsStore.addNotification({
			title: notifTitle,
			message: notifBody,
			type: "info",
		});

		// 2. Vibration feedback on mobile
		if (typeof navigator !== "undefined" && "vibrate" in navigator) {
			try {
				navigator.vibrate([100, 50, 100]);
			} catch (_) {}
		}

		// 3. System Notification via Service Worker (supports background & lock screen)
		if ("serviceWorker" in navigator) {
			try {
				const reg = await navigator.serviceWorker.ready;
				if (reg && reg.showNotification) {
					await reg.showNotification(notifTitle, {
						body: notifBody,
						icon: "/manifest/manifest-icon-192.maskable.png",
						badge: "/manifest/manifest-icon-192.maskable.png",
						vibrate: [100, 50, 100],
						data: { url },
						tag: "cw-test-alert",
						renotify: true,
					});
					return true;
				}
			} catch (e) {
				console.warn("[Notifications] Service Worker showNotification failed:", e);
			}
		}

		// 4. Fallback: window.Notification
		if ("Notification" in window && Notification.permission === "granted") {
			try {
				new Notification(notifTitle, {
					body: notifBody,
					icon: "/manifest/manifest-icon-192.maskable.png",
				});
				return true;
			} catch (_) {}
		}

		return false;
	},
};
