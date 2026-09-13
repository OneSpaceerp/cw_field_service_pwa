<template>
	<div class="px-4 py-3 space-y-4 max-w-xl mx-auto pb-24">
		<!-- Technician Identity Card -->
		<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
			<div class="flex items-center space-x-3.5">
				<Avatar
					:label="session.userFullName || 'Eng'"
					size="xl"
					class="ring-4 ring-sky-500/20"
				/>
				<div class="flex-1 min-w-0">
					<h2 class="text-base font-extrabold text-ink-gray-9 truncate">{{ session.userFullName }}</h2>
					<p class="text-xs text-ink-gray-5">{{ session.userEmail }}</p>
					<div class="flex items-center space-x-2 mt-1.5">
						<Badge theme="blue" size="sm" variant="subtle" label="Field Service Engineer" />
						<span class="text-[10px] text-ink-gray-4 font-mono">EMP-0042</span>
					</div>
				</div>
			</div>

			<!-- Shift Status Toggle -->
			<div class="flex items-center justify-between p-3 bg-surface-gray-2 rounded-xl border border-outline-gray-1">
				<div class="flex items-center space-x-2">
					<FeatherIcon name="clock" class="w-4 h-4 text-sky-600" />
					<div>
						<span class="text-xs font-bold text-ink-gray-9 block">Duty Shift Status</span>
						<span class="text-[10px] text-ink-gray-5 block">{{ isOnDuty ? "Active on Field Duty" : "Off Duty / Standby" }}</span>
					</div>
				</div>
				<button
					@click="isOnDuty = !isOnDuty"
					class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
					:class="isOnDuty ? 'bg-sky-600' : 'bg-slate-300'"
				>
					<span
						class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
						:class="isOnDuty ? 'translate-x-5' : 'translate-x-0'"
					/>
				</button>
			</div>
		</div>

		<!-- Field Device & Offline Storage -->
		<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
			<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider border-b border-outline-gray-1 pb-2">
				Offline Storage & Sync Status
			</h3>

			<div class="grid grid-cols-2 gap-2 text-center text-xs">
				<div class="p-2.5 bg-surface-gray-2 rounded-xl">
					<span class="text-[10px] text-ink-gray-4 block uppercase font-bold">Cached Visits</span>
					<span class="text-base font-extrabold text-ink-gray-9 mt-0.5 block">{{ visitsData.visits.length }}</span>
				</div>
				<div class="p-2.5 bg-surface-gray-2 rounded-xl">
					<span class="text-[10px] text-ink-gray-4 block uppercase font-bold">Pending Queue</span>
					<span class="text-base font-extrabold text-amber-600 mt-0.5 block">{{ syncStore.pendingCount }}</span>
				</div>
			</div>

			<div class="space-y-2 pt-1">
				<Button
					variant="subtle"
					theme="blue"
					size="sm"
					class="w-full justify-center !rounded-xl text-xs font-bold"
					@click="handleRefreshCache"
				>
					<template #prefix>
						<FeatherIcon name="refresh-cw" class="w-3.5 h-3.5" />
					</template>
					Refresh Field Data from Server
				</Button>

				<Button
					variant="ghost"
					theme="red"
					size="sm"
					class="w-full justify-center !rounded-xl text-xs font-bold !text-red-600"
					@click="handleClearCache"
				>
					<template #prefix>
						<FeatherIcon name="trash-2" class="w-3.5 h-3.5" />
					</template>
					Clear Local Offline Storage
				</Button>
			</div>
		</div>

		<!-- PWA App Installation -->
		<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-2.5">
					<div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
						<FeatherIcon name="download" class="w-4 h-4" />
					</div>
					<div>
						<h4 class="text-xs font-bold text-ink-gray-9">Progressive Web App</h4>
						<p class="text-[10px] text-ink-gray-5">Home screen installation & offline launch</p>
					</div>
				</div>
				<Badge theme="green" size="sm" variant="subtle" label="v1.2 PWA" />
			</div>

			<p class="text-xs text-ink-gray-6 leading-relaxed">
				For fast offline field service on mobile devices, tap Share in your browser and select <strong>"Add to Home Screen"</strong>.
			</p>
		</div>

		<!-- Logout Action -->
		<div class="pt-2">
			<Button
				variant="solid"
				theme="red"
				size="lg"
				class="w-full justify-center !rounded-xl !py-3 font-bold shadow-xs text-sm"
				@click="handleLogout"
			>
				<template #prefix>
					<FeatherIcon name="log-out" class="w-4 h-4 mr-1" />
				</template>
				Log Out of Field Service
			</Button>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Avatar, Badge, Button, FeatherIcon } from "frappe-ui";
import { session } from "@/data/session";
import { visitsData } from "@/data/visits";
import { syncStore } from "@/stores/sync";

const router = useRouter();
const isOnDuty = ref(true);

async function handleRefreshCache() {
	try {
		await visitsData.fetchVisits();
		alert("Field cache refreshed successfully from Frappe server!");
	} catch (err) {
		alert("Refresh failed: " + err.message);
	}
}

function handleClearCache() {
	if (confirm("Are you sure you want to clear your local storage cache? Any unsynced changes will be lost.")) {
		localStorage.clear();
		alert("Local storage cleared. Reloading app.");
		window.location.reload();
	}
}

function handleLogout() {
	if (confirm("Log out of C-Water Field Service?")) {
		session.logout();
		router.replace({ name: "Login" });
	}
}
</script>
