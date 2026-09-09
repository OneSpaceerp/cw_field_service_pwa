# C-Water Field Engineer Mobile PWA (`cw_field_service_pwa`)

A mobile-first Progressive Web Application (PWA) designed specifically for C-Water field service engineers and technicians executing site visits on smartphones and tablets.

## Key Features
- **Touch-First Mobile UX**: Large touch buttons, card-based navigation, high-contrast indicators, and zero dense desktop tables.
- **Offline Resilience & Sync Queue**: Unsent drafts, check-in timestamps, readings, and photos are safely stored in browser `localStorage` / `IndexedDB` with UUIDv4 idempotency keys to prevent duplicate submissions when network drops.
- **Real-Time GPS Check-in**: One-touch GPS capture using browser Geolocation API with accuracy indicator and instant site geofence verification.
- **Dynamic Water Quality Readings**: Visual color-coded status badges (`Normal`, `Warning`, `Critical`) computed in real-time as the technician enters test values.
- **Digital Signatures**: Built-in HTML5 Canvas signature pad allowing on-site customer acknowledgement directly on the engineer's phone screen.
- **Photo & Evidence Capture**: Camera and gallery upload with category tagging (`Before`, `During`, `After`, `Defect`, `Gauge`).
- **Installable PWA**: Service Worker with asset caching, web app manifest, and home screen install capability.

## Running / Serving the PWA
The PWA is a modern, dependency-free web application. It can be served directly by any web server (Nginx, Caddy, Apache) or accessed through ERPNext's website portal.

To test locally:
```bash
python -m http.server 8080 --directory cw_field_service_pwa
```
Open `http://localhost:8080` in your browser or mobile device.
