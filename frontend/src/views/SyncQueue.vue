<template>
	<div class="px-4 py-3 space-y-4 max-w-xl mx-auto pb-24">
		<!-- Top Status Header Card -->
		<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-2.5">
					<div
						class="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
						:class="isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'"
					>
						<FeatherIcon :name="isOnline ? 'cloud' : 'cloud-off'" class="w-5 h-5" />
					</div>
					<div>
						<h2 class="text-sm font-bold text-ink-gray-9">Offline Mutation Queue</h2>
						<p class="text-[11px] text-ink-gray-5">
							{{ isOnline ? "Connected to Frappe ERPNext" : "Offline — Changes buffered locally" }}
						</p>
					</div>
				</div>

				<Badge
					:theme="isOnline ? 'green' : 'red'"
					size="sm"
					variant="subtle"
					:label="isOnline ? 'Online' : 'Offline'"
					class="font-semibold"
				/>
			</div>

			<!-- Metrics -->
			<div class="grid grid-cols-2 gap-2 pt-2 border-t border-outline-gray-1 text-center">
				<div class="p-2 bg-surface-gray-2 rounded-xl">
					<span class="text-[10px] font-bold text-ink-gray-4 block uppercase">Pending Mutations</span>
					<span class="text-xl font-extrabold text-amber-600 mt-0.5 block">{{ syncStore.pendingCount }}</span>
				</div>
				<div class="p-2 bg-surface-gray-2 rounded-xl">
					<span class="text-[10px] font-bold text-ink-gray-4 block uppercase">Queue Health</span>
					<span class="text-sm font-bold text-emerald-600 mt-1 block">IndexedDB Ready</span>
				</div>
			</div>

			<!-- Sync Action Button -->
			<Button
				variant="solid"
				theme="blue"
				size="md"
				:loading="isSyncing"
				loading-text="Synchronizing with server..."
				:disabled="!isOnline || syncStore.pendingCount === 0"
				class="w-full justify-center !rounded-xl !py-2.5 font-bold shadow-xs flex items-center gap-2"
				@click="triggerSync"
			>
				<template #prefix>
					<FeatherIcon name="refresh-cw" class="w-4 h-4" />
				</template>
				Sync All Pending Changes Now
			</Button>
		</div>

		<!-- Queued Items List -->
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider">Queued Actions</h3>
				<span class="text-[11px] text-ink-gray-4">{{ syncStore.queue.length }} total records</span>
			</div>

			<div v-if="syncStore.queue.length" class="space-y-2.5">
				<div
					v-for="item in syncStore.queue"
					:key="item.id"
					class="p-3.5 bg-surface-white rounded-xl border border-outline-gray-1 shadow-2xs space-y-2"
				>
					<div class="flex justify-between items-start">
						<div>
							<div class="flex items-center space-x-2">
								<span
									class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
									:class="{
										'bg-blue-50 text-sky-700': item.action === 'check_in',
										'bg-purple-50 text-purple-700': item.action === 'save_readings',
										'bg-emerald-50 text-emerald-700': item.action === 'create_visit',
										'bg-amber-50 text-amber-700': item.action === 'submit_report',
									}"
								>
									{{ item.action.replace('_', ' ') }}
								</span>
								<span class="text-xs font-bold text-ink-gray-9">{{ item.visit_id || "New Record" }}</span>
							</div>
							<p class="text-[10px] text-ink-gray-4 mt-1 font-mono">
								ID: {{ item.idempotency_key ? item.idempotency_key.substring(0, 18) + '...' : item.id }}
							</p>
						</div>

						<Badge
							:theme="item.status === 'pending' ? 'orange' : item.status === 'synced' ? 'green' : 'red'"
							size="sm"
							variant="subtle"
							:label="item.status"
							class="capitalize text-[10px]"
						/>
					</div>

					<div class="flex justify-between items-center text-[10px] text-ink-gray-5 pt-1.5 border-t border-outline-gray-1">
						<span>{{ new Date(item.timestamp).toLocaleTimeString() }}</span>
						<Button
							v-if="item.status === 'pending' && isOnline"
							variant="ghost"
							theme="blue"
							size="sm"
							class="!text-xs font-bold !p-0"
							@click="syncItem(item)"
						>
							Retry Now
						</Button>
					</div>
				</div>
			</div>

			<!-- Empty State -->
			<div v-else class="text-center py-12 bg-surface-white rounded-2xl border border-dashed border-outline-gray-2 p-6">
				<FeatherIcon name="check-circle" class="w-10 h-10 text-emerald-500 mx-auto mb-2" />
				<h4 class="text-sm font-bold text-ink-gray-9">Queue is Empty</h4>
				<p class="text-xs text-ink-gray-5 mt-0.5">All mobile field entries are synchronized with Frappe ERPNext.</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { Badge, Button, FeatherIcon } from "frappe-ui";
import { useNetwork } from "@/composables/useNetwork";
import { syncStore } from "@/stores/sync";

const { isOnline } = useNetwork();
const isSyncing = ref(false);

async function triggerSync() {
	if (!isOnline.value) {
		alert("Cannot sync while offline. Please connect to the internet.");
		return;
	}
	isSyncing.value = true;
	try {
		await syncStore.processQueue();
		alert("Queue synchronization complete!");
	} catch (err) {
		alert("Sync failed: " + err.message);
	} finally {
		isSyncing.value = false;
	}
}

async function syncItem(item) {
	isSyncing.value = true;
	try {
		await syncStore.processQueue();
	} finally {
		isSyncing.value = false;
	}
}
</script>
