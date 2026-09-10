app_name = "cw_field_service_pwa"
app_title = "CW Field Service PWA"
app_publisher = "Nest Software Development & C-Water"
app_description = "Mobile Progressive Web Application for C-Water Field Service"
app_email = "info@nest-dev.com"
app_license = "mit"

required_apps = ["erpnext"]

# Route all PWA sub-paths to the single-page HTML entry
website_route_rules = [
	{"from_route": "/cw_field_service_pwa/<path:app_path>", "to_route": "cw_field_service_pwa"},
]
