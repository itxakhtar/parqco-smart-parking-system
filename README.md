# PARQCO – Smart Parking Management System with AI Predictions

A full-stack project built from the SRS and SDD documents: **React** dashboard, **Node.js/Express** API,
**MongoDB** database, **ESP32 + ultrasonic** IoT sensors and a **forecasting module** that predicts peak hours.

```
IoT sensors ──► Node.js API ──► MongoDB ──► Forecast service ──► React UI
 (ESP32)        (Express)      (Mongoose)   (peak-hour model)    (live via Socket.IO)
```

## Run it locally in VS Code (5 minutes)

**You need:** [Node.js 18 or newer](https://nodejs.org). MongoDB is optional (see step 3).

1. Open the `parqco` folder in VS Code, then open a terminal (**Terminal → New Terminal**).
2. Install everything (one command):
   ```bash
   npm run install:all
   ```
3. Choose a database in `backend/.env`:
   - **Easiest (default):** `USE_MEMORY_DB=true`. A temporary MongoDB starts by itself and is filled with demo data. The first start downloads a MongoDB binary once (about 1–2 minutes). Data resets whenever the API restarts.
   - **Real MongoDB:** install MongoDB Community Server, set `USE_MEMORY_DB=false`, then run `npm run seed` once to load the demo data.
4. Start the API and the website together:
   ```bash
   npm run dev
   ```
5. Open **http://localhost:5173**

| Role   | Email              | Password   |
|--------|--------------------|------------|
| Driver | demo@parqco.com    | Demo@123   |
| Admin  | admin@parqco.com   | Admin@123  |

### E-mail (sign-up code, password-reset code, booking slip)

E-mails are sent through **Brevo**. In `backend/.env` set `SMTP_USER` and `SMTP_PASS` (Brevo → *SMTP & API* → *SMTP*) and
`MAIL_FROM` (a sender you verified in Brevo). Copy `backend/.env.example` for the full list.
For quick local testing without any e-mail, set `OTP_DEV_MODE=true` and the code is printed in the backend terminal.

### Challan

Every booking produces a challan number (for example `CH-20261025-0001`) with the driver name and vehicle registration number.
The driver sees it right after booking and can download the PDF slip from *My bookings* at any time.

**See it live:** open a second terminal and run `npm run simulate`. A fake ESP32 flips random slots every 3 seconds and the dashboard updates without a refresh.

## Folder structure

```
parqco/
├── backend/
│   ├── src/
│   │   ├── config/        env + database connection
│   │   ├── models/        User, Slot, Booking, SensorData, Prediction
│   │   ├── controllers/   auth, slots, bookings, sensors, predictions, admin
│   │   ├── routes/        one file that lists every endpoint
│   │   ├── middleware/    JWT auth, role check, device key, validation, errors
│   │   ├── services/      slotStatus (live status), predictionService (ML)
│   │   ├── sockets/       Socket.IO live updates
│   │   └── utils/         seed script, ApiError, asyncHandler
│   └── scripts/simulate-sensors.js
├── frontend/
│   └── src/
│       ├── pages/         Landing, Login, Register, Dashboard, BookSlot, MyBookings, Predictions
│       │   └── admin/     Overview, Slots, Bookings, Users, Sensors
│       ├── components/    Navbar, ParkingLot, SlotBay, ForecastChart, DataTable, …
│       ├── context/       AuthContext (login state)
│       ├── api/           axios client + socket
│       └── styles/        global.css (design tokens first, then components)
└── esp32/parqco_esp32.ino   firmware for the real sensor
```

## How each part works

**Request flow (backend):** route → middleware (auth/validation) → controller → model → JSON response. Errors are thrown with `ApiError` and formatted in one place (`middleware/errorHandler.js`).

**Slot status.** The sensor sets the physical state (`available` / `occupied`). A booking that covers "now" shows the slot as `reserved`. Admins can set `maintenance`. `services/slotStatus.js` combines these into one value for the UI.

**Booking rules.** Start cannot be in the past, a booking is at most 24 hours, and the server rejects any time overlap on the same slot. The price is hours (rounded up) × the slot’s hourly rate.

**IoT endpoint.** `POST /api/sensor-data` with header `x-device-key` and body `{ "sensorId": "SENSOR_A101", "occupied": 1, "battery": 87 }`. Every reading is stored (this is the ML training data), the slot is updated and the change is pushed to all dashboards.

**Forecast (`services/predictionService.js`).** It takes 28 days of readings, computes the occupancy ratio per hour, averages it for weekdays or weekends, and multiplies by a trend factor (last 7 days vs the 21 before). It returns 24 hourly points, a confidence score, the busiest 2-hour window and plain-language insights. The SDD lists ARIMA/LSTM as options; this baseline is explainable and needs no extra install. To upgrade, replace `buildHourlyPattern()` and keep the same return shape, and the API and UI keep working.

## API summary

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | public | Create account / sign in |
| GET | `/api/auth/me` | user | Current user |
| GET | `/api/slots/summary` | public | Counts for the landing page |
| GET | `/api/slots` | user | All slots with live status |
| GET | `/api/slots/availability?start=&end=` | user | Which slots are bookable for a time window |
| POST/PUT/DELETE | `/api/slots`, `/api/slots/:id` | admin | Manage slots |
| POST | `/api/bookings` | user | Book a slot |
| GET | `/api/bookings/my` | user | My bookings |
| DELETE | `/api/bookings/:id` | owner/admin | Cancel |
| GET | `/api/bookings` | admin | All bookings |
| POST | `/api/sensor-data` | device key | ESP32 reading |
| GET | `/api/sensors` | admin | Sensor health |
| GET | `/api/predictions/today`, `/weekly` | user | Forecast |
| GET | `/api/admin/stats`, `/admin/users` | admin | Admin data |

## Using the real ESP32

1. Open `esp32/parqco_esp32.ino` in Arduino IDE (install the ESP32 board package).
2. Set your WiFi name and password, `API_URL` (your computer’s IP, for example `http://192.168.1.50:5000/api/sensor-data`) and `SENSOR_ID` (a sensor that exists in the Slots page).
3. Upload. Put the laptop and the ESP32 on the same WiFi, and allow port 5000 in your firewall.

## Before you deploy for real

- Change `JWT_SECRET` and `DEVICE_API_KEY` to long random values.
- Use a hosted MongoDB (Atlas) and set `CLIENT_URL` to your website’s address.
- Serve the built frontend (`npm run build --prefix frontend`) behind HTTPS and set a real Socket.IO URL in `frontend/src/api/socket.js`.
- Booking overlap is checked in code, not with a database lock. For very high traffic, wrap booking creation in a MongoDB transaction.

## SRS/SDD coverage

Slot detection (ESP32 + ultrasonic) ✔ · real-time dashboard ✔ · AI prediction ✔ · notification of availability (live badge and updates) ✔ · admin panel ✔ · online booking (listed as a future enhancement in the SRS, included here because the SDD UI shows it) ✔ · payments, mobile app and camera detection are left out as in the SRS future work.
