import Booking from '../models/Booking.js';

/**
 * A slot has a *physical* status (from the sensor) and may also be *reserved* by a booking.
 * The UI wants one value, so we combine them:
 *   maintenance > occupied (a car is there) > reserved (booking covers "now") > available
 */
export async function withLiveStatus(slots) {
  const now = new Date();
  const activeBookings = await Booking.find({
    status: 'confirmed',
    startTime: { $lte: now },
    endTime: { $gt: now },
  }).select('slotId');
  const reservedIds = new Set(activeBookings.map((booking) => booking.slotId));

  return slots.map((slot) => {
    const plain = slot.toObject ? slot.toObject() : slot;
    let liveStatus = plain.status;
    if (liveStatus === 'available' && reservedIds.has(plain.slotId)) liveStatus = 'reserved';
    return { ...plain, liveStatus };
  });
}

/** Marks confirmed bookings whose end time has passed as completed. */
export async function completeFinishedBookings() {
  await Booking.updateMany(
    { status: 'confirmed', endTime: { $lte: new Date() } },
    { status: 'completed' }
  );
}
