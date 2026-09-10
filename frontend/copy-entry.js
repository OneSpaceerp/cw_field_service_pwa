import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.resolve(__dirname, "../cw_field_service_pwa/public/frontend/index.html");
const dest = path.resolve(__dirname, "../cw_field_service_pwa/www/cw_field_service_pwa.html");

if (fs.existsSync(src)) {
	let html = fs.readFileSync(src, "utf-8");
	const injection = `
	<script>
		window.csrf_token = "{{ csrf_token }}";
		{% if boot %}
		window.site_name = "{{ site_name }}";
		window.boot = {{ boot | json }};
		{% endif %}
	</script>
</head>`;
	html = html.replace("</head>", injection);
	fs.writeFileSync(dest, html, "utf-8");
	console.log(`[PWA Build] Injected Frappe Boot context and copied ${src} -> ${dest}`);
} else {
	console.error(`[PWA Build Error] File not found: ${src}`);
}
