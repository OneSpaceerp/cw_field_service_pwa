import { createRouter, createWebHistory } from "@ionic/vue-router";
import { session } from "@/data/session";

const routes = [
	{
		path: "/login",
		name: "Login",
		component: () => import("@/views/Login.vue"),
		meta: { isLoginPage: true },
	},
	{
		path: "/",
		name: "Home",
		component: () => import("@/views/Home.vue"),
	},
	{
		path: "/visits",
		name: "VisitsList",
		component: () => import("@/views/VisitsList.vue"),
	},
	{
		path: "/visits/:id",
		name: "VisitDetail",
		component: () => import("@/views/VisitDetail.vue"),
	},
	{
		path: "/sync-queue",
		name: "SyncQueue",
		component: () => import("@/views/SyncQueue.vue"),
	},
	{
		path: "/profile",
		name: "Profile",
		component: () => import("@/views/Profile.vue"),
	},
	{
		path: "/notifications",
		name: "Notifications",
		component: () => import("@/views/Notifications.vue"),
	},
	{
		path: "/:pathMatch(.*)*",
		redirect: "/",
	},
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
});

router.beforeEach((to, from, next) => {
	const isLoggedIn = session.isLoggedIn;
	if (!isLoggedIn && !to.meta.isLoginPage) {
		next({ name: "Login" });
	} else if (isLoggedIn && to.meta.isLoginPage) {
		next({ name: "Home" });
	} else {
		next();
	}
});

export default router;
