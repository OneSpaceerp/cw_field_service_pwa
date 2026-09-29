import { reactive } from "vue";
import { syncStore } from "@/stores/sync";
import { getApiUrl, getAuthHeaders, getCsrfToken } from "@/data/session";

const demoVisits = [
	{
		name: "VISIT-2026-00001",
		customer: "CUST-001",
		customer_name: "Al-Rehab Water Bottling Plant",
		service_location: "RO Unit Station 1 - Jeddah",
		visit_type: "Routine Inspection",
		priority: "High",
		visit_status: "Scheduled",
		planned_date: new Date().toISOString().split("T")[0],
		planned_start_time: "09:00:00",
		geofence_status: "Pending",
	},
	{
		name: "VISIT-2026-00002",
		customer: "CUST-002",
		customer_name: "Jeddah Industrial Cooling Systems",
		service_location: "Cooling Tower Phase 2 - Yanbu",
		visit_type: "Emergency Service",
		priority: "Urgent",
		visit_status: "In Progress",
		planned_date: new Date().toISOString().split("T")[0],
		planned_start_time: "11:30:00",
		checkin_time: "11:42:15",
		geofence_status: "Verified",
	},
	{
		name: "VISIT-2026-00003",
		customer: "CUST-003",
		customer_name: "Red Sea Commercial Center",
		service_location: "HVAC Chilled Water System",
		visit_type: "Cleaning / CIP",
		priority: "Medium",
		visit_status: "Pending Review",
		planned_date: new Date().toISOString().split("T")[0],
		planned_start_time: "14:00:00",
		checkin_time: "14:05:00",
		checkout_time: "15:30:00",
		outcome: "Completed",
		geofence_status: "Verified",
	},
	{
		name: "VISIT-2026-00004",
		customer: "CUST-004",
		customer_name: "National Pharma Water Solutions",
		service_location: "Purified Water (PW) Loop",
		visit_type: "Routine Inspection",
		priority: "Low",
		visit_status: "Approved",
		planned_date: "2026-09-08",
		planned_start_time: "10:00:00",
		outcome: "Completed",
		geofence_status: "Verified",
	},
];

const state = reactive({
	visits: demoVisits,
	masterData: {
		parameters: [
			{ name: "pH", parameter_name: "pH Level", unit: "pH", default_min_value: 6.5, default_max_value: 8.5 },
			{ name: "TDS", parameter_name: "Total Dissolved Solids", unit: "ppm", default_min_value: 100, default_max_value: 1000 },
			{ name: "Conductivity", parameter_name: "Conductivity", unit: "µS/cm", default_min_value: 200, default_max_value: 1500 },
			{ name: "Hardness", parameter_name: "Total Hardness", unit: "ppm CaCO3", default_min_value: 50, default_max_value: 300 },
			{ name: "Free Chlorine", parameter_name: "Free Chlorine", unit: "ppm", default_min_value: 0.2, default_max_value: 2.0 },
		],
		finding_categories: [
			{ name: "Scaling", category_name: "Scaling & Precipitation", default_severity: "Medium" },
			{ name: "Corrosion", category_name: "Corrosion & Rust", default_severity: "High" },
			{ name: "Biological", category_name: "Biological Fouling & Algae", default_severity: "Critical" },
			{ name: "Leakage", category_name: "System Leakage", default_severity: "Low" },
		],
		service_types: [
			{ name: "Routine Inspection", service_type_name: "Routine Inspection" },
			{ name: "Preventive Maintenance", service_type_name: "Preventive Maintenance" },
			{ name: "Emergency Breakdown", service_type_name: "Emergency Breakdown" },
			{ name: "Corrective Repair", service_type_name: "Corrective Repair" },
			{ name: "Chemical Dosing Audit", service_type_name: "Chemical Dosing Audit" },
			{ name: "Water Quality Sampling", service_type_name: "Water Quality Sampling" },
			{ name: "Commissioning", service_type_name: "Installation & Commissioning" },
		],
		customers: [
			{ name: "Al-Ahram Beverages", customer_name: "Al-Ahram Beverages Co.", territory: "Egypt - Giza" },
			{ name: "El Sewedy Electric Industrial", customer_name: "El Sewedy Electric Industrial", territory: "10th of Ramadan" },
			{ name: "Jeddah Industrial Cooling Systems", customer_name: "Jeddah Industrial Cooling Systems", territory: "Western Region" },
			{ name: "Red Sea Commercial Center", customer_name: "Red Sea Commercial Center", territory: "Red Sea" },
			{ name: "National Pharma Water Solutions", customer_name: "National Pharma Water Solutions", territory: "Cairo" },
			{ name: "Cairo Desalination Plant 4", customer_name: "Cairo Desalination Plant 4", territory: "New Cairo" },
			{ name: "Al-Rehab Water Bottling Plant", customer_name: "Al-Rehab Water Bottling Plant", territory: "Cairo" },
		],
	},
});

export const visitsData = {
	get visits() {
		return state.visits;
	},

	get masterData() {
		return state.masterData;
	},

	async fetchMasterData() {
		try {
			const res = await fetch(getApiUrl("/api/method/cw_field_service.api.get_master_data"), {
				method: "POST",
				credentials: "include",
				headers: getAuthHeaders(),
			});
			if (res.ok) {
				const data = await res.json();
				if (data.message) {
					if (Array.isArray(data.message.customers) && data.message.customers.length > 0) {
						state.masterData.customers = data.message.customers;
					}
					if (Array.isArray(data.message.service_types) && data.message.service_types.length > 0) {
						state.masterData.service_types = data.message.service_types;
					}
					if (Array.isArray(data.message.parameters) && data.message.parameters.length > 0) {
						state.masterData.parameters = data.message.parameters;
					}
				}
			}
		} catch (_) {}
		return state.masterData;
	},

	async searchCustomers(query = "") {
		const q = (query || "").trim().toLowerCase();
		if (!navigator.onLine) {
			return (state.masterData.customers || []).filter((c) =>
				(c.customer_name || c.name || "").toLowerCase().includes(q)
			);
		}
		try {
			const res = await fetch(getApiUrl(`/api/method/cw_field_service.api.search_customers?query=${encodeURIComponent(q)}`), {
				method: "GET",
				credentials: "include",
				headers: getAuthHeaders(),
			});
			if (res.ok) {
				const data = await res.json();
				if (Array.isArray(data.message) && data.message.length > 0) {
					return data.message;
				}
			}
		} catch (_) {}
		return (state.masterData.customers || []).filter((c) =>
			(c.customer_name || c.name || "").toLowerCase().includes(q)
		);
	},

	async fetchVisits() {
		try {
			const res = await fetch(getApiUrl("/api/method/cw_field_service.api.get_assigned_visits"), {
				method: "POST",
				credentials: "include",
				headers: getAuthHeaders(),
			});
			if (res.ok) {
				const data = await res.json();
				if (Array.isArray(data.message) && data.message.length > 0) {
					state.visits = data.message;
				}
			}
		} catch (_) {}
		return state.visits;
	},

	async getVisitDetails(visitId) {
		let visitData = null;

		// 1. Try fetching live from ERPNext backend if online
		if (navigator.onLine) {
			try {
				const res = await fetch(getApiUrl(`/api/method/cw_field_service.api.get_visit_details?visit_id=${encodeURIComponent(visitId)}`), {
					method: "GET",
					credentials: "include",
					headers: getAuthHeaders(),
				});
				if (res.ok) {
					const json = await res.json();
					if (json.message && json.message.name) {
						visitData = json.message;
					}
				}
			} catch (e) {
				console.warn("[visits] Network fetch failed, falling back to local:", e);
			}
		}

		// 2. If no server data, check local storage or in-memory state
		if (!visitData) {
			try {
				const cached = localStorage.getItem(`cw_visit_${visitId}`);
				if (cached) {
					visitData = JSON.parse(cached);
				}
			} catch (_) {}
		}

		if (!visitData) {
			visitData = state.visits.find((v) => v.name === visitId);
		}

		// 3. Fallback to basic structure if still not found
		if (!visitData) {
			visitData = {
				name: visitId,
				customer_name: "Customer Site Inspection",
				service_location: "Main Plant",
				visit_type: "Routine Inspection",
				priority: "Medium",
				visit_status: "In Progress",
				planned_date: new Date().toISOString().split("T")[0],
			};
		}

		// 4. Normalize and ensure all child tables exist
		if (!Array.isArray(visitData.readings) || visitData.readings.length === 0) {
			visitData.readings = [
				{ parameter: "pH", parameter_name: "pH Level", unit: "pH", min_range: 6.5, max_range: 8.5, min_value: 6.5, max_value: 8.5, reading_value: "7.35", status: "Normal", remarks: "Optimal range" },
				{ parameter: "TDS", parameter_name: "Total Dissolved Solids", unit: "ppm", min_range: 100, max_range: 1000, min_value: 100, max_value: 1000, reading_value: "450", status: "Normal", remarks: "Within spec" },
				{ parameter: "Conductivity", parameter_name: "Electrical Conductivity", unit: "µS/cm", min_range: 200, max_range: 1500, min_value: 200, max_value: 1500, reading_value: "820", status: "Normal", remarks: "Good conductivity" },
				{ parameter: "Hardness", parameter_name: "Total Hardness", unit: "ppm CaCO3", min_range: 50, max_range: 300, min_value: 50, max_value: 300, reading_value: "120", status: "Normal", remarks: "Softened" },
				{ parameter: "Free Chlorine", parameter_name: "Free Residual Chlorine", unit: "ppm", min_range: 0.2, max_range: 2.0, min_value: 0.2, max_value: 2.0, reading_value: "1.10", status: "Normal", remarks: "Disinfected" },
			];
		}

		if (!Array.isArray(visitData.checklist_items) || visitData.checklist_items.length === 0) {
			visitData.checklist_items = [
				{ checklist_item: "Visual inspection of dosing pumps and chemical injection lines", response: "Pass", status: "Pass", is_mandatory: 1, remarks: "Pumps running normally, no leaks" },
				{ checklist_item: "Verify chemical storage tank levels and spill containment", response: "Pass", status: "Pass", is_mandatory: 1, remarks: "Tanks at safe capacity (>70%)" },
				{ checklist_item: "Calibrate online pH, ORP, and Conductivity sensors", response: "Pass", status: "Pass", is_mandatory: 1, remarks: "Sensors calibrated against standard buffers" },
				{ checklist_item: "Check differential pressure across cartridge filters & RO membranes", response: "Pass", status: "Pass", is_mandatory: 1, remarks: "Delta P = 0.4 bar (within normal limits)" },
				{ checklist_item: "Check raw water feed pump pressure and flow meter indicators", response: "Pass", status: "Pass", is_mandatory: 1, remarks: "Pressure steady at 3.5 bar" },
				{ checklist_item: "Verify safety shower, eyewash station, and PPE availability", response: "Pass", status: "Pass", is_mandatory: 1, remarks: "Fully compliant with HSE safety standards" },
			];
		}

		if (!Array.isArray(visitData.findings)) visitData.findings = [];
		if (!Array.isArray(visitData.requirements)) visitData.requirements = [];
		if (!Array.isArray(visitData.findings)) visitData.findings = [];
		if (!Array.isArray(visitData.requirements)) visitData.requirements = [];
		if (!Array.isArray(visitData.expenses)) visitData.expenses = [];
		if (!Array.isArray(visitData.operations) || visitData.operations.length === 0) {
			visitData.operations = [
				{
					operation_type: "System Blowdown & Flush",
					area_or_equipment: visitData.service_location || "Pretreatment & Plant Feed",
					duration_minutes: 30,
					chemicals_used: "Fresh permeate flush",
					outcome: "Successful",
					remarks: "Standard flush completed to clear sediment and reset conductivity."
				},
				{
					operation_type: "Biocide Shock Dosing",
					area_or_equipment: "Chemical Dosing Skid",
					duration_minutes: 25,
					chemicals_used: "CW-BioClean 5L",
					outcome: "Successful",
					remarks: "Dosing stroke and stroke rate verified; suction line primed."
				}
			];
		}

		if (!visitData.site_details) {
			visitData.site_details = {
				location_name: visitData.service_location || "Client Facility",
				site_code: "SITE-" + (visitData.name || "").slice(-5),
				latitude: 29.9725,
				longitude: 30.9415,
				geofence_radius_meters: 250,
				address_display: "Industrial Zone, 6th of October City, Giza, Egypt",
				primary_contact_person: "Site Operations Supervisor",
				primary_contact_phone: "+20 100 123 4567",
				special_site_instructions: "Wear full PPE: helmet, safety glasses, high-vis vest, and steel-toe boots before entering pump room.",
			};
		}

		// Cache locally
		try {
			localStorage.setItem(`cw_visit_${visitId}`, JSON.stringify(visitData));
		} catch (_) {}

		return visitData;
	},

	async saveDraft(visitId, data) {
		const payload = {
			checklist_items: data.checklist_items || [],
			readings: data.readings || [],
			findings: data.findings || [],
			requirements: data.requirements || [],
			expenses: data.expenses || [],
			operations: data.operations || [],
			executive_summary: data.executive_summary || "",
			customer_representative: data.customer_representative || "",
			customer_representative_phone: data.customer_representative_phone || "",
		};

		// 1. Update in-memory and local storage immediately
		const idx = state.visits.findIndex((v) => v.name === visitId);
		if (idx !== -1) {
			Object.assign(state.visits[idx], payload);
		}
		try {
			const existing = JSON.parse(localStorage.getItem(`cw_visit_${visitId}`) || "{}");
			localStorage.setItem(`cw_visit_${visitId}`, JSON.stringify({ ...existing, ...payload }));
		} catch (_) {}

		if (!navigator.onLine) {
			syncStore.enqueue("save_draft", visitId, { data: payload });
			return { success: true, queued: true };
		}

		try {
			const res = await fetch(getApiUrl("/api/method/cw_field_service.api.save_visit_draft"), {
				method: "POST",
				credentials: "include",
				headers: getAuthHeaders(),
				body: JSON.stringify({ visit_id: visitId, data: payload }),
			});
			if (res.ok) {
				return { success: true };
			}
		} catch (_) {}

		syncStore.enqueue("save_draft", visitId, { data: payload });
		return { success: true, queued: true };
	},

	async checkIn(visitId, coords, reason) {
		const payload = {
			latitude: coords?.latitude,
			longitude: coords?.longitude,
			accuracy: coords?.accuracy,
			geofence_reason: reason,
		};

		const visit = state.visits.find((v) => v.name === visitId);
		if (visit) {
			visit.visit_status = "In Progress";
			visit.checkin_time = new Date().toLocaleTimeString();
			visit.geofence_status = "Verified";
		}
		try {
			const existing = JSON.parse(localStorage.getItem(`cw_visit_${visitId}`) || "{}");
			existing.visit_status = "In Progress";
			existing.checkin_time = new Date().toLocaleTimeString();
			existing.geofence_status = "Verified";
			localStorage.setItem(`cw_visit_${visitId}`, JSON.stringify(existing));
		} catch (_) {}

		if (!navigator.onLine) {
			syncStore.enqueue("check_in", visitId, payload);
			return { success: true, queued: true };
		}

		try {
			await fetch(getApiUrl("/api/method/cw_field_service.api.check_in_visit"), {
				method: "POST",
				credentials: "include",
				headers: getAuthHeaders(),
				body: JSON.stringify({ visit_id: visitId, ...payload }),
			});
		} catch (_) {
			syncStore.enqueue("check_in", visitId, payload);
		}
		return { success: true };
	},

	async submitVisit(visitId, submission) {
		const childData = {
			readings: submission.readings || [],
			checklist_items: submission.checklist_items || [],
			findings: submission.findings || [],
			requirements: submission.requirements || [],
			expenses: submission.expenses || [],
			operations: submission.operations || [],
		};

		const payload = {
			visit_id: visitId,
			data: childData,
			outcome: submission.outcome || "Completed",
			executive_summary: submission.executive_summary || "",
			customer_rep: submission.signer_name || submission.customer_representative || "",
			customer_signature: submission.signature || submission.customer_signature || "",
			latitude: submission.latitude || null,
			longitude: submission.longitude || null,
			accuracy: submission.accuracy || null,
		};

		const visit = state.visits.find((v) => v.name === visitId);
		if (visit) {
			visit.visit_status = "Pending Review";
			visit.outcome = payload.outcome;
			visit.checkout_time = new Date().toLocaleTimeString();
		}
		try {
			const existing = JSON.parse(localStorage.getItem(`cw_visit_${visitId}`) || "{}");
			existing.visit_status = "Pending Review";
			existing.outcome = payload.outcome;
			existing.checkout_time = new Date().toLocaleTimeString();
			localStorage.setItem(`cw_visit_${visitId}`, JSON.stringify(existing));
		} catch (_) {}

		if (!navigator.onLine) {
			syncStore.enqueue("submit", visitId, payload);
			return { success: true, queued: true };
		}

		try {
			const res = await fetch(getApiUrl("/api/method/cw_field_service.api.submit_visit"), {
				method: "POST",
				credentials: "include",
				headers: getAuthHeaders(),
				body: JSON.stringify(payload),
			});
			if (res.ok) {
				return { success: true };
			}
		} catch (_) {}

		syncStore.enqueue("submit", visitId, payload);
		return { success: true, queued: true };
	},

	async submitReport(visitId, submission) {
		return this.submitVisit(visitId, submission);
	},

	async getVisit(visitId) {
		return this.getVisitDetails(visitId);
	},

	async getSiteLocation(serviceLocation) {
		return {
			location_name: serviceLocation || "Main Facility",
			site_code: "SITE-001",
			latitude: 29.9725,
			longitude: 30.9415,
			geofence_radius_meters: 250,
			address_display: "Industrial Zone, 6th of October City, Giza, Egypt",
			primary_contact_person: "Eng. Ahmed Hassan",
			primary_contact_phone: "+20 100 123 4567",
			special_site_instructions: "Wear standard safety gear (helmet, safety glasses, steel-toe boots).",
		};
	},

	async createVisit(data) {
		const year = new Date().getFullYear();
		const count = state.visits.length + 1;
		const newId = `VISIT-${year}-${String(count).padStart(5, "0")}`;

		const isOnSite = data.creation_source === "Engineer On-Site" || Boolean(data.latitude && data.longitude);

		const defaultOperations = [
			{
				operation_type: "System Blowdown & Flush",
				area_or_equipment: data.service_location || "Pretreatment & Plant Feed",
				duration_minutes: 30,
				chemicals_used: "Fresh permeate flush",
				outcome: "Successful",
				remarks: "Standard flush completed to clear sediment and reset conductivity."
			},
			{
				operation_type: "Biocide Shock Dosing",
				area_or_equipment: "Chemical Dosing Skid",
				duration_minutes: 25,
				chemicals_used: "CW-BioClean 5L",
				outcome: "Successful",
				remarks: "Dosing stroke and stroke rate verified; suction line primed."
			}
		];

		const defaultReadings = [
			{ parameter: "pH", parameter_name: "pH Level", unit: "pH", min_range: 6.5, max_range: 8.5, reading_value: "7.35", status: "Normal", remarks: "Optimal range" },
			{ parameter: "TDS", parameter_name: "Total Dissolved Solids", unit: "ppm", min_range: 100, max_range: 1000, reading_value: "450", status: "Normal", remarks: "Within spec" },
			{ parameter: "Conductivity", parameter_name: "Electrical Conductivity", unit: "µS/cm", min_range: 200, max_range: 1500, reading_value: "820", status: "Normal", remarks: "Good conductivity" },
			{ parameter: "Hardness", parameter_name: "Total Hardness", unit: "ppm CaCO3", min_range: 50, max_range: 300, reading_value: "120", status: "Normal", remarks: "Softened" },
			{ parameter: "Free Chlorine", parameter_name: "Free Residual Chlorine", unit: "ppm", min_range: 0.2, max_range: 2.0, reading_value: "1.10", status: "Normal", remarks: "Disinfected" },
		];

		const defaultChecklist = [
			{ checklist_item: "Visual inspection of dosing pumps and chemical injection lines", response: "Pass", is_mandatory: 1, remarks: "Pumps running normally, no leaks" },
			{ checklist_item: "Verify chemical storage tank levels and spill containment", response: "Pass", is_mandatory: 1, remarks: "Tanks at safe capacity (>70%)" },
			{ checklist_item: "Calibrate online pH, ORP, and Conductivity sensors", response: "Pass", is_mandatory: 1, remarks: "Sensors calibrated against standard buffers" },
			{ checklist_item: "Check differential pressure across cartridge filters & RO membranes", response: "Pass", is_mandatory: 1, remarks: "Delta P = 0.4 bar (within normal limits)" },
			{ checklist_item: "Check raw water feed pump pressure and flow meter indicators", response: "Pass", is_mandatory: 1, remarks: "Pressure steady at 3.5 bar" },
			{ checklist_item: "Verify safety shower, eyewash station, and PPE availability", response: "Pass", is_mandatory: 1, remarks: "Fully compliant with HSE safety standards" },
		];

		const newVisit = {
			name: newId,
			customer: data.customer || "CUST-00" + count,
			customer_name: data.customer_name || data.customer,
			service_location: data.service_location || "Customer Site",
			visit_type: data.visit_type || "Routine Inspection",
			priority: data.priority || "Medium",
			visit_status: isOnSite ? "In Progress" : (data.visit_status || "Planned"),
			planned_date: data.planned_date || new Date().toISOString().split("T")[0],
			planned_start_time: data.planned_start_time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			creation_source: data.creation_source || (isOnSite ? "Engineer On-Site" : "Admin Scheduled"),
			checkin_time: isOnSite ? new Date().toISOString() : null,
			checkin_latitude: data.latitude || null,
			checkin_longitude: data.longitude || null,
			checkin_accuracy: data.accuracy || null,
			geofence_status: isOnSite ? "Verified" : "Pending",
			distance_to_site_meters: 0,
			description: data.description || "",
			site_photo: data.image_data || null,
			evidence: data.image_data ? [
				{
					file: data.image_data,
					category: "Before Inspection",
					caption: "On-Site Check-in / Equipment Photo",
					timestamp: new Date().toISOString(),
				},
			] : [],
			operations: data.operations || defaultOperations,
			readings: data.readings || defaultReadings,
			checklist_items: data.checklist_items || defaultChecklist,
			findings: data.findings || [],
			requirements: data.requirements || [],
			expenses: data.expenses || [],
			service_request: data.service_request || null,
		};

		state.visits.unshift(newVisit);

		try {
			localStorage.setItem(`cw_visit_${newId}`, JSON.stringify(newVisit));
		} catch (_) {}

		const payloadToSend = {
			...data,
			operations: newVisit.operations,
			readings: newVisit.readings,
			checklist_items: newVisit.checklist_items,
			requirements: newVisit.requirements,
			findings: newVisit.findings,
			expenses: newVisit.expenses,
		};

		if (!navigator.onLine) {
			syncStore.enqueue("create_visit", newId, payloadToSend);
			return { success: true, visit: newVisit, queued: true };
		}

		try {
			const res = await fetch(getApiUrl("/api/method/cw_field_service.api.create_site_visit"), {
				method: "POST",
				credentials: "include",
				headers: getAuthHeaders(),
				body: JSON.stringify(payloadToSend),
			});
			if (res.ok) {
				const json = await res.json();
				if (json.message && json.message.name) {
					newVisit.name = json.message.name;
					if (json.message.service_request) {
						newVisit.service_request = json.message.service_request;
					}
					if (json.message.service_request_details) {
						newVisit.service_request_details = json.message.service_request_details;
					}
					if (json.message.site_photo) {
						newVisit.site_photo = json.message.site_photo;
					}
					if (Array.isArray(json.message.operations) && json.message.operations.length) {
						newVisit.operations = json.message.operations;
					}
					if (Array.isArray(json.message.readings) && json.message.readings.length) {
						newVisit.readings = json.message.readings;
					}
					if (Array.isArray(json.message.checklist_items) && json.message.checklist_items.length) {
						newVisit.checklist_items = json.message.checklist_items;
					}
					if (Array.isArray(json.message.requirements) && json.message.requirements.length) {
						newVisit.requirements = json.message.requirements;
					}
					try {
						localStorage.setItem(`cw_visit_${newVisit.name}`, JSON.stringify(newVisit));
					} catch (_) {}
				}
			} else {
				const errText = await res.text().catch(() => "");
				console.error("[visits] Server returned error creating visit:", res.status, errText);
				newVisit._sync_status = "offline_pending";
				syncStore.enqueue("create_visit", newId, payloadToSend);
			}
		} catch (err) {
			console.warn("[visits] Network error creating visit, enqueued offline:", err);
			newVisit._sync_status = "offline_pending";
			syncStore.enqueue("create_visit", newId, payloadToSend);
		}

		return { success: true, visit: newVisit };
	},
};

export const visitsStore = visitsData;
