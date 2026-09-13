<template>
	<div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-sky-50 via-slate-50 to-slate-100">
		<div class="w-full max-w-sm bg-surface-white rounded-3xl shadow-xl border border-outline-gray-1 p-6 relative overflow-hidden">
			<!-- Header with Logo -->
			<div class="text-center mb-6">
				<img src="/assets/logo.png" alt="C-Water" class="h-14 max-w-[80%] mx-auto object-contain mb-3" />
				<h2 class="text-xl font-extrabold text-ink-gray-9">Field Service Sign In</h2>
				<p class="text-xs text-ink-gray-5 mt-1">C-Water Operations & Water Quality Inspection</p>
			</div>

			<!-- Demo Role Quick Chips -->
			<div class="mb-4 p-2.5 bg-surface-gray-2 rounded-2xl border border-outline-gray-1">
				<span class="text-[10px] font-bold text-ink-gray-4 uppercase tracking-wider block mb-1.5">Quick Demo Fill:</span>
				<div class="flex space-x-2">
					<button
						type="button"
						@click="fillRole('engineer')"
						class="flex-1 py-1 px-2 text-[11px] font-bold bg-white text-sky-700 border border-sky-200 rounded-xl hover:bg-sky-50 shadow-2xs transition-all text-center"
					>
						Field Engineer
					</button>
					<button
						type="button"
						@click="fillRole('manager')"
						class="flex-1 py-1 px-2 text-[11px] font-bold bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-all text-center"
					>
						Service Manager
					</button>
				</div>
			</div>

			<form @submit.prevent="handleLogin" class="space-y-3.5">
				<FormControl
					type="text"
					label="Username / Email"
					v-model="email"
					placeholder="engineer@cwater.com"
					required
					class="text-xs"
				/>

				<FormControl
					type="password"
					label="Password"
					v-model="password"
					placeholder="••••••••"
					required
					class="text-xs"
				/>

				<ErrorMessage v-if="errorMsg" :message="errorMsg" />

				<Button
					type="submit"
					variant="solid"
					theme="blue"
					size="lg"
					:loading="loading"
					loading-text="Signing in..."
					class="w-full justify-center !rounded-xl !py-3 font-bold shadow-md text-sm mt-2"
				>
					<template #prefix>
						<FeatherIcon name="log-in" class="w-4 h-4 mr-1" />
					</template>
					Sign In
				</Button>
			</form>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { FormControl, Button, ErrorMessage, FeatherIcon } from "frappe-ui";
import { session } from "@/data/session";

const email = ref("engineer@cwater.com");
const password = ref("password");
const loading = ref(false);
const errorMsg = ref("");

function fillRole(role) {
	if (role === "engineer") {
		email.value = "engineer@cwater.com";
		password.value = "password";
	} else {
		email.value = "manager@cwater.com";
		password.value = "password";
	}
}

async function handleLogin() {
	loading.value = true;
	errorMsg.value = "";
	try {
		await session.login(email.value, password.value);
	} catch (err) {
		errorMsg.value = err.message || "Failed to authenticate.";
	} finally {
		loading.value = false;
	}
}
</script>
