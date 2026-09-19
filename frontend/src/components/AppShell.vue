<template>
	<div class="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative antialiased">
		<!-- Sliding Offline Warning Banner -->
		<NetworkStatus />

		<!-- Top Mobile Header -->
		<MobileHeader v-if="showChrome" />

		<!-- Main Page Router View -->
		<main
			class="flex-1 overflow-y-auto min-h-0"
		>
			<router-view v-slot="{ Component }">
				<transition name="fade" mode="out-in">
					<component :is="Component" />
				</transition>
			</router-view>

			<!-- Bottom Navigation Clearance Spacer: Guarantees the last line of content is never hidden behind the fixed bottom nav -->
			<div
				v-if="showChrome && !route.meta.hideBottomTabs"
				class="w-full shrink-0 pointer-events-none"
				style="height: calc(5.5rem + env(safe-area-inset-bottom, 24px));"
				aria-hidden="true"
			/>
		</main>

		<!-- Bottom 5-Tab Navigation -->
		<BottomTabs
			v-if="showChrome && !route.meta.hideBottomTabs"
			@open-new-visit="showNewVisitModal = true"
		/>

		<!-- Global New Visit Modal -->
		<NewVisitModal
			v-model="showNewVisitModal"
			@created="handleVisitCreated"
		/>

		<!-- Install PWA prompt -->
		<InstallPrompt />
	</div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import MobileHeader from "./MobileHeader.vue";
import BottomTabs from "./BottomTabs.vue";
import NetworkStatus from "./NetworkStatus.vue";
import InstallPrompt from "./InstallPrompt.vue";
import NewVisitModal from "./NewVisitModal.vue";
import { session } from "@/data/session";

const route = useRoute();
const router = useRouter();

const showNewVisitModal = ref(false);

const showChrome = computed(() => {
	return session.isLoggedIn && route.name !== "Login";
});

function handleVisitCreated(newVisit) {
	if (confirm(`Visit ${newVisit.name} created! Open and inspect it now?`)) {
		router.push(`/visits/${newVisit.name}`);
	}
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
