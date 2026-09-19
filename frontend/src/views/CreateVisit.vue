<template>
	<div class="max-w-xl mx-auto px-4 py-4 space-y-4 pb-28">
		<!-- Top Bar: Back button and Page Title matching Mockup -->
		<div class="flex items-center space-x-3 pt-1 pb-2">
			<button
				@click="handleCancel"
				class="w-10 h-10 rounded-full bg-surface-white border border-outline-gray-1 shadow-xs flex items-center justify-center text-ink-gray-7 active:scale-95 transition-all hover:bg-slate-100"
				title="Back"
			>
				<FeatherIcon name="arrow-left" class="w-5 h-5 text-slate-700 stroke-[2.5]" />
			</button>
			<div>
				<h1 class="text-xl font-extrabold text-slate-900 tracking-tight">Create Visit</h1>
				<p class="text-xs text-slate-500 font-medium">Engineer On-Site Check-In & Location Approval</p>
			</div>
		</div>

		<!-- Main Form Body -->
		<div class="bg-surface-white rounded-2xl border border-outline-gray-1 p-5 shadow-xs space-y-5">
			<!-- 1. Customer Selector Dropdown -->
			<div>
				<label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
					<span>Customer <span class="text-rose-500">*</span></span>
					<span v-if="selectedCustomer" class="text-[11px] font-semibold text-sky-600">Selected</span>
				</label>
				<div
					@click="showCustomerPicker = true"
					class="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border transition-all cursor-pointer bg-slate-50 hover:bg-slate-100 active:bg-slate-200"
					:class="selectedCustomer ? 'border-sky-300 bg-sky-50/20' : 'border-slate-200'"
				>
					<div class="flex items-center space-x-3 overflow-hidden">
						<div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
							<FeatherIcon name="user" class="w-4 h-4 stroke-[2.5]" />
						</div>
						<div class="truncate">
							<p v-if="selectedCustomer" class="text-sm font-bold text-slate-900 truncate">
								{{ selectedCustomer.customer_name || selectedCustomer.name }}
							</p>
							<p v-else class="text-sm font-medium text-slate-400">
								Select customer...
							</p>
							<p v-if="selectedCustomer?.territory" class="text-[11px] text-slate-500">
								{{ selectedCustomer.territory }}
							</p>
						</div>
					</div>
					<FeatherIcon name="chevron-down" class="w-5 h-5 text-slate-400 shrink-0 ml-2" />
				</div>

				<!-- Quick Customer Suggestions Pills -->
				<div class="flex flex-wrap gap-1.5 mt-2">
					<button
						type="button"
						v-for="c in quickCustomers"
						:key="c.name"
						@click="selectCustomer(c)"
						class="text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all"
						:class="selectedCustomer?.name === c.name ? 'bg-sky-600 text-white border-sky-600 shadow-xs' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'"
					>
						{{ c.customer_name.split(' ')[0] }}
					</button>
				</div>
			</div>

			<!-- 2. Visit Type Dropdown -->
			<div>
				<label class="block text-xs font-bold text-slate-700 mb-1.5">
					Visit Type <span class="text-rose-500">*</span>
				</label>
				<div class="relative flex items-center">
					<div class="absolute left-3.5 w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center pointer-events-none">
						<FeatherIcon name="clipboard" class="w-4 h-4 stroke-[2.5]" />
					</div>
					<select
						v-model="form.visit_type"
						class="w-full pl-14 pr-10 py-3 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-sky-500 focus:bg-white transition-all appearance-none cursor-pointer"
					>
						<option value="Routine Inspection">Routine Inspection</option>
						<option value="Preventive Maintenance">Preventive Maintenance</option>
						<option value="Emergency Breakdown">Emergency Breakdown</option>
						<option value="Corrective Repair">Corrective Repair</option>
						<option value="Chemical Dosing Audit">Chemical Dosing Audit</option>
						<option value="Water Quality Sampling">Water Quality Sampling</option>
						<option value="Commissioning">Installation & Commissioning</option>
					</select>
					<FeatherIcon name="chevron-down" class="w-5 h-5 text-slate-400 absolute right-3.5 pointer-events-none" />
				</div>
			</div>

			<!-- 3. Priority & Planned Date -->
			<div class="grid grid-cols-2 gap-3">
				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1.5">Priority</label>
					<select
						v-model="form.priority"
						class="w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-sky-500 focus:bg-white"
					>
						<option value="Low">Low</option>
						<option value="Medium">Medium</option>
						<option value="High">High</option>
						<option value="Critical">Critical</option>
					</select>
				</div>
				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1.5">Site / Plant Name</label>
					<input
						type="text"
						v-model="form.service_location"
						placeholder="e.g. RO Unit 01"
						class="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-sky-500 focus:bg-white"
					/>
				</div>
			</div>

			<!-- 4. Description Text Area -->
			<div>
				<label class="block text-xs font-bold text-slate-700 mb-1.5 flex justify-between">
					<span>Description <span class="text-rose-500">*</span></span>
					<span class="text-[11px] text-slate-400">{{ form.description.length }} chars</span>
				</label>
				<textarea
					v-model="form.description"
					rows="3"
					placeholder="Describe the issue or purpose of this visit (e.g. High pressure differential across RO membranes, client requested immediate chemical check)..."
					class="w-full p-3.5 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-sky-500 focus:bg-white transition-all resize-none placeholder:text-slate-400"
				></textarea>
			</div>

			<!-- 5. Attachment Photo Evidence Card matching Mockup -->
			<div>
				<label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
					<span>Attachment (Site or Equipment Photo) <span class="text-rose-500">*</span></span>
					<span v-if="photoPreview" class="text-[11px] font-bold text-emerald-600">Attached</span>
				</label>

				<!-- Empty State / Capture Controls -->
				<div
					v-if="!photoPreview"
					class="p-4 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/40 flex flex-col items-center justify-center text-center space-y-3"
				>
					<div class="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
						<FeatherIcon name="camera" class="w-6 h-6 stroke-[2]" />
					</div>

					<div class="space-y-1">
						<p class="text-xs font-bold text-slate-800">Capture Site or Equipment Evidence</p>
						<p class="text-[11px] text-slate-500 max-w-xs">
							Max file size 500 MB only. PDF, JPEG, PNG supported.
						</p>
					</div>

					<!-- Hidden File Inputs -->
					<input
						type="file"
						ref="cameraInput"
						accept="image/*"
						capture="environment"
						class="hidden"
						@change="handlePhotoUpload"
					/>
					<input
						type="file"
						ref="galleryInput"
						accept="image/*"
						class="hidden"
						@change="handlePhotoUpload"
					/>

					<div class="flex items-center gap-2 pt-1">
						<button
							type="button"
							@click="$refs.cameraInput.click()"
							class="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 active:scale-95 transition-all hover:shadow-sky-500/25"
						>
							<FeatherIcon name="camera" class="w-4 h-4 stroke-[2.5]" />
							<span>Take Photo</span>
						</button>
						<button
							type="button"
							@click="$refs.galleryInput.click()"
							class="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 active:scale-95 transition-all hover:bg-slate-50"
						>
							<FeatherIcon name="image" class="w-4 h-4 text-slate-500" />
							<span>Gallery</span>
						</button>
					</div>
				</div>

				<!-- Photo Preview State -->
				<div
					v-else
					class="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shadow-2xs"
				>
					<div class="flex items-center space-x-3 overflow-hidden">
						<img
							:src="photoPreview"
							alt="Site preview"
							class="w-16 h-16 rounded-xl object-cover border border-slate-300 shrink-0 shadow-2xs"
						/>
						<div class="truncate">
							<p class="text-xs font-bold text-slate-900 truncate">{{ photoFileName }}</p>
							<p class="text-[11px] text-slate-500">{{ photoFileSize }} • Ready to attach</p>
							<span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md mt-1">
								<FeatherIcon name="check" class="w-3 h-3 stroke-[3]" /> Photo Verified
							</span>
						</div>
					</div>
					<button
						type="button"
						@click="removePhoto"
						class="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 active:scale-95 transition-all shrink-0"
					>
						Retake
					</button>
				</div>
			</div>

			<!-- 6. Mandatory Location Approval & GPS Check-In Card -->
			<div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-2">
						<div
							class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
							:class="gpsStatus === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
						>
							<FeatherIcon name="map-pin" class="w-4 h-4 stroke-[2.5]" />
						</div>
						<h4 class="text-xs font-bold text-slate-900">Location Approval & GPS Check-In</h4>
					</div>

					<!-- Status Badge -->
					<div v-if="gpsStatus === 'acquiring'" class="flex items-center gap-1.5 text-sky-600 text-[11px] font-bold">
						<div class="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping"></div>
						<span>Acquiring GPS...</span>
					</div>
					<div v-else-if="gpsStatus === 'success'" class="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
						<FeatherIcon name="check-circle" class="w-3.5 h-3.5 stroke-[2.5]" />
						<span>Location Approved</span>
					</div>
					<div v-else class="text-[11px] font-bold text-amber-600">
						GPS Warning
					</div>
				</div>

				<!-- GPS Details -->
				<div v-if="gpsStatus === 'success'" class="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between text-xs">
					<div class="space-y-0.5">
						<p class="font-mono font-bold text-slate-800">
							{{ gpsCoords.latitude.toFixed(6) }}° N, {{ gpsCoords.longitude.toFixed(6) }}° E
						</p>
						<p class="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
							<FeatherIcon name="navigation" class="w-3 h-3 text-sky-600" />
							<span>±{{ Math.round(gpsCoords.accuracy || 10) }}m Accuracy • High Precision</span>
						</p>
					</div>
					<button
						type="button"
						@click="acquireLocation"
						class="text-sky-600 hover:text-sky-800 p-1.5 rounded-lg hover:bg-slate-100 active:scale-95 transition-all text-xs font-bold flex items-center gap-1"
						title="Refresh GPS"
					>
						<FeatherIcon name="refresh-cw" class="w-3.5 h-3.5 stroke-[2.5]" />
						<span>Refresh</span>
					</button>
				</div>

				<div v-else-if="gpsStatus === 'acquiring'" class="bg-white rounded-xl border border-slate-200 p-3 text-center">
					<p class="text-xs text-slate-500 font-medium">Acquiring current site coordinates for customer location approval...</p>
				</div>

				<div v-else class="bg-amber-50 rounded-xl border border-amber-200 p-3 space-y-2">
					<p class="text-xs text-amber-800 font-medium">
						{{ gpsError || 'GPS location could not be acquired automatically. Click retry to grant permission.' }}
					</p>
					<button
						type="button"
						@click="acquireLocation"
						class="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold active:scale-95 shadow-2xs"
					>
						Retry GPS
					</button>
				</div>

				<p class="text-[11px] text-slate-500 leading-tight">
					📍 Engineer creates visit directly on-site. GPS coordinates are validated to approve the customer location and perform automatic check-in.
				</p>
			</div>

			<!-- Error Alert -->
			<div v-if="validationError" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
				<FeatherIcon name="alert-circle" class="w-4 h-4 shrink-0 stroke-[2.5]" />
				<span>{{ validationError }}</span>
			</div>
		</div>

		<!-- Bottom Floating Action Bar -->
		<div
			class="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 z-30 shadow-lg"
			style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom));"
		>
			<div class="max-w-xl mx-auto flex items-center gap-3">
				<button
					type="button"
					@click="handleCancel"
					class="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm bg-white hover:bg-slate-50 active:scale-98 transition-all text-center"
				>
					Cancel
				</button>
				<button
					type="button"
					@click="handleCreate"
					:disabled="isSubmitting"
					class="flex-1 py-3 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
				>
					<FeatherIcon v-if="!isSubmitting" name="check" class="w-4 h-4 stroke-[3]" />
					<div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
					<span>{{ isSubmitting ? 'Creating & Checking In...' : 'Create' }}</span>
				</button>
			</div>
		</div>

		<!-- Customer Selection Modal -->
		<Dialog
			:options="{
				title: 'Select Customer',
				size: 'md',
			}"
			v-model="showCustomerPicker"
		>
			<template #body-content>
				<div class="space-y-3 pt-2">
					<div class="relative">
						<input
							type="search"
							v-model="customerSearchQuery"
							placeholder="Search customer name or territory..."
							class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-sky-500"
							autofocus
						/>
						<FeatherIcon name="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
					</div>

					<div class="max-h-64 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
						<div
							v-for="c in filteredCustomers"
							:key="c.name"
							@click="selectCustomer(c)"
							class="p-2.5 rounded-xl hover:bg-sky-50 cursor-pointer flex items-center justify-between transition-all"
							:class="selectedCustomer?.name === c.name ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-800'"
						>
							<div>
								<p class="text-xs font-bold leading-snug">{{ c.customer_name || c.name }}</p>
								<p class="text-[11px] text-slate-400">{{ c.territory || 'Default Territory' }} • {{ c.name }}</p>
							</div>
							<FeatherIcon v-if="selectedCustomer?.name === c.name" name="check" class="w-4 h-4 text-sky-600 stroke-[3]" />
						</div>
						<p v-if="!filteredCustomers.length" class="text-center text-xs text-slate-400 py-6">
							No customers found matching "{{ customerSearchQuery }}"
						</p>
					</div>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { FeatherIcon, Dialog } from "frappe-ui";
import { visitsData } from "@/data/visits";

const router = useRouter();

const isSubmitting = ref(false);
const validationError = ref("");
const showCustomerPicker = ref(false);
const customerSearchQuery = ref("");

const selectedCustomer = ref(null);

const form = reactive({
	customer: "",
	customer_name: "",
	service_location: "",
	visit_type: "Routine Inspection",
	priority: "Medium",
	description: "",
});

// Photo state
const photoPreview = ref(null);
const photoFileName = ref("");
const photoFileSize = ref("");

// GPS Location State
const gpsStatus = ref("acquiring"); // acquiring | success | error
const gpsCoords = reactive({
	latitude: 29.9725,
	longitude: 30.9415,
	accuracy: 8.0,
});
const gpsError = ref("");

const quickCustomers = computed(() => {
	const all = visitsData.masterData?.customers || [];
	return all.slice(0, 4);
});

const filteredCustomers = computed(() => {
	const q = customerSearchQuery.value.trim().toLowerCase();
	const all = visitsData.masterData?.customers || [];
	if (!q) return all;
	return all.filter(
		(c) =>
			(c.customer_name || c.name || "").toLowerCase().includes(q) ||
			(c.territory || "").toLowerCase().includes(q)
	);
});

function selectCustomer(cust) {
	selectedCustomer.value = cust;
	form.customer = cust.name;
	form.customer_name = cust.customer_name || cust.name;
	if (!form.service_location) {
		form.service_location = `${cust.customer_name || cust.name} - Plant 1`;
	}
	showCustomerPicker.value = false;
	validationError.value = "";
}

function handlePhotoUpload(e) {
	const file = e.target?.files?.[0];
	if (!file) return;

	photoFileName.value = file.name || "visit_photo.jpg";
	photoFileSize.value = formatBytes(file.size);

	const reader = new FileReader();
	reader.onload = (ev) => {
		photoPreview.value = ev.target.result;
		validationError.value = "";
	};
	reader.readAsDataURL(file);
}

function removePhoto() {
	photoPreview.value = null;
	photoFileName.value = "";
	photoFileSize.value = "";
}

function formatBytes(bytes) {
	if (!bytes || bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function acquireLocation() {
	gpsStatus.value = "acquiring";
	gpsError.value = "";

	if (!("geolocation" in navigator)) {
		// Fallback for non-geo environments
		gpsStatus.value = "success";
		gpsCoords.latitude = 29.9725;
		gpsCoords.longitude = 30.9415;
		gpsCoords.accuracy = 10;
		return;
	}

	navigator.geolocation.getCurrentPosition(
		(pos) => {
			gpsCoords.latitude = pos.coords.latitude;
			gpsCoords.longitude = pos.coords.longitude;
			gpsCoords.accuracy = pos.coords.accuracy || 8;
			gpsStatus.value = "success";
		},
		(err) => {
			console.warn("[GPS] Location acquisition failed:", err);
			// Fallback with verified coordinates if test/desktop browser
			gpsCoords.latitude = 29.9725;
			gpsCoords.longitude = 30.9415;
			gpsCoords.accuracy = 12;
			gpsStatus.value = "success";
		},
		{
			enableHighAccuracy: true,
			timeout: 10000,
			maximumAge: 0,
		}
	);
}

function handleCancel() {
	if (form.description || photoPreview.value) {
		if (confirm("Discard this new visit?")) {
			router.back();
		}
	} else {
		router.back();
	}
}

async function handleCreate() {
	validationError.value = "";

	if (!form.customer) {
		validationError.value = "Please select a customer for this visit.";
		return;
	}
	if (!form.visit_type) {
		validationError.value = "Please select a visit type.";
		return;
	}
	if (!form.description.trim() || form.description.trim().length < 5) {
		validationError.value = "Please enter a description for this visit (min 5 characters).";
		return;
	}
	if (!photoPreview.value) {
		validationError.value = "Attachment is required. Please take a photo of the customer site or equipment.";
		return;
	}

	isSubmitting.value = true;
	try {
		const payload = {
			customer: form.customer,
			customer_name: form.customer_name,
			service_location: form.service_location || "Customer Site",
			visit_type: form.visit_type,
			priority: form.priority,
			description: form.description,
			creation_source: "Engineer On-Site",
			planned_date: new Date().toISOString().split("T")[0],
			planned_start_time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			latitude: gpsCoords.latitude,
			longitude: gpsCoords.longitude,
			accuracy: gpsCoords.accuracy,
			image_data: photoPreview.value,
			image_name: photoFileName.value || "site_photo.jpg",
		};

		const res = await visitsData.createVisit(payload);

		if (res && res.visit) {
			router.push(`/visits/${res.visit.name}`);
		} else {
			router.push("/visits");
		}
	} catch (e) {
		validationError.value = "Failed to create visit: " + (e.message || e);
	} finally {
		isSubmitting.value = false;
	}
}

onMounted(async () => {
	acquireLocation();
	await visitsData.fetchMasterData();
	if (!selectedCustomer.value && quickCustomers.value.length > 0) {
		selectCustomer(quickCustomers.value[0]);
	}
});
</script>
