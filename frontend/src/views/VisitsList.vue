<template>
	<BaseLayout title="Service Visits" :onRefresh="refreshData">
		<MobileHeader />

		<div class="px-4 py-3 space-y-3">
			<!-- Search Bar -->
			<div class="relative">
				<input
					type="text"
					v-model="searchQuery"
					placeholder="Search customer, location, or ID..."
					class="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 shadow-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
				/>
				<svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" viewBox="0 0 24 24" fill="currentColor">
					<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
				</svg>
			</div>

			<!-- Filter Chips -->
			<div class="flex space-x-2 overflow-x-auto no-scrollbar py-1">
				<button
					v-for="chip in filterChips"
					:key="chip"
					@click="activeFilter = chip"
					class="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-xs"
					:class="activeFilter === chip ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
				>
					{{ chip }}
				</button>
			</div>

			<!-- Visits List -->
			<div v-if="filteredVisits.length" class="space-y-3 pt-1">
				<div
					v-for="v in filteredVisits"
					:key="v.name"
					@click="$router.push(`/visits/${v.name}`)"
					class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 active:scale-98 transition-all cursor-pointer"
				>
					<div class="flex justify-between items-start mb-2">
						<div>
							<h4 class="font-bold text-slate-900 text-sm">{{ v.customer_name || v.customer }}</h4>
							<p class="text-xs text-slate-500 mt-0.5">{{ v.service_location }} &bull; {{ v.visit_type || "Routine" }}</p>
						</div>
						<StatusBadge :status="v.visit_status" />
					</div>

					<div class="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
						<span>Planned: {{ v.planned_date }}</span>
						<span class="text-sky-600 font-bold flex items-center">
							Open &rarr;
						</span>
					</div>
				</div>
			</div>

			<div v-else class="text-center py-12 bg-white rounded-2xl border border-slate-200">
				<p class="text-sm font-semibold text-slate-500">No visits found</p>
				<p class="text-xs text-slate-400 mt-1">Try changing your search or filter</p>
			</div>
		</div>

		<BottomTabs />
	</BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import BaseLayout from "@/components/BaseLayout.vue";
import MobileHeader from "@/components/MobileHeader.vue";
import BottomTabs from "@/components/BottomTabs.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import { visitsData } from "@/data/visits";

const route = useRoute();
const searchQuery = ref("");
const activeFilter = ref("All");
const filterChips = ["All", "Scheduled", "In Progress", "Pending Review", "Approved"];

onMounted(() => {
	if (route.query.status) {
		activeFilter.value = route.query.status;
	}
});

const filteredVisits = computed(() => {
	let list = visitsData.visits || [];
	if (activeFilter.value !== "All") {
		list = list.filter((v) => v.visit_status === activeFilter.value);
	}
	if (searchQuery.value.trim()) {
		const q = searchQuery.value.toLowerCase();
		list = list.filter(
			(v) =>
				(v.customer_name && v.customer_name.toLowerCase().includes(q)) ||
				(v.customer && v.customer.toLowerCase().includes(q)) ||
				(v.service_location && v.service_location.toLowerCase().includes(q)) ||
				(v.name && v.name.toLowerCase().includes(q))
		);
	}
	return list;
});

async function refreshData() {
	await visitsData.fetchVisits();
}
</script>
