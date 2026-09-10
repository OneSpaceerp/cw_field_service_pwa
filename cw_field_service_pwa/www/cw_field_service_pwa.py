# Copyright (c) 2026, Nest Software Development & C-Water
# For license information, please see license.txt

try:
	import frappe
	from frappe.boot import load_translations
except ImportError:
	frappe = None

no_cache = 1


def get_context(context):
	if not frappe:
		return context

	csrf_token = frappe.sessions.get_csrf_token()
	frappe.db.commit()

	context = frappe._dict()
	context.csrf_token = csrf_token
	context.boot = get_boot()
	context.site_name = frappe.local.site
	return context


def get_context_for_dev():
	"""Provides bootinfo to Vite Dev Server proxy during local development."""
	if not frappe:
		return {"site_name": "cwater.local", "user": "Administrator"}
	if not frappe.conf.developer_mode:
		frappe.throw(frappe._("Only available in developer mode"))
	return get_boot()


if frappe and hasattr(frappe, "whitelist"):
	get_context_for_dev = frappe.whitelist(methods=["POST"], allow_guest=True)(get_context_for_dev)


def get_boot():
	if not frappe:
		return {}

	bootinfo = frappe._dict(
		{
			"site_name": frappe.local.site,
			"user": frappe.session.user,
			"socketio_port": frappe.conf.get("socketio_port") or 9000,
			"push_relay_server_url": frappe.conf.get("push_relay_server_url") or "",
			"default_route": "/cw_field_service_pwa",
		}
	)

	bootinfo.lang = frappe.local.lang
	load_translations(bootinfo)

	return bootinfo
