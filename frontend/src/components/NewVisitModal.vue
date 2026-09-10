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

				<!-- Site Notes -->
				<div>
					<label class="block text-xs font-bold text-ink-gray-8 mb-1">Instructions / Notes</label>
					<textarea
						v-model="form.instructions"
						rows="2"
						placeholder="Optional instructions, PPE requirements, or customer notes..."
						class="w-full px-3 py-2 text-xs rounded-lg border border-outline-gray-2 bg-surface-gray-2 outline-none focus:border-outline-blue-2"
					></textarea>
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
					Schedule Visit
				</Button>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
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

const customerSuggestions = [
	"Al-Rehab Water Bottling Plant",
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
	instructions: "",
});

function resetForm() {
	form.customer = "";
	form.service_location = "";
	form.visit_type = "Routine Inspection";
	form.priority = "Medium";
	form.planned_date = new Date().toISOString().split("T")[0];
	form.planned_start_time = "09:00";
	form.instructions = "";
}

async function handleSubmit() {
	if (!form.customer.trim()) {
		alert("Please enter a customer name.");
		return;
	}
	if (!form.service_location.trim()) {
		alert("Please enter the service location.");
		return;
	}

	isSubmitting.value = true;
	try {
		const res = await visitsData.createVisit({
			customer: form.customer,
			customer_name: form.customer,
			service_location: form.service_location,
			visit_type: form.visit_type,
			priority: form.priority,
			planned_date: form.planned_date,
			planned_start_time: form.planned_start_time + ":00",
			instructions: form.instructions,
		});

		alert(`Visit ${res.visit.name} scheduled successfully!`);
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
