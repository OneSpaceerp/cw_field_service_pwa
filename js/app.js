// C-Water Field Service PWA - Main Application Controller
const App = {
  state: {
    currentView: 'home',
    activeVisitId: null,
    activeVisit: null,
    activeSubtab: 'info',
    visits: [],
    masterData: { parameters: [], finding_categories: [], operation_types: [], service_types: [] },
    signaturePad: null,
    currentFilter: 'all'
  },

  async init() {
    console.log('[App] Initializing C-Water Field Service PWA...');

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('./sw.js');
        console.log('[App] Service Worker registered successfully.');
      } catch (e) {
        console.warn('[App] Service Worker registration failed:', e);
      }
    }

    // Network Status Listeners
    this.updateOnlineStatus();
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());

    // Initialize Auto-Sync
    Sync.initAutoSync(API);
    Sync.onChange((queue) => this.updateSyncBadge(queue));

    // Check Authentication
    if (!Auth.isAuthenticated()) {
      this.showView('login');
    } else {
      await this.loadInitialData();
      this.showView('home');
    }

    this.bindGlobalEvents();
  },

  updateOnlineStatus() {
    const badge = document.getElementById('network-badge');
    if (!badge) return;
    if (navigator.onLine) {
      badge.className = 'network-badge online';
      badge.innerHTML = '<span class="dot"></span> Online';
    } else {
      badge.className = 'network-badge offline';
      badge.innerHTML = '<span class="dot"></span> Offline';
    }
  },

  updateSyncBadge(queue) {
    const btn = document.getElementById('sync-counter-btn');
    if (!btn) return;
    const count = queue.length;
    btn.textContent = count > 0 ? `${count} Queued` : 'Synced';
    btn.style.display = count > 0 ? 'inline-block' : 'none';
  },

  async loadInitialData() {
    try {
      this.state.masterData = await API.getMasterData();
      this.state.visits = await API.getAssignedVisits();
      this.renderHome();
      this.renderVisitsList();
    } catch (err) {
      this.showToast('Failed to load online data. Working offline.', 'warning');
      this.renderHome();
      this.renderVisitsList();
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4000);
  },

  showView(viewName) {
    this.state.currentView = viewName;
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.add('active');

    // Update Bottom Nav active state
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-view') === viewName);
    });

    // View-specific lifecycle hooks
    if (viewName === 'home') this.renderHome();
    if (viewName === 'visits') this.renderVisitsList();
    if (viewName === 'sync-queue') this.renderSyncQueue();
    if (viewName === 'profile') this.renderProfile();
  },

  bindGlobalEvents() {
    // Bottom Nav clicks
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const view = item.getAttribute('data-view');
        if (view) this.showView(view);
      });
    });

    // Sync button click
    const syncBtn = document.getElementById('sync-counter-btn');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => this.showView('sync-queue'));
    }

    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usr = document.getElementById('login-username').value.trim();
        const pwd = document.getElementById('login-password').value.trim();
        const srv = document.getElementById('login-server').value.trim();

        try {
          await Auth.login(usr, pwd, srv);
          this.showToast('Logged in successfully', 'success');
          await this.loadInitialData();
          this.showView('home');
        } catch (err) {
          this.showToast(err.message || 'Login failed', 'error');
        }
      });
    }
  },

  // ----------------------------------------------------
  // Home Dashboard
  // ----------------------------------------------------
  renderHome() {
    const user = Auth.getUser();
    const greetingEl = document.getElementById('home-greeting');
    if (greetingEl) {
      greetingEl.textContent = user ? `Welcome back, ${user.fullName}` : 'Welcome, Field Engineer';
    }

    const visits = this.state.visits || [];
    const scheduled = visits.filter(v => v.visit_status === 'Scheduled').length;
    const inProgress = visits.filter(v => v.visit_status === 'In Progress').length;
    const pending = visits.filter(v => v.visit_status === 'Pending Review').length;
    const completed = visits.filter(v => v.visit_status === 'Approved').length;

    const elScheduled = document.getElementById('stat-scheduled');
    const elInProgress = document.getElementById('stat-inprogress');
    const elPending = document.getElementById('stat-pending');
    const elCompleted = document.getElementById('stat-completed');

    if (elScheduled) elScheduled.textContent = scheduled;
    if (elInProgress) elInProgress.textContent = inProgress;
    if (elPending) elPending.textContent = pending;
    if (elCompleted) elCompleted.textContent = completed;

    // Render Next Up card
    const nextVisit = visits.find(v => v.visit_status === 'In Progress') || visits.find(v => v.visit_status === 'Scheduled');
    const nextCardEl = document.getElementById('home-next-visit-card');
    if (nextCardEl) {
      if (nextVisit) {
        nextCardEl.innerHTML = `
          <div class="card-header">
            <div>
              <div class="card-title">${nextVisit.customer_name || nextVisit.customer}</div>
              <div class="card-sub">${nextVisit.service_location || 'Site Location'}</div>
            </div>
            <span class="badge badge-${nextVisit.visit_status.toLowerCase().replace(' ', '-')}">${nextVisit.visit_status}</span>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
            <strong>Planned:</strong> ${nextVisit.planned_date || 'Today'} ${nextVisit.planned_start_time || ''}
          </p>
          <button class="btn btn-primary btn-block" onclick="App.openVisit('${nextVisit.name}')">
            ${nextVisit.visit_status === 'In Progress' ? 'Continue Inspection' : 'Start Visit & Check-In'}
          </button>
        `;
      } else {
        nextCardEl.innerHTML = `<p style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 20px;">No scheduled visits for today.</p>`;
      }
    }
  },

  // ----------------------------------------------------
  // Visits List
  // ----------------------------------------------------
  renderVisitsList() {
    const listEl = document.getElementById('visits-list-container');
    if (!listEl) return;

    let visits = this.state.visits || [];
    if (this.state.currentFilter !== 'all') {
      visits = visits.filter(v => v.visit_status === this.state.currentFilter);
    }

    if (visits.length === 0) {
      listEl.innerHTML = `<div class="card" style="text-align: center; padding: 30px; color: var(--text-muted);">No visits found for the selected filter.</div>`;
      return;
    }

    listEl.innerHTML = visits.map(v => `
      <div class="card" style="cursor: pointer;" onclick="App.openVisit('${v.name}')">
        <div class="card-header">
          <div>
            <div class="card-title">${v.customer_name || v.customer}</div>
            <div class="card-sub">${v.service_location || 'Site Location'} &bull; ${v.visit_type || 'Routine'}</div>
          </div>
          <span class="badge badge-${v.visit_status.toLowerCase().replace(' ', '-')}">${v.visit_status}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted); margin-top: 8px;">
          <span>Planned: ${v.planned_date || 'N/A'}</span>
          <span style="color: var(--secondary); font-weight: 600;">Open &rarr;</span>
        </div>
      </div>
    `).join('');
  },

  setVisitFilter(filter) {
    this.state.currentFilter = filter;
    document.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
    });
    this.renderVisitsList();
  },

  // ----------------------------------------------------
  // Visit Details & Execution
  // ----------------------------------------------------
  async openVisit(visitId) {
    this.state.activeVisitId = visitId;
    this.showView('visit-detail');

    try {
      this.state.activeVisit = await API.getVisitDetails(visitId);
    } catch (err) {
      this.state.activeVisit = (this.state.visits || []).find(v => v.name === visitId) || { name: visitId };
    }

    // Merge any offline draft saved
    const draft = Sync.getDraft(visitId);
    if (draft) {
      this.state.activeVisit = { ...this.state.activeVisit, ...draft };
    }

    this.switchVisitSubtab('info');
    this.renderVisitHeader();
  },

  renderVisitHeader() {
    const v = this.state.activeVisit;
    if (!v) return;

    const titleEl = document.getElementById('visit-detail-title');
    const subEl = document.getElementById('visit-detail-sub');
    const badgeEl = document.getElementById('visit-detail-status-badge');

    if (titleEl) titleEl.textContent = v.customer_name || v.customer || v.name;
    if (subEl) subEl.textContent = `${v.service_location || 'Site Location'} &bull; ${v.name}`;
    if (badgeEl) {
      badgeEl.className = `badge badge-${(v.visit_status || 'scheduled').toLowerCase().replace(' ', '-')}`;
      badgeEl.textContent = v.visit_status || 'Scheduled';
    }
  },

  switchVisitSubtab(tab) {
    this.state.activeSubtab = tab;
    document.querySelectorAll('.visit-subtab').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.subtab-btn').forEach(el => el.classList.toggle('active', el.getAttribute('data-tab') === tab));

    const target = document.getElementById(`subtab-${tab}`);
    if (target) target.classList.add('active');

    // Tab-specific rendering
    if (tab === 'info') this.renderTabInfo();
    if (tab === 'readings') this.renderTabReadings();
    if (tab === 'checklist') this.renderTabChecklist();
    if (tab === 'findings') this.renderTabFindings();
    if (tab === 'requirements') this.renderTabRequirements();
    if (tab === 'expenses') this.renderTabExpenses();
    if (tab === 'sign') this.renderTabSign();
  },

  // Subtab 1: Info & Check-in
  renderTabInfo() {
    const v = this.state.activeVisit;
    const site = v.site_details || {};
    const container = document.getElementById('subtab-info');
    if (!container) return;

    const isCheckedIn = v.visit_status === 'In Progress' || v.visit_status === 'Pending Review' || v.visit_status === 'Approved';

    container.innerHTML = `
      <div class="card">
        <div class="card-title" style="margin-bottom: 8px;">Site Details</div>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;"><strong>Address:</strong> ${site.address_display || 'Not specified'}</p>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;"><strong>Contact Person:</strong> ${site.primary_contact_person || 'N/A'}</p>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;"><strong>Phone:</strong> ${site.primary_contact_phone || 'N/A'}</p>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;"><strong>Instructions:</strong> ${site.special_site_instructions || 'None'}</p>
        
        <div style="background: #f8fafc; border: 1.5px solid var(--surface-border); border-radius: 10px; padding: 12px; margin-bottom: 14px; font-size: 13px; color: var(--text-main);">
          <div><strong>Target Site GPS:</strong> ${site.latitude || '0.0'}, ${site.longitude || '0.0'}</div>
          <div style="margin-top: 4px;"><strong>Geofence Radius:</strong> ${site.geofence_radius_meters || 200} meters</div>
        </div>

        ${!isCheckedIn ? `
          <button class="btn btn-primary btn-block" onclick="App.handleCheckIn()">
            <svg style="width: 18px; height: 18px; fill: currentColor;" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            Capture GPS & Check-In
          </button>
        ` : `
          <div style="padding: 10px; background: var(--success-bg); border: 1px solid var(--success); border-radius: 8px; font-size: 13px; color: var(--success); text-align: center;">
            Checked in on ${v.checkin_time || 'Today'} (GPS Verified)
          </div>
        `}
      </div>
    `;
  },

  async handleCheckIn() {
    this.showToast('Acquiring high-accuracy GPS coordinates...', 'info');
    try {
      const coords = await Geo.getCurrentPosition();
      const site = this.state.activeVisit.site_details || {};
      const geoResult = Geo.evaluateGeofence(site.latitude, site.longitude, coords.latitude, coords.longitude, site.geofence_radius_meters || 200);

      let reason = null;
      if (geoResult.requiresReason) {
        reason = prompt(`You are ${geoResult.distance}m away from the target site. Please enter reason for remote/offsite check-in:`);
        if (!reason) {
          this.showToast('Check-in aborted: Geofence justification required.', 'warning');
          return;
        }
      }

      const res = await API.checkInVisit(this.state.activeVisitId, coords, reason);
      this.state.activeVisit.visit_status = 'In Progress';
      this.state.activeVisit.checkin_time = new Date().toLocaleTimeString();
      this.renderVisitHeader();
      this.renderTabInfo();
      this.showToast(res.message || 'Checked in successfully!', 'success');
    } catch (err) {
      this.showToast(err.message || 'GPS Check-in failed.', 'error');
    }
  },

  // Subtab 2: Water Parameters Testing
  renderTabReadings() {
    const container = document.getElementById('subtab-readings');
    if (!container) return;

    const readings = this.state.activeVisit.readings || [];
    const masters = this.state.masterData.parameters || [];

    // If no readings present on visit, pre-populate default master parameters
    if (readings.length === 0 && masters.length > 0) {
      masters.forEach(m => {
        readings.push({
          parameter: m.name,
          parameter_name: m.parameter_name,
          min_value: m.default_min_value,
          max_value: m.default_max_value,
          unit: m.unit,
          reading_value: ''
        });
      });
      this.state.activeVisit.readings = readings;
    }

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Water Quality Parameters</div>
          <span class="card-sub">Instant Range Check</span>
        </div>
        <div id="readings-container">
          ${readings.map((r, idx) => {
            const val = parseFloat(r.reading_value);
            const isOutOfRange = !isNaN(val) && ((r.min_value != null && val < r.min_value) || (r.max_value != null && val > r.max_value));
            const isValid = !isNaN(val) && !isOutOfRange;
            const statusClass = isOutOfRange ? 'out-of-range' : (isValid ? 'in-range' : '');

            return `
              <div class="reading-row">
                <div class="reading-info">
                  <span class="reading-name">${r.parameter_name || r.parameter}</span>
                  <span class="reading-limits">Standard: ${r.min_value ?? '-'} - ${r.max_value ?? '-'} ${r.unit || ''}</span>
                </div>
                <div class="reading-input-wrap">
                  <input type="number" step="0.01" class="reading-input ${statusClass}" 
                    value="${r.reading_value ?? ''}" 
                    placeholder="${r.unit || 'val'}"
                    onchange="App.updateReading(${idx}, this.value)"
                  />
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <button class="btn btn-secondary btn-block" style="margin-top: 14px;" onclick="App.saveDraft()">Save Readings Draft</button>
      </div>
    `;
  },

  updateReading(index, value) {
    if (this.state.activeVisit && this.state.activeVisit.readings) {
      this.state.activeVisit.readings[index].reading_value = value ? parseFloat(value) : '';
      this.renderTabReadings();
      this.saveDraft(false);
    }
  },

  // Subtab 3: Checklist
  renderTabChecklist() {
    const container = document.getElementById('subtab-checklist');
    if (!container) return;

    let items = this.state.activeVisit.checklist_items || [];
    if (items.length === 0) {
      items = [
        { item_description: 'Visual inspection of dosing pumps and lines', status: 'Pending', remarks: '' },
        { item_description: 'Check raw water inlet pressure and filter differential', status: 'Pending', remarks: '' },
        { item_description: 'Verify chemical storage tank levels and spill containment', status: 'Pending', remarks: '' },
        { item_description: 'Calibrate online pH and Conductivity sensor probes', status: 'Pending', remarks: '' },
        { item_description: 'Inspect blowdown valves and blowdown controller operation', status: 'Pending', remarks: '' }
      ];
      this.state.activeVisit.checklist_items = items;
    }

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Safety & Site Checklist</div>
        </div>
        ${items.map((item, idx) => `
          <div class="checklist-item-card">
            <div class="checklist-title">${item.item_description}</div>
            <div class="checklist-options">
              <button class="checklist-btn ${item.status === 'Pass' ? 'selected-pass' : ''}" onclick="App.setChecklistStatus(${idx}, 'Pass')">Pass</button>
              <button class="checklist-btn ${item.status === 'Fail' ? 'selected-fail' : ''}" onclick="App.setChecklistStatus(${idx}, 'Fail')">Fail</button>
              <button class="checklist-btn ${item.status === 'N/A' ? 'selected-na' : ''}" onclick="App.setChecklistStatus(${idx}, 'N/A')">N/A</button>
            </div>
            <input type="text" class="form-input" style="margin-top: 8px; min-height: 36px; font-size: 12px;" 
              placeholder="Remarks / corrective note..." 
              value="${item.remarks || ''}" 
              onchange="App.updateChecklistRemark(${idx}, this.value)"
            />
          </div>
        `).join('')}
        <button class="btn btn-secondary btn-block" style="margin-top: 14px;" onclick="App.saveDraft()">Save Checklist Draft</button>
      </div>
    `;
  },

  setChecklistStatus(index, status) {
    if (this.state.activeVisit && this.state.activeVisit.checklist_items) {
      this.state.activeVisit.checklist_items[index].status = status;
      this.renderTabChecklist();
      this.saveDraft(false);
    }
  },

  updateChecklistRemark(index, remark) {
    if (this.state.activeVisit && this.state.activeVisit.checklist_items) {
      this.state.activeVisit.checklist_items[index].remarks = remark;
      this.saveDraft(false);
    }
  },

  // Subtab 4: Findings
  renderTabFindings() {
    const container = document.getElementById('subtab-findings');
    if (!container) return;

    const findings = this.state.activeVisit.findings || [];
    const categories = this.state.masterData.finding_categories || [];

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Observations & Defects</div>
          <button class="btn btn-outline" style="min-height: 32px; padding: 4px 10px; font-size: 12px;" onclick="App.showAddFindingModal()">+ Add</button>
        </div>
        ${findings.length === 0 ? `
          <p style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 20px;">No findings reported for this visit.</p>
        ` : findings.map((f, idx) => `
          <div class="checklist-item-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span class="badge badge-${f.severity.toLowerCase() === 'critical' ? 'exception' : (f.severity.toLowerCase() === 'high' ? 'warning' : 'draft')}">${f.severity}</span>
              <span style="font-size: 12px; color: var(--text-muted);">${f.category}</span>
            </div>
            <p style="font-size: 13px; margin-bottom: 4px;"><strong>Issue:</strong> ${f.description}</p>
            <p style="font-size: 12px; color: var(--secondary);"><strong>Corrective Action:</strong> ${f.corrective_action || 'None'}</p>
          </div>
        `).join('')}
      </div>
    `;
  },

  showAddFindingModal() {
    const categories = this.state.masterData.finding_categories || [];
    const catOptions = categories.map(c => `<option value="${c.name}">${c.category_name}</option>`).join('');

    const desc = prompt('Enter Finding Description:');
    if (!desc) return;
    const action = prompt('Enter Recommended Corrective Action:');

    const newFinding = {
      category: categories[0] ? categories[0].name : 'General',
      severity: 'Medium',
      description: desc,
      corrective_action: action || ''
    };

    if (!this.state.activeVisit.findings) this.state.activeVisit.findings = [];
    this.state.activeVisit.findings.push(newFinding);
    this.renderTabFindings();
    this.saveDraft(false);
  },

  // Subtab 5: Requirements
  renderTabRequirements() {
    const container = document.getElementById('subtab-requirements');
    if (!container) return;

    const reqs = this.state.activeVisit.requirements || [];

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Chemical & Parts Requisitions</div>
          <button class="btn btn-outline" style="min-height: 32px; padding: 4px 10px; font-size: 12px;" onclick="App.showAddRequirementModal()">+ Add Item</button>
        </div>
        ${reqs.length === 0 ? `
          <p style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 20px;">No spare parts or chemicals requested.</p>
        ` : reqs.map((r, idx) => `
          <div class="checklist-item-card">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 600; font-size: 13px;">${r.item_name || r.item_code}</span>
              <span style="color: var(--secondary); font-weight: 600;">${r.quantity} ${r.unit || 'Nos'}</span>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Purpose: ${r.purpose || 'Maintenance'}</p>
          </div>
        `).join('')}
      </div>
    `;
  },

  showAddRequirementModal() {
    const item = prompt('Item Name / Chemical (e.g. Anti-Scalant CW-102):');
    if (!item) return;
    const qty = prompt('Quantity:', '1');
    const unit = prompt('Unit (e.g. Kg, Drum, Nos):', 'Kg');

    const req = {
      item_code: item,
      item_name: item,
      quantity: parseFloat(qty) || 1,
      unit: unit || 'Nos',
      purpose: 'Field Maintenance'
    };

    if (!this.state.activeVisit.requirements) this.state.activeVisit.requirements = [];
    this.state.activeVisit.requirements.push(req);
    this.renderTabRequirements();
    this.saveDraft(false);
  },

  // Subtab 6: Expenses
  renderTabExpenses() {
    const container = document.getElementById('subtab-expenses');
    if (!container) return;

    const expenses = this.state.activeVisit.expenses || [];

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Field Expenses</div>
          <button class="btn btn-outline" style="min-height: 32px; padding: 4px 10px; font-size: 12px;" onclick="App.showAddExpenseModal()">+ Add</button>
        </div>
        ${expenses.length === 0 ? `
          <p style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 20px;">No on-site expenses recorded.</p>
        ` : expenses.map(e => `
          <div class="checklist-item-card">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 600; font-size: 13px;">${e.expense_type}</span>
              <span style="color: var(--success); font-weight: 600;">SAR ${parseFloat(e.amount).toFixed(2)}</span>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${e.description || 'On-site expense'}</p>
          </div>
        `).join('')}
      </div>
    `;
  },

  showAddExpenseModal() {
    const type = prompt('Expense Type (Fuel, Meals, Consumables, Toll):', 'Fuel');
    if (!type) return;
    const amount = prompt('Amount (SAR):', '50.00');

    const exp = {
      expense_type: type,
      amount: parseFloat(amount) || 0,
      description: 'Logged via Field Service PWA'
    };

    if (!this.state.activeVisit.expenses) this.state.activeVisit.expenses = [];
    this.state.activeVisit.expenses.push(exp);
    this.renderTabExpenses();
    this.saveDraft(false);
  },

  // Subtab 7: Sign & Submit
  renderTabSign() {
    const container = document.getElementById('subtab-sign');
    if (!container) return;

    const v = this.state.activeVisit;

    container.innerHTML = `
      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">Review & Client Sign-off</div>
        
        <div class="form-group">
          <label class="form-label">Visit Outcome</label>
          <select id="submit-outcome" class="form-select">
            <option value="Completed" ${v.outcome === 'Completed' ? 'selected' : ''}>Completed Successfully</option>
            <option value="Partial" ${v.outcome === 'Partial' ? 'selected' : ''}>Partial - Follow-up Needed</option>
            <option value="Emergency Action Taken" ${v.outcome === 'Emergency Action Taken' ? 'selected' : ''}>Emergency Action Taken</option>
            <option value="Site Inaccessible" ${v.outcome === 'Site Inaccessible' ? 'selected' : ''}>Site Inaccessible</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Executive Summary / Engineer Notes</label>
          <textarea id="submit-summary" class="form-textarea" placeholder="Summarize service findings and recommendations...">${v.executive_summary || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Customer Representative Name</label>
          <input type="text" id="submit-rep-name" class="form-input" value="${v.customer_representative || ''}" placeholder="e.g. Eng. Ahmed Al-Mansoor" />
        </div>

        <div class="form-group">
          <label class="form-label">Client Signature</label>
          <div class="signature-box">
            <canvas id="signature-pad"></canvas>
          </div>
          <button class="btn btn-outline btn-block" style="min-height: 36px; font-size: 12px;" onclick="App.clearSignature()">Clear Signature</button>
        </div>

        <button class="btn btn-success btn-block" style="margin-top: 16px; font-size: 15px;" onclick="App.handleSubmitVisit()">
          <svg style="width: 20px; height: 20px; fill: currentColor;" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          Complete & Submit Visit
        </button>
      </div>
    `;

    // Initialize Signature Canvas
    setTimeout(() => {
      const canvas = document.getElementById('signature-pad');
      if (canvas) {
        this.state.signaturePad = new SignaturePad(canvas);
      }
    }, 100);
  },

  clearSignature() {
    if (this.state.signaturePad) {
      this.state.signaturePad.clear();
    }
  },

  async saveDraft(showToastMessage = true) {
    if (!this.state.activeVisitId) return;

    const data = {
      readings: this.state.activeVisit.readings,
      checklist_items: this.state.activeVisit.checklist_items,
      findings: this.state.activeVisit.findings,
      requirements: this.state.activeVisit.requirements,
      expenses: this.state.activeVisit.expenses
    };

    const res = await API.saveVisitDraft(this.state.activeVisitId, data);
    if (showToastMessage) {
      this.showToast(res.message || 'Draft saved', 'success');
    }
  },

  async handleSubmitVisit() {
    const outcome = document.getElementById('submit-outcome').value;
    const summary = document.getElementById('submit-summary').value.trim();
    const repName = document.getElementById('submit-rep-name').value.trim();

    if (!summary) {
      this.showToast('Please enter an Executive Summary before submitting.', 'warning');
      return;
    }

    if (!repName) {
      this.showToast('Please provide the Customer Representative name.', 'warning');
      return;
    }

    let signature = null;
    if (this.state.signaturePad && !this.state.signaturePad.isEmpty()) {
      signature = this.state.signaturePad.toDataURL();
    }

    this.showToast('Capturing GPS and submitting visit report...', 'info');

    let coords = null;
    try {
      coords = await Geo.getCurrentPosition(6000);
    } catch (_) {
      console.warn('GPS timed out during checkout. Proceeding with checkout submission.');
    }

    const submission = {
      data: {
        readings: this.state.activeVisit.readings,
        checklist_items: this.state.activeVisit.checklist_items,
        findings: this.state.activeVisit.findings,
        requirements: this.state.activeVisit.requirements,
        expenses: this.state.activeVisit.expenses
      },
      coords: coords,
      outcome: outcome,
      executive_summary: summary,
      customer_rep: repName,
      customer_signature: signature
    };

    try {
      const res = await API.submitVisit(this.state.activeVisitId, submission);
      this.showToast(res.message || 'Visit report submitted successfully!', 'success');
      await this.loadInitialData();
      this.showView('visits');
    } catch (err) {
      this.showToast(err.message || 'Submission failed.', 'error');
    }
  },

  // ----------------------------------------------------
  // Sync Queue View
  // ----------------------------------------------------
  renderSyncQueue() {
    const container = document.getElementById('sync-queue-list');
    if (!container) return;

    const queue = Sync.getQueue();
    if (queue.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px 20px;">
          <svg style="width: 48px; height: 48px; fill: var(--success); margin-bottom: 12px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          <div class="card-title">All Synced</div>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">There are no pending offline changes on this device.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="margin-bottom: 14px; display: flex; gap: 8px;">
        <button class="btn btn-primary btn-block" onclick="App.triggerManualSync()">Sync All Now</button>
        <button class="btn btn-outline" onclick="Sync.clearQueue()">Clear All</button>
      </div>
      ${queue.map(item => `
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title" style="text-transform: capitalize;">${item.action.replace('_', ' ')}</div>
              <div class="card-sub">Visit: ${item.visit_id}</div>
            </div>
            <span class="badge badge-warning">Pending</span>
          </div>
          <p style="font-size: 11px; color: var(--text-muted);">Queued: ${new Date(item.queued_at).toLocaleString()}</p>
          ${item.last_error ? `<p style="font-size: 11px; color: var(--danger); margin-top: 4px;">Error: ${item.last_error}</p>` : ''}
        </div>
      `).join('')}
    `;
  },

  async triggerManualSync() {
    this.showToast('Synchronizing offline queue with server...', 'info');
    const res = await Sync.syncNow(API);
    if (res.success) {
      this.showToast(`Synced ${res.count} items successfully!`, 'success');
      await this.loadInitialData();
      this.renderSyncQueue();
    } else {
      this.showToast(res.reason === 'offline' ? 'Cannot sync while offline.' : 'Sync failed.', 'error');
    }
  },

  // ----------------------------------------------------
  // Profile / Settings
  // ----------------------------------------------------
  renderProfile() {
    const user = Auth.getUser();
    const nameEl = document.getElementById('profile-name');
    const userEl = document.getElementById('profile-user');
    const srvEl = document.getElementById('profile-server');

    if (nameEl) nameEl.textContent = user ? user.fullName : 'Guest';
    if (userEl) userEl.textContent = user ? user.username : 'Not logged in';
    if (srvEl) srvEl.textContent = user ? user.serverUrl : window.location.origin;
  }
};

// Start application upon DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
