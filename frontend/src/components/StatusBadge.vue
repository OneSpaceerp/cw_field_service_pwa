<template>
	<Badge
		:theme="badgeTheme"
		:size="size"
		:variant="variant"
		:label="status"
		class="font-semibold uppercase tracking-wider"
	/>
</template>

<script setup>
import { computed } from "vue";
import { Badge } from "frappe-ui";

const props = defineProps({
	status: { type: String, default: "" },
	size: { type: String, default: "md" },
	variant: { type: String, default: "subtle" },
});

const badgeTheme = computed(() => {
	const s = (props.status || "").toLowerCase();
	if (s.includes("scheduled") || s.includes("routine")) {
		return "blue";
	}
	if (s.includes("in progress") || s.includes("warning") || s.includes("medium")) {
		return "orange";
	}
	if (s.includes("approved") || s.includes("completed") || s.includes("verified") || s.includes("pass")) {
		return "green";
	}
	if (s.includes("exception") || s.includes("fail") || s.includes("critical") || s.includes("urgent") || s.includes("high")) {
		return "red";
	}
	return "gray";
});
</script>
