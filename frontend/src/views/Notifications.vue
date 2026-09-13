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
		<div class="p-4 space-y-3 max-w-xl mx-auto">
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
import { useRouter } from "vue-router";
import { Button, FeatherIcon } from "frappe-ui";
import { notificationsStore } from "@/data/notifications";

const router = useRouter();

function handleNotificationClick(item) {
	notificationsStore.markAsRead(item.id);
	if (item.visit_id) {
		router.push(`/visits/${item.visit_id}`);
	}
}
</script>
