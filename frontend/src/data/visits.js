import { reactive } from "vue";
import { syncStore } from "@/stores/sync";

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
	},
});

export const visitsData = {
	get visits() {
		return state.visits;
	},

	get masterData() {
		return state.masterData;
	},

	async fetchVisits() {
		try {
			const res = await fetch("/api/method/cw_field_service.api.get_assigned_visits", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Frappe-CSRF-Token": window.csrf_token || "",
				},
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
		const base = state.visits.find((v) => v.name === visitId) || state.visits[0];
		return {
			...base,
			site_details: {
				location_name: base.service_location,
				site_code: "SITE-" + base.name.slice(-5),
				latitude: 21.5433,
				longitude: 39.1728,
				geofence_radius_meters: 250,
				address_display: "Industrial Area 3, Jeddah, Saudi Arabia",
				primary_contact_person: "Eng. Ahmed Al-Ghamdi",
				primary_contact_phone: "+966 55 123 4567",
				special_site_instructions: "Wear full PPE (safety helmet, goggles, steel-toe boots). Obtain visitor pass at Gate 2.",
			},
			readings: [
				{ parameter: "pH", parameter_name: "pH Level", unit: "pH", min_value: 6.5, max_value: 8.5, reading_value: 7.35 },
				{ parameter: "TDS", parameter_name: "Total Dissolved Solids", unit: "ppm", min_value: 100, max_value: 1000, reading_value: 450 },
				{ parameter: "Conductivity", parameter_name: "Conductivity", unit: "µS/cm", min_value: 200, max_value: 1500, reading_value: 820 },
				{ parameter: "Hardness", parameter_name: "Total Hardness", unit: "ppm CaCO3", min_value: 50, max_value: 300, reading_value: 120 },
				{ parameter: "Free Chlorine", parameter_name: "Free Chlorine", unit: "ppm", min_value: 0.2, max_value: 2.0, reading_value: 1.1 },
			],
			checklist_items: [
				{ item_description: "Visual inspection of dosing pumps and chemical lines", status: "Pass", remarks: "Pumps running normally" },
				{ item_description: "Verify chemical storage tank levels and spill containment", status: "Pass", remarks: "Tanks at 75% volume" },
				{ item_description: "Calibrate online pH and Conductivity sensors", status: "Pass", remarks: "Sensors calibrated against standard" },
				{ item_description: "Check differential pressure across cartridge filters", status: "Pass", remarks: "Delta P = 0.4 bar (normal)" },
			],
			findings: [
				{ category: "Scaling", severity: "Low", description: "Minor scale on drain valve", corrective_action: "Acid wipe" },
			],
			requirements: [
				{ item_code: "CHEM-CW102", item_name: "Anti-Scalant Polymer CW-102", quantity: 2, unit: "Drums", purpose: "Replenishment" },
			],
			expenses: [
				{ expense_type: "Transport / Fuel", amount: 50.0, description: "Highway fuel" },
			],
			executive_summary: "Water quality parameters verified within target thresholds. System operating safely.",
			customer_representative: "Eng. Ahmed Al-Ghamdi",
		};
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
		}

		if (!navigator.onLine) {
			syncStore.enqueue("check_in", visitId, payload);
			return { success: true, queued: true };
		}

		try {
			await fetch("/api/method/cw_field_service.api.check_in_visit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Frappe-CSRF-Token": window.csrf_token || "",
				},
				body: JSON.stringify({ visit_id: visitId, ...payload }),
			});
		} catch (_) {
			syncStore.enqueue("check_in", visitId, payload);
		}
		return { success: true };
	},

	async submitVisit(visitId, submission) {
		const visit = state.visits.find((v) => v.name === visitId);
		if (visit) {
			visit.visit_status = "Pending Review";
			visit.outcome = submission.outcome;
		}

		if (!navigator.onLine) {
			syncStore.enqueue("submit", visitId, submission);
			return { success: true, queued: true };
		}

		try {
			await fetch("/api/method/cw_field_service.api.submit_visit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Frappe-CSRF-Token": window.csrf_token || "",
				},
				body: JSON.stringify({ visit_id: visitId, ...submission }),
			});
		} catch (_) {
			syncStore.enqueue("submit", visitId, submission);
		}
		return { success: true };
	},
};

export const visitsStore = visitsData;
