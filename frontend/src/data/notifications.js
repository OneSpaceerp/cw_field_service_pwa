import { reactive, computed } from "vue";

export const notificationsStore = reactive({
	items: [
		{
			id: "notif-001",
			title: "Emergency Visit Assigned",
			message: "Urgent: Al-Baik Central RO Pump pressure drop requires emergency inspection.",
			timestamp: "10 mins ago",
			type: "urgent",
			read: false,
			visit_id: "VISIT-2026-00003",
		},
		{
			id: "notif-002",
			title: "Report Approved",
			message: "Manager approved Technical Report for Red Sea Mall Chiller Plant.",
			timestamp: "2 hours ago",
			type: "success",
			read: false,
			visit_id: "VISIT-2026-00001",
		},
		{
			id: "notif-003",
			title: "SLA Deadline Approaching",
			message: "Scheduled visit at Jeddah Port Authority is due within 4 hours.",
			timestamp: "Yesterday",
			type: "warning",
			read: true,
			visit_id: "VISIT-2026-00002",
		},
	],

	get unreadCount() {
		return this.items.filter((item) => !item.read).length;
	},

	markAsRead(id) {
		const item = this.items.find((i) => i.id === id);
		if (item) item.read = true;
	},

	markAllAsRead() {
		this.items.forEach((item) => (item.read = true));
	},

	addNotification(notif) {
		this.items.unshift({
			id: `notif-${Date.now()}`,
			timestamp: "Just now",
			read: false,
			...notif,
		});
	},
});
