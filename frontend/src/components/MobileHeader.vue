<template>
	<header class="sticky top-0 z-50 flex items-center justify-between px-4 py-2.5 bg-surface-white/95 backdrop-blur-md border-b border-outline-gray-1 shadow-xs">
		<div class="flex items-center space-x-2.5">
			<img src="/assets/logo.png" alt="C-Water Logo" class="h-9 w-auto object-contain" />
			<Badge theme="blue" size="sm" variant="subtle" label="Field PWA" class="font-bold tracking-wider" />
		</div>
		<div class="flex items-center space-x-2">
			<Button
				v-if="syncStore.pendingCount > 0"
				variant="solid"
				theme="blue"
				size="sm"
				class="!rounded-full text-xs font-bold shadow-xs"
				@click="$router.push('/sync-queue')"
			>
				{{ syncStore.pendingCount }} Queued
			</Button>
			<Badge
				:theme="isOnline ? 'green' : 'red'"
				size="md"
				variant="subtle"
				:label="isOnline ? 'Online' : 'Offline'"
				class="font-semibold"
			/>
		</div>
	</header>
</template>

<script setup>
import { Badge, Button } from "frappe-ui";
import { useNetwork } from "@/composables/useNetwork";
import { syncStore } from "@/stores/sync";

const { isOnline } = useNetwork();
</script>
