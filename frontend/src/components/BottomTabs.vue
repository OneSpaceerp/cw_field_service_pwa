<template>
	<nav
		class="fixed bottom-0 inset-x-0 bg-surface-white/95 backdrop-blur-md border-t border-outline-gray-1 z-40 flex items-center justify-around shadow-lg px-2"
		style="padding-bottom: max(0.5rem, env(safe-area-inset-bottom)); height: calc(3.75rem + env(safe-area-inset-bottom));"
	>
		<!-- 1. Home -->
		<router-link
			to="/"
			class="flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-semibold transition-all rounded-xl"
			:class="$route.path === '/' ? 'text-sky-600 font-bold' : 'text-ink-gray-5 hover:text-ink-gray-8'"
		>
			<FeatherIcon name="home" class="w-5 h-5 mb-0.5" />
			<span>Home</span>
		</router-link>

		<!-- 2. Visits List -->
		<router-link
			to="/visits"
			class="flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-semibold transition-all rounded-xl"
			:class="$route.path.startsWith('/visits') ? 'text-sky-600 font-bold' : 'text-ink-gray-5 hover:text-ink-gray-8'"
		>
			<FeatherIcon name="calendar" class="w-5 h-5 mb-0.5" />
			<span>Visits</span>
		</router-link>

		<!-- 3. Center Elevated "+ New" Action Button -->
		<div class="flex flex-col items-center justify-center flex-1 py-1 relative">
			<button
				@click="emit('open-new-visit')"
				class="w-11 h-11 -mt-4 bg-gradient-to-tr from-sky-600 to-cyan-500 text-white rounded-full shadow-md flex items-center justify-center active:scale-95 transition-transform hover:shadow-sky-500/25 ring-4 ring-white"
				title="Schedule New Visit"
			>
				<FeatherIcon name="plus" class="w-6 h-6 stroke-[2.5]" />
			</button>
			<span class="text-[10px] font-bold text-sky-700 mt-1">Schedule</span>
		</div>

		<!-- 4. Sync Queue -->
		<router-link
			to="/sync-queue"
			class="flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-semibold transition-all rounded-xl relative"
			:class="$route.path === '/sync-queue' ? 'text-sky-600 font-bold' : 'text-ink-gray-5 hover:text-ink-gray-8'"
		>
			<div class="relative">
				<FeatherIcon name="refresh-cw" class="w-5 h-5 mb-0.5" />
				<span
					v-if="syncStore.pendingCount > 0"
					class="absolute -top-1 -right-1.5 min-w-4 h-4 px-1 bg-amber-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white"
				>
					{{ syncStore.pendingCount }}
				</span>
			</div>
			<span>Sync</span>
		</router-link>

		<!-- 5. Profile -->
		<router-link
			to="/profile"
			class="flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-semibold transition-all rounded-xl"
			:class="$route.path === '/profile' ? 'text-sky-600 font-bold' : 'text-ink-gray-5 hover:text-ink-gray-8'"
		>
			<FeatherIcon name="user" class="w-5 h-5 mb-0.5" />
			<span>Profile</span>
		</router-link>
	</nav>
</template>

<script setup>
import { FeatherIcon } from "frappe-ui";
import { syncStore } from "@/stores/sync";

const emit = defineEmits(["open-new-visit"]);
</script>
