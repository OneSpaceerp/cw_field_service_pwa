<template>
	<BaseLayout title="Offline Sync Queue">
		<MobileHeader />

		<div class="px-4 py-3 space-y-4">
			<div>
				<h2 class="text-xl font-extrabold text-slate-900">Offline Queue</h2>
				<p class="text-xs text-slate-500">Idempotent operations queued on device</p>
			</div>

			<div v-if="syncStore.items.length" class="space-y-3">
				<div class="flex space-x-2">
					<button
						@click="handleSyncAll"
						:disabled="isSyncing"
						class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold text-xs shadow-md active:scale-98 transition-all"
					>
						{{ isSyncing ? "Synchronizing..." : "Sync All Now" }}
					</button>
					<button
						@click="syncStore.clearQueue()"
						class="py-2.5 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50"
					>
						Clear
					</button>
				</div>

				<div class="space-y-2">
					<div
						v-for="item in syncStore.items"
						:key="item.idempotency_key"
						class="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs"
					>
						<div class="flex justify-between items-center mb-1">
							<span class="font-bold text-slate-800 uppercase tracking-wide text-[11px]">{{ item.action }}</span>
							<span class="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
								Pending
							</span>
						</div>
						<p class="text-slate-600"><strong>Visit:</strong> {{ item.visit_id }}</p>
						<p class="text-[10px] text-slate-400 mt-1">UUID: {{ item.idempotency_key }}</p>
					</div>
				</div>
			</div>

			<div v-else class="text-center py-16 bg-white rounded-2xl border border-slate-200">
				<svg class="w-12 h-12 text-emerald-500 mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
				</svg>
				<h3 class="text-base font-bold text-slate-800">All Changes Synced</h3>
				<p class="text-xs text-slate-400 mt-1">There are no pending offline mutations</p>
			</div>
		</div>

		<BottomTabs />
	</BaseLayout>
</template>

<script setup>
import { ref } from "vue";
import BaseLayout from "@/components/BaseLayout.vue";
import MobileHeader from "@/components/MobileHeader.vue";
import BottomTabs from "@/components/BottomTabs.vue";
import { syncStore } from "@/stores/sync";

const isSyncing = ref(false);

async function handleSyncAll() {
	isSyncing.value = true;
	try {
		const res = await syncStore.syncAll();
		alert(`Successfully synced ${res.count} actions!`);
	} catch (e) {
		alert("Sync failed: " + e.message);
	} finally {
		isSyncing.value = false;
	}
}
</script>
