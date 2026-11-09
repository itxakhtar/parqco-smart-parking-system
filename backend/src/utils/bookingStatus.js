import Payment, { PAYMENT_STATUS } from '../models/Payment.js';

const RANK = {
  [PAYMENT_STATUS.PENDING]: 0,
  [PAYMENT_STATUS.PAID]: 1,
  [PAYMENT_STATUS.CONFIRMED]: 2,
};

/** What the driver should see: cancelled/completed win, otherwise the payment state. */
export function displayStatusOf(bookingStatus, paymentStatus) {
  if (bookingStatus === 'cancelled') return 'cancelled';
  if (bookingStatus === 'completed') return 'completed';
  return paymentStatus ?? PAYMENT_STATUS.PENDING; // no payment yet = pending
}

/** Adds paymentStatus + displayStatus to one booking or a list of bookings. */
export async function withPaymentStatus(input) {
  const list = (Array.isArray(input) ? input : [input]).map((b) =>
    typeof b?.toObject === 'function' ? b.toObject() : b
  );

  const payments = await Payment.find({ booking: { $in: list.map((b) => b._id) } })
    .select('booking status')
    .lean();

  // If a booking has several payment records, keep the most advanced one.
  const payOf = new Map();
  for (const p of payments) {
    const key = String(p.booking);
    if (!payOf.has(key) || RANK[p.status] > RANK[payOf.get(key)]) payOf.set(key, p.status);
  }

  const out = list.map((b) => {
    const paymentStatus = payOf.get(String(b._id)) ?? PAYMENT_STATUS.PENDING;
    return { ...b, paymentStatus, displayStatus: displayStatusOf(b.status, paymentStatus) };
  });
  return Array.isArray(input) ? out : out[0];
}

/** Text for the slip and the slip e-mail. `view` is a booking returned by withPaymentStatus(). */
export function slipStatusOf(view) {
  const paid = view.paymentStatus === PAYMENT_STATUS.PAID || view.paymentStatus === PAYMENT_STATUS.CONFIRMED;

  if (view.status === 'cancelled') {
    return { key: 'cancelled', badge: 'CANCELLED', amountLabel: 'AMOUNT', note: 'This booking was cancelled.' };
  }
  if (!paid) {
    return {
      key: 'pending',
      badge: view.status === 'completed' ? 'UNPAID' : 'PENDING',
      amountLabel: 'AMOUNT DUE',
      note: 'Payment pending. Pay to confirm your booking.',
    };
  }
  if (view.status === 'completed') {
    return { key: 'completed', badge: 'COMPLETED', amountLabel: 'AMOUNT PAID', note: 'Payment received. Thank you for parking with PARQCO.' };
  }
  return { key: 'confirmed', badge: 'CONFIRMED', amountLabel: 'AMOUNT PAID', note: 'Payment received. Your booking is confirmed.' };
}