<template>
	<div class="bg-surface-white rounded-2xl border border-outline-gray-1 p-4 shadow-xs space-y-4">
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-outline-gray-1 pb-3">
			<div class="flex items-center space-x-2">
				<div class="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
					<FeatherIcon name="shield" class="w-4 h-4 stroke-[2.5]" />
				</div>
				<div>
					<h3 class="text-sm font-bold text-slate-900">Device Permissions & Alerts</h3>
					<p class="text-[11px] text-slate-500 font-medium">Android & iOS Hardware Integration</p>
				</div>
			</div>

			<!-- All Granted Status Indicator -->
			<span
				v-if="permissionsManager.allGranted"
				class="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full"
			>
				<FeatherIcon name="check-circle" class="w-3 h-3 stroke-[3]" /> All Active
			</span>
			<span
				v-else
				class="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"
			>
				{{ permissionsManager.missingCount }} Needed
			</span>
		</div>

		<!-- 1. GPS Location Row -->
		<div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3">
			<div class="flex items-start space-x-2.5">
				<div
					class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
					:class="state.location === 'granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'"
				>
					<FeatherIcon name="map-pin" class="w-3.5 h-3.5 stroke-[2.5]" />
				</div>
				<div>
					<div class="flex items-center gap-1.5">
						<span class="text-xs font-bold text-slate-900">GPS Location</span>
						<span
							v-if="state.location === 'granted'"
							class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded"
						>
							Granted
						</span>
						<span
							v-else-if="state.location === 'denied'"
							class="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded"
						>
							Blocked in Settings
						</span>
						<span
							v-else
							class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded"
						>
							Action Needed
						</span>
					</div>
					<p class="text-[11px] text-slate-500 mt-0.5 leading-snug">
						Required for customer location approval & on-site check-in verification.
					</p>
					<p v-if="state.lastCoords" class="text-[10px] font-mono text-emerald-700 mt-1">
						📍 {{ state.lastCoords.latitude.toFixed(5) }}, {{ state.lastCoords.longitude.toFixed(5) }} (±{{ Math.round(state.lastCoords.accuracy || 5) }}m)
					</p>
				</div>
			</div>

			<button
				v-if="state.location !== 'granted'"
				type="button"
				@click="requestLocation"
				:disabled="isRequestingLocation"
				class="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-xs transition-all shrink-0 disabled:opacity-60 flex items-center gap-1"
			>
				<FeatherIcon v-if="!isRequestingLocation" name="navigation" class="w-3 h-3 stroke-[2.5]" />
				<div v-else class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
				<span>Allow</span>
			</button>
			<button
				v-else
				type="button"
				@click="requestLocation"
				class="text-sky-600 p-1 hover:bg-slate-200 rounded text-xs font-bold shrink-0"
				title="Refresh GPS location"
			>
				<FeatherIcon name="refresh-cw" class="w-3.5 h-3.5" />
			</button>
		</div>

		<!-- 2. Camera Access Row -->
		<div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3">
			<div class="flex items-start space-x-2.5">
				<div
					class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
					:class="state.camera === 'granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'"
				>
					<FeatherIcon name="camera" class="w-3.5 h-3.5 stroke-[2.5]" />
				</div>
				<div>
					<div class="flex items-center gap-1.5">
						<span class="text-xs font-bold text-slate-900">Camera</span>
						<span
							v-if="state.camera === 'granted'"
							class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded"
						>
							Granted
						</span>
						<span
							v-else-if="state.camera === 'denied'"
							class="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded"
						>
							Blocked in Settings
						</span>
						<span
							v-else
							class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded"
						>
							Action Needed
						</span>
					</div>
					<p class="text-[11px] text-slate-500 mt-0.5 leading-snug">
						Required to capture photos of customer units, membrane filters, and equipment.
					</p>
				</div>
			</div>

			<button
				v-if="state.camera !== 'granted'"
				type="button"
				@click="requestCamera"
				:disabled="isRequestingCamera"
				class="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-xs transition-all shrink-0 disabled:opacity-60 flex items-center gap-1"
			>
				<FeatherIcon v-if="!isRequestingCamera" name="camera" class="w-3 h-3 stroke-[2.5]" />
				<div v-else class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
				<span>Allow</span>
			</button>
			<span v-else class="text-emerald-600 p-1 font-bold text-xs shrink-0 flex items-center gap-1">
				<FeatherIcon name="check" class="w-4 h-4 stroke-[3]" />
			</span>
		</div>

		<!-- 3. System & Push Notifications Row -->
		<div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3">
			<div class="flex items-start space-x-2.5">
				<div
					class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
					:class="state.notifications === 'granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'"
				>
					<FeatherIcon name="bell" class="w-3.5 h-3.5 stroke-[2.5]" />
				</div>
				<div>
					<div class="flex items-center gap-1.5">
						<span class="text-xs font-bold text-slate-900">Notifications</span>
						<span
							v-if="state.notifications === 'granted'"
							class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded"
						>
							Enabled
						</span>
						<span
							v-else-if="state.notifications === 'requires_install'"
							class="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded"
						>
							Install PWA First (iOS)
						</span>
						<span
							v-else-if="state.notifications === 'denied'"
							class="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded"
						>
							Blocked in Settings
						</span>
						<span
							v-else
							class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded"
						>
							Action Needed
						</span>
					</div>
					<p class="text-[11px] text-slate-500 mt-0.5 leading-snug">
						Real-time alerts for urgent visit dispatches, SLA countdowns, and approvals.
					</p>

					<!-- iOS Safari browser tip -->
					<div
						v-if="state.notifications === 'requires_install'"
						class="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-lg text-[11px] text-purple-900 leading-tight space-y-1"
					>
						<p class="font-bold flex items-center gap-1">
							<FeatherIcon name="info" class="w-3 h-3 text-purple-700" />
							<span>iOS Web Push Requirement:</span>
						</p>
						<p>
							Apple requires this app to be installed to your Home Screen to deliver push alerts. Tap <strong>Share ⎋</strong> then <strong>Add to Home Screen</strong>, then open the installed app to enable notifications.
						</p>
					</div>
				</div>
			</div>

			<button
				v-if="state.notifications !== 'granted' && state.notifications !== 'requires_install'"
				type="button"
				@click="requestNotifications"
				:disabled="isRequestingNotifications"
				class="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-xs transition-all shrink-0 disabled:opacity-60 flex items-center gap-1"
			>
				<FeatherIcon v-if="!isRequestingNotifications" name="bell" class="w-3 h-3 stroke-[2.5]" />
				<div v-else class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
				<span>Enable</span>
			</button>
			<span v-else-if="state.notifications === 'granted'" class="text-emerald-600 p-1 font-bold text-xs shrink-0 flex items-center gap-1">
				<FeatherIcon name="check" class="w-4 h-4 stroke-[3]" />
			</span>
		</div>

		<!-- Action Row -->
		<div class="pt-1 flex flex-wrap gap-2">
			<!-- Grant All Button -->
			<button
				v-if="!permissionsManager.allGranted"
				type="button"
				@click="requestAll"
				class="flex-1 py-2 px-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5"
			>
				<FeatherIcon name="check-circle" class="w-3.5 h-3.5 stroke-[2.5]" />
				<span>Grant All Permissions</span>
			</button>

			<!-- Test Notification Button -->
			<button
				type="button"
				@click="sendTestAlert"
				:disabled="isTestingAlert"
				class="py-2 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-98 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5"
			>
				<FeatherIcon name="bell" class="w-3.5 h-3.5 text-sky-600" />
				<span>{{ isTestingAlert ? 'Sending Alert...' : 'Test Notification' }}</span>
			</button>

			<!-- Help Toggle -->
			<button
				type="button"
				@click="showTroubleshooting = !showTroubleshooting"
				class="py-2 px-2.5 text-slate-500 hover:text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-all flex items-center gap-1"
			>
				<FeatherIcon name="help-circle" class="w-3.5 h-3.5" />
				<span>{{ showTroubleshooting ? 'Hide Guide' : 'Settings Help' }}</span>
			</button>
		</div>

		<!-- Troubleshooting / OS Guide Accordion -->
		<div
			v-if="showTroubleshooting"
			class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2.5 text-slate-700"
		>
			<h4 class="font-bold text-slate-900 flex items-center gap-1.5">
				<FeatherIcon name="settings" class="w-3.5 h-3.5 text-slate-600" />
				<span>How to re-enable blocked permissions:</span>
			</h4>

			<!-- iOS Guide -->
			<div class="space-y-1 pl-1">
				<p class="font-bold text-slate-800">🍏 Apple iPhone & iPad (iOS):</p>
				<ul class="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 pl-1">
					<li><strong>Location:</strong> Settings &gt; Privacy & Security &gt; Location Services &gt; Safari / CW Service &gt; Set to <em>While Using the App</em>.</li>
					<li><strong>Camera:</strong> Settings &gt; Safari &gt; Camera &gt; Set to <em>Allow</em>.</li>
					<li><strong>Notifications:</strong> Settings &gt; Notifications &gt; CW Service &gt; Turn on <em>Allow Notifications</em>.</li>
				</ul>
			</div>

			<!-- Android Guide -->
			<div class="space-y-1 pl-1 border-t border-slate-200 pt-2">
				<p class="font-bold text-slate-800">🤖 Android Devices:</p>
				<ul class="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 pl-1">
					<li>Tap the <strong>Lock / Tune icon 🔒</strong> in Chrome's address bar &gt; <em>Permissions</em> &gt; Turn on Location, Camera, and Notifications.</li>
					<li>Or go to: Device Settings &gt; Apps &gt; Chrome (or CW Service) &gt; Permissions &gt; Allow.</li>
				</ul>
			</div>
		</div>

		<!-- Feedback message -->
		<div
			v-if="feedbackMessage"
			class="p-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
			:class="feedbackSuccess ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
		>
			<FeatherIcon :name="feedbackSuccess ? 'check-circle' : 'alert-circle'" class="w-4 h-4 shrink-0 stroke-[2.5]" />
			<span>{{ feedbackMessage }}</span>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { FeatherIcon } from "frappe-ui";
import { permissionsManager, permissionsState } from "@/utils/permissions";

const state = permissionsState;

const isRequestingLocation = ref(false);
const isRequestingCamera = ref(false);
const isRequestingNotifications = ref(false);
const isTestingAlert = ref(false);
const showTroubleshooting = ref(false);

const feedbackMessage = ref("");
const feedbackSuccess = ref(true);

function showFeedback(msg, success = true) {
	feedbackMessage.value = msg;
	feedbackSuccess.value = success;
	setTimeout(() => {
		feedbackMessage.value = "";
	}, 4000);
}

async function requestLocation() {
	isRequestingLocation.value = true;
	try {
		const coords = await permissionsManager.requestLocation();
		showFeedback(`📍 Location granted: ±${Math.round(coords.accuracy || 5)}m high-accuracy GPS acquired.`);
	} catch (err) {
		showFeedback(err.message || "Failed to acquire location. Please check OS permissions.", false);
	} finally {
		isRequestingLocation.value = false;
	}
}

async function requestCamera() {
	isRequestingCamera.value = true;
	try {
		await permissionsManager.requestCamera();
		showFeedback("📷 Camera access granted successfully.");
	} catch (err) {
		showFeedback(err.message || "Failed to access camera. Please check OS permissions.", false);
	} finally {
		isRequestingCamera.value = false;
	}
}

async function requestNotifications() {
	isRequestingNotifications.value = true;
	try {
		const res = await permissionsManager.requestNotifications();
		if (res === "granted") {
			showFeedback("🔔 Notifications enabled! You will receive live alerts.");
		} else {
			showFeedback("Notifications were not granted.", false);
		}
	} catch (err) {
		showFeedback(err.message || "Could not enable notifications.", false);
	} finally {
		isRequestingNotifications.value = false;
	}
}

async function requestAll() {
	try {
		await permissionsManager.requestAll();
		if (permissionsManager.allGranted) {
			showFeedback("✓ All permissions granted successfully!");
		} else {
			showFeedback("Some permissions still require action.", false);
		}
	} catch (e) {
		showFeedback(e.message || "Error requesting permissions", false);
	}
}

async function sendTestAlert() {
	isTestingAlert.value = true;
	try {
		await permissionsManager.sendTestNotification({
			title: "C-Water Dispatch Alert",
			body: "Emergency inspection assigned: RO Unit 01 differential pressure check.",
			url: "/notifications",
		});
		showFeedback("✓ Test notification dispatched with vibration.");
	} catch (e) {
		showFeedback("Failed to send test notification: " + e.message, false);
	} finally {
		isTestingAlert.value = false;
	}
}

onMounted(() => {
	permissionsManager.checkAll();
});
</script>
