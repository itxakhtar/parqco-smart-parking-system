import { z } from 'zod';
import Slot from '../models/Slot.js';
import SensorData from '../models/SensorData.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { broadcast } from '../sockets/io.js';

// What the ESP32 sends. "occupied" may be 0/1 or true/false.
export const sensorReadingSchema = z.object({
  sensorId: z.string().min(1, 'sensorId is required'),
  occupied: z.union([z.literal(0), z.literal(1), z.boolean()]).transform((value) => (value ? 1 : 0)),
  battery: z.number().min(0).max(100).optional(),
});

/** POST /api/sensor-data – called by the ESP32 (IoT layer -> backend). */
export const ingestReading = asyncHandler(async (req, res) => {
  const { sensorId, occupied, battery } = req.body;

  const slot = await Slot.findOne({ sensorId });
  if (!slot) throw new ApiError(404, `No parking slot is linked to sensor ${sensorId}.`);

  // 1. Keep every reading – this history trains the ML model
  await SensorData.create({ sensorId, slotId: slot.slotId, occupied, battery });

  // 2. Update the live slot status (unless an admin put it in maintenance)
  if (slot.status !== 'maintenance') {
    slot.status = occupied ? 'occupied' : 'available';
    await slot.save();
  }

  // 3. Push the change to every open dashboard instantly
  broadcast('slot:update', { slotId: slot.slotId, status: slot.status });
  res.status(201).json({ success: true, slotId: slot.slotId, status: slot.status });
});

/** Admin: latest reading and health of each sensor. */
export const sensorOverview = asyncHandler(async (_req, res) => {
  const slots = await Slot.find().sort({ slotId: 1 });
  const latest = await SensorData.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: { _id: '$sensorId', occupied: { $first: '$occupied' }, battery: { $first: '$battery' }, lastSeen: { $first: '$timestamp' } } },
  ]);
  const bySensor = new Map(latest.map((row) => [row._id, row]));

  const OFFLINE_AFTER_MS = 15 * 60 * 1000;
  const sensors = slots.map((slot) => {
    const reading = bySensor.get(slot.sensorId);
    const online = reading && Date.now() - new Date(reading.lastSeen).getTime() < OFFLINE_AFTER_MS;
    return {
      sensorId: slot.sensorId,
      slotId: slot.slotId,
      battery: reading?.battery ?? null,
      lastSeen: reading?.lastSeen ?? null,
      state: reading ? (reading.occupied ? 'Occupied' : 'Empty') : 'No data',
      online: Boolean(online),
    };
  });
  res.json({ success: true, sensors });
});
