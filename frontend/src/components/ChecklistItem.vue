<template>
	<div class="bg-surface-white p-3.5 rounded-xl border border-outline-gray-1 shadow-xs mb-3">
		<h4 class="text-sm font-semibold text-ink-gray-9 mb-2">{{ item.item_description }}</h4>
		<div class="grid grid-cols-3 gap-2 mb-2.5">
			<Button
				type="button"
				:variant="item.status === 'Pass' ? 'solid' : 'subtle'"
				theme="green"
				size="sm"
				class="justify-center !rounded-lg text-xs font-bold"
				@click="setStatus('Pass')"
			>
				Pass
			</Button>
			<Button
				type="button"
				:variant="item.status === 'Fail' ? 'solid' : 'subtle'"
				theme="red"
				size="sm"
				class="justify-center !rounded-lg text-xs font-bold"
				@click="setStatus('Fail')"
			>
				Fail
			</Button>
			<Button
				type="button"
				:variant="item.status === 'N/A' ? 'solid' : 'subtle'"
				theme="gray"
				size="sm"
				class="justify-center !rounded-lg text-xs font-bold"
				@click="setStatus('N/A')"
			>
				N/A
			</Button>
		</div>
		<input
			type="text"
			v-model="item.remarks"
			placeholder="Remarks / corrective note..."
			class="w-full px-3 py-1.5 text-xs rounded-lg border border-outline-gray-2 bg-surface-gray-2 focus:bg-surface-white focus:border-outline-blue-2 outline-none"
		/>
	</div>
</template>

<script setup>
import { Button } from "frappe-ui";

const props = defineProps({
	item: { type: Object, required: true },
});

function setStatus(s) {
	props.item.status = s;
}
</script>
