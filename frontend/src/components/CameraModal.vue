<template>
	<div
		v-if="isOpen"
		class="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4"
		style="padding-top: max(1rem, env(safe-area-inset-top)); padding-bottom: max(1rem, env(safe-area-inset-bottom));"
	>
		<!-- Top Bar Controls -->
		<div class="flex items-center justify-between text-white z-10">
			<button
				type="button"
				@click="closeCamera"
				class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all text-white"
			>
				<FeatherIcon name="x" class="w-5 h-5 stroke-[2.5]" />
			</button>

			<span class="text-xs font-bold tracking-wide uppercase px-3 py-1 bg-white/20 backdrop-blur-md rounded-full">
				Site Camera
			</span>

			<button
				type="button"
				@click="toggleCameraFacing"
				class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all text-white"
				title="Switch Camera"
			>
				<FeatherIcon name="refresh-cw" class="w-5 h-5" />
			</button>
		</div>

		<!-- Camera Stream Viewfinder -->
		<div class="relative flex-1 my-4 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border border-white/10">
			<video
				ref="videoRef"
				autoplay
				playsinline
				muted
				class="w-full h-full object-cover"
			></video>

			<!-- Targeting Overlay -->
			<div class="absolute inset-0 pointer-events-none flex items-center justify-center">
				<div class="w-64 h-64 border-2 border-white/40 rounded-3xl border-dashed"></div>
			</div>

			<!-- Loading State -->
			<div v-if="isLoading" class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white space-y-2">
				<div class="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
				<p class="text-xs font-bold">Starting camera stream...</p>
			</div>

			<!-- Error State -->
			<div v-if="cameraError" class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
				<FeatherIcon name="camera-off" class="w-10 h-10 text-rose-400" />
				<p class="text-xs font-bold text-rose-200">{{ cameraError }}</p>
				<p class="text-[11px] text-slate-300">Tap below to use native system camera instead.</p>
				<button
					type="button"
					@click="triggerNativeFallback"
					class="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md"
				>
					Use Native Camera
				</button>
			</div>
		</div>

		<!-- Bottom Shutter & Controls -->
		<div class="flex items-center justify-around py-2 z-10">
			<!-- Gallery Fallback -->
			<button
				type="button"
				@click="triggerGalleryFallback"
				class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all"
				title="Choose from Gallery"
			>
				<FeatherIcon name="image" class="w-5 h-5" />
			</button>

			<!-- Shutter Capture Button -->
			<button
				type="button"
				@click="captureFrame"
				:disabled="isLoading || cameraError"
				class="w-20 h-20 rounded-full border-4 border-white p-1 flex items-center justify-center active:scale-90 transition-transform shadow-xl disabled:opacity-50"
			>
				<div class="w-full h-full bg-white rounded-full"></div>
			</button>

			<!-- Close/Cancel button -->
			<button
				type="button"
				@click="closeCamera"
				class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all"
			>
				<span class="text-xs font-bold">Cancel</span>
			</button>
		</div>

		<!-- Hidden Elements for Frame Capture -->
		<canvas ref="canvasRef" class="hidden"></canvas>
		<input
			type="file"
			ref="fallbackInput"
			accept="image/*"
			capture="environment"
			class="hidden"
			@change="onFallbackFileChange"
		/>
		<input
			type="file"
			ref="galleryFallbackInput"
			accept="image/*"
			class="hidden"
			@change="onFallbackFileChange"
		/>
	</div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from "vue";
import { FeatherIcon } from "frappe-ui";

const props = defineProps({
	modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "captured"]);

const isOpen = ref(false);
const videoRef = ref(null);
const canvasRef = ref(null);
const fallbackInput = ref(null);
const galleryFallbackInput = ref(null);

const isLoading = ref(false);
const cameraError = ref("");
const facingMode = ref("environment"); // environment | user
let activeStream = null;

watch(
	() => props.modelValue,
	(val) => {
		isOpen.value = val;
		if (val) {
			startCamera();
		} else {
			stopCamera();
		}
	},
	{ immediate: true }
);

async function startCamera() {
	isLoading.value = true;
	cameraError.value = "";

	if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
		cameraError.value = "Camera stream is not supported in this browser mode.";
		isLoading.value = false;
		return;
	}

	stopCamera();

	try {
		const constraints = {
			video: {
				facingMode: facingMode.value,
				width: { ideal: 1920 },
				height: { ideal: 1080 },
			},
			audio: false,
		};

		activeStream = await navigator.mediaDevices.getUserMedia(constraints);
		if (videoRef.value) {
			videoRef.value.srcObject = activeStream;
			await videoRef.value.play();
		}
	} catch (err) {
		console.warn("[CameraModal] getUserMedia failed:", err);
		if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
			cameraError.value = "Camera permission denied. Please allow camera access in your device settings.";
		} else {
			cameraError.value = "Unable to start camera stream. Use native capture instead.";
		}
	} finally {
		isLoading.value = false;
	}
}

function stopCamera() {
	if (activeStream) {
		activeStream.getTracks().forEach((track) => track.stop());
		activeStream = null;
	}
	if (videoRef.value) {
		videoRef.value.srcObject = null;
	}
}

function toggleCameraFacing() {
	facingMode.value = facingMode.value === "environment" ? "user" : "environment";
	startCamera();
}

function captureFrame() {
	if (!videoRef.value || !canvasRef.value) return;

	const video = videoRef.value;
	const canvas = canvasRef.value;

	canvas.width = video.videoWidth || 1280;
	canvas.height = video.videoHeight || 720;

	const ctx = canvas.getContext("2d");
	ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

	const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

	// Haptic feedback
	if (typeof navigator !== "undefined" && "vibrate" in navigator) {
		try {
			navigator.vibrate(50);
		} catch (_) {}
	}

	emit("captured", {
		dataUrl,
		fileName: `site_capture_${Date.now()}.jpg`,
		fileSize: formatBytes(Math.round((dataUrl.length * 3) / 4)),
	});

	closeCamera();
}

function triggerNativeFallback() {
	if (fallbackInput.value) {
		fallbackInput.value.click();
	}
}

function triggerGalleryFallback() {
	if (galleryFallbackInput.value) {
		galleryFallbackInput.value.click();
	}
}

function onFallbackFileChange(e) {
	const file = e.target?.files?.[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = (ev) => {
		emit("captured", {
			dataUrl: ev.target.result,
			fileName: file.name || `site_capture_${Date.now()}.jpg`,
			fileSize: formatBytes(file.size),
		});
		closeCamera();
	};
	reader.readAsDataURL(file);
}

function formatBytes(bytes) {
	if (!bytes || bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function closeCamera() {
	stopCamera();
	isOpen.value = false;
	emit("update:modelValue", false);
}

onBeforeUnmount(() => {
	stopCamera();
});
</script>
