<template>
	<BaseLayout title="Service Visits" :onRefresh="refreshData">
		<MobileHeader />

		<div class="px-4 py-3 space-y-3">
			<!-- Search & New Visit Bar -->
			<div class="flex items-center space-x-2">
				<div class="relative flex-1">
					<TextInput
						type="search"
						v-model="searchQuery"
						placeholder="Search customer, site, or ID..."
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
					class="!rounded-xl font-bold shadow-xs flex-shrink-0"
					@click="showNewModal = true"
				>
					<template #prefix>
						<FeatherIcon name="plus" class="w-4 h-4" />
					</template>
					New Visit
				</Button>
			</div>

			<!-- Filter Chips -->
			<div class="flex space-x-2 overflow-x-auto no-scrollbar py-1">
				<Button
					v-for="chip in filterChips"
					:key="chip"
					:variant="activeFilter === chip ? 'solid' : 'subtle'"
					:theme="activeFilter === chip ? 'blue' : 'gray'"
					size="sm"
					class="!rounded-full whitespace-nowrap text-xs font-semibold"
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
					class="p-4 bg-surface-white rounded-2xl border border-outline-gray-1 shadow-xs hover:border-outline-blue-2 active:scale-98 transition-all cursor-pointer"
				>
					<div class="flex justify-between items-start mb-2">
						<div>
							<h4 class="font-bold text-ink-gray-9 text-sm">{{ v.customer_name || v.customer }}</h4>
							<p class="text-xs text-ink-gray-5 mt-0.5 flex items-center gap-1">
								<FeatherIcon name="map-pin" class="w-3.5 h-3.5 text-ink-gray-4" />
								<span>{{ v.service_location }} &bull; {{ v.visit_type || "Routine" }}</span>
							</p>
						</div>
						<StatusBadge :status="v.visit_status" />
					</div>

					<div class="flex justify-between items-center text-xs text-ink-gray-5 pt-2.5 border-t border-outline-gray-modals">
						<span class="flex items-center gap-1">
							<FeatherIcon name="calendar" class="w-3.5 h-3.5 text-ink-gray-4" />
							Planned: {{ v.planned_date }}
						</span>
						<span class="text-ink-blue-3 font-bold flex items-center gap-1">
							Open <FeatherIcon name="chevron-right" class="w-3.5 h-3.5" />
						</span>
					</div>
				</div>
			</div>

			<div v-else class="text-center py-12 bg-surface-white rounded-2xl border border-outline-gray-1">
				<FeatherIcon name="inbox" class="w-10 h-10 text-ink-gray-4 mx-auto mb-2" />
				<p class="text-sm font-semibold text-ink-gray-7">No visits found</p>
				<p class="text-xs text-ink-gray-4 mt-1 mb-3">Try changing your search or schedule a new visit</p>
				<Button
					variant="solid"
					theme="blue"
					size="sm"
					class="!rounded-xl font-bold mx-auto"
					@click="showNewModal = true"
				>
					<template #prefix>
						<FeatherIcon name="plus" class="w-3.5 h-3.5" />
					</template>
					Schedule New Visit
				</Button>
			</div>
		</div>

		<NewVisitModal v-model="showNewModal" @created="onVisitCreated" />
		<BottomTabs />
	</BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { TextInput, Button, FeatherIcon } from "frappe-ui";
import BaseLayout from "@/components/BaseLayout.vue";
import MobileHeader from "@/components/MobileHeader.vue";
import BottomTabs from "@/components/BottomTabs.vue";
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

async function refreshData() {
	await visitsData.fetchVisits();
}

function onVisitCreated(visit) {
	activeFilter.value = "All";
	if (confirm(`Visit ${visit.name} created! Do you want to open and execute it now?`)) {
		router.push(`/visits/${visit.name}`);
	}
}
</script>
