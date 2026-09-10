<template>
	<div class="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
		<div class="flex flex-col pr-2">
			<span class="text-sm font-bold text-slate-800">{{ reading.parameter_name || reading.parameter }}</span>
			<span class="text-xs text-slate-500">
				Standard: {{ reading.min_value ?? "-" }} - {{ reading.max_value ?? "-" }} {{ reading.unit || "" }}
			</span>
		</div>
		<div class="w-28 relative">
			<input
				type="number"
				step="0.01"
				v-model="reading.reading_value"
				:placeholder="reading.unit || 'value'"
				class="w-full px-3 py-2 text-right font-bold rounded-lg border text-sm transition-colors outline-none focus:ring-2 focus:ring-sky-500"
				:class="validationClass"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
	reading: { type: Object, required: true },
});

const validationClass = computed(() => {
	const val = parseFloat(props.reading.reading_value);
	if (isNaN(val) || props.reading.reading_value === "") {
		return "bg-white border-slate-300 text-slate-800";
	}
	const isMinViolated = props.reading.min_value != null && val < props.reading.min_value;
	const isMaxViolated = props.reading.max_value != null && val > props.reading.max_value;

	if (isMinViolated || isMaxViolated) {
		return "bg-rose-50 border-rose-500 text-rose-700 font-extrabold";
	}
	return "bg-emerald-50 border-emerald-500 text-emerald-800 font-extrabold";
});
</script>
