<template>
	<div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs mb-3">
		<h4 class="text-sm font-semibold text-slate-800 mb-2">{{ item.item_description }}</h4>
		<div class="grid grid-cols-3 gap-2 mb-2.5">
			<button
				type="button"
				@click="setStatus('Pass')"
				class="py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors"
				:class="item.status === 'Pass' ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
			>
				Pass
			</button>
			<button
				type="button"
				@click="setStatus('Fail')"
				class="py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors"
				:class="item.status === 'Fail' ? 'bg-rose-500 text-white border-rose-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
			>
				Fail
			</button>
			<button
				type="button"
				@click="setStatus('N/A')"
				class="py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors"
				:class="item.status === 'N/A' ? 'bg-slate-600 text-white border-slate-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
			>
				N/A
			</button>
		</div>
		<input
			type="text"
			v-model="item.remarks"
			placeholder="Remarks / corrective note..."
			class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 outline-none"
		/>
	</div>
</template>

<script setup>
const props = defineProps({
	item: { type: Object, required: true },
});

function setStatus(s) {
	props.item.status = s;
}
</script>
