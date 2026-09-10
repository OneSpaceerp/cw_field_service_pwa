<template>
	<span
		class="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border shadow-xs"
		:class="badgeClass"
	>
		{{ status }}
	</span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
	status: { type: String, default: "" },
});

const badgeClass = computed(() => {
	const s = (props.status || "").toLowerCase();
	if (s.includes("scheduled")) {
		return "bg-sky-50 text-sky-700 border-sky-200";
	}
	if (s.includes("in progress")) {
		return "bg-amber-50 text-amber-700 border-amber-200";
	}
	if (s.includes("pending")) {
		return "bg-purple-50 text-purple-700 border-purple-200";
	}
	if (s.includes("approved") || s.includes("completed") || s.includes("verified")) {
		return "bg-emerald-50 text-emerald-700 border-emerald-200";
	}
	if (s.includes("warning")) {
		return "bg-amber-50 text-amber-700 border-amber-200";
	}
	if (s.includes("exception") || s.includes("fail") || s.includes("critical")) {
		return "bg-rose-50 text-rose-700 border-rose-200";
	}
	return "bg-slate-100 text-slate-600 border-slate-200";
});
</script>
