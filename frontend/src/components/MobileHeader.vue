<template>
	<header
		class="sticky top-0 z-40 bg-surface-white/95 backdrop-blur-md border-b border-outline-gray-1 shadow-xs px-4 py-2.5 flex items-center justify-between"
		style="padding-top: max(0.625rem, env(safe-area-inset-top));"
	>
		<!-- Left: Back Button or User Avatar -->
		<div class="flex items-center space-x-2.5">
			<Button
				v-if="showBack"
				variant="ghost"
				theme="gray"
				size="sm"
				class="!p-1 !rounded-lg"
				@click="handleBack"
			>
				<template #prefix>
					<FeatherIcon name="chevron-left" class="w-5 h-5 text-ink-gray-7" />
				</template>
			</Button>

			<div
				v-else
				@click="$router.push('/profile')"
				class="cursor-pointer flex items-center space-x-2"
			>
				<Avatar
					:label="session.userFullName || 'Eng'"
					size="sm"
					class="ring-2 ring-sky-500/30"
				/>
			</div>

			<!-- Center Branding / Title -->
			<div class="flex items-center space-x-2">
				<img src="/assets/logo.png" alt="C-Water" class="h-8 w-auto object-contain" />
				<div class="hidden sm:block">
					<span class="text-xs font-extrabold text-sky-800 tracking-wider">C-WATER</span>
					<span class="text-[10px] text-ink-gray-5 block -mt-1 font-medium">Field Service PWA</span>
				</div>
			</div>
		</div>

		<!-- Right: Quick Actions & Status -->
		<div class="flex items-center space-x-2">
			<!-- Queued mutations badge -->
			<Button
				v-if="syncStore.pendingCount > 0"
				variant="subtle"
				theme="blue"
				size="sm"
				class="!rounded-full !py-1 !px-2.5 text-[11px] font-bold shadow-xs flex items-center gap-1"
				@click="$router.push('/sync-queue')"
			>
				<FeatherIcon name="refresh-cw" class="w-3 h-3 animate-spin text-sky-600" />
				<span>{{ syncStore.pendingCount }} Queued</span>
			</Button>

			<!-- Notifications Bell -->
			<button
				@click="$router.push('/notifications')"
				class="relative p-1.5 rounded-lg text-ink-gray-6 hover:text-ink-gray-9 hover:bg-surface-gray-2 transition-colors active:scale-95"
				title="Notifications"
			>
				<FeatherIcon name="bell" class="w-5 h-5" />
				<span
					v-if="notificationsStore.unreadCount > 0"
					class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"
				></span>
			</button>

			<!-- Online/Offline Status Indicator -->
			<Badge
				:theme="isOnline ? 'green' : 'red'"
				size="sm"
				variant="subtle"
				:label="isOnline ? 'Online' : 'Offline'"
				class="font-semibold text-[10px]"
			/>
		</div>
	</header>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Avatar, Badge, Button, FeatherIcon } from "frappe-ui";
import { useNetwork } from "@/composables/useNetwork";
import { session } from "@/data/session";
import { syncStore } from "@/stores/sync";
import { notificationsStore } from "@/data/notifications";

const route = useRoute();
const router = useRouter();
const { isOnline } = useNetwork();

const showBack = computed(() => {
	return route.path.startsWith("/visits/") || route.path === "/notifications";
});

function handleBack() {
	if (window.history.length > 1) {
		router.back();
	} else {
		router.push("/visits");
	}
}
</script>
