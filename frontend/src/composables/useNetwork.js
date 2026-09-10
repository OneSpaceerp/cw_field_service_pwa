import { ref, onMounted, onUnmounted } from "vue";

const isOnline = ref(navigator.onLine);

export function useNetwork() {
	function updateStatus() {
		isOnline.value = navigator.onLine;
	}

	onMounted(() => {
		window.addEventListener("online", updateStatus);
		window.addEventListener("offline", updateStatus);
	});

	onUnmounted(() => {
		window.removeEventListener("online", updateStatus);
		window.removeEventListener("offline", updateStatus);
	});

	return {
		isOnline,
	};
}
