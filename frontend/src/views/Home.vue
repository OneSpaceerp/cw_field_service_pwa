<template>
	<div class="px-4 py-3 space-y-4 max-w-xl mx-auto">
		<!-- 1. Engineer Shift Status & Greeting Banner -->
		<div class="bg-gradient-to-r from-sky-800 to-cyan-700 text-white p-4 rounded-2xl shadow-sm relative overflow-hidden">
			<div class="flex items-center justify-between relative z-10">
				<div>
					<p class="text-[11px] font-medium text-sky-200 uppercase tracking-wider">{{ currentDate }}</p>
					<h2 class="text-lg font-extrabold mt-0.5">Welcome, {{ session.userFullName }}</h2>
					<div class="flex items-center space-x-2 mt-2">
						<span
							class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
							:class="isOnDuty ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40' : 'bg-slate-400/20 text-slate-300 border border-slate-400/30'"
						>
							<span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="isOnDuty ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'"></span>
							{{ isOnDuty ? "Shift Active (On Duty)" : "Off Duty" }}
						</span>
						<button
							@click="toggleDuty"
							class="text-[10px] text-sky-200 underline hover:text-white"
						>
							Toggle
						</button>
					</div>
				</div>

				<div class="text-right">
					<span class="text-[10px] text-sky-200 block">Jeddah District</span>
					<span class="text-xs font-bold text-white block mt-0.5">Water Field Service</span>
				</div>
			</div>

			<!-- Background decorative wave shape -->
			<div class="absolute -bottom-8 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
		</div>

		<!-- 2. Operational KPI Cards Grid -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider">Field Operations Summary</h3>
				<span class="text-[11px] text-ink-blue-3 font-semibold cursor-pointer" @click="$router.push('/visits')">View all</span>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<!-- Scheduled -->
				<div
					@click="$router.push('/visits?status=Scheduled')"
					class="p-3.5 rounded-2xl bg-surface-blue-1 border-l-4 border-l-sky-500 border border-outline-blue-1 shadow-xs active:scale-98 transition-transform cursor-pointer"
				>
					<div class="flex items-center justify-between">
						<span class="text-[11px] font-bold text-sky-800 tracking-wider">SCHEDULED</span>
						<FeatherIcon name="calendar" class="w-4 h-4 text-sky-600" />
					</div>
					<div class="text-2xl font-extrabold text-sky-900 mt-1.5">{{ counts.scheduled }}</div>
					<span class="text-[10px] text-ink-gray-5">Awaiting dispatch</span>
				</div>

				<!-- In Progress -->
				<div
					@click="$router.push('/visits?status=In Progress')"
					class="p-3.5 rounded-2xl bg-amber-50 border-l-4 border-l-amber-500 border border-amber-200 shadow-xs active:scale-98 transition-transform cursor-pointer"
				>
					<div class="flex items-center justify-between">
						<span class="text-[11px] font-bold text-amber-800 tracking-wider">IN PROGRESS</span>
						<FeatherIcon name="activity" class="w-4 h-4 text-amber-600" />
					</div>
					<div class="text-2xl font-extrabold text-amber-900 mt-1.5">{{ counts.inProgress }}</div>
					<span class="text-[10px] text-ink-gray-5">Currently on site</span>
				</div>

				<!-- Pending Review -->
				<div
					@click="$router.push('/visits?status=Pending Review')"
					class="p-3.5 rounded-2xl bg-purple-50 border-l-4 border-l-purple-500 border border-purple-200 shadow-xs active:scale-98 transition-transform cursor-pointer"
				>
					<div class="flex items-center justify-between">
						<span class="text-[11px] font-bold text-purple-800 tracking-wider">UNDER REVIEW</span>
						<FeatherIcon name="clock" class="w-4 h-4 text-purple-600" />
					</div>
					<div class="text-2xl font-extrabold text-purple-900 mt-1.5">{{ counts.pending }}</div>
					<span class="text-[10px] text-ink-gray-5">Reports submitted</span>
				</div>

				<!-- Completed -->
				<div
					@click="$router.push('/visits?status=Approved')"
					class="p-3.5 rounded-2xl bg-emerald-50 border-l-4 border-l-emerald-500 border border-emerald-200 shadow-xs active:scale-98 transition-transform cursor-pointer"
				>
					<div class="flex items-center justify-between">
						<span class="text-[11px] font-bold text-emerald-800 tracking-wider">COMPLETED</span>
						<FeatherIcon name="check-circle" class="w-4 h-4 text-emerald-600" />
					</div>
					<div class="text-2xl font-extrabold text-emerald-900 mt-1.5">{{ counts.completed }}</div>
					<span class="text-[10px] text-ink-gray-5">Approved visits</span>
				</div>
			</div>
		</div>

		<!-- 3. Quick Action Chips (Frappe HR Style) -->
		<div>
			<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider mb-2">Quick Actions</h3>
			<div class="grid grid-cols-4 gap-2">
				<button
					@click="showNewModal = true"
					class="flex flex-col items-center justify-center p-2.5 bg-surface-white rounded-xl border border-outline-gray-1 shadow-2xs hover:border-sky-300 active:scale-95 transition-all text-center"
				>
					<div class="w-9 h-9 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-1.5">
						<FeatherIcon name="plus" class="w-4 h-4 stroke-[2.5]" />
					</div>
					<span class="text-[11px] font-semibold text-ink-gray-8">New Visit</span>
				</button>

				<button
					@click="nextVisit ? $router.push(`/visits/${nextVisit.name}`) : $router.push('/visits')"
					class="flex flex-col items-center justify-center p-2.5 bg-surface-white rounded-xl border border-outline-gray-1 shadow-2xs hover:border-sky-300 active:scale-95 transition-all text-center"
				>
					<div class="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
						<FeatherIcon name="map-pin" class="w-4 h-4 stroke-[2.5]" />
					</div>
					<span class="text-[11px] font-semibold text-ink-gray-8">Check-In</span>
				</button>

				<button
					@click="$router.push('/sync-queue')"
					class="flex flex-col items-center justify-center p-2.5 bg-surface-white rounded-xl border border-outline-gray-1 shadow-2xs hover:border-sky-300 active:scale-95 transition-all text-center relative"
				>
					<div class="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
						<FeatherIcon name="refresh-cw" class="w-4 h-4 stroke-[2.5]" />
					</div>
					<span class="text-[11px] font-semibold text-ink-gray-8">Sync Queue</span>
					<span
						v-if="syncStore.pendingCount > 0"
						class="absolute top-1.5 right-2 w-2 h-2 bg-amber-500 rounded-full"
					></span>
				</button>

				<button
					@click="openEmergencyCallout"
					class="flex flex-col items-center justify-center p-2.5 bg-surface-white rounded-xl border border-outline-gray-1 shadow-2xs hover:border-red-300 active:scale-95 transition-all text-center"
				>
					<div class="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-1.5">
						<FeatherIcon name="alert-triangle" class="w-4 h-4 stroke-[2.5]" />
					</div>
					<span class="text-[11px] font-semibold text-ink-gray-8">Emergency</span>
				</button>
			</div>
		</div>

		<!-- 4. Active / Next Assignment Spotlight (Hero Card) -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider">Current Assignment</h3>
				<span v-if="nextVisit" class="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
					{{ nextVisit.name }}
				</span>
			</div>

			<div v-if="nextVisit" class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs">
				<div class="flex justify-between items-start mb-2">
					<div>
						<h4 class="font-bold text-ink-gray-9 text-sm leading-snug">{{ nextVisit.customer_name || nextVisit.customer }}</h4>
						<p class="text-xs text-ink-gray-5 mt-0.5 flex items-center gap-1">
							<FeatherIcon name="map-pin" class="w-3.5 h-3.5 text-sky-600" />
							<span>{{ nextVisit.service_location }}</span>
						</p>
					</div>
					<StatusBadge :status="nextVisit.visit_status" />
				</div>

				<div class="flex items-center justify-between text-xs text-ink-gray-6 py-2 border-y border-outline-gray-1 my-3">
					<div class="flex items-center gap-1.5">
						<FeatherIcon name="calendar" class="w-3.5 h-3.5 text-ink-gray-4" />
						<span><strong>Date:</strong> {{ nextVisit.planned_date }}</span>
					</div>
					<div class="flex items-center gap-1.5">
						<FeatherIcon name="tag" class="w-3.5 h-3.5 text-ink-gray-4" />
						<span><strong>Type:</strong> {{ nextVisit.visit_type || "Routine" }}</span>
					</div>
				</div>

				<Button
					variant="solid"
					theme="blue"
					size="md"
					class="w-full justify-center !rounded-xl !py-2.5 font-bold shadow-xs flex items-center gap-2"
					@click="$router.push(`/visits/${nextVisit.name}`)"
				>
					<template #prefix>
						<FeatherIcon name="arrow-right-circle" class="w-4 h-4" />
					</template>
					{{ nextVisit.visit_status === "In Progress" ? "Continue Inspection" : "Start Visit & Check-In" }}
				</Button>
			</div>

			<div v-else class="text-center py-8 bg-surface-white rounded-2xl border border-dashed border-outline-gray-2 p-4">
				<FeatherIcon name="check-circle" class="w-8 h-8 text-emerald-500 mx-auto mb-2" />
				<h4 class="text-xs font-bold text-ink-gray-9">No Pending Visits</h4>
				<p class="text-[11px] text-ink-gray-5 mt-0.5">All scheduled visits for today are completed.</p>
				<Button
					variant="subtle"
					theme="blue"
					size="sm"
					class="!rounded-xl mt-3 font-semibold"
					@click="showNewModal = true"
				>
					Schedule Next Visit
				</Button>
			</div>
		</div>

		<!-- 5. Today's Visits Schedule -->
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<h3 class="text-xs font-bold text-ink-gray-5 uppercase tracking-wider">Today's Schedule</h3>
				<span class="text-[11px] text-ink-gray-5">{{ todayVisits.length }} visits planned</span>
			</div>

			<div class="space-y-2.5">
				<div
					v-for="v in todayVisits"
					:key="v.name"
					@click="$router.push(`/visits/${v.name}`)"
					class="p-3 bg-surface-white rounded-xl border border-outline-gray-1 shadow-2xs flex items-center justify-between active:scale-98 transition-transform cursor-pointer"
				>
					<div class="flex items-center space-x-3">
						<div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
							<FeatherIcon name="clipboard" class="w-4 h-4" />
						</div>
						<div>
							<h5 class="text-xs font-bold text-ink-gray-9 truncate max-w-[200px]">{{ v.customer_name || v.customer }}</h5>
							<p class="text-[10px] text-ink-gray-5">{{ v.service_location }} &bull; {{ v.visit_type || "Routine" }}</p>
						</div>
					</div>

					<div class="flex items-center space-x-2">
						<StatusBadge :status="v.visit_status" />
						<FeatherIcon name="chevron-right" class="w-4 h-4 text-ink-gray-4" />
					</div>
				</div>
			</div>
		</div>

		<!-- New Visit Modal -->
		<NewVisitModal
			v-model="showNewModal"
			@created="handleCreated"
		/>
	</div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Button, FeatherIcon } from "frappe-ui";
import StatusBadge from "@/components/StatusBadge.vue";
import NewVisitModal from "@/components/NewVisitModal.vue";
import { session } from "@/data/session";
import { visitsData } from "@/data/visits";
import { syncStore } from "@/stores/sync";

const router = useRouter();
const showNewModal = ref(false);
const isOnDuty = ref(true);

const currentDate = computed(() => {
	const now = new Date();
	return now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
});

const counts = computed(() => {
	const all = visitsData.visits || [];
	return {
		scheduled: all.filter((v) => v.visit_status === "Scheduled").length,
		inProgress: all.filter((v) => v.visit_status === "In Progress").length,
		pending: all.filter((v) => v.visit_status === "Pending Review").length,
		completed: all.filter((v) => v.visit_status === "Approved").length,
	};
});

const nextVisit = computed(() => {
	const all = visitsData.visits || [];
	return (
		all.find((v) => v.visit_status === "In Progress") ||
		all.find((v) => v.visit_status === "Scheduled") ||
		all[0]
	);
});

const todayVisits = computed(() => {
	return visitsData.visits || [];
});

function toggleDuty() {
	isOnDuty.value = !isOnDuty.value;
}

function openEmergencyCallout() {
	showNewModal.value = true;
}

function handleCreated(newVisit) {
	if (confirm(`Visit ${newVisit.name} scheduled! Open it now?`)) {
		router.push(`/visits/${newVisit.name}`);
	}
}
</script>
