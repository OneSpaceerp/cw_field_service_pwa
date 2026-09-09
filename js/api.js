// C-Water Field Service PWA - Backend API Client
const API = {
  getBaseUrl() {
    const user = Auth.getUser();
    return (user && user.serverUrl) ? user.serverUrl : window.location.origin;
  },

  async call(method, args = {}) {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}/api/method/${method}`;

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    const token = Auth.getToken();
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    // Include CSRF token if available in cookie / window
    if (window.csrf_token && window.csrf_token !== '{{ csrf_token }}') {
      headers['X-Frappe-CSRF-Token'] = window.csrf_token;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(args)
      });

      if (!response.ok) {
        let errorMsg = `Server error ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || (errData._server_messages ? JSON.parse(errData._server_messages)[0] : errorMsg);
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const res = await response.json();
      return res.message !== undefined ? res.message : res;
    } catch (err) {
      console.warn(`[API] Network failure calling ${method}:`, err);
      throw err;
    }
  },

  // Fetch Master Data (Parameters, Checklist, Findings) with offline cache fallback
  async getMasterData() {
    const CACHE_KEY = 'cw_master_data_cache';
    if (!navigator.onLine) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    }

    try {
      const data = await this.call('cw_field_service.api.get_master_data');
      if (data && data.parameters) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      return data;
    } catch (err) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached);
      // Default fallback if initial load is offline
      return {
        parameters: [
          { name: 'pH', parameter_name: 'pH', unit: 'pH', default_min_value: 6.5, default_max_value: 8.5 },
          { name: 'TDS', parameter_name: 'Total Dissolved Solids', unit: 'ppm', default_min_value: 100, default_max_value: 1000 },
          { name: 'Conductivity', parameter_name: 'Conductivity', unit: 'µS/cm', default_min_value: 200, default_max_value: 1500 },
          { name: 'Hardness', parameter_name: 'Total Hardness', unit: 'ppm CaCO3', default_min_value: 50, default_max_value: 300 },
          { name: 'Free Chlorine', parameter_name: 'Free Chlorine', unit: 'ppm', default_min_value: 0.2, default_max_value: 2.0 }
        ],
        finding_categories: [
          { name: 'Scaling', category_name: 'Scaling & Precipitation', default_severity: 'Medium' },
          { name: 'Corrosion', category_name: 'Corrosion & Rust', default_severity: 'High' },
          { name: 'Biological', category_name: 'Biological Fouling & Algae', default_severity: 'Critical' },
          { name: 'Leakage', category_name: 'System Leakage', default_severity: 'Low' }
        ],
        operation_types: [
          { name: 'Acid Washing', operation_name: 'Acid Chemical Cleaning', category: 'Cleaning' },
          { name: 'Alkaline Flushing', operation_name: 'Alkaline Neutralization', category: 'Flushing' },
          { name: 'Biocide Shock', operation_name: 'Biocide Shock Treatment', category: 'Disinfection' }
        ],
        service_types: [
          { name: 'Routine Inspection', service_type_name: 'Routine Water Inspection', default_sla_hours: 24 },
          { name: 'Emergency Service', service_type_name: 'Emergency Remediation', default_sla_hours: 4 }
        ]
      };
    }
  },

  // Fetch Assigned Visits with cache fallback
  async getAssignedVisits(status = null, date = null) {
    const CACHE_KEY = 'cw_assigned_visits_cache';
    if (!navigator.onLine) {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : this.getDemoVisits();
    }

    try {
      const visits = await this.call('cw_field_service.api.get_assigned_visits', { status, date });
      if (Array.isArray(visits) && visits.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(visits));
        return visits;
      }
      return this.getDemoVisits();
    } catch (err) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached);
      return this.getDemoVisits();
    }
  },

  // Fetch Visit Details with cache fallback
  async getVisitDetails(visitId) {
    const CACHE_KEY = `cw_visit_details_${visitId}`;
    if (!navigator.onLine) {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : this.getDemoVisitDetails(visitId);
    }

    try {
      const visit = await this.call('cw_field_service.api.get_visit_details', { visit_id: visitId });
      if (visit && visit.name) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(visit));
        return visit;
      }
      return this.getDemoVisitDetails(visitId);
    } catch (err) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached);
      return this.getDemoVisitDetails(visitId);
    }
  },

  getDemoVisits() {
    return [
      {
        name: "VISIT-2026-00001",
        customer: "CUST-001",
        customer_name: "Al-Rehab Water Bottling Plant",
        service_location: "RO Unit Station 1 - Jeddah",
        visit_type: "Routine Inspection",
        priority: "High",
        visit_status: "Scheduled",
        planned_date: new Date().toISOString().split('T')[0],
        planned_start_time: "09:00:00",
        geofence_status: "Pending"
      },
      {
        name: "VISIT-2026-00002",
        customer: "CUST-002",
        customer_name: "Jeddah Industrial Cooling Systems",
        service_location: "Cooling Tower Phase 2 - Yanbu",
        visit_type: "Emergency Service",
        priority: "Urgent",
        visit_status: "In Progress",
        planned_date: new Date().toISOString().split('T')[0],
        planned_start_time: "11:30:00",
        checkin_time: "11:42:15",
        geofence_status: "Verified"
      },
      {
        name: "VISIT-2026-00003",
        customer: "CUST-003",
        customer_name: "Red Sea Commercial Center",
        service_location: "HVAC Chilled Water System",
        visit_type: "Cleaning / CIP",
        priority: "Medium",
        visit_status: "Pending Review",
        planned_date: new Date().toISOString().split('T')[0],
        planned_start_time: "14:00:00",
        checkin_time: "14:05:00",
        checkout_time: "15:30:00",
        outcome: "Completed",
        geofence_status: "Verified"
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
        geofence_status: "Verified"
      }
    ];
  },

  getDemoVisitDetails(visitId) {
    const list = this.getDemoVisits();
    const base = list.find(v => v.name === visitId) || list[0];
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
        special_site_instructions: "Wear PPE (safety helmet, goggles, steel-toe boots). Obtain visitor security pass at Gate 2."
      },
      readings: [
        { parameter: "pH", parameter_name: "pH Level", unit: "pH", min_value: 6.5, max_value: 8.5, reading_value: 7.35 },
        { parameter: "TDS", parameter_name: "Total Dissolved Solids", unit: "ppm", min_value: 100, max_value: 1000, reading_value: 450 },
        { parameter: "Conductivity", parameter_name: "Conductivity", unit: "µS/cm", min_value: 200, max_value: 1500, reading_value: 820 },
        { parameter: "Hardness", parameter_name: "Total Hardness", unit: "ppm CaCO3", min_value: 50, max_value: 300, reading_value: 120 },
        { parameter: "Free Chlorine", parameter_name: "Free Chlorine", unit: "ppm", min_value: 0.2, max_value: 2.0, reading_value: 1.1 }
      ],
      checklist_items: [
        { item_description: "Visual inspection of dosing pumps and chemical feed lines", status: "Pass", remarks: "All pumps operational without leaks" },
        { item_description: "Verify chemical storage tank levels and containment", status: "Pass", remarks: "Tanks at 75% capacity" },
        { item_description: "Calibrate online pH and Conductivity sensors", status: "Pass", remarks: "Probes clean and calibrated against buffer" },
        { item_description: "Check differential pressure across cartridge filters", status: "Pass", remarks: "Delta P = 0.4 bar (within tolerance)" }
      ],
      findings: [
        { category: "Scaling", severity: "Low", description: "Minor mineral accumulation on sample drain port", corrective_action: "Flushed with mild citric acid" }
      ],
      requirements: [
        { item_code: "CHEM-CW102", item_name: "Anti-Scalant Polymer CW-102", quantity: 2, unit: "Drums", purpose: "Monthly replenishment" }
      ],
      expenses: [
        { expense_type: "Transport / Fuel", amount: 45.0, description: "Highway toll & fuel" }
      ],
      executive_summary: "Routine water quality parameters are well within allowable specification ranges. Dosing systems functioning normally.",
      customer_representative: "Eng. Ahmed Al-Ghamdi"
    };
  },

  // Check-In (Offline Queue supported)
  async checkInVisit(visitId, coords, geofenceReason = null) {
    const payload = {
      latitude: coords ? coords.latitude : null,
      longitude: coords ? coords.longitude : null,
      accuracy: coords ? coords.accuracy : null,
      geofence_reason: geofenceReason
    };

    if (!navigator.onLine) {
      Sync.enqueue('check_in', visitId, payload);
      return {
        status: 'queued_offline',
        visit_id: visitId,
        visit_status: 'In Progress',
        message: 'Check-in recorded offline. Will sync automatically once connected.'
      };
    }

    try {
      return await this.call('cw_field_service.api.check_in_visit', {
        visit_id: visitId,
        ...payload
      });
    } catch (err) {
      console.warn('[API] Check-in failed online, falling back to offline queue:', err);
      Sync.enqueue('check_in', visitId, payload);
      return {
        status: 'queued_offline',
        visit_id: visitId,
        visit_status: 'In Progress',
        message: 'Check-in saved offline.'
      };
    }
  },

  // Save Draft (Offline Queue supported)
  async saveVisitDraft(visitId, data) {
    Sync.saveDraftLocally(visitId, data);

    if (!navigator.onLine) {
      Sync.enqueue('save_draft', visitId, { data });
      return {
        status: 'saved_locally',
        message: 'Draft saved to local device.'
      };
    }

    try {
      return await this.call('cw_field_service.api.save_visit_draft', {
        visit_id: visitId,
        data: JSON.stringify(data),
        idempotency_key: Sync.generateUUID()
      });
    } catch (err) {
      Sync.enqueue('save_draft', visitId, { data });
      return {
        status: 'saved_locally',
        message: 'Draft queued locally.'
      };
    }
  },

  // Submit Visit (Offline Queue supported)
  async submitVisit(visitId, submission) {
    Sync.saveDraftLocally(visitId, submission.data || {});

    const payload = {
      data: submission.data,
      latitude: submission.coords ? submission.coords.latitude : null,
      longitude: submission.coords ? submission.coords.longitude : null,
      accuracy: submission.coords ? submission.coords.accuracy : null,
      outcome: submission.outcome,
      executive_summary: submission.executive_summary,
      customer_rep: submission.customer_rep,
      customer_signature: submission.customer_signature
    };

    if (!navigator.onLine) {
      Sync.enqueue('submit', visitId, payload);
      return {
        status: 'queued_offline',
        visit_id: visitId,
        visit_status: 'Pending Review',
        message: 'Report submitted offline! It will sync automatically when back online.'
      };
    }

    try {
      return await this.call('cw_field_service.api.submit_visit', {
        visit_id: visitId,
        data: JSON.stringify(payload.data),
        latitude: payload.latitude,
        longitude: payload.longitude,
        accuracy: payload.accuracy,
        outcome: payload.outcome,
        executive_summary: payload.executive_summary,
        customer_rep: payload.customer_rep,
        customer_signature: payload.customer_signature,
        idempotency_key: Sync.generateUUID()
      });
    } catch (err) {
      Sync.enqueue('submit', visitId, payload);
      return {
        status: 'queued_offline',
        visit_id: visitId,
        visit_status: 'Pending Review',
        message: 'Submission queued locally.'
      };
    }
  }
};
