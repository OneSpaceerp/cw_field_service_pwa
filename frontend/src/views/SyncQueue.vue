<template>
	<div class="px-4 py-3 space-y-3 max-w-xl mx-auto pb-6">
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
					<span class="text-[10px] font-bold text-ink-gray-4 block uppercase tracking-wider">Pending Mutations</span>
					<span class="text-xl font-extrabold text-amber-600 mt-0.5 block">{{ syncStore.pendingCount }}</span>
				</div>
				<div class="p-2 bg-surface-gray-2 rounded-xl">
					<span class="text-[10px] font-bold text-ink-gray-4 block uppercase tracking-wider">Queue Health</span>
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

			<!-- Clear Queue Button if any items exist -->
			<div v-if="syncStore.pendingCount > 0" class="text-center pt-1">
				<button
					type="button"
					@click="clearAll"
					class="text-[11px] text-rose-500 hover:text-rose-700 font-medium inline-flex items-center gap-1 transition"
				>
					<FeatherIcon name="trash-2" class="w-3 h-3" />
					Clear local queue
				</button>
			</div>
		</div>

		<!-- Queued Items List -->
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider">Queued Actions</h3>
				<span class="text-[11px] text-ink-gray-4">{{ queueList.length }} total records</span>
			</div>

			<div v-if="queueList.length" class="space-y-2.5">
				<div
					v-for="(item, idx) in queueList"
					:key="item.idempotency_key || item.id || idx"
					class="p-3.5 bg-surface-white rounded-xl border border-outline-gray-1 shadow-2xs space-y-2"
				>
					<div class="flex justify-between items-start">
						<div>
							<div class="flex items-center space-x-2">
								<span
									class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
									:class="{
										'bg-blue-50 text-sky-700': item.action === 'check_in',
										'bg-purple-50 text-purple-700': item.action === 'save_readings' || item.action === 'save_draft',
										'bg-emerald-50 text-emerald-700': item.action === 'create_visit',
										'bg-amber-50 text-amber-700': item.action === 'submit_report' || item.action === 'submit',
									}"
								>
									{{ (item.action || 'mutation').replace('_', ' ') }}
								</span>
								<span class="text-xs font-bold text-ink-gray-9">{{ item.visit_id || "New Visit" }}</span>
							</div>
							<p class="text-[10px] text-ink-gray-4 mt-1 font-mono">
								ID: {{ item.idempotency_key ? item.idempotency_key.substring(0, 18) + '...' : (item.id || idx) }}
							</p>
						</div>

						<Badge
							:theme="item.status === 'pending' ? 'orange' : item.status === 'synced' ? 'green' : 'red'"
							size="sm"
							variant="subtle"
							:label="item.status || 'pending'"
							class="capitalize text-[10px]"
						/>
					</div>

					<div class="flex justify-between items-center text-[10px] text-ink-gray-5 pt-1.5 border-t border-outline-gray-1">
						<span>{{ formatTime(item.queued_at || item.timestamp) }}</span>
						<div class="flex items-center gap-3">
							<button
								type="button"
								class="text-[11px] font-semibold text-rose-500 hover:text-rose-700 transition"
								@click="removeItem(item)"
							>
								Remove
							</button>
							<button
								v-if="item.status === 'pending' && isOnline"
								type="button"
								class="text-[11px] font-bold text-sky-600 hover:text-sky-800 transition"
								@click="triggerSync"
							>
								Sync Now
							</button>
						</div>
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
import { ref, computed } from "vue";
import { Badge, Button, FeatherIcon } from "frappe-ui";
import { useNetwork } from "@/composables/useNetwork";
import { syncStore } from "@/stores/sync";

const { isOnline } = useNetwork();
const isSyncing = ref(false);

const queueList = computed(() => {
	return syncStore.items || syncStore.queue || [];
});

function formatTime(val) {
	if (!val) return "";
	try {
		const d = new Date(val);
		return isNaN(d.getTime())
			? ""
			: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
	} catch (_) {
		return "";
	}
}

async function triggerSync() {
	if (!isOnline.value) {
		alert("Cannot sync while offline. Please connect to the internet.");
		return;
	}
	isSyncing.value = true;
	try {
		const res = await syncStore.syncAll();
		if (res && res.success) {
			alert(`Sync complete! Synced ${res.count || 0} item(s) to ERPNext.`);
		} else {
			alert(`Sync failed: ${res?.error || "Unknown server response"}`);
		}
	} catch (err) {
		alert("Sync failed: " + err.message);
	} finally {
		isSyncing.value = false;
	}
}

function removeItem(item) {
	if (confirm("Are you sure you want to discard this queued action?")) {
		syncStore.removeItem(item.idempotency_key || item.id || item.visit_id);
	}
}

function clearAll() {
	if (confirm("Are you sure you want to clear all queued offline mutations?")) {
		syncStore.clearQueue();
	}
}
</script>
