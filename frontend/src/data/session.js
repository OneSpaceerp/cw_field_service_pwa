import { computed, reactive } from "vue";
import router from "@/router";

export const DEFAULT_ERPNEXT_URL = "https://onespace.cw-eg.com";

export function getApiBaseUrl() {
	return localStorage.getItem("cw_server_url") || import.meta.env.VITE_ERPNEXT_URL || "";
}

export function setApiBaseUrl(url) {
	if (!url) {
		localStorage.removeItem("cw_server_url");
	} else {
		localStorage.setItem("cw_server_url", url.trim().replace(/\/$/, ""));
	}
}

export function getApiUrl(endpoint) {
	const base = getApiBaseUrl().replace(/\/$/, "");
	const clean = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
	return base ? `${base}${clean}` : clean;
}

export function getCsrfToken() {
	try {
		let cookies = new URLSearchParams(document.cookie.split("; ").join("&"));
		let token = cookies.get("csrf_token");
		if (token) return token;
	} catch (_) {}
	return window.csrf_token || "";
}

export function sessionUser() {
	try {
		let cookies = new URLSearchParams(document.cookie.split("; ").join("&"));
		let _sessionUser = cookies.get("user_id");
		if (_sessionUser && _sessionUser !== "Guest") {
			return _sessionUser;
		}
	} catch (_) {}

	const localUser = localStorage.getItem("cw_session_user");
	return localUser || null;
}

export const session = reactive({
	user: sessionUser(),
	isLoggedIn: computed(() => !!session.user),
	userFullName: localStorage.getItem("cw_user_fullname") || "Demo Field Engineer",

	login: async (email, password, serverUrl = null) => {
		if (serverUrl !== null) {
			setApiBaseUrl(serverUrl);
		}

		try {
			const targetUrl = getApiUrl("/api/method/login");
			const res = await fetch(targetUrl, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
				body: JSON.stringify({ usr: email, pwd: password }),
			});

			if (res.ok) {
				const data = await res.json();
				session.user = email;
				session.userFullName = data.full_name || email;
				localStorage.setItem("cw_session_user", email);
				localStorage.setItem("cw_user_fullname", session.userFullName);
				router.replace({ path: "/" });
				return { success: true, userFullName: session.userFullName };
			} else {
				const errData = await res.json().catch(() => ({}));
				if (errData.message) {
					console.warn("[Auth] Server returned auth error:", errData.message);
				}
			}
		} catch (e) {
			console.warn("[Auth] Server login request failed, checking fallback...", e);
		}

		// Demo credentials fallback for offline testing
		if (email === "engineer@cwater.com" || email === "test") {
			session.user = email;
			session.userFullName = "Eng. Ahmed Al-Mansoor";
			localStorage.setItem("cw_session_user", email);
			localStorage.setItem("cw_user_fullname", session.userFullName);
			router.replace({ path: "/" });
			return { success: true, isDemo: true };
		}
		if (email === "manager@cwater.com") {
			session.user = email;
			session.userFullName = "Eng. Tariq Al-Hazmi (Manager)";
			localStorage.setItem("cw_session_user", email);
			localStorage.setItem("cw_user_fullname", session.userFullName);
			router.replace({ path: "/" });
			return { success: true, isDemo: true };
		}

		throw new Error("Invalid username or password. Please verify your ERPNext credentials.");
	},

	logout: async () => {
		try {
			await fetch(getApiUrl("/api/method/logout"), {
				method: "POST",
				credentials: "include",
			});
		} catch (_) {}
		session.user = null;
		session.userFullName = "";
		localStorage.removeItem("cw_session_user");
		localStorage.removeItem("cw_user_fullname");
		router.replace({ name: "Login" });
	},
});

