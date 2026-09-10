<template>
	<!-- Android / Desktop Install Banner -->
	<div
		v-if="showPrompt"
		class="fixed bottom-20 inset-x-4 z-50 bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 flex items-center justify-between"
	>
		<div class="flex items-center space-x-3">
			<img src="/manifest/manifest-icon-192.maskable.png" class="w-10 h-10 rounded-xl" />
			<div>
				<h4 class="font-bold text-slate-900 text-sm">Install C-Water Service</h4>
				<p class="text-xs text-slate-500">Fast, offline mobile service app</p>
			</div>
		</div>
		<button
			@click="installPWA"
			class="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-transform"
		>
			Install
		</button>
	</div>

	<!-- iOS Safari Instructions Popover -->
	<div
		v-if="showIosInstruction"
		class="fixed bottom-20 inset-x-4 z-50 bg-sky-50 border border-sky-200 p-4 rounded-2xl shadow-2xl"
	>
		<div class="flex justify-between items-center mb-1">
			<span class="font-bold text-sm text-sky-900">Install on iPhone / iPad</span>
			<button @click="showIosInstruction = false" class="text-slate-400 font-bold p-1">✕</button>
		</div>
		<p class="text-xs text-sky-800">
			Tap the <strong>Share</strong> button at the bottom of Safari, then select <strong>Add to Home Screen</strong>.
		</p>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const deferredPrompt = ref(null);
const showPrompt = ref(false);
const showIosInstruction = ref(false);

const isIos = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
const isInStandalone = () => "standalone" in window.navigator && window.navigator.standalone;

onMounted(() => {
	if (isIos() && !isInStandalone()) {
		showIosInstruction.value = true;
	}

	window.addEventListener("beforeinstallprompt", (e) => {
		e.preventDefault();
		deferredPrompt.value = e;
		if (!isInStandalone()) {
			showPrompt.value = true;
		}
	});

	window.addEventListener("appinstalled", () => {
		showPrompt.value = false;
		deferredPrompt.value = null;
	});
});

async function installPWA() {
	if (deferredPrompt.value) {
		deferredPrompt.value.prompt();
		const { outcome } = await deferredPrompt.value.userChoice;
		if (outcome === "accepted") {
			showPrompt.value = false;
		}
	}
}
</script>
