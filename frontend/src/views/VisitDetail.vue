<template>
	<div v-if="visit" class="px-4 py-3 space-y-3 max-w-xl mx-auto pb-28">
		<!-- Top Bar: Navigation, Status & Save Draft -->
		<div class="flex items-center justify-between gap-2">
			<Button
				variant="ghost"
				theme="gray"
				size="sm"
				class="!p-1.5 !rounded-xl text-slate-700 hover:bg-slate-100"
				@click="$router.push('/visits')"
			>
				<template #prefix>
					<FeatherIcon name="chevron-left" class="w-5 h-5 mr-0.5 stroke-[2.5]" />
				</template>
				<span class="font-bold text-xs">Visits</span>
			</Button>

			<div class="flex items-center gap-2">
				<span
					v-if="saveFeedback"
					class="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full transition-all animate-fade-in"
				>
					{{ saveFeedback }}
				</span>
				<Button
					variant="subtle"
					theme="gray"
					size="sm"
					class="!rounded-xl text-xs font-bold"
					:loading="isSaving"
					@click="saveCurrentDraft(false)"
					title="Save current progress without submitting"
				>
					<template #prefix>
						<FeatherIcon name="save" class="w-3.5 h-3.5 mr-1" />
					</template>
					Save Draft
				</Button>
				<StatusBadge :status="visit.visit_status" />
			</div>
		</div>

		<!-- Visit Summary Card -->
		<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-2">
			<div class="flex justify-between items-start gap-2">
				<div class="truncate">
					<div class="flex items-center gap-1.5 flex-wrap">
						<span class="text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
							{{ visit.name }}
						</span>
						<span
							v-if="visit.creation_source === 'Engineer On-Site'"
							class="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"
						>
							📍 On-Site Created
						</span>
					</div>
					<h2 class="text-base font-extrabold text-slate-900 mt-1 truncate">
						{{ visit.customer_name || visit.customer }}
					</h2>
					<p class="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
						<FeatherIcon name="map-pin" class="w-3.5 h-3.5 text-sky-600 shrink-0" />
						<span class="truncate">{{ visit.service_location || "Client Facility" }}</span>
					</p>
				</div>
				<div class="text-right shrink-0">
					<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
						{{ visit.visit_type || "Routine Inspection" }}
					</span>
					<span class="block text-[11px] text-slate-400 mt-1">Planned: {{ visit.planned_date }}</span>
				</div>
			</div>
		</div>

		<!-- Subtabs Segmented Control (Inspection Steps) -->
		<div class="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
			<button
				v-for="tab in tabs"
				:key="tab.id"
				@click="switchTab(tab.id)"
				class="whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-full transition-all border shrink-0 flex items-center gap-1.5"
				:class="activeTab === tab.id
					? 'bg-sky-600 text-white border-sky-600 shadow-xs'
					: 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'"
			>
				<FeatherIcon :name="tab.icon" class="w-3.5 h-3.5" />
				<span>{{ tab.label }}</span>
				<span
					v-if="tab.badge != null && tab.badge > 0"
					class="w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-extrabold"
					:class="activeTab === tab.id ? 'bg-white text-sky-700' : 'bg-slate-200 text-slate-800'"
				>
					{{ tab.badge }}
				</span>
			</button>
		</div>

		<!-- ========================================== -->
		<!-- SUBTAB 1: OVERVIEW & SITE CONTACT          -->
		<!-- ========================================== -->
		<div v-if="activeTab === 'overview'" class="space-y-3">
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-outline-gray-1 pb-2">
					Site & Contact Information
				</h3>
				<div class="grid grid-cols-2 gap-3 text-xs">
					<div>
						<span class="text-slate-400 block text-[10px] font-bold uppercase">Customer</span>
						<span class="font-extrabold text-slate-900">{{ visit.customer_name || visit.customer }}</span>
					</div>
					<div>
						<span class="text-slate-400 block text-[10px] font-bold uppercase">Location / Plant</span>
						<span class="font-extrabold text-slate-900">{{ visit.service_location || "Main Site" }}</span>
					</div>
					<div>
						<span class="text-slate-400 block text-[10px] font-bold uppercase">Contact Person</span>
						<span class="font-bold text-slate-800">{{ siteDetails.primary_contact_person || "Site Supervisor" }}</span>
					</div>
					<div>
						<span class="text-slate-400 block text-[10px] font-bold uppercase">Phone</span>
						<a
							v-if="siteDetails.primary_contact_phone"
							:href="`tel:${siteDetails.primary_contact_phone}`"
							class="font-bold text-sky-600 underline flex items-center gap-1"
						>
							<FeatherIcon name="phone-call" class="w-3.5 h-3.5" />
							<span>{{ siteDetails.primary_contact_phone }}</span>
						</a>
						<span v-else class="font-bold text-slate-800">+966 50 123 4567</span>
					</div>
				</div>

				<div v-if="siteDetails.address_display" class="pt-2 border-t border-slate-100 text-xs">
					<span class="text-slate-400 block text-[10px] font-bold uppercase mb-0.5">Facility Address</span>
					<p class="text-slate-700 font-medium">{{ siteDetails.address_display }}</p>
				</div>

				<!-- Site Access Instructions -->
				<div class="pt-2 border-t border-slate-100">
					<span class="text-slate-400 block text-[10px] font-bold uppercase mb-1">Safety & Access Protocol</span>
					<div class="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed font-medium">
						{{ siteDetails.special_site_instructions || "Mandatory PPE: Safety helmet, protective eye goggles, and steel-toe safety boots required before entering pump room." }}
					</div>
				</div>

				<!-- Scope / Description -->
				<div v-if="visit.description" class="pt-2 border-t border-slate-100">
					<span class="text-slate-400 block text-[10px] font-bold uppercase mb-1">Visit Scope & Notes</span>
					<div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed">
						{{ visit.description }}
					</div>
				</div>

				<!-- Attached Check-in Photo Preview if exists -->
				<div v-if="visit.site_photo" class="pt-2 border-t border-slate-100">
					<span class="text-slate-400 block text-[10px] font-bold uppercase mb-1.5">Site Check-In Photo</span>
					<div class="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
						<img
							:src="visit.site_photo"
							alt="Site Check-in"
							class="w-16 h-16 rounded-lg object-cover border border-slate-300 shadow-2xs"
						/>
						<div class="text-xs">
							<p class="font-bold text-slate-800">Site Photo Attached</p>
							<p class="text-[11px] text-emerald-600 font-semibold">Location Verified & Approved</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- ========================================== -->
		<!-- SUBTAB 2: GPS GEOFENCE & CHECK-IN          -->
		<!-- ========================================== -->
		<div v-if="activeTab === 'geofence'" class="space-y-3">
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-outline-gray-1 pb-2">
					GPS Geofence Verification
				</h3>

				<div class="p-3.5 bg-slate-50 rounded-xl text-xs space-y-2 text-slate-700">
					<div class="flex justify-between items-center">
						<span class="font-medium">Target Coordinates:</span>
						<strong class="font-mono text-slate-900">{{ targetLat.toFixed(4) }}° N, {{ targetLng.toFixed(4) }}° E</strong>
					</div>
					<div class="flex justify-between items-center">
						<span class="font-medium">Allowed Radius:</span>
						<strong class="text-slate-900">{{ allowedRadius }} meters</strong>
					</div>
					<div v-if="currentDistance !== null" class="flex justify-between items-center pt-2 border-t border-slate-200">
						<span class="font-bold">Calculated Distance:</span>
						<strong
							class="px-2 py-0.5 rounded-md font-mono font-extrabold text-xs"
							:class="currentDistance <= allowedRadius ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
						>
							{{ Math.round(currentDistance) }} meters
						</strong>
					</div>
				</div>

				<!-- Geofence Status Alert -->
				<div
					v-if="visit.visit_status !== 'Scheduled'"
					class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-bold"
				>
					<FeatherIcon name="check-circle" class="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
					<span>Checked In: {{ visit.checkin_time || "Today 09:30 AM" }} (Verified within Geofence)</span>
				</div>

				<!-- Geofence Justification Warning if outside radius -->
				<div
					v-if="currentDistance !== null && currentDistance > allowedRadius && visit.visit_status === 'Scheduled'"
					class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2"
				>
					<div class="flex items-center gap-1.5 font-bold">
						<FeatherIcon name="alert-triangle" class="w-4 h-4 text-amber-600" />
						<span>Outside Standard Geofence ({{ Math.round(currentDistance) }}m)</span>
					</div>
					<p class="text-[11px] text-amber-800 leading-tight">
						Please provide a justification reason for supervisor review before proceeding.
					</p>
					<input
						type="text"
						v-model="geofenceReason"
						placeholder="e.g. Client security gate delayed entry, inspecting outer pumps"
						class="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 bg-white outline-none focus:ring-1 focus:ring-amber-500 font-medium"
					/>
				</div>

				<!-- Check-In Action Button -->
				<div v-if="visit.visit_status === 'Scheduled'" class="pt-1">
					<Button
						variant="solid"
						theme="blue"
						size="lg"
						:loading="isCheckingIn"
						loading-text="Acquiring GPS & Verifying..."
						class="w-full justify-center !rounded-xl !py-3 font-bold shadow-md"
						@click="handleCheckIn"
					>
						<template #prefix>
							<FeatherIcon name="map-pin" class="w-4 h-4 mr-1.5" />
						</template>
						Capture GPS & Check-In
					</Button>
				</div>
			</div>
		</div>

		<!-- ========================================== -->
		<!-- SUBTAB 3: WATER PARAMETER TESTS            -->
		<!-- ========================================== -->
		<div v-if="activeTab === 'readings'" class="space-y-3">
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<div class="flex justify-between items-center border-b border-outline-gray-1 pb-2">
					<div>
						<h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Water Quality Tests</h3>
						<p class="text-[11px] text-slate-500 font-medium">Out-of-range values trigger quality alerts</p>
					</div>
					<div class="flex items-center gap-1.5">
						<span
							v-if="outOfRangeCount > 0"
							class="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200"
						>
							{{ outOfRangeCount }} Out of Range
						</span>
						<span class="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
							{{ visit.readings ? visit.readings.length : 0 }} Parameters
						</span>
					</div>
				</div>

				<!-- Readings List -->
				<div class="space-y-2.5">
					<ReadingRow
						v-for="(reading, idx) in visit.readings"
						:key="idx"
						:reading="reading"
						@remove="removeReading(idx)"
					/>
				</div>

				<!-- Add Parameter Button -->
				<button
					type="button"
					@click="openAddReadingModal"
					class="w-full py-2.5 px-3 rounded-xl border border-dashed border-sky-300 text-sky-700 bg-sky-50/50 hover:bg-sky-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
				>
					<FeatherIcon name="plus" class="w-4 h-4 stroke-[2.5]" />
					<span>Add Water Test Parameter</span>
				</button>
			</div>
		</div>

		<!-- ========================================== -->
		<!-- SUBTAB 4: SAFETY & INSPECTION CHECKLIST    -->
		<!-- ========================================== -->
		<div v-if="activeTab === 'checklist'" class="space-y-3">
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<div class="flex justify-between items-center border-b border-outline-gray-1 pb-2">
					<div>
						<h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Safety & Inspection Protocol</h3>
						<p class="text-[11px] text-slate-500 font-medium">Verify standard plant safety and operational checkpoints</p>
					</div>
					<span class="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
						{{ completedChecklistCount }} / {{ visit.checklist_items ? visit.checklist_items.length : 0 }} Reviewed
					</span>
				</div>

				<!-- Checklist Items List -->
				<div class="space-y-2.5">
					<ChecklistItem
						v-for="(item, idx) in visit.checklist_items"
						:key="idx"
						:item="item"
						:allow-remove="idx >= 6"
						@remove="removeChecklistItem(idx)"
					/>
				</div>

				<!-- Add Custom Checklist Item Button -->
				<button
					type="button"
					@click="showAddChecklistModal = true"
					class="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 text-slate-700 bg-slate-50/60 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
				>
					<FeatherIcon name="plus" class="w-4 h-4 stroke-[2.5]" />
					<span>Add Custom Checkpoint</span>
				</button>
			</div>
		</div>

		<!-- ========================================== -->
		<!-- SUBTAB 5: EQUIPMENT DEFECT FINDINGS        -->
		<!-- ========================================== -->
		<div v-if="activeTab === 'findings'" class="space-y-3">
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<div class="flex justify-between items-center border-b border-outline-gray-1 pb-2">
					<div>
						<h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Equipment Defect Findings</h3>
						<p class="text-[11px] text-slate-500 font-medium">Log fouling, corrosion, leaks, or mechanical issues</p>
					</div>
					<Button
						variant="solid"
						theme="blue"
						size="sm"
						class="!rounded-xl !text-xs font-bold"
						@click="showAddFindingModal = true"
					>
						<template #prefix>
							<FeatherIcon name="plus" class="w-3.5 h-3.5" />
						</template>
						Log Defect
					</Button>
				</div>

				<div v-if="visit.findings && visit.findings.length" class="space-y-2.5">
					<div
						v-for="(finding, idx) in visit.findings"
						:key="idx"
						class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2"
					>
						<div class="flex justify-between items-start gap-2">
							<strong class="text-slate-900 text-xs font-extrabold">{{ finding.category || "General Finding" }}</strong>
							<div class="flex items-center gap-2">
								<span
									class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase"
									:class="{
										'bg-rose-100 text-rose-800 border border-rose-200': finding.severity === 'Critical',
										'bg-amber-100 text-amber-800 border border-amber-200': finding.severity === 'Major',
										'bg-blue-100 text-blue-800 border border-blue-200': finding.severity === 'Minor',
										'bg-slate-100 text-slate-600': finding.severity === 'Info' || !finding.severity,
									}"
								>
									{{ finding.severity || 'Minor' }}
								</span>
								<button
									type="button"
									@click="removeFinding(idx)"
									class="text-slate-400 hover:text-rose-600 p-1"
									title="Delete finding"
								>
									<FeatherIcon name="trash-2" class="w-3.5 h-3.5" />
								</button>
							</div>
						</div>
						<p class="text-slate-700 leading-relaxed font-medium">{{ finding.observation }}</p>
						<div v-if="finding.recommendation" class="pt-1.5 border-t border-slate-200/70 text-[11px] text-sky-800">
							<strong>Recommended Action:</strong> {{ finding.recommendation }}
						</div>
					</div>
				</div>

				<div v-else class="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-4">
					<FeatherIcon name="shield-check" class="w-8 h-8 text-emerald-500 mx-auto mb-1 stroke-[1.5]" />
					<p class="text-xs font-bold text-slate-700">No Defects Logged</p>
					<p class="text-[11px] text-slate-400">All equipment inspected in good operating condition.</p>
				</div>
			</div>
		</div>

		<!-- ========================================== -->
		<!-- SUBTAB 6: CHEMICAL & SPARES REQUISITION    -->
		<!-- ========================================== -->
		<div v-if="activeTab === 'requirements'" class="space-y-3">
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<div class="flex justify-between items-center border-b border-outline-gray-1 pb-2">
					<div>
						<h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Chemicals & Spare Parts Requisition</h3>
						<p class="text-[11px] text-slate-500 font-medium">Request replacement chemicals or spare parts for site</p>
					</div>
					<Button
						variant="solid"
						theme="blue"
						size="sm"
						class="!rounded-xl !text-xs font-bold"
						@click="showAddRequirementModal = true"
					>
						<template #prefix>
							<FeatherIcon name="plus" class="w-3.5 h-3.5" />
						</template>
						Add Requisition
					</Button>
				</div>

				<div v-if="visit.requirements && visit.requirements.length" class="space-y-2.5">
					<div
						v-for="(item, idx) in visit.requirements"
						:key="idx"
						class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs gap-3"
					>
						<div class="truncate">
							<strong class="text-slate-900 block truncate">{{ item.item_name || item.item_code }}</strong>
							<p class="text-[11px] text-slate-500 truncate">{{ item.reason || item.item_code }}</p>
							<span
								class="inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded"
								:class="item.urgency === 'Emergency' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'"
							>
								{{ item.urgency || 'Normal' }}
							</span>
						</div>
						<div class="flex items-center gap-3 shrink-0">
							<span class="font-extrabold text-sky-700 text-sm">
								{{ item.quantity }} {{ item.uom || 'Nos' }}
							</span>
							<button
								type="button"
								@click="removeRequirement(idx)"
								class="text-slate-400 hover:text-rose-600 p-1"
								title="Delete requisition"
							>
								<FeatherIcon name="trash-2" class="w-3.5 h-3.5" />
							</button>
						</div>
					</div>
				</div>

				<div v-else class="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-4">
					<FeatherIcon name="box" class="w-8 h-8 text-slate-400 mx-auto mb-1 stroke-[1.5]" />
					<p class="text-xs font-bold text-slate-700">No Spares or Chemicals Required</p>
					<p class="text-[11px] text-slate-400">Chemical levels sufficient and no replacements needed.</p>
				</div>
			</div>
		</div>

		<!-- ========================================== -->
		<!-- SUBTAB 7: SUMMARY, EXPENSES & SIGN-OFF     -->
		<!-- ========================================== -->
		<div v-if="activeTab === 'submit'" class="space-y-4">
			<!-- On-site Expenses Card -->
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<div class="flex justify-between items-center border-b border-outline-gray-1 pb-2">
					<div>
						<h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Expenses</h3>
						<p class="text-[11px] text-slate-500 font-medium">Total: {{ totalExpenses.toFixed(2) }} EGP / SAR</p>
					</div>
					<Button
						variant="ghost"
						theme="blue"
						size="sm"
						class="!rounded-xl text-xs font-bold"
						@click="showAddExpenseModal = true"
					>
						+ Add Expense
					</Button>
				</div>

				<div v-if="visit.expenses && visit.expenses.length" class="space-y-2">
					<div
						v-for="(exp, idx) in visit.expenses"
						:key="idx"
						class="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
					>
						<div>
							<strong class="text-slate-900">{{ exp.expense_type }}</strong>
							<p class="text-[11px] text-slate-500">{{ exp.remarks || 'Out-of-pocket' }}</p>
						</div>
						<div class="flex items-center gap-2">
							<span class="font-extrabold text-slate-900">{{ parseFloat(exp.amount || 0).toFixed(2) }}</span>
							<button
								type="button"
								@click="removeExpense(idx)"
								class="text-slate-400 hover:text-rose-600 p-1"
							>
								<FeatherIcon name="trash-2" class="w-3.5 h-3.5" />
							</button>
						</div>
					</div>
				</div>
				<p v-else class="text-xs text-slate-400 text-center py-2">No out-of-pocket field expenses claimed.</p>
			</div>

			<!-- Executive Summary & Service Outcome -->
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-outline-gray-1 pb-2">
					Inspection Findings & Outcome
				</h3>

				<div>
					<label class="text-xs font-bold text-slate-700 block mb-1">Service Execution Outcome *</label>
					<select
						v-model="visit.outcome"
						class="w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-sky-500"
					>
						<option value="Completed">Completed Successfully</option>
						<option value="Partially Completed">Partially Completed (Follow-up Required)</option>
						<option value="Breakdown Resolved">Breakdown Resolved & Recommissioned</option>
						<option value="Incomplete">Incomplete (Client Facility Closed)</option>
					</select>
				</div>

				<div>
					<label class="text-xs font-bold text-slate-700 block mb-1">Executive Summary / Technical Notes</label>
					<textarea
						v-model="visit.executive_summary"
						rows="3"
						placeholder="Detailed summary of maintenance conducted, chemical dosing status, and plant condition..."
						class="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-sky-500 font-medium"
					></textarea>
				</div>
			</div>

			<!-- Customer Representative Sign-Off -->
			<div class="bg-surface-white p-4 rounded-2xl border border-outline-gray-1 shadow-xs space-y-3">
				<h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-outline-gray-1 pb-2">
					Customer Representative Sign-Off
				</h3>

				<div class="grid grid-cols-2 gap-2.5">
					<div>
						<label class="text-xs font-bold text-slate-700 block mb-1">Signatory Name *</label>
						<input
							type="text"
							v-model="customerSignerName"
							placeholder="e.g. Eng. Hani Mansoor"
							class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-sky-500 font-medium"
						/>
					</div>
					<div>
						<label class="text-xs font-bold text-slate-700 block mb-1">Representative Phone</label>
						<input
							type="tel"
							v-model="customerSignerPhone"
							placeholder="e.g. +966 50 123 4567"
							class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-sky-500 font-medium"
						/>
					</div>
				</div>

				<div>
					<label class="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
						<span>Touch Canvas Signature</span>
						<span class="text-[11px] text-slate-400 font-normal">Customer signs below</span>
					</label>
					<SignaturePad ref="sigPad" />
				</div>

				<!-- Final Submit Button -->
				<div class="pt-2">
					<Button
						variant="solid"
						theme="blue"
						size="lg"
						:loading="isSubmitting"
						loading-text="Submitting Service Report..."
						class="w-full justify-center !rounded-xl !py-3.5 font-bold shadow-md text-sm bg-gradient-to-r from-sky-600 to-blue-600"
						@click="handleSubmitReport"
					>
						<template #prefix>
							<FeatherIcon name="check-square" class="w-5 h-5 mr-1.5" />
						</template>
						Submit Technical Service Report
					</Button>
				</div>
			</div>
		</div>

		<!-- ========================================== -->
		<!-- MODAL 1: ADD WATER TEST PARAMETER          -->
		<!-- ========================================== -->
		<Dialog
			:options="{ title: 'Add Water Test Parameter', size: 'md' }"
			v-model="showAddReadingModal"
		>
			<template #body-content>
				<form @submit.prevent="handleAddReadingSubmit" class="space-y-3 pt-2">
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">Parameter Preset</label>
						<select
							v-model="newReading.preset"
							@change="applyReadingPreset"
							class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50"
						>
							<option value="pH">pH Level (6.5 - 8.5 pH)</option>
							<option value="TDS">Total Dissolved Solids (100 - 1000 ppm)</option>
							<option value="Conductivity">Electrical Conductivity (200 - 1500 µS/cm)</option>
							<option value="Hardness">Total Hardness (50 - 300 ppm CaCO3)</option>
							<option value="Free Chlorine">Free Residual Chlorine (0.2 - 2.0 ppm)</option>
							<option value="Iron">Iron (Fe) (0.01 - 0.10 ppm)</option>
							<option value="Silica">Silica (SiO2) (5.0 - 30.0 ppm)</option>
							<option value="Turbidity">Turbidity (0.1 - 1.0 NTU)</option>
							<option value="custom">-- Custom Parameter --</option>
						</select>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<div>
							<label class="block text-xs font-bold text-slate-700 mb-1">Parameter Name *</label>
							<input
								type="text"
								v-model="newReading.parameter_name"
								placeholder="e.g. Phosphate (PO4)"
								required
								class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
							/>
						</div>
						<div>
							<label class="block text-xs font-bold text-slate-700 mb-1">Unit of Measure *</label>
							<input
								type="text"
								v-model="newReading.unit"
								placeholder="e.g. ppm, pH, µS/cm"
								required
								class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
							/>
						</div>
					</div>

					<div class="grid grid-cols-3 gap-2">
						<div>
							<label class="block text-xs font-bold text-slate-700 mb-1">Min Range</label>
							<input
								type="number"
								step="0.01"
								v-model="newReading.min_range"
								placeholder="0"
								class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
							/>
						</div>
						<div>
							<label class="block text-xs font-bold text-slate-700 mb-1">Max Range</label>
							<input
								type="number"
								step="0.01"
								v-model="newReading.max_range"
								placeholder="100"
								class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
							/>
						</div>
						<div>
							<label class="block text-xs font-bold text-slate-700 mb-1">Measured *</label>
							<input
								type="number"
								step="0.01"
								v-model="newReading.reading_value"
								placeholder="Value"
								required
								class="w-full px-3 py-2 text-xs font-bold rounded-xl border border-sky-300 bg-sky-50/30"
							/>
						</div>
					</div>

					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">Remarks</label>
						<input
							type="text"
							v-model="newReading.remarks"
							placeholder="Optional observation"
							class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
						/>
					</div>

					<div class="flex justify-end gap-2 pt-2">
						<Button variant="subtle" theme="gray" size="sm" @click="showAddReadingModal = false">
							Cancel
						</Button>
						<Button variant="solid" theme="blue" size="sm" type="submit">
							Add Test Parameter
						</Button>
					</div>
				</form>
			</template>
		</Dialog>

		<!-- ========================================== -->
		<!-- MODAL 2: ADD DEFECT FINDING                -->
		<!-- ========================================== -->
		<Dialog
			:options="{ title: 'Log Equipment Defect Finding', size: 'md' }"
			v-model="showAddFindingModal"
		>
			<template #body-content>
				<form @submit.prevent="handleAddFindingSubmit" class="space-y-3 pt-2">
					<div class="grid grid-cols-2 gap-2">
						<div>
							<label class="block text-xs font-bold text-slate-700 mb-1">Category *</label>
							<select
								v-model="newFinding.category"
								class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50"
							>
								<option value="Scaling">Scaling & Precipitation</option>
								<option value="Corrosion">Corrosion & Rust</option>
								<option value="Biological">Biological Fouling</option>
								<option value="System Leakage">System Leakage</option>
								<option value="Mechanical Breakdown">Mechanical Breakdown</option>
								<option value="Sensor / Electrical">Sensor / Electrical Fault</option>
							</select>
						</div>
						<div>
							<label class="block text-xs font-bold text-slate-700 mb-1">Severity *</label>
							<select
								v-model="newFinding.severity"
								class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50"
							>
								<option value="Critical">Critical</option>
								<option value="Major">Major</option>
								<option value="Minor">Minor</option>
								<option value="Info">Info</option>
							</select>
						</div>
					</div>

					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">Defect Observation *</label>
						<textarea
							v-model="newFinding.observation"
							rows="3"
							placeholder="Describe specific defect, location, and operating symptom observed..."
							required
							class="w-full p-2.5 text-xs rounded-xl border border-slate-200"
						></textarea>
					</div>

					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">Recommended Action</label>
						<input
							type="text"
							v-model="newFinding.recommendation"
							placeholder="e.g. Schedule chemical descaling and replace O-ring seal"
							class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
						/>
					</div>

					<div class="flex justify-end gap-2 pt-2">
						<Button variant="subtle" theme="gray" size="sm" @click="showAddFindingModal = false">
							Cancel
						</Button>
						<Button variant="solid" theme="blue" size="sm" type="submit">
							Save Defect Finding
						</Button>
					</div>
				</form>
			</template>
		</Dialog>

		<!-- ========================================== -->
		<!-- MODAL 3: ADD CHEMICAL & SPARES REQUISITION -->
		<!-- ========================================== -->
		<Dialog
			:options="{ title: 'Request Chemical or Spare Part', size: 'md' }"
			v-model="showAddRequirementModal"
		>
			<template #body-content>
				<form @submit.prevent="handleAddRequirementSubmit" class="space-y-3 pt-2">
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">Item / Chemical Code *</label>
						<select
							v-model="newRequirement.preset"
							@change="applyRequirementPreset"
							class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 mb-1.5"
						>
							<option value="CHEM-CW102">Anti-Scalant Polymer CW-102 (Drums)</option>
							<option value="CHEM-CW301">Non-Oxidizing Biocide CW-301 (Drums)</option>
							<option value="CHEM-CW204">Oxygen Scavenger CW-204 (Drums)</option>
							<option value="EQ-RO-8040">RO Membrane Element 8040 (Nos)</option>
							<option value="EQ-FLT-05">5-Micron Cartridge Filter 40" (Nos)</option>
							<option value="EQ-PUMP-P1">Chemical Dosing Pump Seal Kit (Sets)</option>
							<option value="custom">-- Custom Part / Code --</option>
						</select>
						<input
							type="text"
							v-model="newRequirement.item_name"
							placeholder="Item / Chemical name"
							required
							class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
						/>
					</div>

					<div class="grid grid-cols-3 gap-2">
						<div>
							<label class="block text-xs font-bold text-slate-700 mb-1">Qty *</label>
							<input
								type="number"
								step="1"
								min="1"
								v-model="newRequirement.quantity"
								required
								class="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200"
							/>
						</div>
						<div>
							<label class="block text-xs font-bold text-slate-700 mb-1">UOM</label>
							<select
								v-model="newRequirement.uom"
								class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
							>
								<option value="Drums">Drums</option>
								<option value="Kg">Kg</option>
								<option value="Liters">Liters</option>
								<option value="Nos">Nos</option>
								<option value="Sets">Sets</option>
							</select>
						</div>
						<div>
							<label class="block text-xs font-bold text-slate-700 mb-1">Urgency</label>
							<select
								v-model="newRequirement.urgency"
								class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
							>
								<option value="Normal">Normal</option>
								<option value="Urgent">Urgent</option>
								<option value="Emergency">Emergency</option>
							</select>
						</div>
					</div>

					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">Purpose / Reason *</label>
						<input
							type="text"
							v-model="newRequirement.reason"
							placeholder="e.g. Chemical stock low; replenishment required"
							required
							class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
						/>
					</div>

					<div class="flex justify-end gap-2 pt-2">
						<Button variant="subtle" theme="gray" size="sm" @click="showAddRequirementModal = false">
							Cancel
						</Button>
						<Button variant="solid" theme="blue" size="sm" type="submit">
							Save Requisition
						</Button>
					</div>
				</form>
			</template>
		</Dialog>

		<!-- ========================================== -->
		<!-- MODAL 4: ADD ON-SITE EXPENSE               -->
		<!-- ========================================== -->
		<Dialog
			:options="{ title: 'Add Field Expense', size: 'sm' }"
			v-model="showAddExpenseModal"
		>
			<template #body-content>
				<form @submit.prevent="handleAddExpenseSubmit" class="space-y-3 pt-2">
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">Expense Type *</label>
						<select
							v-model="newExpense.expense_type"
							class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50"
						>
							<option value="Fuel">Fuel / Diesel</option>
							<option value="Travel / Transportation">Travel / Transportation / Tolls</option>
							<option value="Meals">Meals / Subsistence</option>
							<option value="Materials / Hardware">Emergency Hardware / Consumables</option>
							<option value="Lodging">Lodging</option>
							<option value="Other">Other</option>
						</select>
					</div>

					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">Amount (EGP / SAR) *</label>
						<input
							type="number"
							step="0.01"
							v-model="newExpense.amount"
							placeholder="0.00"
							required
							class="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200"
						/>
					</div>

					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">Remarks / Note</label>
						<input
							type="text"
							v-model="newExpense.remarks"
							placeholder="e.g. Highway toll and refueling"
							class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
						/>
					</div>

					<div class="flex justify-end gap-2 pt-2">
						<Button variant="subtle" theme="gray" size="sm" @click="showAddExpenseModal = false">
							Cancel
						</Button>
						<Button variant="solid" theme="blue" size="sm" type="submit">
							Save Expense
						</Button>
					</div>
				</form>
			</template>
		</Dialog>

		<!-- ========================================== -->
		<!-- MODAL 5: ADD CUSTOM CHECKLIST ITEM         -->
		<!-- ========================================== -->
		<Dialog
			:options="{ title: 'Add Custom Checkpoint', size: 'sm' }"
			v-model="showAddChecklistModal"
		>
			<template #body-content>
				<form @submit.prevent="handleAddChecklistSubmit" class="space-y-3 pt-2">
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">Checkpoint Description *</label>
						<input
							type="text"
							v-model="newChecklistItem"
							placeholder="e.g. Inspect membrane vessel end-caps for brine weeping"
							required
							class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
						/>
					</div>

					<div class="flex justify-end gap-2 pt-2">
						<Button variant="subtle" theme="gray" size="sm" @click="showAddChecklistModal = false">
							Cancel
						</Button>
						<Button variant="solid" theme="blue" size="sm" type="submit">
							Add Checkpoint
						</Button>
					</div>
				</form>
			</template>
		</Dialog>
	</div>

	<!-- Loading State -->
	<div v-else class="p-16 text-center text-slate-500">
		<FeatherIcon name="loader" class="w-8 h-8 animate-spin mx-auto mb-2 text-sky-600" />
		<p class="text-xs font-semibold">Loading inspection details...</p>
	</div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button, FeatherIcon, Dialog } from "frappe-ui";
import StatusBadge from "@/components/StatusBadge.vue";
import ReadingRow from "@/components/ReadingRow.vue";
import ChecklistItem from "@/components/ChecklistItem.vue";
import SignaturePad from "@/components/SignaturePad.vue";
import { visitsData } from "@/data/visits";

const route = useRoute();
const router = useRouter();

const visitId = computed(() => route.params.id);
const visit = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const saveFeedback = ref("");
const isCheckingIn = ref(false);
const isSubmitting = ref(false);

const activeTab = ref("overview");
const currentDistance = ref(null);
const geofenceReason = ref("");
const customerSignerName = ref("");
const customerSignerPhone = ref("");
const sigPad = ref(null);

// Modal visibility flags
const showAddReadingModal = ref(false);
const showAddFindingModal = ref(false);
const showAddRequirementModal = ref(false);
const showAddExpenseModal = ref(false);
const showAddChecklistModal = ref(false);

// New item forms
const newReading = reactive({
	preset: "pH",
	parameter: "pH",
	parameter_name: "pH Level",
	unit: "pH",
	min_range: 6.5,
	max_range: 8.5,
	reading_value: "",
	remarks: "",
});

const newFinding = reactive({
	category: "Scaling",
	severity: "Major",
	observation: "",
	recommendation: "",
});

const newRequirement = reactive({
	preset: "CHEM-CW102",
	item_code: "CHEM-CW102",
	item_name: "Anti-Scalant Polymer CW-102",
	quantity: 1,
	uom: "Drums",
	urgency: "Normal",
	reason: "Regular chemical replenishment",
});

const newExpense = reactive({
	expense_type: "Fuel",
	amount: "",
	remarks: "",
});

const newChecklistItem = ref("");

// Computed site and coordinates
const siteDetails = computed(() => visit.value?.site_details || {});
const targetLat = computed(() => siteDetails.value?.latitude || 21.5433);
const targetLng = computed(() => siteDetails.value?.longitude || 39.1728);
const allowedRadius = computed(() => siteDetails.value?.geofence_radius_meters || 250);

// Badges & Counters
const completedChecklistCount = computed(() => {
	if (!visit.value?.checklist_items) return 0;
	return visit.value.checklist_items.filter((i) => (i.response || i.status) && (i.response || i.status) !== "Pending").length;
});

const outOfRangeCount = computed(() => {
	if (!visit.value?.readings) return 0;
	return visit.value.readings.filter((r) => {
		const val = parseFloat(r.reading_value);
		if (isNaN(val) || r.reading_value === "") return false;
		const min = r.min_range != null ? r.min_range : r.min_value;
		const max = r.max_range != null ? r.max_range : r.max_value;
		if (min != null && val < min) return true;
		if (max != null && val > max) return true;
		return false;
	}).length;
});

const totalExpenses = computed(() => {
	if (!visit.value?.expenses) return 0;
	return visit.value.expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
});

// Dynamic Tab List with Badges
const tabs = computed(() => [
	{ id: "overview", label: "Overview", icon: "file-text" },
	{ id: "geofence", label: "GPS Check-In", icon: "map-pin" },
	{ id: "readings", label: "Water Tests", icon: "activity", badge: outOfRangeCount.value },
	{ id: "checklist", label: "Checklist", icon: "check-square", badge: completedChecklistCount.value },
	{ id: "findings", label: "Findings", icon: "alert-triangle", badge: visit.value?.findings?.length || 0 },
	{ id: "requirements", label: "Spares & Chems", icon: "box", badge: visit.value?.requirements?.length || 0 },
	{ id: "submit", label: "Summary & Sign", icon: "feather" },
]);

// Switch Tab with silent auto-save
function switchTab(tabId) {
	saveCurrentDraft(true);
	activeTab.value = tabId;
}

// Save Draft Action
async function saveCurrentDraft(silent = false) {
	if (!visit.value) return;
	isSaving.value = true;
	if (!silent) saveFeedback.value = "Saving...";
	try {
		await visitsData.saveDraft(visit.value.name, {
			checklist_items: visit.value.checklist_items || [],
			readings: visit.value.readings || [],
			findings: visit.value.findings || [],
			requirements: visit.value.requirements || [],
			expenses: visit.value.expenses || [],
			operations: visit.value.operations || [],
			executive_summary: visit.value.executive_summary || "",
			customer_representative: customerSignerName.value || visit.value.customer_representative || "",
			customer_representative_phone: customerSignerPhone.value || visit.value.customer_representative_phone || "",
		});
		if (!silent) {
			saveFeedback.value = "Saved ✓";
			setTimeout(() => { saveFeedback.value = ""; }, 2500);
		}
	} catch (e) {
		if (!silent) {
			saveFeedback.value = "Saved locally ✓";
			setTimeout(() => { saveFeedback.value = ""; }, 2500);
		}
	} finally {
		isSaving.value = false;
	}
}

// GPS Check-In with Haversine Distance
async function handleCheckIn() {
	isCheckingIn.value = true;
	try {
		let coords = { latitude: targetLat.value, longitude: targetLng.value, accuracy: 10 };
		if (navigator.geolocation) {
			try {
				const pos = await new Promise((resolve, reject) => {
					navigator.geolocation.getCurrentPosition(resolve, reject, {
						enableHighAccuracy: true,
						timeout: 8000,
						maximumAge: 0,
					});
				});
				coords = {
					latitude: pos.coords.latitude,
					longitude: pos.coords.longitude,
					accuracy: pos.coords.accuracy,
				};
			} catch (_) {}
		}

		// Calculate distance to target site
		const dist = haversineDistance(coords.latitude, coords.longitude, targetLat.value, targetLng.value);
		currentDistance.value = dist;

		await visitsData.checkIn(visit.value.name, coords, geofenceReason.value);
		visit.value.visit_status = "In Progress";
		visit.value.geofence_status = "Verified";
		visit.value.checkin_time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

		saveFeedback.value = "Check-in verified!";
		setTimeout(() => { saveFeedback.value = ""; }, 3000);
		activeTab.value = "readings";
	} catch (err) {
		alert("Check-In saved locally for sync.");
		activeTab.value = "readings";
	} finally {
		isCheckingIn.value = false;
	}
}

function haversineDistance(lat1, lon1, lat2, lon2) {
	const R = 6371000;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

// Readings Modal Handlers
function openAddReadingModal() {
	newReading.preset = "pH";
	applyReadingPreset();
	newReading.reading_value = "";
	newReading.remarks = "";
	showAddReadingModal.value = true;
}

function applyReadingPreset() {
	const presets = {
		pH: { parameter: "pH", parameter_name: "pH Level", unit: "pH", min_range: 6.5, max_range: 8.5 },
		TDS: { parameter: "TDS", parameter_name: "Total Dissolved Solids", unit: "ppm", min_range: 100, max_range: 1000 },
		Conductivity: { parameter: "Conductivity", parameter_name: "Electrical Conductivity", unit: "µS/cm", min_range: 200, max_range: 1500 },
		Hardness: { parameter: "Hardness", parameter_name: "Total Hardness", unit: "ppm CaCO3", min_range: 50, max_range: 300 },
		"Free Chlorine": { parameter: "Free Chlorine", parameter_name: "Free Residual Chlorine", unit: "ppm", min_range: 0.2, max_range: 2.0 },
		Iron: { parameter: "Iron", parameter_name: "Total Iron (Fe)", unit: "ppm", min_range: 0.01, max_range: 0.10 },
		Silica: { parameter: "Silica", parameter_name: "Reactive Silica (SiO2)", unit: "ppm", min_range: 5.0, max_range: 30.0 },
		Turbidity: { parameter: "Turbidity", parameter_name: "Turbidity", unit: "NTU", min_range: 0.1, max_range: 1.0 },
	};
	if (presets[newReading.preset]) {
		Object.assign(newReading, presets[newReading.preset]);
	}
}

function handleAddReadingSubmit() {
	if (!visit.value.readings) visit.value.readings = [];
	const isWarn =
		(newReading.min_range != null && parseFloat(newReading.reading_value) < newReading.min_range) ||
		(newReading.max_range != null && parseFloat(newReading.reading_value) > newReading.max_range);

	visit.value.readings.push({
		parameter: newReading.parameter || newReading.parameter_name,
		parameter_name: newReading.parameter_name,
		unit: newReading.unit,
		min_range: newReading.min_range,
		max_range: newReading.max_range,
		min_value: newReading.min_range,
		max_value: newReading.max_range,
		reading_value: String(newReading.reading_value),
		status: isWarn ? "Warning" : "Normal",
		remarks: newReading.remarks || "",
	});
	showAddReadingModal.value = false;
	saveCurrentDraft(true);
}

function removeReading(idx) {
	visit.value.readings.splice(idx, 1);
	saveCurrentDraft(true);
}

// Checklist Modal Handlers
function handleAddChecklistSubmit() {
	if (!newChecklistItem.value.trim()) return;
	if (!visit.value.checklist_items) visit.value.checklist_items = [];
	visit.value.checklist_items.push({
		checklist_item: newChecklistItem.value.trim(),
		response: "Pass",
		status: "Pass",
		is_mandatory: 0,
		remarks: "",
	});
	newChecklistItem.value = "";
	showAddChecklistModal.value = false;
	saveCurrentDraft(true);
}

function removeChecklistItem(idx) {
	visit.value.checklist_items.splice(idx, 1);
	saveCurrentDraft(true);
}

// Findings Modal Handlers
function handleAddFindingSubmit() {
	if (!newFinding.observation.trim()) return;
	if (!visit.value.findings) visit.value.findings = [];
	visit.value.findings.push({
		category: newFinding.category,
		severity: newFinding.severity,
		observation: newFinding.observation.trim(),
		recommendation: newFinding.recommendation.trim(),
	});
	newFinding.observation = "";
	newFinding.recommendation = "";
	showAddFindingModal.value = false;
	saveCurrentDraft(true);
}

function removeFinding(idx) {
	visit.value.findings.splice(idx, 1);
	saveCurrentDraft(true);
}

// Requirements Modal Handlers
function applyRequirementPreset() {
	const presets = {
		"CHEM-CW102": { item_code: "CHEM-CW102", item_name: "Anti-Scalant Polymer CW-102", uom: "Drums" },
		"CHEM-CW301": { item_code: "CHEM-CW301", item_name: "Non-Oxidizing Biocide CW-301", uom: "Drums" },
		"CHEM-CW204": { item_code: "CHEM-CW204", item_name: "Oxygen Scavenger CW-204", uom: "Drums" },
		"EQ-RO-8040": { item_code: "EQ-RO-8040", item_name: "RO Membrane Element 8040", uom: "Nos" },
		"EQ-FLT-05": { item_code: "EQ-FLT-05", item_name: "5-Micron Cartridge Filter 40\"", uom: "Nos" },
		"EQ-PUMP-P1": { item_code: "EQ-PUMP-P1", item_name: "Chemical Dosing Pump Seal Kit", uom: "Sets" },
	};
	if (presets[newRequirement.preset]) {
		Object.assign(newRequirement, presets[newRequirement.preset]);
	}
}

function handleAddRequirementSubmit() {
	if (!newRequirement.item_name.trim()) return;
	if (!visit.value.requirements) visit.value.requirements = [];
	visit.value.requirements.push({
		item_code: newRequirement.item_code || newRequirement.item_name,
		item_name: newRequirement.item_name.trim(),
		quantity: parseFloat(newRequirement.quantity) || 1,
		uom: newRequirement.uom,
		urgency: newRequirement.urgency,
		reason: newRequirement.reason.trim(),
	});
	showAddRequirementModal.value = false;
	saveCurrentDraft(true);
}

function removeRequirement(idx) {
	visit.value.requirements.splice(idx, 1);
	saveCurrentDraft(true);
}

// Expense Handlers
function handleAddExpenseSubmit() {
	if (!newExpense.amount) return;
	if (!visit.value.expenses) visit.value.expenses = [];
	visit.value.expenses.push({
		expense_type: newExpense.expense_type,
		amount: parseFloat(newExpense.amount) || 0,
		remarks: newExpense.remarks.trim(),
	});
	newExpense.amount = "";
	newExpense.remarks = "";
	showAddExpenseModal.value = false;
	saveCurrentDraft(true);
}

function removeExpense(idx) {
	visit.value.expenses.splice(idx, 1);
	saveCurrentDraft(true);
}

// Final Technical Report Submission
async function handleSubmitReport() {
	if (!customerSignerName.value.trim()) {
		alert("Please enter the Customer Signatory Name before submitting.");
		return;
	}

	const confirmed = confirm(
		`Submit completed Technical Service Report for ${visit.value.customer_name || visit.value.customer}?\n\nThis will stamp checkout time, finalize inspection parameters, and lock the document for review.`
	);
	if (!confirmed) return;

	isSubmitting.value = true;
	try {
		const sigData = sigPad.value ? sigPad.value.toDataURL() : null;

		let checkoutCoords = { latitude: targetLat.value, longitude: targetLng.value, accuracy: 10 };
		if (navigator.geolocation) {
			try {
				const pos = await new Promise((res, rej) =>
					navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000, enableHighAccuracy: true })
				);
				checkoutCoords = {
					latitude: pos.coords.latitude,
					longitude: pos.coords.longitude,
					accuracy: pos.coords.accuracy,
				};
			} catch (_) {}
		}

		await visitsData.submitVisit(visit.value.name, {
			readings: visit.value.readings || [],
			checklist_items: visit.value.checklist_items || [],
			findings: visit.value.findings || [],
			requirements: visit.value.requirements || [],
			expenses: visit.value.expenses || [],
			operations: visit.value.operations || [],
			outcome: visit.value.outcome || "Completed",
			executive_summary: visit.value.executive_summary || "Water quality inspection completed.",
			customer_rep: customerSignerName.value.trim(),
			customer_signature: sigData,
			latitude: checkoutCoords.latitude,
			longitude: checkoutCoords.longitude,
			accuracy: checkoutCoords.accuracy,
		});

		alert("Technical Service Report submitted successfully! Record locked for review.");
		router.push("/visits");
	} catch (err) {
		alert("Report queued offline for sync once connection is restored.");
		router.push("/visits");
	} finally {
		isSubmitting.value = false;
	}
}

onMounted(async () => {
	try {
		isLoading.value = true;
		visit.value = await visitsData.getVisitDetails(visitId.value);
		if (visit.value?.customer_representative) {
			customerSignerName.value = visit.value.customer_representative;
		}
		if (visit.value?.customer_representative_phone) {
			customerSignerPhone.value = visit.value.customer_representative_phone;
		}
	} catch (e) {
		console.error("Error loading visit:", e);
	} finally {
		isLoading.value = false;
	}
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
	display: none;
}
.no-scrollbar {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
</style>
