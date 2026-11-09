# PARQCO frontend
Smart Parking Management System with AI Predictions. React + Vite + React Router.

## Run
    npm install
    npm run dev
    npm run build

## Status (frontend phase)
- REAL: routing, layouts, role-based route guards (UI only), responsive UI.
- MOCK: login (any valid email + 6-char password, role picker), all data in `src/data/mockData.js`.
- NOT IMPLEMENTED: backend, MongoDB, ESP32, prediction service. Real authorization must be enforced by the Node.js backend.
- Pages marked "coming next" use `PlaceholderPage`.

## Structure
`components/` (common, layout, parking, admin) · `pages/` (auth, user, admin) · `routes/` · `context/` · `hooks/` · `data/` · `utils/` · `styles/`
