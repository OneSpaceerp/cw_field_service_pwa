/**
 * Image processing utilities for C-Water Field Service PWA
 * Handles resizing, compression, and format normalization for site evidence photos.
 */

/**
 * Convert a File or Blob into a base64 Data URL.
 * @param {File|Blob} file
 * @returns {Promise<string>}
 */
export function fileToDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => resolve(e.target.result);
		reader.onerror = (err) => reject(err);
		reader.readAsDataURL(file);
	});
}

/**
 * Compresses and scales an image (Data URL or File) to a maximum dimension
 * and specified JPEG quality to ensure fast mobile uploads.
 * @param {string|File|Blob} input - Data URL string or File/Blob object
 * @param {number} maxDimension - Maximum width or height in pixels (default 1600)
 * @param {number} quality - JPEG compression quality between 0.1 and 1.0 (default 0.85)
 * @returns {Promise<{ dataUrl: string, width: number, height: number, sizeBytes: number, formattedSize: string }>}
 */
export async function optimizeImage(input, maxDimension = 1600, quality = 0.85) {
	let dataUrl;
	if (typeof input === "string") {
		dataUrl = input;
	} else if (input instanceof Blob || input instanceof File) {
		dataUrl = await fileToDataUrl(input);
	} else {
		throw new Error("Invalid image input for optimization");
	}

	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			let width = img.naturalWidth || img.width;
			let height = img.naturalHeight || img.height;

			// If image has valid dimensions, calculate aspect-ratio preserving dimensions
			if (width > maxDimension || height > maxDimension) {
				if (width > height) {
					height = Math.round((height * maxDimension) / width);
					width = maxDimension;
				} else {
					width = Math.round((width * maxDimension) / height);
					height = maxDimension;
				}
			}

			// Render onto off-screen canvas
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;

			const ctx = canvas.getContext("2d", { willReadFrequently: true });
			if (!ctx) {
				// Fallback to original if canvas context unavailable
				const estimatedSize = Math.round((dataUrl.length * 3) / 4);
				resolve({
					dataUrl,
					width: img.naturalWidth,
					height: img.naturalHeight,
					sizeBytes: estimatedSize,
					formattedSize: formatBytes(estimatedSize),
				});
				return;
			}

			// Smooth scaling
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = "high";
			ctx.drawImage(img, 0, 0, width, height);

			try {
				const optimizedDataUrl = canvas.toDataURL("image/jpeg", quality);
				const sizeBytes = Math.round((optimizedDataUrl.length * 3) / 4);

				resolve({
					dataUrl: optimizedDataUrl,
					width,
					height,
					sizeBytes,
					formattedSize: formatBytes(sizeBytes),
				});
			} catch (canvasErr) {
				console.warn("[image.js] Canvas toDataURL failed, using original:", canvasErr);
				const estimatedSize = Math.round((dataUrl.length * 3) / 4);
				resolve({
					dataUrl,
					width,
					height,
					sizeBytes: estimatedSize,
					formattedSize: formatBytes(estimatedSize),
				});
			}
		};

		img.onerror = (err) => {
			console.warn("[image.js] Failed to load image for optimization, falling back:", err);
			const estimatedSize = Math.round((dataUrl.length * 3) / 4);
			resolve({
				dataUrl,
				width: 0,
				height: 0,
				sizeBytes: estimatedSize,
				formattedSize: formatBytes(estimatedSize),
			});
		};

		img.src = dataUrl;
	});
}

/**
 * Format bytes into readable string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
	if (!bytes || bytes <= 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
