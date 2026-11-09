/**
 * Fake ESP32 for demos – no hardware needed.
 *   1. Start the API and frontend.
 *   2. Run:  npm run simulate
 * Every few seconds a random parking slot changes state, exactly like a real sensor
 * calling POST /api/sensor-data. Watch the dashboard update live.
 */
import dotenv from 'dotenv';
dotenv.config();

const API = `http://localhost:${process.env.PORT || 5000}/api`;
const DEVICE_KEY = process.env.DEVICE_API_KEY || 'parqco-esp32-secret';
const INTERVAL_MS = 3000;

async function loginAsAdmin() {
  const response = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@parqco.com', password: 'Admin@123' }),
  });
  const data = await response.json();
  if (!data.token) throw new Error('Admin login failed. Did you seed the database?');
  return data.token;
}

async function loadSlots(token) {
  const response = await fetch(`${API}/slots`, { headers: { Authorization: `Bearer ${token}` } });
  return (await response.json()).slots.filter((slot) => slot.status !== 'maintenance');
}

async function sendReading(slot, occupied) {
  const response = await fetch(`${API}/sensor-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-device-key': DEVICE_KEY },
    body: JSON.stringify({ sensorId: slot.sensorId, occupied, battery: 60 + Math.floor(Math.random() * 40) }),
  });
  return response.ok;
}

const token = await loginAsAdmin();
const slots = await loadSlots(token);
console.log(`📡 Simulating ${slots.length} sensors. Press Ctrl+C to stop.`);

setInterval(async () => {
  const slot = slots[Math.floor(Math.random() * slots.length)];
  slot.status = slot.status === 'occupied' ? 'available' : 'occupied'; // flip it
  const ok = await sendReading(slot, slot.status === 'occupied' ? 1 : 0);
  console.log(`${ok ? '✔' : '✖'} ${slot.slotId} -> ${slot.status}`);
}, INTERVAL_MS);
