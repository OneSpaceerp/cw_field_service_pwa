<template>
	<BaseLayout title="Offline Sync Queue">
		<MobileHeader />

		<div class="px-4 py-3 space-y-4">
			<div>
				<h2 class="text-xl font-extrabold text-ink-gray-9">Offline Queue</h2>
				<p class="text-xs text-ink-gray-5">Idempotent operations queued on device</p>
			</div>

			<div v-if="syncStore.items.length" class="space-y-3">
				<div class="flex space-x-2">
					<Button
						variant="solid"
						theme="blue"
						size="lg"
						:loading="isSyncing"
						loading-text="Synchronizing..."
						class="flex-1 justify-center !rounded-xl font-bold text-xs shadow-md"
						@click="handleSyncAll"
					>
						<template #prefix><FeatherIcon name="refresh-cw" class="w-4 h-4" /></template>
						Sync All Now
					</Button>
					<Button
						variant="subtle"
						theme="gray"
						size="lg"
						class="!rounded-xl text-xs font-bold"
						@click="syncStore.clearQueue()"
					>
						Clear
					</Button>
				</div>

				<div class="space-y-2">
					<div
						v-for="item in syncStore.items"
						:key="item.idempotency_key"
						class="p-3.5 bg-surface-white rounded-2xl border border-outline-gray-1 shadow-xs text-xs"
					>
						<div class="flex justify-between items-center mb-1">
							<span class="font-bold text-ink-gray-9 uppercase tracking-wide text-[11px]">{{ item.action }}</span>
							<Badge theme="orange" size="sm" variant="subtle" label="Pending Sync" />
						</div>
						<p class="text-ink-gray-7"><strong>Visit:</strong> {{ item.visit_id }}</p>
						<p class="text-[10px] text-ink-gray-4 mt-1 font-mono">UUID: {{ item.idempotency_key }}</p>
					</div>
				</div>
			</div>

			<div v-else class="text-center py-16 bg-surface-white rounded-2xl border border-outline-gray-1">
				<FeatherIcon name="check-circle" class="w-12 h-12 text-ink-green-3 mx-auto mb-2" />
				<h3 class="text-base font-bold text-ink-gray-9">All Changes Synced</h3>
				<p class="text-xs text-ink-gray-4 mt-1">There are no pending offline mutations</p>
			</div>
		</div>

		<BottomTabs />
	</BaseLayout>
</template>

<script setup>
import { ref } from "vue";
import { Button, Badge, FeatherIcon } from "frappe-ui";
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
