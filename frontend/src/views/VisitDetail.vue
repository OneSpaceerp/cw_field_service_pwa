<template>
	<BaseLayout :title="visit ? (visit.customer_name || visit.name) : 'Visit Details'">
		<template #start-actions>
			<Button variant="ghost" theme="gray" size="sm" @click="$router.push('/visits')">
				<template #prefix>
					<FeatherIcon name="chevron-left" class="w-4 h-4" />
				</template>
				Back
			</Button>
		</template>

		<div v-if="visit" class="px-4 py-2 space-y-3">
			<!-- Header Card -->
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs">
				<div class="flex justify-between items-start mb-1">
					<div>
						<h2 class="text-base font-extrabold text-ink-gray-9">{{ visit.customer_name || visit.customer }}</h2>
						<p class="text-xs text-ink-gray-5 mt-0.5">{{ visit.service_location }} &bull; {{ visit.name }}</p>
					</div>
					<StatusBadge :status="visit.visit_status" />
				</div>
			</div>

			<!-- Subtabs Bar -->
			<div class="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
				<Button
					v-for="tab in tabs"
					:key="tab.id"
					:variant="activeTab === tab.id ? 'solid' : 'subtle'"
					:theme="activeTab === tab.id ? 'blue' : 'gray'"
					size="sm"
					class="!rounded-full whitespace-nowrap text-xs font-semibold"
					@click="activeTab = tab.id"
				>
					{{ tab.label }}
				</Button>
			</div>

			<!-- SUBTAB 1: SITE INFO & GPS CHECK-IN -->
			<div v-if="activeTab === 'info'" class="space-y-3">
				<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-2.5">
					<h3 class="text-sm font-bold text-ink-gray-9 border-b border-outline-gray-modals pb-2">Site Details & Target GPS</h3>
					<div class="text-xs space-y-1.5 text-ink-gray-7">
						<p><strong class="text-ink-gray-9">Address:</strong> {{ site.address_display || "Not specified" }}</p>
						<p><strong class="text-ink-gray-9">Contact Person:</strong> {{ site.primary_contact_person || "N/A" }}</p>
						<p><strong class="text-ink-gray-9">Phone:</strong> {{ site.primary_contact_phone || "N/A" }}</p>
						<p><strong class="text-ink-gray-9">Safety Notes:</strong> {{ site.special_site_instructions || "Standard safety gear" }}</p>
					</div>

					<div class="p-3 bg-surface-gray-2 border border-outline-gray-modals rounded-xl text-xs text-ink-gray-7">
						<div><strong>Site Target GPS:</strong> {{ site.latitude || "0.0" }}, {{ site.longitude || "0.0" }}</div>
						<div class="mt-0.5"><strong>Geofence Radius:</strong> {{ site.geofence_radius_meters || 200 }} meters</div>
					</div>

					<div v-if="visit.visit_status === 'Scheduled'" class="pt-2">
						<Button
							variant="solid"
							theme="blue"
							size="lg"
							:loading="isCheckingIn"
							loading-text="Acquiring GPS..."
							class="w-full justify-center !rounded-xl !py-3 font-bold shadow-md"
							@click="handleCheckIn"
						>
							<template #prefix>
								<FeatherIcon name="map-pin" class="w-4 h-4" />
							</template>
							Capture GPS & Check-In
						</Button>
					</div>
					<div v-else class="p-3 bg-surface-green-2 border border-outline-green-2 rounded-xl text-xs text-ink-green-3 font-bold text-center flex items-center justify-center gap-1.5">
						<FeatherIcon name="check-circle" class="w-4 h-4" />
						<span>Checked In on {{ visit.checkin_time || "Today" }} (GPS Verified)</span>
					</div>
				</div>
			</div>

			<!-- SUBTAB 2: WATER TESTING READINGS -->
			<div v-if="activeTab === 'readings'" class="space-y-3">
				<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
					<div class="flex justify-between items-center border-b border-outline-gray-modals pb-2">
						<h3 class="text-sm font-bold text-ink-gray-9">Field Water Parameter Tests</h3>
						<span class="text-[11px] font-semibold text-ink-gray-5">Out-of-range flagged</span>
					</div>

					<div class="space-y-2.5">
						<ReadingRow
							v-for="reading in visit.readings"
							:key="reading.parameter"
							:reading="reading"
						/>
					</div>

					<Button
						variant="subtle"
						theme="blue"
						size="sm"
						class="w-full justify-center !rounded-xl text-xs font-semibold mt-2"
						@click="addCustomReading"
					>
						<template #prefix>
							<FeatherIcon name="plus" class="w-3.5 h-3.5" />
						</template>
						Add Other Parameter
					</Button>
				</div>
			</div>

			<!-- SUBTAB 3: SAFETY CHECKLIST -->
			<div v-if="activeTab === 'checklist'" class="space-y-3">
				<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
					<h3 class="text-sm font-bold text-ink-gray-9 border-b border-outline-gray-modals pb-2">Safety & Pre-Service Verification</h3>
					<div class="space-y-2">
						<ChecklistItem
							v-for="item in visit.checklist_items"
							:key="item.checklist_item"
							:item="item"
						/>
					</div>
				</div>
			</div>

			<!-- SUBTAB 4: FINDINGS & DEFECTS -->
			<div v-if="activeTab === 'findings'" class="space-y-3">
				<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
					<div class="flex justify-between items-center border-b border-outline-gray-modals pb-2">
						<h3 class="text-sm font-bold text-ink-gray-9">Identified Defects & Findings</h3>
						<Button variant="subtle" theme="blue" size="sm" class="!rounded-lg text-xs" @click="addFinding">
							<template #prefix><FeatherIcon name="plus" class="w-3 h-3" /></template>
							Add Finding
						</Button>
					</div>

					<div v-if="visit.findings && visit.findings.length" class="space-y-2.5">
						<div
							v-for="(f, i) in visit.findings"
							:key="i"
							class="p-3 bg-surface-gray-2 rounded-xl border border-outline-gray-modals text-xs space-y-1"
						>
							<div class="flex justify-between items-center">
								<span class="font-bold text-ink-gray-9">{{ f.finding_category }}</span>
								<StatusBadge :status="f.severity" size="sm" />
							</div>
							<p class="text-ink-gray-7">{{ f.finding_description }}</p>
							<p class="text-[11px] text-ink-gray-5"><strong class="text-ink-gray-7">Action:</strong> {{ f.recommended_action }}</p>
						</div>
					</div>
					<div v-else class="text-center py-6 text-xs text-ink-gray-4">
						No abnormal findings reported yet.
					</div>
				</div>
			</div>

			<!-- SUBTAB 5: REQUISITIONS & EXPENSES -->
			<div v-if="activeTab === 'requirements'" class="space-y-3">
				<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
					<div class="flex justify-between items-center border-b border-outline-gray-modals pb-2">
						<h3 class="text-sm font-bold text-ink-gray-9">Chemicals & Spare Parts</h3>
						<Button variant="subtle" theme="blue" size="sm" class="!rounded-lg text-xs" @click="addRequirement">
							<template #prefix><FeatherIcon name="plus" class="w-3 h-3" /></template>
							Request Part
						</Button>
					</div>

					<div v-if="visit.requirements && visit.requirements.length" class="space-y-2">
						<div
							v-for="(req, i) in visit.requirements"
							:key="i"
							class="flex justify-between items-center p-2.5 bg-surface-gray-2 rounded-xl border border-outline-gray-modals text-xs"
						>
							<div>
								<div class="font-bold text-ink-gray-9">{{ req.item_name }}</div>
								<div class="text-[11px] text-ink-gray-5">{{ req.purpose }}</div>
							</div>
							<span class="font-bold text-ink-blue-3">{{ req.quantity }} {{ req.unit }}</span>
						</div>
					</div>
					<div v-else class="text-center py-6 text-xs text-ink-gray-4">
						No chemical or spare requisitions added.
					</div>
				</div>

				<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
					<div class="flex justify-between items-center border-b border-outline-gray-modals pb-2">
						<h3 class="text-sm font-bold text-ink-gray-9">Incidental Expenses (SAR)</h3>
						<Button variant="subtle" theme="gray" size="sm" class="!rounded-lg text-xs" @click="addExpense">
							<template #prefix><FeatherIcon name="plus" class="w-3 h-3" /></template>
							Add Expense
						</Button>
					</div>

					<div v-if="visit.expenses && visit.expenses.length" class="space-y-2">
						<div
							v-for="(exp, i) in visit.expenses"
							:key="i"
							class="flex justify-between items-center p-2.5 bg-surface-gray-2 rounded-xl border border-outline-gray-modals text-xs"
						>
							<div>
								<div class="font-bold text-ink-gray-9">{{ exp.expense_type }}</div>
								<div class="text-[11px] text-ink-gray-5">{{ exp.description }}</div>
							</div>
							<span class="font-bold text-ink-green-3">SAR {{ exp.amount.toFixed(2) }}</span>
						</div>
					</div>
					<div v-else class="text-center py-6 text-xs text-ink-gray-4">
						No on-site expenses recorded.
					</div>
				</div>
			</div>

			<!-- SUBTAB 6: SIGN & SUBMIT -->
			<div v-if="activeTab === 'sign'" class="space-y-3">
				<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
					<h3 class="text-sm font-bold text-ink-gray-9 pb-2 border-b border-outline-gray-modals">Review & Customer Sign-off</h3>

					<div>
						<label class="block text-xs font-bold text-ink-gray-8 mb-1">Visit Outcome</label>
						<select
							v-model="visit.outcome"
							class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-outline-gray-2 bg-surface-gray-2 outline-none focus:border-outline-blue-2"
						>
							<option value="Completed">Completed Successfully</option>
							<option value="Partial">Partial - Follow-up Needed</option>
							<option value="Emergency Action Taken">Emergency Action Taken</option>
						</select>
					</div>

					<div>
						<label class="block text-xs font-bold text-ink-gray-8 mb-1">Executive Summary / Observations</label>
						<textarea
							v-model="visit.executive_summary"
							rows="3"
							placeholder="Summarize site findings, water condition, and recommendations..."
							class="w-full px-3 py-2 text-xs rounded-xl border border-outline-gray-2 bg-surface-gray-2 outline-none focus:border-outline-blue-2"
						></textarea>
					</div>

					<FormControl
						type="text"
						label="Customer Signee Name"
						v-model="visit.customer_representative"
						placeholder="e.g. Eng. Tariq Al-Amoudi"
						class="text-xs font-semibold"
					/>

					<div>
						<label class="block text-xs font-bold text-ink-gray-8 mb-1">Customer Digital Signature</label>
						<SignaturePad ref="sigPad" />
					</div>

					<Button
						variant="solid"
						theme="green"
						size="lg"
						:loading="isSubmitting"
						loading-text="Submitting Report..."
						class="w-full justify-center !rounded-xl !py-3 font-extrabold text-sm shadow-md mt-4"
						@click="handleSubmit"
					>
						<template #prefix>
							<FeatherIcon name="check" class="w-5 h-5" />
						</template>
						Complete & Submit Visit
					</Button>
				</div>
			</div>
		</div>
	</BaseLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button, FormControl, FeatherIcon } from "frappe-ui";
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
	visit.value = await visitsData.getVisit(visitId);
	if (visit.value) {
		site.value = await visitsData.getSiteLocation(visit.value.service_location);
	}
});

async function handleCheckIn() {
	isCheckingIn.value = true;
	try {
		const pos = await getCurrentPosition();
		const evalResult = evaluateGeofence(
			pos.latitude,
			pos.longitude,
			site.value.latitude || 21.5433,
			site.value.longitude || 39.1728,
			site.value.geofence_radius_meters || 200
		);

		await visitsData.checkIn(visit.value.name, {
			latitude: pos.latitude,
			longitude: pos.longitude,
			accuracy: pos.accuracy,
			distance_meters: evalResult.distance,
			geofence_status: evalResult.status,
		});

		alert(`Checked in successfully! Distance to target: ${evalResult.distance}m (${evalResult.status})`);
	} catch (e) {
		alert("GPS Check-In failed: " + e.message);
	} finally {
		isCheckingIn.value = false;
	}
}

function addCustomReading() {
	const paramName = prompt("Enter parameter name (e.g. Free Chlorine, Turbidity):");
	if (!paramName) return;
	const val = prompt("Enter test value:");
	if (val === null) return;

	if (!visit.value.readings) visit.value.readings = [];
	visit.value.readings.push({
		parameter: paramName,
		parameter_name: paramName,
		reading_value: parseFloat(val) || 0,
		unit: "ppm",
		min_value: 0.1,
		max_value: 5.0,
		is_out_of_range: false,
	});
}

function addFinding() {
	const desc = prompt("Describe the finding or defect:");
	if (!desc) return;
	const sev = prompt("Severity (Low, Medium, High, Critical):", "Medium");
	const act = prompt("Recommended corrective action:", "Monitor and adjust dosing");

	if (!visit.value.findings) visit.value.findings = [];
	visit.value.findings.push({
		finding_category: "General Inspection",
		finding_description: desc,
		severity: sev || "Medium",
		recommended_action: act || "",
	});
}

function addRequirement() {
	const item = prompt("Item name or chemical required:");
	if (!item) return;
	const qty = prompt("Quantity needed:", "1");
	const unit = prompt("Unit of measure (Litre, Kg, Pcs):", "Litre");

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
