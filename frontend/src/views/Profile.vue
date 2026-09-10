<template>
  <base-layout title="Technician Profile">
    <div class="p-4 space-y-5 max-w-lg mx-auto pb-12">
      <!-- Profile Card -->
      <div class="bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div class="flex items-center space-x-4 relative z-10">
          <div class="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold backdrop-blur-md shadow-inner text-white">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-xl font-bold truncate">{{ user?.full_name || 'C-Water Technician' }}</h2>
            <p class="text-xs text-sky-200 truncate">{{ user?.email || 'tech@cwater.com' }}</p>
            <div class="mt-2 flex items-center space-x-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/20">
                🔧 Field Service Engineer
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- App Status & Connectivity -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Connectivity & System</h3>
        <div class="divide-y divide-slate-100">
          <div class="py-2.5 flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700">Network Mode</span>
            <span
              class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              :class="isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
            >
              <span class="w-2 h-2 rounded-full" :class="isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'"></span>
              <span>{{ isOnline ? 'Online (ERPNext Sync Active)' : 'Offline (Local IndexedDB)' }}</span>
            </span>
          </div>

          <div class="py-2.5 flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700">Pending Sync Items</span>
            <router-link to="/sync-queue" class="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors">
              <span>{{ pendingCount }} pending changes</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>

          <div class="py-2.5 flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700">Server Host</span>
            <span class="text-xs font-mono text-slate-500 truncate max-w-[200px]">{{ serverOrigin }}</span>
          </div>
        </div>
      </div>

      <!-- PWA Diagnostics & Cache Management -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Offline Storage & Maintenance</h3>
        
        <div class="flex items-center justify-between py-2 text-sm text-slate-600">
          <span>Cached Visits in Storage</span>
          <span class="font-bold text-slate-800">{{ cachedVisitsCount }} records</span>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button
            @click="refreshData"
            :disabled="isRefreshing"
            class="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <svg class="w-4 h-4 text-brand-600" :class="{ 'animate-spin': isRefreshing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ isRefreshing ? 'Refreshing...' : 'Reload Data' }}</span>
          </button>

          <button
            @click="clearCache"
            class="px-3 py-2.5 rounded-xl border border-rose-200 text-rose-700 font-semibold text-xs flex items-center justify-center space-x-1.5 hover:bg-rose-50 active:scale-95 transition-all"
          >
            <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Clear Local Cache</span>
          </button>
        </div>
      </div>

      <!-- App Metadata -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2 text-xs text-slate-500">
        <div class="flex justify-between">
          <span>Application</span>
          <span class="font-semibold text-slate-700">C-Water Field Service PWA</span>
        </div>
        <div class="flex justify-between">
          <span>Architecture</span>
          <span class="font-semibold text-brand-600">Frappe HRMS v16 Reference</span>
        </div>
        <div class="flex justify-between">
          <span>PWA Version</span>
          <span class="font-semibold text-slate-700">v1.2.0 (Vue 3.5 + Ionic 7)</span>
        </div>
        <div class="flex justify-between">
          <span>Theme</span>
          <span class="font-semibold text-emerald-600">Light & Vibrant Water Palette</span>
        </div>
      </div>

      <!-- Logout Button -->
      <div class="pt-2">
        <button
          @click="handleLogout"
          class="w-full py-3.5 px-4 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.99] shadow-sm"
        >
          <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out of Technician Account</span>
        </button>
      </div>

      <div class="text-center">
        <p class="text-[11px] text-slate-400">C-Water Operations &copy; 2026. All rights reserved.</p>
      </div>
    </div>
    <BottomTabs />
  </base-layout>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import BaseLayout from "../components/BaseLayout.vue";
import BottomTabs from "../components/BottomTabs.vue";
import { session } from "../data/session";
import { user } from "../data/user";
import { visitsStore } from "../data/visits";
import { useSyncStore } from "../stores/sync";
import { useNetwork } from "../composables/useNetwork";

const router = useRouter();
const syncStore = useSyncStore();
const { isOnline } = useNetwork();

const isRefreshing = ref(false);
const serverOrigin = computed(() => window.location.origin);
const pendingCount = computed(() => syncStore.pendingCount);
const cachedVisitsCount = computed(() => visitsStore.visits?.length || 0);

const userInitials = computed(() => {
  const name = user.full_name || session.user || "Tech";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

async function refreshData() {
  isRefreshing.value = true;
  try {
    await visitsStore.fetchVisits();
  } finally {
    setTimeout(() => {
      isRefreshing.value = false;
    }, 600);
  }
}

function clearCache() {
  if (confirm("Are you sure you want to clear local visits cache? Unsynced offline queue items will be preserved.")) {
    localStorage.removeItem("cw_pwa_visits_cache");
    visitsStore.fetchVisits();
    alert("Local visit cache cleared successfully.");
  }
}

async function handleLogout() {
  if (confirm("Are you sure you want to sign out?")) {
    await session.logout();
    router.push("/login");
  }
}
</script>
