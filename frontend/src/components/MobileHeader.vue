<template>
	<header class="sticky top-0 z-50 flex items-center justify-between px-4 py-2.5 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
		<div class="flex items-center space-x-2.5">
			<img src="/assets/logo.png" alt="C-Water Logo" class="h-9 w-auto object-contain" />
			<span class="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Field PWA</span>
		</div>
		<div class="flex items-center space-x-2">
			<button
				v-if="syncStore.pendingCount > 0"
				@click="$router.push('/sync-queue')"
				class="bg-gradient-to-r from-sky-600 to-sky-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm active:scale-95 transition-transform"
			>
				{{ syncStore.pendingCount }} Queued
			</button>
			<div
				class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
				:class="isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
			>
				<span class="w-2 h-2 rounded-full" :class="isOnline ? 'bg-emerald-500' : 'bg-amber-500'"></span>
				<span>{{ isOnline ? "Online" : "Offline" }}</span>
			</div>
		</div>
	</header>
</template>

<script setup>
import { useNetwork } from "@/composables/useNetwork";
import { syncStore } from "@/stores/sync";

const { isOnline } = useNetwork();
</script>
