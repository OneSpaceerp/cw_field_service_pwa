<template>
	<div
		v-if="isOpen"
		class="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4"
		style="padding-top: max(1rem, env(safe-area-inset-top)); padding-bottom: max(1rem, env(safe-area-inset-bottom));"
	>
		<!-- Top Bar Controls -->
		<div class="flex items-center justify-between text-white z-20">
			<button
				type="button"
				@click="closeCamera"
				class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all text-white shadow-sm"
				title="Close Camera"
			>
				<FeatherIcon name="x" class="w-5 h-5 stroke-[2.5]" />
			</button>

			<span class="text-xs font-bold tracking-wide uppercase px-3 py-1 bg-white/20 backdrop-blur-md rounded-full shadow-sm">
				Site Camera
			</span>

			<button
				type="button"
				@click="toggleCameraFacing"
				class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all text-white shadow-sm"
				title="Switch Camera (Front/Rear)"
			>
				<FeatherIcon name="refresh-cw" class="w-5 h-5" />
			</button>
		</div>

		<!-- Camera Stream Viewfinder -->
		<div class="relative flex-1 my-3 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-white/10 shadow-2xl">
			<!-- Live Video Stream -->
			<video
				ref="videoRef"
				autoplay
				playsinline
				webkit-playsinline
				muted
				class="w-full h-full object-cover"
			></video>

			<!-- Shutter Flash Effect -->
			<div
				v-if="shutterFlash"
				class="absolute inset-0 bg-white z-30 pointer-events-none transition-opacity duration-150 animate-pulse"
			></div>

			<!-- Targeting Overlay -->
			<div class="absolute inset-0 pointer-events-none flex items-center justify-center">
				<div class="w-64 h-64 border-2 border-white/40 rounded-3xl border-dashed relative">
					<!-- Corner brackets -->
					<div class="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-sky-400"></div>
					<div class="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-sky-400"></div>
					<div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-sky-400"></div>
					<div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-sky-400"></div>
				</div>
			</div>

			<!-- Loading State -->
			<div v-if="isLoading" class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white space-y-2 z-10">
				<div class="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
				<p class="text-xs font-bold">Starting camera stream...</p>
			</div>

			<!-- Stream Error / Fallback State -->
			<div v-if="cameraError" class="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-white p-6 text-center space-y-3 z-10">
				<FeatherIcon name="camera-off" class="w-10 h-10 text-rose-400" />
				<p class="text-xs font-bold text-rose-200">{{ cameraError }}</p>
				<p class="text-[11px] text-slate-300">Tap below to capture using your device system camera.</p>
				<button
					type="button"
					@click="triggerNativeFallback"
					class="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2"
				>
					<FeatherIcon name="camera" class="w-4 h-4" />
					<span>Open Device Camera</span>
				</button>
			</div>
		</div>

		<!-- Bottom Shutter & Controls -->
		<div class="flex items-center justify-around py-2 z-20">
			<!-- Gallery Picker -->
			<button
				type="button"
				@click="triggerGalleryFallback"
				class="flex flex-col items-center gap-1 text-white/80 hover:text-white active:scale-95 transition-all"
				title="Choose from Gallery"
			>
				<div class="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
					<FeatherIcon name="image" class="w-5 h-5" />
				</div>
				<span class="text-[10px] font-bold tracking-wide">Gallery</span>
			</button>

			<!-- Shutter Capture Button -->
			<button
				type="button"
				@click="handleShutterClick"
				:disabled="isCapturing"
				class="w-20 h-20 rounded-full border-4 border-white p-1.5 flex items-center justify-center active:scale-90 transition-transform shadow-2xl disabled:opacity-50 relative group"
				title="Capture Photo"
			>
				<div
					class="w-full h-full rounded-full transition-all flex items-center justify-center pointer-events-none"
					:class="isCapturing ? 'bg-sky-400' : 'bg-white group-active:bg-slate-200'"
				>
					<div v-if="isCapturing" class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
				</div>
			</button>

			<!-- Direct System Camera Fallback -->
			<button
				type="button"
				@click="triggerNativeFallback"
				class="flex flex-col items-center gap-1 text-white/80 hover:text-white active:scale-95 transition-all"
				title="Use Device Camera"
			>
				<div class="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
					<FeatherIcon name="camera" class="w-5 h-5 text-sky-400" />
				</div>
				<span class="text-[10px] font-bold tracking-wide">Device Cam</span>
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
import { ref, watch, nextTick, onBeforeUnmount } from "vue";
import { FeatherIcon } from "frappe-ui";
import { optimizeImage, formatBytes, fileToDataUrl } from "@/utils/image";

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
const isCapturing = ref(false);
const shutterFlash = ref(false);
const cameraError = ref("");
const facingMode = ref("environment"); // environment | user
let activeStream = null;

watch(
	() => props.modelValue,
	async (val) => {
		isOpen.value = val;
		if (val) {
			await nextTick();
			await startCamera();
		} else {
			stopCamera();
		}
	},
	{ immediate: true }
);

async function startCamera() {
	isLoading.value = true;
	cameraError.value = "";

	if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
		cameraError.value = "Camera stream is not supported in this browser mode.";
		isLoading.value = false;
		return;
	}

	stopCamera();

	try {
		const constraints = {
			video: {
				facingMode: { ideal: facingMode.value },
				width: { ideal: 1920, min: 640 },
				height: { ideal: 1080, min: 480 },
			},
			audio: false,
		};

		activeStream = await navigator.mediaDevices.getUserMedia(constraints);
		await nextTick();

		if (videoRef.value) {
			const video = videoRef.value;
			video.muted = true;
			video.playsInline = true;
			video.setAttribute("playsinline", "true");
			video.setAttribute("webkit-playsinline", "true");
			video.setAttribute("autoplay", "true");
			video.setAttribute("muted", "true");
			video.srcObject = activeStream;

			// Await metadata resolution before attempting playback
			await new Promise((resolve) => {
				if (video.readyState >= 1) {
					return resolve();
				}
				video.onloadedmetadata = () => resolve();
				setTimeout(resolve, 800); // 800ms fallback timeout
			});

			try {
				await video.play();
			} catch (playErr) {
				console.warn("[CameraModal] video.play() notice:", playErr);
			}
		}
	} catch (err) {
		console.warn("[CameraModal] getUserMedia failed:", err);
		if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
			cameraError.value = "Camera permission denied. Please allow camera access in browser settings.";
		} else {
			cameraError.value = "Unable to start camera stream. Use device camera instead.";
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

/**
 * Shutter button handler:
 * - If stream is unavailable or errored, immediately opens device system camera.
 * - If stream is live, performs frame capture with shutter flash & haptic feedback.
 */
async function handleShutterClick() {
	if (isCapturing.value) return;

	if (cameraError.value || !activeStream || !videoRef.value) {
		triggerNativeFallback();
		return;
	}

	await captureFrame();
}

async function captureFrame() {
	isCapturing.value = true;

	// Visual shutter flash effect
	shutterFlash.value = true;
	setTimeout(() => {
		shutterFlash.value = false;
	}, 120);

	// Haptic vibration feedback
	if (typeof navigator !== "undefined" && "vibrate" in navigator) {
		try {
			navigator.vibrate([30, 20, 40]);
		} catch (_) {}
	}

	try {
		// Strategy 1: Native hardware sensor capture via ImageCapture API (Android Chrome)
		const track = activeStream?.getVideoTracks()?.[0];
		if (typeof window !== "undefined" && "ImageCapture" in window && track && track.readyState === "live") {
			try {
				const imageCapture = new window.ImageCapture(track);
				const blob = await imageCapture.takePhoto();
				if (blob && blob.size > 500) {
					const optimized = await optimizeImage(blob, 1600, 0.85);
					emitCaptured(optimized.dataUrl, optimized.sizeBytes);
					return;
				}
			} catch (icErr) {
				console.warn("[CameraModal] ImageCapture failed, falling back to canvas:", icErr);
			}
		}

		// Strategy 2: Canvas frame extraction (iOS Safari, Desktop, standard browsers)
		const video = videoRef.value;
		if (!video) throw new Error("Video stream element not found");

		// Wait briefly if video frame hasn't loaded
		if (video.readyState < 2) {
			await new Promise((resolve) => setTimeout(resolve, 150));
		}

		const width = video.videoWidth || video.clientWidth || 1280;
		const height = video.videoHeight || video.clientHeight || 720;

		const canvas = canvasRef.value || document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		if (!ctx) throw new Error("Could not acquire 2D canvas context");

		ctx.drawImage(video, 0, 0, width, height);
		const rawDataUrl = canvas.toDataURL("image/jpeg", 0.90);

		if (!rawDataUrl || rawDataUrl === "data:," || rawDataUrl.length < 200) {
			throw new Error("Canvas captured empty frame");
		}

		const optimized = await optimizeImage(rawDataUrl, 1600, 0.85);
		emitCaptured(optimized.dataUrl, optimized.sizeBytes);
	} catch (err) {
		console.warn("[CameraModal] Frame capture encountered an issue, launching system camera:", err);
		triggerNativeFallback();
	} finally {
		isCapturing.value = false;
	}
}

function emitCaptured(dataUrl, sizeBytes) {
	emit("captured", {
		dataUrl,
		fileName: `site_capture_${Date.now()}.jpg`,
		fileSize: formatBytes(sizeBytes),
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

async function onFallbackFileChange(e) {
	const file = e.target?.files?.[0];
	if (!file) return;

	try {
		isLoading.value = true;
		const dataUrl = await fileToDataUrl(file);
		const optimized = await optimizeImage(dataUrl, 1600, 0.85);

		emit("captured", {
			dataUrl: optimized.dataUrl,
			fileName: file.name || `site_capture_${Date.now()}.jpg`,
			fileSize: optimized.formattedSize,
		});

		closeCamera();
	} catch (err) {
		console.error("[CameraModal] Error processing file from input:", err);
	} finally {
		isLoading.value = false;
		if (e.target) {
			e.target.value = ""; // Reset input so same file can be re-selected if retrying
		}
	}
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
