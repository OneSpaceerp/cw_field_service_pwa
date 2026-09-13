<template>
	<div class="px-4 py-3 space-y-3 max-w-xl mx-auto">
		<!-- Search & New Visit Top Bar -->
		<div class="flex items-center space-x-2">
			<div class="relative flex-1">
				<TextInput
					type="search"
					v-model="searchQuery"
					placeholder="Search customer, plant, or ID..."
					class="w-full text-xs"
				>
					<template #prefix>
						<FeatherIcon name="search" class="w-4 h-4 text-ink-gray-4" />
					</template>
				</TextInput>
			</div>

			<Button
				variant="solid"
				theme="blue"
				size="md"
				class="!rounded-xl font-bold shadow-xs flex-shrink-0 flex items-center gap-1.5"
				@click="showNewModal = true"
			>
				<template #prefix>
					<FeatherIcon name="plus" class="w-4 h-4 stroke-[2.5]" />
				</template>
				<span>New Visit</span>
			</Button>
		</div>

		<!-- Filter Chips Carousel -->
		<div class="flex space-x-2 overflow-x-auto no-scrollbar py-1">
			<Button
				v-for="chip in filterChips"
				:key="chip"
				:variant="activeFilter === chip ? 'solid' : 'subtle'"
				:theme="activeFilter === chip ? 'blue' : 'gray'"
				size="sm"
				class="!rounded-full whitespace-nowrap text-xs font-semibold px-3"
				@click="activeFilter = chip"
			>
				{{ chip }}
			</Button>
		</div>

		<!-- Visits List -->
		<div v-if="filteredVisits.length" class="space-y-3 pt-1">
			<div
				v-for="v in filteredVisits"
				:key="v.name"
				@click="$router.push(`/visits/${v.name}`)"
				class="p-4 bg-surface-white rounded-2xl border border-outline-gray-1 shadow-xs hover:border-sky-300 active:scale-98 transition-all cursor-pointer"
			>
				<!-- Card Top: Customer, Location & Status -->
				<div class="flex justify-between items-start mb-2.5">
					<div class="pr-2">
						<h4 class="font-bold text-ink-gray-9 text-sm leading-snug">{{ v.customer_name || v.customer }}</h4>
						<p class="text-xs text-ink-gray-5 mt-0.5 flex items-center gap-1">
							<FeatherIcon name="map-pin" class="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
							<span class="truncate">{{ v.service_location }}</span>
						</p>
					</div>
					<StatusBadge :status="v.visit_status" />
				</div>

				<!-- Card Middle: Visit Type & Priority Tags -->
				<div class="flex items-center space-x-2 mb-2.5">
					<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
						{{ v.visit_type || "Routine Inspection" }}
					</span>
					<span
						class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold"
						:class="{
							'bg-red-50 text-red-700': v.priority === 'Urgent',
							'bg-orange-50 text-orange-700': v.priority === 'High',
							'bg-blue-50 text-blue-700': v.priority === 'Medium',
							'bg-slate-100 text-slate-600': v.priority === 'Low' || !v.priority,
						}"
					>
						{{ v.priority || "Medium" }} Priority
					</span>
				</div>

				<!-- Card Footer: Planned Date & Open Action -->
				<div class="flex justify-between items-center text-xs text-ink-gray-5 pt-2.5 border-t border-outline-gray-1">
					<span class="flex items-center gap-1.5">
						<FeatherIcon name="calendar" class="w-3.5 h-3.5 text-ink-gray-4" />
						<span>Planned: <strong class="text-ink-gray-7">{{ v.planned_date }}</strong></span>
					</span>
					<span class="text-sky-600 font-bold flex items-center gap-1">
						<span>Open</span>
						<FeatherIcon name="chevron-right" class="w-3.5 h-3.5" />
					</span>
				</div>
			</div>
		</div>

		<!-- Empty State -->
		<div v-else class="text-center py-16 bg-surface-white rounded-2xl border border-outline-gray-1 p-6">
			<div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
				<FeatherIcon name="inbox" class="w-6 h-6" />
			</div>
			<h4 class="text-sm font-bold text-ink-gray-9">No visits found</h4>
			<p class="text-xs text-ink-gray-5 mt-1 mb-4">
				{{ searchQuery ? "No visits match your search criteria." : "No visits in this status category." }}
			</p>
			<Button
				variant="solid"
				theme="blue"
				size="sm"
				class="!rounded-xl font-bold mx-auto flex items-center gap-1"
				@click="showNewModal = true"
			>
				<template #prefix>
					<FeatherIcon name="plus" class="w-3.5 h-3.5" />
				</template>
				<span>Schedule New Visit</span>
			</Button>
		</div>

		<!-- New Visit Modal -->
		<NewVisitModal
			v-model="showNewModal"
			@created="handleCreated"
		/>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button, FeatherIcon, TextInput } from "frappe-ui";
import StatusBadge from "@/components/StatusBadge.vue";
import NewVisitModal from "@/components/NewVisitModal.vue";
import { visitsData } from "@/data/visits";

const route = useRoute();
const router = useRouter();

const searchQuery = ref("");
const activeFilter = ref("All");
const filterChips = ["All", "Scheduled", "In Progress", "Pending Review", "Approved"];
const showNewModal = ref(false);

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

function handleCreated(newVisit) {
	activeFilter.value = "All";
	if (confirm(`Visit ${newVisit.name} created! Open and inspect it now?`)) {
		router.push(`/visits/${newVisit.name}`);
	}
}
</script>
