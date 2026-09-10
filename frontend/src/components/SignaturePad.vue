<template>
	<div>
		<div class="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white mb-2 shadow-xs">
			<canvas
				ref="canvasEl"
				class="w-full h-44 block touch-none"
				@mousedown="startDrawing"
				@mousemove="draw"
				@mouseup="stopDrawing"
				@touchstart.prevent="handleTouchStart"
				@touchmove.prevent="handleTouchMove"
				@touchend.prevent="stopDrawing"
			></canvas>
		</div>
		<button
			type="button"
			@click="clear"
			class="w-full py-1.5 px-3 text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
		>
			Clear Signature
		</button>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const canvasEl = ref(null);
let ctx = null;
let isDrawing = false;
let hasDrawn = false;

onMounted(() => {
	const canvas = canvasEl.value;
	if (!canvas) return;
	ctx = canvas.getContext("2d");

	const rect = canvas.getBoundingClientRect();
	const ratio = Math.max(window.devicePixelRatio || 1, 1);
	canvas.width = rect.width * ratio;
	canvas.height = rect.height * ratio;
	ctx.scale(ratio, ratio);

	ctx.strokeStyle = "#0f172a";
	ctx.lineWidth = 2.5;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
});

function getPos(e) {
	const rect = canvasEl.value.getBoundingClientRect();
	return {
		x: e.clientX - rect.left,
		y: e.clientY - rect.top,
	};
}

function startDrawing(e) {
	isDrawing = true;
	const pos = getPos(e);
	ctx.beginPath();
	ctx.moveTo(pos.x, pos.y);
	hasDrawn = true;
}

function draw(e) {
	if (!isDrawing) return;
	const pos = getPos(e);
	ctx.lineTo(pos.x, pos.y);
	ctx.stroke();
}

function stopDrawing() {
	isDrawing = false;
}

function handleTouchStart(e) {
	startDrawing(e.touches[0]);
}

function handleTouchMove(e) {
	draw(e.touches[0]);
}

function clear() {
	if (!ctx || !canvasEl.value) return;
	ctx.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height);
	hasDrawn = false;
}

function isEmpty() {
	return !hasDrawn;
}

function toDataURL() {
	return canvasEl.value ? canvasEl.value.toDataURL("image/png") : null;
}

defineExpose({
	clear,
	isEmpty,
	toDataURL,
});
</script>
