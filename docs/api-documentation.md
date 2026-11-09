# PARQCO — API Documentation

Base URL (production): `https://parqco.onrender.com`
All responses are JSON. Errors return `{ "error": "<message>" }` with a
matching HTTP status. Auth uses `Authorization: Bearer <JWT>` unless
noted. Sensor ingestion uses the `x-api-key: <ESP32_API_KEY>` header.

## Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | `{ ok: true, service: "parqco-backend" }` |

## Auth — `/api/auth`

Sign-up and password reset are confirmed with a 6-digit code e-mailed through Brevo.
A code is valid for `OTP_TTL_MINUTES` (10), allows `OTP_MAX_ATTEMPTS` (5) tries and can be
re-sent after `OTP_RESEND_SECONDS` (60). Errors always look like `{ "success": false, "message": "..." }`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Body `{name, email, password (min 8), phone?}` → e-mails a code. **No account exists yet.** |
| POST | `/api/auth/verify-otp` | — | Body `{email, otp}` → creates the `user` account, returns JWT + user |
| POST | `/api/auth/resend-otp` | — | Body `{email, purpose: "register" \| "reset"}` → sends a new code |
| POST | `/api/auth/forgot-password` | — | Body `{email}` → e-mails a reset code (same answer whether or not the account exists) |
| POST | `/api/auth/reset-password` | — | Body `{email, otp, newPassword (min 8)}` → sets the new password |
| POST | `/api/auth/login` | — | Body `{email, password}` → returns JWT + user |
| GET | `/api/auth/me` | JWT | Current user's profile |

## Slots — `/api/slots`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/slots` | — | All slots with live status, sensorId, lastSeenAt |
| GET | `/api/slots/stats` | — | Totals: slots, available, occupied, occupancy % |
| POST | `/api/slots` | JWT + admin | Create a slot `{slotId, label, zone}` |
| PATCH | `/api/slots/:slotId` | JWT + admin | Update a slot |
| DELETE | `/api/slots/:slotId` | JWT + admin | Remove a slot |

## Sensor ingestion

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/sensor-data` | `x-api-key` | ESP32 reading `{sensorId, slotId, occupied, distanceCm}` → updates slot + appends history, emits Socket.io update |

## Bookings — `/api/bookings`

Every booking gets a **challan number** (`CH-YYYYMMDD-0001`, restarts each day) that is printed,
together with the **driver name** and the **vehicle registration number**, on the PDF parking slip.
The slip is also e-mailed to the driver when e-mail is configured.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | JWT | Body `{slotId, startTime, endTime, vehiclePlate, driverName?}` → `{booking, slip, slipUrl}` (`driverName` defaults to the account name) |
| GET | `/api/bookings/my` | JWT | The caller's bookings, newest first |
| GET | `/api/bookings` | JWT + admin | The 200 most recent bookings |
| GET | `/api/bookings/:id/slip` | JWT (owner or admin) | PDF slip; add `?format=json` for the slip data |
| DELETE | `/api/bookings/:id` | JWT (owner or admin) | Cancel an upcoming booking |

Rules: 15 minutes minimum, 24 hours maximum, no overlap for the same slot or the same vehicle.

## Predictions — `/api/predictions` (proxied to the ML service)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/predictions?hours=24` | — | Hourly forecast: time, occupancyPct, availableSlots (hours clamped 1–72) |
| GET | `/api/predictions/peak` | — | Predicted peak window for the next 24 h |

Returns 503 from the ML service until a model has been trained
(seed or train first — see Admin).

## Admin — `/api/admin` (JWT + admin on all)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/seed` | Generate 28 days of simulated history + train the model |
| POST | `/api/admin/train` | Retrain the model on current sensor history |
| POST / GET | `/api/admin/demo-mode` | Toggle / read the built-in sensor simulator |
| POST | `/api/admin/ensure-admin` | Idempotently ensure the configured admin account exists |

## ML service (direct, internal)

Base URL: the Render `parqco-ml` service. Endpoints: `GET /health`
(`{ok, modelLoaded}`), `POST /seed`, `POST /train`,
`GET /predict?hours=24`, `GET /peak`. The backend reaches it via the
`ML_SERVICE_URL` environment variable.

## Real-time (Socket.io)

Connect to the backend origin. Events:

| Event | Payload | When |
|---|---|---|
| `slots:update` | Updated slot list | Any sensor reading / slot change |
| `stats:update` | Totals + occupancy % | Same |
