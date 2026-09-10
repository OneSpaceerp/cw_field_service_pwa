<template>
	<BaseLayout :title="visit ? (visit.customer_name || visit.name) : 'Visit Details'">
		<template #start-actions>
			<button @click="$router.push('/visits')" class="text-sky-600 font-bold text-sm px-2">
				&larr; Back
			</button>
		</template>

		<div v-if="visit" class="px-4 py-2 space-y-3">
			<!-- Header Card -->
			<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
				<div class="flex justify-between items-start mb-1">
					<div>
						<h2 class="text-base font-extrabold text-slate-900">{{ visit.customer_name || visit.customer }}</h2>
						<p class="text-xs text-slate-500 mt-0.5">{{ visit.service_location }} &bull; {{ visit.name }}</p>
					</div>
					<StatusBadge :status="visit.visit_status" />
				</div>
			</div>

			<!-- Subtabs Bar -->
			<div class="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
				<button
					v-for="tab in tabs"
					:key="tab.id"
					@click="activeTab = tab.id"
					class="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border"
					:class="activeTab === tab.id ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white border-transparent shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
				>
					{{ tab.label }}
				</button>
			</div>

			<!-- SUBTAB 1: SITE INFO & GPS CHECK-IN -->
			<div v-if="activeTab === 'info'" class="space-y-3">
				<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
					<h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Site Details & Target GPS</h3>
					<div class="text-xs space-y-1.5 text-slate-600">
						<p><strong class="text-slate-800">Address:</strong> {{ site.address_display || "Not specified" }}</p>
						<p><strong class="text-slate-800">Contact Person:</strong> {{ site.primary_contact_person || "N/A" }}</p>
						<p><strong class="text-slate-800">Phone:</strong> {{ site.primary_contact_phone || "N/A" }}</p>
						<p><strong class="text-slate-800">Safety Notes:</strong> {{ site.special_site_instructions || "Standard safety gear" }}</p>
					</div>

					<div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
						<div><strong>Site Target GPS:</strong> {{ site.latitude || "0.0" }}, {{ site.longitude || "0.0" }}</div>
						<div class="mt-0.5"><strong>Geofence Radius:</strong> {{ site.geofence_radius_meters || 200 }} meters</div>
					</div>

					<div v-if="visit.visit_status === 'Scheduled'" class="pt-2">
						<button
							@click="handleCheckIn"
							:disabled="isCheckingIn"
							class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 text-white text-xs font-bold shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2"
						>
							<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
							<span>{{ isCheckingIn ? "Acquiring High-Accuracy GPS..." : "Capture GPS & Check-In" }}</span>
						</button>
					</div>
					<div v-else class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold text-center">
						Checked In on {{ visit.checkin_time || "Today" }} (GPS Verified)
					</div>
				</div>
			</div>

			<!-- SUBTAB 2: WATER TESTING READINGS -->
			<div v-if="activeTab === 'readings'" class="space-y-3">
				<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
					<div class="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
						<div>
							<h3 class="text-sm font-bold text-slate-900">Water Parameters</h3>
							<p class="text-[11px] text-slate-500">Instant out-of-range bounds verification</p>
						</div>
					</div>

					<div class="divide-y divide-slate-100">
						<ReadingRow
							v-for="r in visit.readings"
							:key="r.parameter"
							:reading="r"
						/>
					</div>
				</div>
			</div>

			<!-- SUBTAB 3: CHECKLIST -->
			<div v-if="activeTab === 'checklist'" class="space-y-3">
				<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
					<h3 class="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">Safety & Site Protocol</h3>
					<ChecklistItem
						v-for="item in visit.checklist_items"
						:key="item.item_description"
						:item="item"
					/>
				</div>
			</div>

			<!-- SUBTAB 4: FINDINGS & DEFECTS -->
			<div v-if="activeTab === 'findings'" class="space-y-3">
				<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
					<div class="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
						<h3 class="text-sm font-bold text-slate-900">Observations & Defects</h3>
						<button
							@click="addFinding"
							class="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 hover:bg-sky-100"
						>
							+ Add
						</button>
					</div>

					<div v-if="visit.findings && visit.findings.length" class="space-y-2">
						<div
							v-for="(f, idx) in visit.findings"
							:key="idx"
							class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs"
						>
							<div class="flex justify-between items-center mb-1">
								<span class="font-bold text-slate-800">{{ f.category }}</span>
								<StatusBadge :status="f.severity" />
							</div>
							<p class="text-slate-700 font-semibold">{{ f.description }}</p>
							<p v-if="f.corrective_action" class="text-sky-700 text-[11px] mt-1">
								<strong>Action:</strong> {{ f.corrective_action }}
							</p>
						</div>
					</div>
					<p v-else class="text-xs text-slate-400 text-center py-6">No defects or findings recorded.</p>
				</div>
			</div>

			<!-- SUBTAB 5: REQUIREMENTS & EXPENSES -->
			<div v-if="activeTab === 'requirements'" class="space-y-3">
				<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
					<div class="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
						<h3 class="text-sm font-bold text-slate-900">Chemical & Parts Requisitions</h3>
						<button
							@click="addRequirement"
							class="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 hover:bg-sky-100"
						>
							+ Add Item
						</button>
					</div>

					<div v-if="visit.requirements && visit.requirements.length" class="space-y-2">
						<div
							v-for="(r, idx) in visit.requirements"
							:key="idx"
							class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center"
						>
							<div>
								<span class="font-bold text-slate-800">{{ r.item_name }}</span>
								<p class="text-slate-500 text-[11px]">{{ r.purpose }}</p>
							</div>
							<span class="font-extrabold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-lg">
								{{ r.quantity }} {{ r.unit }}
							</span>
						</div>
					</div>
					<p v-else class="text-xs text-slate-400 text-center py-6">No replenishment items requested.</p>
				</div>

				<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
					<div class="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
						<h3 class="text-sm font-bold text-slate-900">Field Expenses</h3>
						<button
							@click="addExpense"
							class="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 hover:bg-sky-100"
						>
							+ Add Expense
						</button>
					</div>

					<div v-if="visit.expenses && visit.expenses.length" class="space-y-2">
						<div
							v-for="(e, idx) in visit.expenses"
							:key="idx"
							class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center"
						>
							<div>
								<span class="font-bold text-slate-800">{{ e.expense_type }}</span>
								<p class="text-slate-500 text-[11px]">{{ e.description }}</p>
							</div>
							<span class="font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
								SAR {{ e.amount }}
							</span>
						</div>
					</div>
					<p v-else class="text-xs text-slate-400 text-center py-6">No travel or field expenses logged.</p>
				</div>
			</div>

			<!-- SUBTAB 6: SIGN & SUBMIT -->
			<div v-if="activeTab === 'sign'" class="space-y-3">
				<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
					<h3 class="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Review & Customer Sign-off</h3>

					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">Visit Outcome</label>
						<select
							v-model="visit.outcome"
							class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white outline-none focus:border-sky-500"
						>
							<option value="Completed">Completed Successfully</option>
							<option value="Partial">Partial - Follow-up Needed</option>
							<option value="Emergency Action Taken">Emergency Action Taken</option>
						</select>
					</div>

					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">Executive Summary / Observations</label>
						<textarea
							v-model="visit.executive_summary"
							rows="3"
							placeholder="Summarize site findings, water condition, and recommendations..."
							class="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white outline-none focus:border-sky-500"
						></textarea>
					</div>

					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">Customer Signee Name</label>
						<input
							type="text"
							v-model="visit.customer_representative"
							placeholder="e.g. Eng. Tariq Al-Amoudi"
							class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white outline-none focus:border-sky-500"
						/>
					</div>

					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">Customer Digital Signature</label>
						<SignaturePad ref="sigPad" />
					</div>

					<button
						@click="handleSubmit"
						:disabled="isSubmitting"
						class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-extrabold text-sm shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2 mt-4"
					>
						<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
						<span>{{ isSubmitting ? "Submitting Report..." : "Complete & Submit Visit" }}</span>
					</button>
				</div>
			</div>
		</div>
	</BaseLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseLayout from "@/components/BaseLayout.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import ReadingRow from "@/components/ReadingRow.vue";
import ChecklistItem from "@/components/ChecklistItem.vue";
import SignaturePad from "@/components/SignaturePad.vue";
import { visitsData } from "@/data/visits";
import { useGeolocation } from "@/composables/useGeolocation";

const route = useRoute();
const router = useRouter();
const { getCurrentPosition, evaluateGeofence } = useGeolocation();

const visit = ref(null);
const site = ref({});
const activeTab = ref("info");
const isCheckingIn = ref(false);
const isSubmitting = ref(false);
const sigPad = ref(null);

const tabs = [
	{ id: "info", label: "Site & GPS" },
	{ id: "readings", label: "Water Testing" },
	{ id: "checklist", label: "Checklist" },
	{ id: "findings", label: "Findings" },
	{ id: "requirements", label: "Requisitions" },
	{ id: "sign", label: "Sign & Submit" },
];

onMounted(async () => {
	const visitId = route.params.id;
	visit.value = await visitsData.getVisitDetails(visitId);
	site.value = visit.value.site_details || {};
	if (!visit.value.outcome) visit.value.outcome = "Completed";
});

async function handleCheckIn() {
	isCheckingIn.value = true;
	try {
		const coords = await getCurrentPosition(10000);
		const geo = evaluateGeofence(site.value.latitude, site.value.longitude, coords.latitude, coords.longitude, site.value.geofence_radius_meters || 200);

		let reason = null;
		if (geo.requiresReason) {
			reason = prompt(`You are ${geo.distance}m away from the target site. Please enter reason for remote check-in:`);
			if (!reason) {
				alert("Check-in cancelled: Geofence justification required.");
				return;
			}
		}

		await visitsData.checkIn(visit.value.name, coords, reason);
		visit.value.visit_status = "In Progress";
		visit.value.checkin_time = new Date().toLocaleTimeString();
		alert("GPS Verified Check-in Recorded!");
	} catch (e) {
		alert(e.message || "GPS check-in failed.");
	} finally {
		isCheckingIn.value = false;
	}
}

function addFinding() {
	const desc = prompt("Enter finding description:");
	if (!desc) return;
	const action = prompt("Recommended corrective action:");
	if (!visit.value.findings) visit.value.findings = [];
	visit.value.findings.push({
		category: "Scaling",
		severity: "Medium",
		description: desc,
		corrective_action: action || "",
	});
}

function addRequirement() {
	const item = prompt("Item / Chemical name (e.g. Anti-Scalant Polymer):");
	if (!item) return;
	const qty = prompt("Quantity:", "1");
	const unit = prompt("Unit:", "Drums");
	if (!visit.value.requirements) visit.value.requirements = [];
	visit.value.requirements.push({
		item_name: item,
		quantity: parseFloat(qty) || 1,
		unit: unit || "Nos",
		purpose: "Field Maintenance",
	});
}

function addExpense() {
	const type = prompt("Expense type (Transport, Fuel, Meals):", "Fuel");
	if (!type) return;
	const amt = prompt("Amount in SAR:", "50.00");
	if (!visit.value.expenses) visit.value.expenses = [];
	visit.value.expenses.push({
		expense_type: type,
		amount: parseFloat(amt) || 0,
		description: "On-site expense",
	});
}

async function handleSubmit() {
	if (!visit.value.executive_summary?.trim()) {
		alert("Please enter an Executive Summary before submitting.");
		return;
	}
	if (!visit.value.customer_representative?.trim()) {
		alert("Please enter the Customer Signee Name.");
		return;
	}

	isSubmitting.value = true;
	const signature = sigPad.value ? sigPad.value.toDataURL() : null;

	const submission = {
		outcome: visit.value.outcome,
		executive_summary: visit.value.executive_summary,
		customer_rep: visit.value.customer_representative,
		customer_signature: signature,
		data: {
			readings: visit.value.readings,
			checklist_items: visit.value.checklist_items,
			findings: visit.value.findings,
			requirements: visit.value.requirements,
			expenses: visit.value.expenses,
		},
	};

	try {
		await visitsData.submitVisit(visit.value.name, submission);
		alert("Visit report submitted successfully!");
		router.push("/visits");
	} catch (e) {
		alert(e.message || "Failed to submit visit.");
	} finally {
		isSubmitting.value = false;
	}
}
</script>
