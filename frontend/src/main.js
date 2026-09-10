import { createApp } from "vue";
import { IonicVue } from "@ionic/vue";
import { setConfig, frappeRequest, resourcesPlugin } from "frappe-ui";
import App from "./App.vue";
import router from "./router";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/* Frappe UI Styles & Tailwind */
import "frappe-ui/src/style.css";
import "./main.css";

const app = createApp(App);

setConfig("resourceFetcher", frappeRequest);
app.use(resourcesPlugin);

app.use(IonicVue, {
	mode: "ios",
});
app.use(router);

router.isReady().then(() => {
	app.mount("#app");
});

if ("serviceWorker" in navigator && import.meta.env.PROD) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("/sw.js").catch((err) => {
			console.warn("ServiceWorker registration failed: ", err);
		});
	});
}
