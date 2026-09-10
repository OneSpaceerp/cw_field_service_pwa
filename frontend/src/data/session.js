import { computed, reactive } from "vue";
import router from "@/router";

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

	login: async (email, password, serverUrl = "") => {
		try {
			const targetUrl = (serverUrl || window.location.origin) + "/api/method/login";
			const res = await fetch(targetUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ usr: email, pwd: password }),
			});

			if (res.ok) {
				const data = await res.json();
				session.user = email;
				session.userFullName = data.full_name || email;
				localStorage.setItem("cw_session_user", email);
				localStorage.setItem("cw_user_fullname", session.userFullName);
				router.replace({ path: "/" });
				return { success: true };
			}
		} catch (e) {
			console.warn("[Auth] Server login failed, checking demo credentials...", e);
		}

		// Demo credentials fallback
		if (email === "engineer@cwater.com" || email === "test") {
			session.user = email;
			session.userFullName = "Eng. Ahmed Al-Mansoor";
			localStorage.setItem("cw_session_user", email);
			localStorage.setItem("cw_user_fullname", session.userFullName);
			router.replace({ path: "/" });
			return { success: true, isDemo: true };
		}

		throw new Error("Invalid username or password.");
	},

	logout: async () => {
		try {
			await fetch("/api/method/logout", { method: "POST" });
		} catch (_) {}
		session.user = null;
		session.userFullName = "";
		localStorage.removeItem("cw_session_user");
		localStorage.removeItem("cw_user_fullname");
		router.replace({ name: "Login" });
	},
});
