<template>
	<div class="min-h-screen flex items-center justify-center p-4 bg-surface-gray-1">
		<div class="w-full max-w-sm bg-surface-white rounded-2xl shadow-xl border border-outline-gray-1 p-6">
			<div class="text-center mb-6">
				<img src="/assets/logo.png" alt="C-Water Logo" class="h-14 max-w-[80%] mx-auto object-contain mb-3" />
				<h2 class="text-xl font-extrabold text-ink-gray-9">Engineer Sign In</h2>
				<p class="text-xs text-ink-gray-5 mt-1">Field Service & Water Testing PWA</p>
			</div>

			<form @submit.prevent="handleLogin" class="space-y-4">
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

				<FormControl
					type="url"
					label="ERPNext Server URL (Optional)"
					v-model="serverUrl"
					placeholder="https://erp.cwater.com"
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
					class="w-full justify-center !rounded-xl !py-2.5 font-bold shadow-sm"
				>
					<template #prefix>
						<FeatherIcon name="log-in" class="w-4 h-4" />
					</template>
					Sign In
				</Button>

				<Button
					type="button"
					variant="subtle"
					theme="gray"
					size="md"
					class="w-full justify-center !rounded-xl text-xs font-semibold"
					@click="fillDemo"
				>
					Use Demo Credentials
				</Button>
			</form>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { FormControl, Button, ErrorMessage, FeatherIcon } from "frappe-ui";
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
