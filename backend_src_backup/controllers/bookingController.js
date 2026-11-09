import mongoose from 'mongoose';
import { z } from 'zod';
import Booking from '../models/Booking.js';
import Slot from '../models/Slot.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { completeFinishedBookings } from '../services/slotStatus.js';
import { broadcast } from '../sockets/io.js';
import { normalizeVehicleNumber } from '../utils/vehicle.js';
import { nextChallanNumber } from '../utils/challan.js';
import { buildSlipData, buildSlipPdf } from '../utils/slip.js';
import { slipEmailHtml } from '../utils/emailTemplates.js';
import { isMailConfigured, sendMail } from '../utils/mailer.js';

const MIN_BOOKING_MINUTES = 15;
const MAX_BOOKING_HOURS = 24;
const START_GRACE_MS = 5 * 60 * 1000; // a booking may start up to 5 minutes "in the past" (slow typing, clock drift)
const HOUR_MS = 60 * 60 * 1000;

const date = (message) => z.coerce.date({ errorMap: () => ({ message }) });

export const bookingSchema = z
  .object({
    slotId: z.string().trim().min(1, 'Please choose a parking slot'),
    startTime: date('Please choose a valid arrival time'),
    endTime: date('Please choose a valid leaving time'),
    vehiclePlate: z.string().trim().min(1, 'Please enter your vehicle registration number'),
    driverName: z.string().trim().max(80).optional(), // defaults to the account name
  })
  .refine((data) => data.endTime > data.startTime, { message: 'End time must be after start time.', path: ['endTime'] });

// ---------------------------------------------------------------- helpers

function assertValidWindow(startTime, endTime) {
  if (startTime.getTime() < Date.now() - START_GRACE_MS) throw new ApiError(400, 'Start time cannot be in the past.');
  const minutes = (endTime - startTime) / 60000;
  if (minutes < MIN_BOOKING_MINUTES) throw new ApiError(400, `The minimum booking is ${MIN_BOOKING_MINUTES} minutes.`);
  if (minutes > MAX_BOOKING_HOURS * 60) throw new ApiError(400, `You can book up to ${MAX_BOOKING_HOURS} hours at a time.`);
}

/** Matches confirmed bookings that overlap the requested time window. */
const overlapping = (startTime, endTime) => ({
  status: 'confirmed',
  startTime: { $lt: endTime },
  endTime: { $gt: startTime },
});

/** Creates the booking together with its challan number; retries if two requests ever drew the same number. */
async function createWithChallan(data) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await Booking.create({ ...data, challanNumber: await nextChallanNumber() });
    } catch (error) {
      const duplicateChallan = error.code === 11000 && error.keyPattern?.challanNumber;
      if (!duplicateChallan || attempt >= 3) throw error;
    }
  }
}

/** E-mails the slip as a PDF. Runs in the background: a mail problem must never break a booking. */
function emailSlipInBackground(slip, user) {
  if (!user?.email || !isMailConfigured()) return;
  (async () => {
    const pdf = await buildSlipPdf(slip);
    await sendMail({
      to: user.email,
      toName: user.name,
      subject: `Parking slip ${slip.challanNumber}`,
      html: slipEmailHtml(slip),
      attachments: [{ filename: `Parking-Slip-${slip.challanNumber}.pdf`, content: pdf }],
    });
  })().catch((error) => console.error('[BOOKING] slip email failed:', error.message));
}

// ---------------------------------------------------------------- handlers

/** POST /api/bookings - reserve a slot and receive the challan. */
export const createBooking = asyncHandler(async (req, res) => {
  const { slotId, startTime, endTime } = req.body;

  const vehiclePlate = normalizeVehicleNumber(req.body.vehiclePlate);
  if (!vehiclePlate) throw new ApiError(400, 'Please enter a valid vehicle registration number (e.g. LEA-1234).');
  const driverName = req.body.driverName || req.user.name;

  assertValidWindow(startTime, endTime);

  // The slot must exist and be usable
  const slot = await Slot.findOne({ slotId });
  if (!slot) throw new ApiError(404, 'Parking slot not found.');
  if (slot.status === 'maintenance') throw new ApiError(400, 'This slot is under maintenance.');
  const now = new Date();
  if (slot.status === 'occupied' && startTime <= now && endTime > now) {
    throw new ApiError(409, 'This slot is occupied right now. Pick another slot or a later time.');
  }

  // One slot cannot be booked twice, and one vehicle cannot be in two places at once
  const clash = overlapping(startTime, endTime);
  if (await Booking.exists({ ...clash, slotId })) {
    throw new ApiError(409, 'Someone just booked this slot for that time. Please pick another.');
  }
  if (await Booking.exists({ ...clash, vehiclePlate })) {
    throw new ApiError(409, 'This vehicle already has a booking for that time.');
  }

  // Price is rounded up to the next full hour
  const amount = Math.ceil((endTime - startTime) / HOUR_MS) * slot.hourlyRate;
  const booking = await createWithChallan({
    user: req.user._id,
    slot: slot._id,
    slotId,
    driverName,
    vehiclePlate,
    startTime,
    endTime,
    amount,
  });

  // Race guard: if two requests passed the checks together, the earliest one wins
  const winner = await Booking.findOne({ ...clash, slotId }).sort({ _id: 1 }).select('_id');
  if (winner && !winner._id.equals(booking._id)) {
    await Booking.deleteOne({ _id: booking._id });
    throw new ApiError(409, 'Someone just booked this slot for that time. Please pick another.');
  }

  const slip = buildSlipData({ booking, user: req.user, slot });
  emailSlipInBackground(slip, req.user);
  broadcast('booking:update', { slotId });

  res.status(201).json({
    success: true,
    message: 'Slot booked successfully.',
    booking,
    slip,
    slipUrl: `/api/bookings/${booking._id}/slip`,
  });
});

/** GET /api/bookings/my - the signed-in driver's bookings, newest first. */
export const myBookings = asyncHandler(async (req, res) => {
  await completeFinishedBookings();
  const bookings = await Booking.find({ user: req.user._id }).sort({ startTime: -1 });
  res.json({ success: true, bookings });
});

/** GET /api/bookings - admin: the 200 most recent bookings with the driver's account. */
export const allBookings = asyncHandler(async (_req, res) => {
  await completeFinishedBookings();
  const bookings = await Booking.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, bookings });
});

/** DELETE /api/bookings/:id - owner or admin cancels an upcoming booking. */
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found.');

  const isOwner = booking.user.equals(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'You can only cancel your own bookings.');
  if (booking.status !== 'confirmed') throw new ApiError(400, `This booking is already ${booking.status}.`);

  booking.status = 'cancelled';
  await booking.save();
  broadcast('booking:update', { slotId: booking.slotId });
  res.json({ success: true, message: 'Booking cancelled.', booking });
});

/** GET /api/bookings/:id/slip - the PDF slip (add ?format=json for the raw data). Owner or admin only. */
export const getSlip = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid booking id.');

  let booking = await Booking.findById(req.params.id);
  const isOwner = booking && booking.user.equals(req.user._id);
  if (!booking || (!isOwner && req.user.role !== 'admin')) throw new ApiError(404, 'Booking not found.');

  // Bookings made before challan numbers existed receive theirs the first time the slip is opened.
  if (!booking.challanNumber) {
    const challanNumber = await nextChallanNumber(booking.createdAt);
    booking =
      (await Booking.findOneAndUpdate(
        { _id: booking._id, challanNumber: { $exists: false } },
        { $set: { challanNumber } },
        { new: true }
      )) || (await Booking.findById(booking._id));
  }

  const [owner, slot] = await Promise.all([User.findById(booking.user), Slot.findOne({ slotId: booking.slotId })]);
  const slip = buildSlipData({ booking, user: owner, slot });

  if (req.query.format === 'json') return res.json({ success: true, slip });

  const pdf = await buildSlipPdf(slip);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': pdf.length,
    'Content-Disposition': `inline; filename="Parking-Slip-${slip.challanNumber}.pdf"`,
    'Cache-Control': 'private, no-store',
  });
  res.send(pdf);
});
