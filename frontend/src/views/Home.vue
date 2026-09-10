<template>
	<BaseLayout title="C-Water Service" :onRefresh="refreshData">
		<MobileHeader />

		<div class="px-4 py-3 space-y-4">
			<div>
				<h2 class="text-xl font-extrabold text-ink-gray-9">Welcome, {{ session.userFullName }}</h2>
				<p class="text-xs text-ink-gray-5">Today's operational field summary</p>
			</div>

			<!-- KPI Cards Grid -->
			<div class="grid grid-cols-2 gap-3">
				<div
					@click="$router.push('/visits?status=Scheduled')"
					class="p-3.5 rounded-2xl bg-surface-blue-1 border-l-4 border-l-surface-blue-3 border border-outline-blue-1 shadow-sm active:scale-98 transition-transform cursor-pointer"
				>
					<div class="flex items-center justify-between">
						<span class="text-[11px] font-bold text-ink-blue-3 tracking-wider">SCHEDULED</span>
						<FeatherIcon name="calendar" class="w-4 h-4 text-ink-blue-3" />
					</div>
					<div class="text-2xl font-extrabold text-ink-blue-3 mt-1.5">{{ counts.scheduled }}</div>
				</div>

				<div
					@click="$router.push('/visits?status=In Progress')"
					class="p-3.5 rounded-2xl bg-surface-amber-1 border-l-4 border-l-surface-amber-3 border border-outline-amber-2 shadow-sm active:scale-98 transition-transform cursor-pointer"
				>
					<div class="flex items-center justify-between">
						<span class="text-[11px] font-bold text-ink-amber-3 tracking-wider">IN PROGRESS</span>
						<FeatherIcon name="activity" class="w-4 h-4 text-ink-amber-3" />
					</div>
					<div class="text-2xl font-extrabold text-ink-amber-3 mt-1.5">{{ counts.inProgress }}</div>
				</div>

				<div
					@click="$router.push('/visits?status=Pending Review')"
					class="p-3.5 rounded-2xl bg-purple-50 border-l-4 border-l-purple-500 border border-purple-200 shadow-sm active:scale-98 transition-transform cursor-pointer"
				>
					<div class="flex items-center justify-between">
						<span class="text-[11px] font-bold text-purple-700 tracking-wider">PENDING REVIEW</span>
						<FeatherIcon name="clock" class="w-4 h-4 text-purple-600" />
					</div>
					<div class="text-2xl font-extrabold text-purple-700 mt-1.5">{{ counts.pending }}</div>
				</div>

				<div
					@click="$router.push('/visits?status=Approved')"
					class="p-3.5 rounded-2xl bg-surface-green-2 border-l-4 border-l-surface-green-3 border border-outline-green-2 shadow-sm active:scale-98 transition-transform cursor-pointer"
				>
					<div class="flex items-center justify-between">
						<span class="text-[11px] font-bold text-ink-green-3 tracking-wider">COMPLETED</span>
						<FeatherIcon name="check-circle" class="w-4 h-4 text-ink-green-3" />
					</div>
					<div class="text-2xl font-extrabold text-ink-green-3 mt-1.5">{{ counts.completed }}</div>
				</div>
			</div>

			<!-- Active / Next Assignment Spotlight -->
			<div>
				<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider mb-2">Active / Next Assignment</h3>
				<div v-if="nextVisit" class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-sm">
					<div class="flex justify-between items-start mb-2">
						<div>
							<h4 class="font-bold text-ink-gray-9 text-sm">{{ nextVisit.customer_name || nextVisit.customer }}</h4>
							<p class="text-xs text-ink-gray-5 mt-0.5 flex items-center gap-1">
								<FeatherIcon name="map-pin" class="w-3.5 h-3.5 text-ink-gray-4" />
								<span>{{ nextVisit.service_location }}</span>
							</p>
						</div>
						<StatusBadge :status="nextVisit.visit_status" />
					</div>

					<p class="text-xs text-ink-gray-6 mb-3 flex items-center gap-1.5">
						<FeatherIcon name="clock" class="w-3.5 h-3.5 text-ink-gray-4" />
						<span><strong class="font-semibold text-ink-gray-7">Planned:</strong> {{ nextVisit.planned_date }} {{ nextVisit.planned_start_time || "" }}</span>
					</p>

					<Button
						variant="solid"
						theme="blue"
						size="md"
						class="w-full justify-center !rounded-xl !py-2.5 font-bold shadow-sm"
						@click="$router.push(`/visits/${nextVisit.name}`)"
					>
						<template #prefix>
							<FeatherIcon name="arrow-right-circle" class="w-4 h-4" />
						</template>
						{{ nextVisit.visit_status === "In Progress" ? "Continue Inspection" : "Start Visit & Check-In" }}
					</Button>
				</div>
				<div v-else class="bg-surface-white p-6 rounded-2xl border border-outline-gray-1 text-center text-ink-gray-4 text-xs">
					No active or scheduled visits for today.
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="grid grid-cols-2 gap-3 pt-1">
				<Button
					variant="subtle"
					theme="gray"
					size="lg"
					class="w-full justify-center !rounded-xl !bg-surface-white !border !border-outline-gray-1 shadow-xs text-xs font-bold"
					@click="$router.push('/visits')"
				>
					<template #prefix>
						<FeatherIcon name="list" class="w-4 h-4 text-ink-blue-2" />
					</template>
					All Visits
				</Button>
				<Button
					variant="subtle"
					theme="gray"
					size="lg"
					class="w-full justify-center !rounded-xl !bg-surface-white !border !border-outline-gray-1 shadow-xs text-xs font-bold"
					@click="$router.push('/sync-queue')"
				>
					<template #prefix>
						<FeatherIcon name="refresh-cw" class="w-4 h-4 text-ink-blue-2" />
					</template>
					Sync Queue
				</Button>
			</div>
		</div>

		<BottomTabs />
	</BaseLayout>
</template>

<script setup>
import { computed } from "vue";
import { Button, FeatherIcon } from "frappe-ui";
import BaseLayout from "@/components/BaseLayout.vue";
import MobileHeader from "@/components/MobileHeader.vue";
import BottomTabs from "@/components/BottomTabs.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import { session } from "@/data/session";
import { visitsData } from "@/data/visits";

const counts = computed(() => {
	const list = visitsData.visits || [];
	return {
		scheduled: list.filter((v) => v.visit_status === "Scheduled").length,
		inProgress: list.filter((v) => v.visit_status === "In Progress").length,
		pending: list.filter((v) => v.visit_status === "Pending Review").length,
		completed: list.filter((v) => v.visit_status === "Approved").length,
	};
});

const nextVisit = computed(() => {
	const list = visitsData.visits || [];
	return list.find((v) => v.visit_status === "In Progress") || list.find((v) => v.visit_status === "Scheduled");
});

async function refreshData() {
	await visitsData.fetchVisits();
}
</script>
