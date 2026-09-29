<template>
	<div class="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 transition-all hover:bg-slate-50 space-y-2">
		<div class="flex items-start justify-between gap-2">
			<div>
				<div class="flex items-center gap-2">
					<h4 class="text-xs font-extrabold text-slate-900">
						{{ reading.parameter_name || reading.parameter }}
					</h4>
					<span
						class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
						:class="statusBadgeClass"
					>
						{{ statusLabel }}
					</span>
				</div>
				<p class="text-[11px] text-slate-500 font-medium mt-0.5">
					Target Range: <span class="font-bold text-slate-700">{{ displayMin }} - {{ displayMax }} {{ reading.unit || '' }}</span>
				</p>
			</div>

			<button
				v-if="allowRemove"
				type="button"
				@click="$emit('remove')"
				class="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
				title="Remove parameter"
			>
				<FeatherIcon name="trash-2" class="w-3.5 h-3.5" />
			</button>
		</div>

		<div class="grid grid-cols-12 gap-2 items-center">
			<div class="col-span-5 sm:col-span-4">
				<label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Measured Value</label>
				<div class="relative">
					<input
						type="number"
						step="0.01"
						v-model="reading.reading_value"
						@input="updateStatus"
						:placeholder="reading.unit || '0.00'"
						class="w-full px-3 py-2 text-right font-bold rounded-xl border text-xs transition-colors outline-none focus:ring-2 focus:ring-sky-500 bg-white"
						:class="inputValidationClass"
					/>
					<span class="absolute left-2.5 top-2 text-[10px] font-bold text-slate-400 pointer-events-none">
						{{ reading.unit || '' }}
					</span>
				</div>
			</div>

			<div class="col-span-7 sm:col-span-8">
				<label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Observation / Remarks</label>
				<input
					type="text"
					v-model="reading.remarks"
					placeholder="e.g. In range, dosing stable"
					class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-sky-500 text-slate-800"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from "vue";
import { FeatherIcon } from "frappe-ui";

const props = defineProps({
	reading: { type: Object, required: true },
	allowRemove: { type: Boolean, default: true },
});

defineEmits(["remove"]);

const displayMin = computed(() => {
	if (props.reading.min_range != null) return props.reading.min_range;
	if (props.reading.min_value != null) return props.reading.min_value;
	return "0";
});

const displayMax = computed(() => {
	if (props.reading.max_range != null) return props.reading.max_range;
	if (props.reading.max_value != null) return props.reading.max_value;
	return "-";
});

const parsedValue = computed(() => {
	const val = parseFloat(props.reading.reading_value);
	return isNaN(val) ? null : val;
});

const isOutOfRange = computed(() => {
	if (parsedValue.value === null) return false;
	const min = parseFloat(displayMin.value);
	const max = parseFloat(displayMax.value);
	if (!isNaN(min) && parsedValue.value < min) return true;
	if (!isNaN(max) && parsedValue.value > max) return true;
	return false;
});

const statusLabel = computed(() => {
	if (parsedValue.value === null || props.reading.reading_value === "") {
		return "Pending Test";
	}
	return isOutOfRange.value ? "Out of Range ⚠" : "Normal ✓";
});

const statusBadgeClass = computed(() => {
	if (parsedValue.value === null || props.reading.reading_value === "") {
		return "bg-slate-100 text-slate-600 border-slate-200";
	}
	return isOutOfRange.value
		? "bg-rose-100 text-rose-800 border-rose-200 font-extrabold"
		: "bg-emerald-100 text-emerald-800 border-emerald-200 font-extrabold";
});

const inputValidationClass = computed(() => {
	if (parsedValue.value === null || props.reading.reading_value === "") {
		return "border-slate-300 text-slate-800";
	}
	return isOutOfRange.value
		? "border-rose-400 bg-rose-50/50 text-rose-900"
		: "border-emerald-400 bg-emerald-50/50 text-emerald-900";
});

function updateStatus() {
	if (parsedValue.value !== null) {
		props.reading.status = isOutOfRange.value ? "Warning" : "Normal";
	}
}
</script>
