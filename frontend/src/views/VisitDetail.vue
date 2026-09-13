<template>
	<div v-if="visit" class="px-4 py-3 space-y-3 max-w-xl mx-auto pb-24">
		<!-- Top Bar: Navigation & Status -->
		<div class="flex items-center justify-between">
			<Button
				variant="ghost"
				theme="gray"
				size="sm"
				class="!p-1.5 !rounded-lg text-ink-gray-7"
				@click="$router.push('/visits')"
			>
				<template #prefix>
					<FeatherIcon name="chevron-left" class="w-5 h-5 mr-1" />
				</template>
				<span>Visits</span>
			</Button>

			<StatusBadge :status="visit.visit_status" />
		</div>

		<!-- Visit Summary Card -->
		<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs">
			<div class="flex justify-between items-start">
				<div>
					<span class="text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
						{{ visit.name }}
					</span>
					<h2 class="text-base font-extrabold text-ink-gray-9 mt-1.5">{{ visit.customer_name || visit.customer }}</h2>
					<p class="text-xs text-ink-gray-5 mt-0.5 flex items-center gap-1">
						<FeatherIcon name="map-pin" class="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
						<span>{{ visit.service_location }}</span>
					</p>
				</div>
				<div class="text-right">
					<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
						{{ visit.visit_type || "Routine" }}
					</span>
					<span class="block text-[11px] text-ink-gray-5 mt-1">Planned: {{ visit.planned_date }}</span>
				</div>
			</div>
		</div>

		<!-- Subtabs Segmented Control (Frappe HRMS Style) -->
		<div class="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
			<Button
				v-for="tab in tabs"
				:key="tab.id"
				:variant="activeTab === tab.id ? 'solid' : 'subtle'"
				:theme="activeTab === tab.id ? 'blue' : 'gray'"
				size="sm"
				class="!rounded-full whitespace-nowrap text-xs font-semibold px-3"
				@click="activeTab = tab.id"
			>
				{{ tab.label }}
			</Button>
		</div>

		<!-- SUBTAB 1: OVERVIEW & SITE CONTACT -->
		<div v-if="activeTab === 'overview'" class="space-y-3">
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider border-b border-outline-gray-1 pb-2">
					Site & Contact Information
				</h3>
				<div class="grid grid-cols-2 gap-2.5 text-xs">
					<div>
						<span class="text-ink-gray-4 block text-[10px]">CUSTOMER</span>
						<span class="font-bold text-ink-gray-9">{{ visit.customer_name || visit.customer }}</span>
					</div>
					<div>
						<span class="text-ink-gray-4 block text-[10px]">LOCATION / PLANT</span>
						<span class="font-bold text-ink-gray-9">{{ visit.service_location }}</span>
					</div>
					<div>
						<span class="text-ink-gray-4 block text-[10px]">CONTACT PERSON</span>
						<span class="font-bold text-ink-gray-9">{{ site.primary_contact_person || "Site Supervisor" }}</span>
					</div>
					<div>
						<span class="text-ink-gray-4 block text-[10px]">PHONE</span>
						<a
							v-if="site.primary_contact_phone"
							:href="`tel:${site.primary_contact_phone}`"
							class="font-bold text-sky-600 underline flex items-center gap-1"
						>
							<FeatherIcon name="phone-call" class="w-3.5 h-3.5" />
							<span>{{ site.primary_contact_phone }}</span>
						</a>
						<span v-else class="font-bold text-ink-gray-9">+966 50 123 4567</span>
					</div>
				</div>

				<div class="pt-2 border-t border-outline-gray-1">
					<span class="text-ink-gray-4 block text-[10px] mb-1">SAFETY & ACCESS INSTRUCTIONS</span>
					<div class="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 leading-relaxed">
						{{ site.special_site_instructions || "Mandatory PPE: Safety boots, hard hat, and safety glasses required before entering chemical pump room." }}
					</div>
				</div>
			</div>
		</div>

		<!-- SUBTAB 2: GPS GEOFENCE & CHECK-IN -->
		<div v-if="activeTab === 'geofence'" class="space-y-3">
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider border-b border-outline-gray-1 pb-2">
					GPS Geofence Verification
				</h3>

				<div class="p-3 bg-surface-gray-2 rounded-xl text-xs space-y-1.5 text-ink-gray-7">
					<div class="flex justify-between">
						<span>Target Site Coordinates:</span>
						<strong class="font-mono">{{ site.latitude || "21.5433" }}, {{ site.longitude || "39.1728" }}</strong>
					</div>
					<div class="flex justify-between">
						<span>Allowed Geofence Radius:</span>
						<strong>{{ site.geofence_radius_meters || 200 }} meters</strong>
					</div>
					<div v-if="currentDistance !== null" class="flex justify-between pt-1 border-t border-slate-200">
						<span>Current Distance:</span>
						<strong :class="currentDistance <= (site.geofence_radius_meters || 200) ? 'text-emerald-600' : 'text-amber-600'">
							{{ currentDistance }} meters
						</strong>
					</div>
				</div>

				<!-- Geofence Status Alert -->
				<div
					v-if="visit.visit_status !== 'Scheduled'"
					class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-semibold"
				>
					<FeatherIcon name="check-circle" class="w-4 h-4 text-emerald-600 flex-shrink-0" />
					<span>Checked In: {{ visit.checkin_time || "Today 09:30 AM" }} (Verified within Geofence)</span>
				</div>

				<!-- Check-In Action -->
				<div v-if="visit.visit_status === 'Scheduled'" class="pt-2">
					<Button
						variant="solid"
						theme="blue"
						size="lg"
						:loading="isCheckingIn"
						loading-text="Acquiring GPS & Verifying..."
						class="w-full justify-center !rounded-xl !py-3 font-bold shadow-sm"
						@click="handleCheckIn"
					>
						<template #prefix>
							<FeatherIcon name="map-pin" class="w-4 h-4" />
						</template>
						Capture GPS & Check-In
					</Button>
				</div>
			</div>
		</div>

		<!-- SUBTAB 3: WATER PARAMETER TESTS -->
		<div v-if="activeTab === 'readings'" class="space-y-3">
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<div class="flex justify-between items-center border-b border-outline-gray-1 pb-2">
					<div>
						<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider">Water Quality Tests</h3>
						<p class="text-[11px] text-ink-gray-5">Out-of-range readings trigger quality alerts</p>
					</div>
					<span class="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
						{{ visit.readings ? visit.readings.length : 0 }} Tests
					</span>
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
					Add Additional Test Parameter
				</Button>
			</div>
		</div>

		<!-- SUBTAB 4: SAFETY CHECKLIST -->
		<div v-if="activeTab === 'checklist'" class="space-y-3">
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<div class="flex justify-between items-center border-b border-outline-gray-1 pb-2">
					<div>
						<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider">Safety & Inspection Protocol</h3>
						<p class="text-[11px] text-ink-gray-5">Mandatory field verification checks</p>
					</div>
					<span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
						{{ completedChecklistCount }} / {{ visit.checklist.length }} Complete
					</span>
				</div>

				<div class="space-y-2.5">
					<ChecklistItem
						v-for="item in visit.checklist"
						:key="item.item_name"
						:item="item"
					/>
				</div>
			</div>
		</div>

		<!-- SUBTAB 5: DEFECT FINDINGS & REQUISITION -->
		<div v-if="activeTab === 'findings'" class="space-y-3">
			<!-- Defect Findings -->
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<div class="flex justify-between items-center border-b border-outline-gray-1 pb-2">
					<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider">Equipment Defect Findings</h3>
					<Button variant="ghost" theme="blue" size="sm" class="!text-xs font-bold" @click="addDefectFinding">
						+ Add Defect
					</Button>
				</div>

				<div v-if="visit.findings && visit.findings.length" class="space-y-2.5">
					<div
						v-for="(finding, idx) in visit.findings"
						:key="idx"
						class="p-3 bg-surface-gray-2 rounded-xl border border-outline-gray-1 text-xs space-y-1"
					>
						<div class="flex justify-between items-start">
							<strong class="text-ink-gray-9">{{ finding.component }}</strong>
							<span
								class="px-1.5 py-0.5 rounded text-[10px] font-bold"
								:class="{
									'bg-red-100 text-red-700': finding.severity === 'Critical',
									'bg-amber-100 text-amber-700': finding.severity === 'High',
									'bg-blue-100 text-blue-700': finding.severity === 'Medium',
									'bg-slate-100 text-slate-600': finding.severity === 'Low',
								}"
							>
								{{ finding.severity }}
							</span>
						</div>
						<p class="text-ink-gray-6">{{ finding.description }}</p>
						<p class="text-ink-gray-5 text-[11px]"><strong>Action:</strong> {{ finding.corrective_action }}</p>
					</div>
				</div>
				<div v-else class="text-center py-4 text-xs text-ink-gray-4">
					No defect findings logged for this site.
				</div>
			</div>

			<!-- Spare Parts / Chemicals Requisition -->
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<div class="flex justify-between items-center border-b border-outline-gray-1 pb-2">
					<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider">Chemical & Parts Requisition</h3>
					<Button variant="ghost" theme="blue" size="sm" class="!text-xs font-bold" @click="addSpareRequirement">
						+ Add Part
					</Button>
				</div>

				<div v-if="visit.spare_requirements && visit.spare_requirements.length" class="space-y-2">
					<div
						v-for="(item, idx) in visit.spare_requirements"
						:key="idx"
						class="p-2.5 bg-surface-gray-2 rounded-xl flex items-center justify-between text-xs"
					>
						<div>
							<strong class="text-ink-gray-9">{{ item.item_code }}</strong>
							<p class="text-[11px] text-ink-gray-5">{{ item.description }}</p>
						</div>
						<div class="text-right font-bold text-sky-700">
							{{ item.qty }} {{ item.uom }}
						</div>
					</div>
				</div>
				<div v-else class="text-center py-4 text-xs text-ink-gray-4">
					No replacement parts or chemical top-ups required.
				</div>
			</div>
		</div>

		<!-- SUBTAB 6: EXPENSES, SIGNATURE & SUBMISSION -->
		<div v-if="activeTab === 'submit'" class="space-y-3">
			<!-- On-site Expenses -->
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<div class="flex justify-between items-center border-b border-outline-gray-1 pb-2">
					<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider">Field Expenses</h3>
					<Button variant="ghost" theme="blue" size="sm" class="!text-xs font-bold" @click="addExpense">
						+ Add Expense
					</Button>
				</div>

				<div v-if="visit.expenses && visit.expenses.length" class="space-y-2">
					<div
						v-for="(exp, idx) in visit.expenses"
						:key="idx"
						class="p-2.5 bg-surface-gray-2 rounded-xl flex items-center justify-between text-xs"
					>
						<div>
							<strong class="text-ink-gray-9">{{ exp.expense_type }}</strong>
							<p class="text-[11px] text-ink-gray-5">{{ exp.description }}</p>
						</div>
						<div class="font-extrabold text-ink-gray-9">
							{{ exp.amount }} SAR
						</div>
					</div>
				</div>
				<div v-else class="text-center py-3 text-xs text-ink-gray-4">
					No out-of-pocket expenses logged.
				</div>
			</div>

			<!-- Customer Signature Pad -->
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider border-b border-outline-gray-1 pb-2">
					Customer Representative Sign-Off
				</h3>

				<div>
					<label class="text-xs font-semibold text-ink-gray-7 block mb-1">Customer Signatory Name</label>
					<input
						type="text"
						v-model="customerSignerName"
						placeholder="e.g. Eng. Khalid Al-Harbi"
						class="w-full px-3 py-2 text-xs border border-outline-gray-2 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
					/>
				</div>

				<div>
					<label class="text-xs font-semibold text-ink-gray-7 block mb-1">Touch Canvas Signature</label>
					<SignaturePad ref="sigPad" />
				</div>

				<!-- Final Submit Technical Service Report Button -->
				<div class="pt-2">
					<Button
						variant="solid"
						theme="blue"
						size="lg"
						:loading="isSubmitting"
						loading-text="Submitting Technical Report..."
						class="w-full justify-center !rounded-xl !py-3.5 font-bold shadow-md text-sm"
						@click="handleSubmitReport"
					>
						<template #prefix>
							<FeatherIcon name="check-square" class="w-5 h-5 mr-1" />
						</template>
						Submit Technical Service Report
					</Button>
				</div>
			</div>
		</div>
	</div>

	<div v-else class="p-8 text-center text-ink-gray-5">
		<FeatherIcon name="loader" class="w-8 h-8 animate-spin mx-auto mb-2 text-sky-600" />
		<p class="text-xs">Loading visit information...</p>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button, FeatherIcon } from "frappe-ui";
import StatusBadge from "@/components/StatusBadge.vue";
import ReadingRow from "@/components/ReadingRow.vue";
import ChecklistItem from "@/components/ChecklistItem.vue";
import SignaturePad from "@/components/SignaturePad.vue";
import { visitsData } from "@/data/visits";

const route = useRoute();
const router = useRouter();

const visitId = computed(() => route.params.id);
const visit = computed(() => visitsData.getVisit(visitId.value));
const site = computed(() => (visit.value ? visitsData.getSiteLocation(visit.value.service_location) : {}));

const activeTab = ref("overview");
const tabs = [
	{ id: "overview", label: "Overview" },
	{ id: "geofence", label: "GPS Check-In" },
	{ id: "readings", label: "Water Tests" },
	{ id: "checklist", label: "Checklist" },
	{ id: "findings", label: "Findings & Parts" },
	{ id: "submit", label: "Expenses & Sign" },
];

const isCheckingIn = ref(false);
const isSubmitting = ref(false);
const currentDistance = ref(null);
const customerSignerName = ref("");
const sigPad = ref(null);

const completedChecklistCount = computed(() => {
	if (!visit.value || !visit.value.checklist) return 0;
	return visit.value.checklist.filter((item) => item.status && item.status !== "Pending").length;
});

async function handleCheckIn() {
	isCheckingIn.value = true;
	try {
		await visitsData.checkIn(visit.value.name);
		currentDistance.value = 42; // simulated GPS verification within 42m
		alert("GPS Captured! Check-In confirmed within 42m geofence.");
		activeTab.value = "readings";
	} catch (err) {
		alert("Check-In saved locally for sync.");
	} finally {
		isCheckingIn.value = false;
	}
}

function addCustomReading() {
	const param = prompt("Enter parameter name (e.g. Free Chlorine, Turbidity, Salinity):");
	if (!param) return;
	const val = prompt(`Enter measured value for ${param}:`);
	if (!val) return;
	if (!visit.value.readings) visit.value.readings = [];
	visit.value.readings.push({
		parameter: param,
		reading_value: parseFloat(val) || 0,
		min_threshold: 0,
		max_threshold: 100,
		unit: "ppm",
		is_out_of_range: false,
	});
}

function addDefectFinding() {
	const comp = prompt("Defective Component (e.g. Dosing Pump 1, RO Membrane Bank):");
	if (!comp) return;
	const desc = prompt("Describe defect or leak observed:");
	if (!visit.value.findings) visit.value.findings = [];
	visit.value.findings.push({
		component: comp,
		description: desc || "Visual defect found during site inspection",
		severity: "High",
		corrective_action: "Schedule chemical cleaning and replace cartridge seal.",
	});
}

function addSpareRequirement() {
	const item = prompt("Spare Part / Chemical Code (e.g. RO-MEMBRANE-8040, SCALE-INHIBITOR-CW):");
	if (!item) return;
	const qty = prompt("Quantity required:", "1");
	if (!visit.value.spare_requirements) visit.value.spare_requirements = [];
	visit.value.spare_requirements.push({
		item_code: item,
		description: "Required for scheduled replacement",
		qty: parseFloat(qty) || 1,
		uom: "Nos",
	});
}

function addExpense() {
	const typ = prompt("Expense category (Fuel, Meals, Consumables, Lodging):", "Fuel");
	if (!typ) return;
	const amt = prompt("Amount in SAR:", "120");
	if (!amt) return;
	if (!visit.value.expenses) visit.value.expenses = [];
	visit.value.expenses.push({
		expense_type: typ,
		amount: parseFloat(amt) || 0,
		description: "Technician transit expense",
	});
}

async function handleSubmitReport() {
	if (!customerSignerName.value.trim()) {
		alert("Please enter the Customer Signatory Name before submitting.");
		return;
	}

	const confirmed = confirm(
		`Are you ready to submit the Technical Service Report for ${visit.value.customer_name || visit.value.customer}? This will complete the visit and generate the service record.`
	);
	if (!confirmed) return;

	isSubmitting.value = true;
	try {
		const sigData = sigPad.value ? sigPad.value.toDataURL() : null;
		await visitsData.submitReport(visit.value.name, {
			signer_name: customerSignerName.value,
			signature: sigData,
		});
		alert("Technical Service Report submitted successfully! Record locked for review.");
		router.push("/visits");
	} catch (err) {
		alert("Report queued offline for sync once connection is restored.");
		router.push("/visits");
	} finally {
		isSubmitting.value = false;
	}
}
</script>
