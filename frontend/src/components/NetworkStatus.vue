<template>
	<transition
		enter-active-class="transition duration-300 ease-out transform"
		enter-from-class="-translate-y-full opacity-0"
		enter-to-class="translate-y-0 opacity-100"
		leave-active-class="transition duration-200 ease-in transform"
		leave-from-class="translate-y-0 opacity-100"
		leave-to-class="-translate-y-full opacity-0"
	>
		<div
			v-if="!isOnline"
			class="fixed top-0 inset-x-0 z-50 bg-amber-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md"
		>
			<div class="flex items-center space-x-2">
				<FeatherIcon name="wifi-off" class="w-4 h-4 flex-shrink-0 animate-pulse" />
				<span>Offline Mode — Changes are saved locally and will sync when reconnected.</span>
			</div>
			<div class="flex items-center space-x-2 flex-shrink-0">
				<router-link
					v-if="syncStore.pendingCount > 0"
					to="/sync-queue"
					class="underline text-[11px] font-bold hover:text-amber-100"
				>
					{{ syncStore.pendingCount }} Queued
				</router-link>
			</div>
		</div>
	</transition>
</template>

<script setup>
import { FeatherIcon } from "frappe-ui";
import { useNetwork } from "@/composables/useNetwork";
import { syncStore } from "@/stores/sync";

const { isOnline } = useNetwork();
</script>
