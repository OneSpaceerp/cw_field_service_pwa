<template>
	<div class="min-h-screen flex items-center justify-center p-4 bg-slate-50">
		<div class="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
			<div class="text-center mb-6">
				<img src="/assets/logo.png" alt="C-Water Logo" class="h-14 max-w-[80%] mx-auto object-contain mb-3" />
				<h2 class="text-xl font-extrabold text-slate-900">Engineer Sign In</h2>
				<p class="text-xs text-slate-500 mt-1">Field Service & Water Testing PWA</p>
			</div>

			<form @submit.prevent="handleLogin" class="space-y-4">
				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1">Username / Email</label>
					<input
						type="text"
						v-model="email"
						required
						placeholder="engineer@cwater.com"
						class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
					/>
				</div>

				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1">Password</label>
					<input
						type="password"
						v-model="password"
						required
						placeholder="••••••••"
						class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
					/>
				</div>

				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1">ERPNext Host URL (Optional)</label>
					<input
						type="url"
						v-model="serverUrl"
						placeholder="https://erp.cwater.com"
						class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
					/>
				</div>

				<div v-if="errorMsg" class="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
					{{ errorMsg }}
				</div>

				<button
					type="submit"
					:disabled="loading"
					class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-98 transition-all"
				>
					{{ loading ? "Signing in..." : "Sign In" }}
				</button>

				<button
					type="button"
					@click="fillDemo"
					class="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
				>
					Use Demo Credentials
				</button>
			</form>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { session } from "@/data/session";

const email = ref("");
const password = ref("");
const serverUrl = ref("");
const loading = ref(false);
const errorMsg = ref("");

function fillDemo() {
	email.value = "engineer@cwater.com";
	password.value = "password";
}

async function handleLogin() {
	loading.value = true;
	errorMsg.value = "";
	try {
		await session.login(email.value, password.value, serverUrl.value);
	} catch (err) {
		errorMsg.value = err.message || "Failed to authenticate.";
	} finally {
		loading.value = false;
	}
}
</script>
