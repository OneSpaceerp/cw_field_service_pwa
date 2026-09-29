import { reactive, computed } from "vue";
import { getApiUrl, getAuthHeaders, getCsrfToken } from "@/data/session";

const QUEUE_KEY = "cw_offline_queue";

function generateUUID() {
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

function loadQueue() {
	try {
		const data = localStorage.getItem(QUEUE_KEY);
		return data ? JSON.parse(data) : [];
	} catch (_) {
		return [];
	}
}

function persistQueue(items) {
	try {
		localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
	} catch (_) {}
}

const state = reactive({
	items: loadQueue(),
});

export const syncStore = {
	get items() {
		return state.items;
	},
	pendingCount: computed(() => state.items.length),

	enqueue(action, visitId, payload) {
		const item = {
			idempotency_key: generateUUID(),
			action,
			visit_id: visitId,
			payload,
			queued_at: new Date().toISOString(),
			status: "pending",
		};
		state.items.push(item);
		persistQueue(state.items);
		return item;
	},

	clearQueue() {
		state.items = [];
		persistQueue(state.items);
	},

	async syncAll() {
		if (state.items.length === 0) return { success: true, count: 0 };

		const payload = state.items.map((i) => ({
			idempotency_key: i.idempotency_key,
			action: i.action,
			visit_id: i.visit_id,
			payload: i.payload,
		}));

		try {
			const res = await fetch(getApiUrl("/api/method/cw_field_service.api.sync_queued_visits"), {
				method: "POST",
				credentials: "include",
				headers: getAuthHeaders(),
				body: JSON.stringify({ queue_payload: JSON.stringify(payload) }),
			});

			if (res.ok) {
				const json = await res.json().catch(() => ({}));
				const count = state.items.length;
				this.clearQueue();
				return { success: true, count, results: json.message?.results };
			} else {
				const errText = await res.text().catch(() => "");
				console.error("[Sync] Server sync failed:", res.status, errText);
				return { success: false, error: `Server error ${res.status}` };
			}
		} catch (e) {
			console.warn("[Sync] Server sync unreachable:", e);
			return { success: false, error: e.message };
		}
	},

	initAutoSync() {
		window.addEventListener("online", () => {
			if (state.items.length > 0) {
				this.syncAll();
			}
		});
	},
};

syncStore.initAutoSync();

export function useSyncStore() {
	return syncStore;
}
