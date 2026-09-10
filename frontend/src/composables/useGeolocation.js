export function useGeolocation() {
	function getCurrentPosition(timeoutMs = 15000) {
		return new Promise((resolve, reject) => {
			if (!navigator.geolocation) {
				reject(new Error("Geolocation is not supported by your browser."));
				return;
			}

			navigator.geolocation.getCurrentPosition(
				(pos) => {
					resolve({
						latitude: pos.coords.latitude,
						longitude: pos.coords.longitude,
						accuracy: pos.coords.accuracy,
						timestamp: new Date(pos.timestamp).toISOString(),
					});
				},
				(err) => {
					let msg = "Failed to acquire GPS location.";
					if (err.code === err.PERMISSION_DENIED) msg = "Location permission denied.";
					else if (err.code === err.POSITION_UNAVAILABLE) msg = "GPS position unavailable.";
					else if (err.code === err.TIMEOUT) msg = "GPS request timed out.";
					reject(new Error(msg));
				},
				{ enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 10000 }
			);
		});
	}

	function haversineDistance(lat1, lon1, lat2, lon2) {
		if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
		const R = 6371000;
		const toRad = (d) => (d * Math.PI) / 180;
		const dLat = toRad(lat2 - lat1);
		const dLon = toRad(lon2 - lon1);

		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return Math.round(R * c);
	}

	function evaluateGeofence(siteLat, siteLon, currentLat, currentLon, radiusMeters = 200, bufferMeters = 50) {
		if (!siteLat || !siteLon) {
			return {
				distance: 0,
				status: "Verified",
				requiresReason: false,
				message: "No site coordinates configured. Geofence bypassed.",
			};
		}

		const dist = haversineDistance(siteLat, siteLon, currentLat, currentLon);
		const allowedMax = (radiusMeters || 200) + (bufferMeters || 50);

		if (dist <= (radiusMeters || 200)) {
			return {
				distance: dist,
				status: "Verified",
				requiresReason: false,
				message: `Within site boundary (${dist}m / ${radiusMeters}m)`,
			};
		} else if (dist <= allowedMax) {
			return {
				distance: dist,
				status: "Warning",
				requiresReason: false,
				message: `Within buffer zone (${dist}m / max ${allowedMax}m)`,
			};
		} else {
			return {
				distance: dist,
				status: "Exception",
				requiresReason: true,
				message: `Outside geofence (${dist}m). Justification reason required.`,
			};
		}
	}

	return {
		getCurrentPosition,
		haversineDistance,
		evaluateGeofence,
	};
}
