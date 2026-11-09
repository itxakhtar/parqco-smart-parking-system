import Slot from '../models/Slot.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { withLiveStatus, completeFinishedBookings } from '../services/slotStatus.js';

/** Numbers for the admin overview page. */
export const getStats = asyncHandler(async (_req, res) => {
  await completeFinishedBookings();
  const slots = await withLiveStatus(await Slot.find());
  const count = (status) => slots.filter((slot) => slot.liveStatus === status).length;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [users, bookingsToday, revenueRows, recentBookings] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Booking.countDocuments({ createdAt: { $gte: startOfDay } }),
    Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Booking.find().populate('user', 'name').sort({ createdAt: -1 }).limit(6),
  ]);

  res.json({
    success: true,
    stats: {
      totalSlots: slots.length,
      available: count('available'),
      occupied: count('occupied'),
      reserved: count('reserved'),
      maintenance: count('maintenance'),
      users,
      bookingsToday,
      revenue: revenueRows[0]?.total ?? 0,
      recentBookings,
    },
  });
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, users });
});
