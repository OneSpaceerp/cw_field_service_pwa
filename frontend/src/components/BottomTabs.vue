<template>
	<nav class="fixed bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 flex items-center justify-around shadow-lg">
		<router-link
			to="/"
			class="flex flex-col items-center justify-center flex-1 h-full text-xs font-semibold transition-colors"
			:class="$route.path === '/' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'"
		>
			<svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
			<span>Home</span>
		</router-link>

		<router-link
			to="/visits"
			class="flex flex-col items-center justify-center flex-1 h-full text-xs font-semibold transition-colors"
			:class="$route.path.startsWith('/visits') ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'"
		>
			<svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
			<span>Visits</span>
		</router-link>

		<router-link
			to="/sync-queue"
			class="flex flex-col items-center justify-center flex-1 h-full text-xs font-semibold transition-colors relative"
			:class="$route.path === '/sync-queue' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'"
		>
			<svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
			<span>Sync</span>
			<span
				v-if="syncStore.pendingCount > 0"
				class="absolute top-2 right-6 w-2.5 h-2.5 bg-sky-500 rounded-full ring-2 ring-white"
			></span>
		</router-link>

		<router-link
			to="/profile"
			class="flex flex-col items-center justify-center flex-1 h-full text-xs font-semibold transition-colors"
			:class="$route.path === '/profile' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'"
		>
			<svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
			<span>Profile</span>
		</router-link>
	</nav>
</template>

<script setup>
import { syncStore } from "@/stores/sync";
</script>
