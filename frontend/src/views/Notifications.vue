<template>
	<div class="min-h-screen bg-slate-50 pb-20">
		<!-- Header -->
		<header class="sticky top-0 z-40 bg-surface-white border-b border-outline-gray-1 px-4 py-3 flex items-center justify-between shadow-xs">
			<div class="flex items-center space-x-2">
				<Button
					variant="ghost"
					theme="gray"
					size="sm"
					class="!p-1.5 !rounded-lg"
					@click="$router.back()"
				>
					<template #prefix>
						<FeatherIcon name="chevron-left" class="w-5 h-5 text-ink-gray-7" />
					</template>
				</Button>
				<div>
					<h1 class="text-base font-bold text-ink-gray-9">Notifications</h1>
					<p class="text-[11px] text-ink-gray-5">{{ notificationsStore.unreadCount }} unread updates</p>
				</div>
			</div>
			<Button
				v-if="notificationsStore.unreadCount > 0"
				variant="subtle"
				theme="blue"
				size="sm"
				class="!text-xs font-semibold !rounded-lg"
				@click="notificationsStore.markAllAsRead()"
			>
				Mark all read
			</Button>
		</header>

		<!-- Content -->
		<div class="p-4 space-y-3 max-w-xl mx-auto pb-6">
			<!-- Device Push Notification Banner -->
			<div
				class="p-3.5 rounded-2xl border shadow-2xs space-y-2.5 transition-all"
				:class="permState.notifications === 'granted' ? 'border-emerald-200 bg-emerald-50/40' : 'border-sky-200 bg-sky-50/40'"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-2.5">
						<div
							class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
							:class="permState.notifications === 'granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'"
						>
							<FeatherIcon name="bell" class="w-3.5 h-3.5" />
						</div>
						<div>
							<h4 class="text-xs font-bold text-slate-900">Device Push Alerts</h4>
							<p class="text-[11px] text-slate-500">
								{{ permState.notifications === 'granted' ? 'System notifications are active' : 'Enable lock screen & dispatch alerts' }}
							</p>
						</div>
					</div>

					<span
						v-if="permState.notifications === 'granted'"
						class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full"
					>
						Active
					</span>
					<span
						v-else-if="permState.notifications === 'requires_install'"
						class="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full"
					>
						iOS Home Screen Required
					</span>
					<span
						v-else
						class="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"
					>
						Action Needed
					</span>
				</div>

				<div class="flex items-center gap-2 pt-0.5">
					<button
						v-if="permState.notifications !== 'granted' && permState.notifications !== 'requires_install'"
						type="button"
						@click="enableNotifications"
						:disabled="isEnabling"
						class="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
					>
						<FeatherIcon name="bell" class="w-3.5 h-3.5" />
						<span>{{ isEnabling ? 'Enabling...' : 'Enable Notifications' }}</span>
					</button>

					<button
						type="button"
						@click="testNotification"
						class="py-2 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-all"
						:class="permState.notifications === 'granted' ? 'w-full' : ''"
					>
						<FeatherIcon name="send" class="w-3.5 h-3.5 text-sky-600" />
						<span>Send Test Alert</span>
					</button>
				</div>
			</div>

			<div
				v-for="item in notificationsStore.items"
				:key="item.id"
				@click="handleNotificationClick(item)"
				class="p-4 rounded-2xl border transition-all cursor-pointer relative"
				:class="[
					item.read
						? 'bg-surface-white border-outline-gray-1 opacity-80'
						: 'bg-white border-outline-blue-2 shadow-xs ring-1 ring-blue-500/10'
				]"
			>
				<div class="flex items-start space-x-3">
					<div
						class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
						:class="{
							'bg-red-50 text-red-600': item.type === 'urgent',
							'bg-amber-50 text-amber-600': item.type === 'warning',
							'bg-emerald-50 text-emerald-600': item.type === 'success',
							'bg-blue-50 text-blue-600': !item.type || item.type === 'info',
						}"
					>
						<FeatherIcon
							:name="
								item.type === 'urgent'
									? 'alert-triangle'
									: item.type === 'warning'
									? 'clock'
									: item.type === 'success'
									? 'check-circle'
									: 'bell'
							"
							class="w-4 h-4"
						/>
					</div>

					<div class="flex-1 min-w-0">
						<div class="flex items-center justify-between">
							<h4 class="text-sm font-bold text-ink-gray-9 truncate">{{ item.title }}</h4>
							<span class="text-[10px] text-ink-gray-4 whitespace-nowrap ml-2">{{ item.timestamp }}</span>
						</div>
						<p class="text-xs text-ink-gray-6 mt-1 leading-relaxed">{{ item.message }}</p>

						<div v-if="item.visit_id" class="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-ink-blue-3">
							<span>View Visit ({{ item.visit_id }})</span>
							<FeatherIcon name="arrow-right" class="w-3.5 h-3.5" />
						</div>
					</div>
				</div>

				<span
					v-if="!item.read"
					class="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"
				></span>
			</div>

			<!-- Empty State -->
			<div
				v-if="notificationsStore.items.length === 0"
				class="text-center py-16 bg-surface-white rounded-2xl border border-outline-gray-1 p-6"
			>
				<div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
					<FeatherIcon name="bell-off" class="w-6 h-6" />
				</div>
				<h3 class="text-sm font-bold text-ink-gray-9">No Notifications</h3>
				<p class="text-xs text-ink-gray-5 mt-1">You're all caught up with your field assignments and reports.</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Button, FeatherIcon } from "frappe-ui";
import { notificationsStore } from "@/data/notifications";
import { permissionsManager, permissionsState } from "@/utils/permissions";

const router = useRouter();
const permState = permissionsState;
const isEnabling = ref(false);

async function enableNotifications() {
	isEnabling.value = true;
	try {
		await permissionsManager.requestNotifications();
	} catch (e) {
		alert(e.message || "Failed to enable notifications.");
	} finally {
		isEnabling.value = false;
	}
}

async function testNotification() {
	await permissionsManager.sendTestNotification({
		title: "C-Water Field Service Alert",
		body: "Test notification: Technician dispatch alerts are operating normally.",
		url: "/notifications",
	});
}

function handleNotificationClick(item) {
	notificationsStore.markAsRead(item.id);
	if (item.visit_id) {
		router.push(`/visits/${item.visit_id}`);
	}
}

onMounted(() => {
	permissionsManager.checkNotifications();
});
</script>
