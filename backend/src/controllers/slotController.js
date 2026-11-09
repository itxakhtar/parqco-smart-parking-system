import { z } from 'zod';
import Slot from '../models/Slot.js';
import Booking from '../models/Booking.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { withLiveStatus, completeFinishedBookings } from '../services/slotStatus.js';
import { broadcast } from '../sockets/io.js';

export const slotSchema = z.object({
  slotId: z.string().trim().min(2, 'Slot ID is required'),
  zone: z.string().trim().min(1, 'Zone is required'),
  floor: z.coerce.number().int().min(0),
  sensorId: z.string().trim().min(2, 'Sensor ID is required'),
  hourlyRate: z.coerce.number().min(0).default(100),
  status: z.enum(['available', 'occupied', 'maintenance']).optional(),
});

/** Public: headline numbers for the landing page. */
export const getSummary = asyncHandler(async (_req, res) => {
  await completeFinishedBookings();
  const slots = await withLiveStatus(await Slot.find());
  const count = (status) => slots.filter((slot) => slot.liveStatus === status).length;
  res.json({
    success: true,
    summary: {
      total: slots.length,
      available: count('available'),
      occupied: count('occupied'),
      reserved: count('reserved'),
      maintenance: count('maintenance'),
    },
  });
});

/** All slots with their live status (GET /api/slots). */
export const listSlots = asyncHandler(async (_req, res) => {
  await completeFinishedBookings();
  const slots = await Slot.find().sort({ slotId: 1 });
  res.json({ success: true, slots: await withLiveStatus(slots) });
});

/**
 * Slots that can be booked for a time window (GET /api/slots/availability?start=&end=).
 * A slot is bookable when it is not in maintenance, has no overlapping booking,
 * and (if the window includes "now") is not physically occupied right now.
 */
export const checkAvailability = asyncHandler(async (req, res) => {
  const start = new Date(req.query.start);
  const end = new Date(req.query.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    throw new ApiError(400, 'Please provide a valid start and end time.');
  }

  const overlapping = await Booking.find({
    status: 'confirmed',
    startTime: { $lt: end },
    endTime: { $gt: start },
  }).select('slotId');
  const bookedIds = new Set(overlapping.map((booking) => booking.slotId));

  const now = new Date();
  const windowIncludesNow = start <= now && end > now;

  const slots = await Slot.find().sort({ slotId: 1 });
  const result = slots.map((slot) => {
    let unavailableReason = null;
    if (slot.status === 'maintenance') unavailableReason = 'Under maintenance';
    else if (bookedIds.has(slot.slotId)) unavailableReason = 'Already booked';
    else if (windowIncludesNow && slot.status === 'occupied') unavailableReason = 'Occupied now';
    return { ...slot.toObject(), bookable: !unavailableReason, unavailableReason };
  });

  res.json({ success: true, slots: result });
});

// ---------------- Admin only ----------------
export const createSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.create(req.body);
  broadcast('slot:update', { slotId: slot.slotId });
  res.status(201).json({ success: true, slot });
});

export const updateSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!slot) throw new ApiError(404, 'Slot not found.');
  broadcast('slot:update', { slotId: slot.slotId, status: slot.status });
  res.json({ success: true, slot });
});

export const deleteSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findByIdAndDelete(req.params.id);
  if (!slot) throw new ApiError(404, 'Slot not found.');
  broadcast('slot:update', { slotId: slot.slotId });
  res.json({ success: true, message: 'Slot deleted.' });
});
