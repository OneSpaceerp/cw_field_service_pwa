<template>
	<div
		class="p-3.5 rounded-2xl border transition-all space-y-2.5"
		:class="{
			'bg-emerald-50/40 border-emerald-200': currentStatus === 'Pass',
			'bg-rose-50/40 border-rose-200': currentStatus === 'Fail',
			'bg-slate-50 border-slate-200': currentStatus === 'N/A' || !currentStatus,
		}"
	>
		<div class="flex items-start justify-between gap-2">
			<div class="space-y-0.5">
				<div class="flex items-center gap-1.5 flex-wrap">
					<h4 class="text-xs font-bold text-slate-900 leading-snug">
						{{ item.checklist_item || item.item_description }}
					</h4>
					<span
						v-if="item.is_mandatory"
						class="text-[9px] font-bold text-rose-600 bg-rose-100/80 px-1.5 py-0.5 rounded"
					>
						Required
					</span>
				</div>
			</div>

			<button
				v-if="allowRemove"
				type="button"
				@click="$emit('remove')"
				class="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
				title="Remove checklist item"
			>
				<FeatherIcon name="trash-2" class="w-3.5 h-3.5" />
			</button>
		</div>

		<!-- 3-State Response Toggle -->
		<div class="grid grid-cols-3 gap-2">
			<button
				type="button"
				@click="setStatus('Pass')"
				class="py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 border"
				:class="currentStatus === 'Pass'
					? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
					: 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'"
			>
				<FeatherIcon name="check" class="w-3.5 h-3.5 stroke-[3]" />
				<span>Pass</span>
			</button>

			<button
				type="button"
				@click="setStatus('Fail')"
				class="py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 border"
				:class="currentStatus === 'Fail'
					? 'bg-rose-600 text-white border-rose-600 shadow-sm'
					: 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700'"
			>
				<FeatherIcon name="x" class="w-3.5 h-3.5 stroke-[3]" />
				<span>Fail</span>
			</button>

			<button
				type="button"
				@click="setStatus('N/A')"
				class="py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 border"
				:class="currentStatus === 'N/A'
					? 'bg-slate-700 text-white border-slate-700 shadow-sm'
					: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'"
			>
				<span>N/A</span>
			</button>
		</div>

		<!-- Remarks Input -->
		<div class="pt-0.5">
			<input
				type="text"
				v-model="item.remarks"
				:placeholder="currentStatus === 'Fail' ? 'Required: Enter failure reason / corrective action...' : 'Optional inspection note...'"
				class="w-full px-3 py-1.5 text-xs rounded-xl border bg-white outline-none focus:border-sky-500 transition-colors"
				:class="currentStatus === 'Fail' && !item.remarks ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200 text-slate-800'"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed } from "vue";
import { FeatherIcon } from "frappe-ui";

const props = defineProps({
	item: { type: Object, required: true },
	allowRemove: { type: Boolean, default: false },
});

defineEmits(["remove"]);

const currentStatus = computed(() => {
	return props.item.response || props.item.status || "Pass";
});

function setStatus(s) {
	props.item.response = s;
	props.item.status = s;
}
</script>
