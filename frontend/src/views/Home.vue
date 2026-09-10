<template>
	<BaseLayout title="C-Water Service" :onRefresh="refreshData">
		<MobileHeader />

		<div class="px-4 py-3 space-y-4">
			<div>
				<h2 class="text-xl font-extrabold text-slate-900">Welcome, {{ session.userFullName }}</h2>
				<p class="text-xs text-slate-500">Today's operational field summary</p>
			</div>

			<!-- KPI Cards Grid -->
			<div class="grid grid-cols-2 gap-3">
				<div
					@click="$router.push('/visits?status=Scheduled')"
					class="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100/60 border-l-4 border-l-sky-500 border border-sky-200 shadow-xs active:scale-98 transition-transform cursor-pointer"
				>
					<span class="text-[11px] font-bold text-sky-700 tracking-wider">SCHEDULED</span>
					<div class="text-2xl font-extrabold text-sky-700 mt-1">{{ counts.scheduled }}</div>
				</div>

				<div
					@click="$router.push('/visits?status=In Progress')"
					class="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 border-l-4 border-l-amber-500 border border-amber-200 shadow-xs active:scale-98 transition-transform cursor-pointer"
				>
					<span class="text-[11px] font-bold text-amber-700 tracking-wider">IN PROGRESS</span>
					<div class="text-2xl font-extrabold text-amber-700 mt-1">{{ counts.inProgress }}</div>
				</div>

				<div
					@click="$router.push('/visits?status=Pending Review')"
					class="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/60 border-l-4 border-l-purple-500 border border-purple-200 shadow-xs active:scale-98 transition-transform cursor-pointer"
				>
					<span class="text-[11px] font-bold text-purple-700 tracking-wider">PENDING REVIEW</span>
					<div class="text-2xl font-extrabold text-purple-700 mt-1">{{ counts.pending }}</div>
				</div>

				<div
					@click="$router.push('/visits?status=Approved')"
					class="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 border-l-4 border-l-emerald-500 border border-emerald-200 shadow-xs active:scale-98 transition-transform cursor-pointer"
				>
					<span class="text-[11px] font-bold text-emerald-700 tracking-wider">COMPLETED</span>
					<div class="text-2xl font-extrabold text-emerald-700 mt-1">{{ counts.completed }}</div>
				</div>
			</div>

			<!-- Active / Next Assignment Spotlight -->
			<div>
				<h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active / Next Assignment</h3>
				<div v-if="nextVisit" class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
					<div class="flex justify-between items-start mb-2">
						<div>
							<h4 class="font-bold text-slate-900 text-sm">{{ nextVisit.customer_name || nextVisit.customer }}</h4>
							<p class="text-xs text-slate-500 mt-0.5">{{ nextVisit.service_location }}</p>
						</div>
						<StatusBadge :status="nextVisit.visit_status" />
					</div>

					<p class="text-xs text-slate-600 mb-3">
						<span class="font-semibold">Planned:</span> {{ nextVisit.planned_date }} {{ nextVisit.planned_start_time || "" }}
					</p>

					<button
						@click="$router.push(`/visits/${nextVisit.name}`)"
						class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 text-white text-xs font-bold shadow-sm active:scale-98 transition-transform"
					>
						{{ nextVisit.visit_status === "In Progress" ? "Continue Inspection" : "Start Visit & Check-In" }}
					</button>
				</div>
				<div v-else class="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
					No active or scheduled visits for today.
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="grid grid-cols-2 gap-3 pt-1">
				<button
					@click="$router.push('/visits')"
					class="p-3 bg-white border border-slate-200 rounded-xl shadow-xs text-xs font-bold text-slate-700 flex items-center justify-center space-x-2 hover:bg-slate-50"
				>
					<svg class="w-4 h-4 text-sky-600" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
					<span>All Visits</span>
				</button>
				<button
					@click="$router.push('/sync-queue')"
					class="p-3 bg-white border border-slate-200 rounded-xl shadow-xs text-xs font-bold text-slate-700 flex items-center justify-center space-x-2 hover:bg-slate-50"
				>
					<svg class="w-4 h-4 text-sky-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
					<span>Sync Queue</span>
				</button>
			</div>
		</div>

		<BottomTabs />
	</BaseLayout>
</template>

<script setup>
import { computed } from "vue";
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
