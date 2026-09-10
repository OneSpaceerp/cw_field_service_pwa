<template>
  <base-layout title="Technician Profile">
    <div class="p-4 space-y-5 max-w-lg mx-auto pb-12">
      <!-- Profile Card -->
      <div class="bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div class="flex items-center space-x-4 relative z-10">
          <Avatar
            :label="user.full_name || 'Tech'"
            size="2xl"
            class="ring-2 ring-white/50 shadow-md font-bold text-lg"
          />
          <div class="flex-1 min-w-0">
            <h2 class="text-xl font-bold truncate">{{ user?.full_name || 'C-Water Technician' }}</h2>
            <p class="text-xs text-sky-200 truncate">{{ user?.email || 'tech@cwater.com' }}</p>
            <div class="mt-2 flex items-center space-x-2">
              <Badge
                theme="blue"
                size="sm"
                variant="solid"
                label="🔧 Field Service Engineer"
                class="!bg-white/20 !text-white font-semibold backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- App Status & Connectivity -->
      <div class="bg-surface-white rounded-2xl p-4 shadow-sm border border-outline-gray-1 space-y-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-ink-gray-4">Connectivity & System</h3>
        <div class="divide-y divide-outline-gray-modals">
          <div class="py-2.5 flex items-center justify-between">
            <span class="text-sm font-medium text-ink-gray-7">Network Mode</span>
            <Badge
              :theme="isOnline ? 'green' : 'red'"
              size="md"
              variant="subtle"
              :label="isOnline ? 'Online (Frappe Sync Active)' : 'Offline (Local Storage)'"
            />
          </div>

          <div class="py-2.5 flex items-center justify-between">
            <span class="text-sm font-medium text-ink-gray-7">Pending Sync Items</span>
            <router-link to="/sync-queue" class="inline-flex items-center space-x-1">
              <Badge
                theme="orange"
                size="md"
                variant="subtle"
                :label="`${pendingCount} pending changes`"
                class="cursor-pointer"
              />
            </router-link>
          </div>

          <div class="py-2.5 flex items-center justify-between">
            <span class="text-sm font-medium text-ink-gray-7">Server Host</span>
            <span class="text-xs font-mono text-ink-gray-5 truncate max-w-[200px]">{{ serverOrigin }}</span>
          </div>
        </div>
      </div>

      <!-- PWA Diagnostics & Cache Management -->
      <div class="bg-surface-white rounded-2xl p-4 shadow-sm border border-outline-gray-1 space-y-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-ink-gray-4">Offline Storage & Maintenance</h3>
        
        <div class="flex items-center justify-between py-2 text-sm text-ink-gray-7">
          <span>Cached Visits in Storage</span>
          <span class="font-bold text-ink-gray-9">{{ cachedVisitsCount }} records</span>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="subtle"
            theme="blue"
            size="md"
            :loading="isRefreshing"
            loading-text="Refreshing..."
            class="justify-center !rounded-xl text-xs font-bold"
            @click="refreshData"
          >
            <template #prefix><FeatherIcon name="refresh-cw" class="w-3.5 h-3.5" /></template>
            Reload Data
          </Button>

          <Button
            variant="subtle"
            theme="red"
            size="md"
            class="justify-center !rounded-xl text-xs font-bold"
            @click="clearCache"
          >
            <template #prefix><FeatherIcon name="trash-2" class="w-3.5 h-3.5" /></template>
            Clear Cache
          </Button>
        </div>
      </div>

      <!-- App Metadata -->
      <div class="bg-surface-white rounded-2xl p-4 shadow-sm border border-outline-gray-1 space-y-2 text-xs text-ink-gray-5">
        <div class="flex justify-between">
          <span>Application</span>
          <span class="font-semibold text-ink-gray-8">C-Water Field Service PWA</span>
        </div>
        <div class="flex justify-between">
          <span>UI Framework</span>
          <span class="font-semibold text-ink-blue-3">Frappe UI (v0.1.105)</span>
        </div>
        <div class="flex justify-between">
          <span>Architecture</span>
          <span class="font-semibold text-ink-gray-8">Frappe HRMS v16 Reference</span>
        </div>
        <div class="flex justify-between">
          <span>Theme</span>
          <span class="font-semibold text-ink-green-3">Light & Vibrant Water Palette</span>
        </div>
      </div>

      <!-- Logout Button -->
      <div class="pt-2">
        <Button
          variant="solid"
          theme="red"
          size="lg"
          class="w-full justify-center !rounded-2xl !py-3 font-bold text-sm shadow-sm"
          @click="handleLogout"
        >
          <template #prefix>
            <FeatherIcon name="log-out" class="w-4 h-4" />
          </template>
          Sign Out of Technician Account
        </Button>
      </div>

      <div class="text-center">
        <p class="text-[11px] text-ink-gray-4">C-Water Operations &copy; 2026. All rights reserved.</p>
      </div>
    </div>
    <BottomTabs />
  </base-layout>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Avatar, Badge, Button, FeatherIcon } from "frappe-ui";
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
