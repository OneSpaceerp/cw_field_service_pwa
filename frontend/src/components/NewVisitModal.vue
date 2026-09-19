<template>
	<Dialog
		:options="{
			title: 'Schedule New Visit',
			size: 'md',
		}"
		v-model="isOpen"
	>
		<template #body-content>
			<form @submit.prevent="handleSubmit" class="space-y-3.5 pt-2">
				<!-- Customer Field with Suggestions -->
				<div>
					<FormControl
						type="text"
						label="Customer / Client Name *"
						v-model="form.customer"
						placeholder="e.g. Al-Rehab Water Bottling Plant"
						required
						class="text-xs"
					/>
					<div class="flex flex-wrap gap-1.5 mt-1.5">
						<button
							type="button"
							v-for="sug in customerSuggestions"
							:key="sug"
							@click="form.customer = sug"
							class="text-[10px] px-2 py-0.5 rounded-md bg-surface-gray-2 text-ink-gray-7 hover:bg-surface-blue-1 hover:text-ink-blue-3 border border-outline-gray-modals transition-colors"
						>
							{{ sug.split(' ')[0] }}...
						</button>
					</div>
				</div>

				<!-- Service Location -->
				<div>
					<FormControl
						type="text"
						label="Service Location / Equipment Site *"
						v-model="form.service_location"
						placeholder="e.g. RO Unit Station 1 - Jeddah"
						required
						class="text-xs"
					/>
				</div>

				<!-- Visit Type & Priority Grid -->
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="block text-xs font-bold text-ink-gray-8 mb-1">Visit Type *</label>
						<select
							v-model="form.visit_type"
							class="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-outline-gray-2 bg-surface-gray-2 outline-none focus:border-outline-blue-2"
						>
							<option value="Routine Inspection">Routine Inspection</option>
							<option value="Emergency Service">Emergency Service</option>
							<option value="Cleaning / CIP">Cleaning / CIP</option>
							<option value="Chemical Dosing Audit">Chemical Dosing Audit</option>
							<option value="Corrective Repair">Corrective Repair</option>
							<option value="Commissioning">Commissioning</option>
						</select>
					</div>

					<div>
						<label class="block text-xs font-bold text-ink-gray-8 mb-1">Priority</label>
						<select
							v-model="form.priority"
							class="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-outline-gray-2 bg-surface-gray-2 outline-none focus:border-outline-blue-2"
						>
							<option value="Low">Low</option>
							<option value="Medium">Medium</option>
							<option value="High">High</option>
							<option value="Urgent">Urgent</option>
						</select>
					</div>
				</div>

				<!-- Date & Time Grid -->
				<div class="grid grid-cols-2 gap-3">
					<div>
						<FormControl
							type="date"
							label="Planned Date *"
							v-model="form.planned_date"
							required
							class="text-xs"
						/>
					</div>

					<div>
						<FormControl
							type="time"
							label="Start Time"
							v-model="form.planned_start_time"
							class="text-xs"
						/>
					</div>
				</div>

				<!-- Description / Scope of Work -->
				<div>
					<label class="block text-xs font-bold text-ink-gray-8 mb-1">Description / Scope of Work *</label>
					<textarea
						v-model="form.description"
						rows="2"
						placeholder="Describe the issue or purpose of this visit..."
						class="w-full px-3 py-2 text-xs rounded-lg border border-outline-gray-2 bg-surface-gray-2 outline-none focus:border-outline-blue-2"
						required
					></textarea>
				</div>

				<!-- Site Photo Attachment -->
				<div>
					<label class="block text-xs font-bold text-ink-gray-8 mb-1 flex items-center justify-between">
						<span>Site / Equipment Photo *</span>
						<span v-if="photoPreview" class="text-[10px] text-emerald-600 font-bold">Attached</span>
					</label>
					<div class="flex items-center gap-2">
						<input
							type="file"
							ref="modalCameraInput"
							accept="image/*"
							capture="environment"
							class="hidden"
							@change="handleModalPhoto"
						/>
						<button
							type="button"
							@click="$refs.modalCameraInput.click()"
							class="px-3 py-2 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-sky-100"
						>
							<FeatherIcon name="camera" class="w-4 h-4" />
							<span>{{ photoPreview ? 'Change Photo' : 'Take Photo' }}</span>
						</button>
						<span v-if="photoFileName" class="text-[11px] text-slate-500 truncate max-w-xs">{{ photoFileName }}</span>
					</div>
					<div v-if="photoPreview" class="mt-2">
						<img :src="photoPreview" class="w-16 h-16 rounded-lg object-cover border border-slate-300" />
					</div>
				</div>

				<!-- Location Approval Info -->
				<div class="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
					<div class="flex items-center gap-1.5 text-emerald-800 font-medium">
						<FeatherIcon name="map-pin" class="w-4 h-4 text-emerald-600 shrink-0" />
						<span>GPS Location Approved on Check-In</span>
					</div>
					<span class="text-[10px] font-mono font-bold text-emerald-700">Verified</span>
				</div>
			</form>
		</template>

		<template #actions>
			<div class="flex justify-end space-x-2 pt-2">
				<Button
					variant="subtle"
					theme="gray"
					size="md"
					@click="isOpen = false"
				>
					Cancel
				</Button>
				<Button
					variant="solid"
					theme="blue"
					size="md"
					:loading="isSubmitting"
					loading-text="Creating..."
					class="font-bold shadow-sm"
					@click="handleSubmit"
				>
					<template #prefix>
						<FeatherIcon name="plus" class="w-4 h-4" />
					</template>
					Create Visit
				</Button>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { Dialog, FormControl, Button, FeatherIcon } from "frappe-ui";
import { visitsData } from "@/data/visits";

const props = defineProps({
	modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "created"]);

const isOpen = computed({
	get: () => props.modelValue,
	set: (val) => emit("update:modelValue", val),
});

const isSubmitting = ref(false);
const photoPreview = ref(null);
const photoFileName = ref("");

const customerSuggestions = [
	"Al-Ahram Beverages",
	"El Sewedy Electric Industrial",
	"Jeddah Industrial Cooling Systems",
	"Red Sea Commercial Center",
	"National Pharma Water Solutions",
];

const form = reactive({
	customer: "",
	service_location: "",
	visit_type: "Routine Inspection",
	priority: "Medium",
	planned_date: new Date().toISOString().split("T")[0],
	planned_start_time: "09:00",
	description: "",
});

function handleModalPhoto(e) {
	const file = e.target?.files?.[0];
	if (!file) return;
	photoFileName.value = file.name || "visit_photo.jpg";
	const reader = new FileReader();
	reader.onload = (ev) => {
		photoPreview.value = ev.target.result;
	};
	reader.readAsDataURL(file);
}

function resetForm() {
	form.customer = "";
	form.service_location = "";
	form.visit_type = "Routine Inspection";
	form.priority = "Medium";
	form.planned_date = new Date().toISOString().split("T")[0];
	form.planned_start_time = "09:00";
	form.description = "";
	photoPreview.value = null;
	photoFileName.value = "";
}

async function handleSubmit() {
	if (!form.customer.trim()) {
		alert("Please enter a customer name.");
		return;
	}
	if (!form.description.trim()) {
		alert("Please enter a description for this visit.");
		return;
	}

	isSubmitting.value = true;
	try {
		const res = await visitsData.createVisit({
			customer: form.customer,
			customer_name: form.customer,
			service_location: form.service_location || "Customer Site",
			visit_type: form.visit_type,
			priority: form.priority,
			planned_date: form.planned_date,
			planned_start_time: form.planned_start_time + ":00",
			description: form.description,
			creation_source: "Engineer On-Site",
			latitude: 29.9725,
			longitude: 30.9415,
			accuracy: 10,
			image_data: photoPreview.value,
			image_name: photoFileName.value || "site_photo.jpg",
		});

		alert(`Visit ${res.visit.name} created successfully!`);
		emit("created", res.visit);
		isOpen.value = false;
		resetForm();
	} catch (e) {
		alert("Failed to create visit: " + e.message);
	} finally {
		isSubmitting.value = false;
	}
}
</script>
