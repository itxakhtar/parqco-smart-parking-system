// DEVELOPMENT DATA ONLY
// Replace with backend API data. Field names follow the SDD data dictionary.

const layout = [
  ["A", "Zone A", "1", ["available", "occupied", "available", "occupied", "reserved"]],
  ["B", "Zone B", "1", ["available", "occupied", "occupied", "available", "occupied"]],
  ["C", "Zone C", "2", ["available", "occupied", "reserved", "occupied", "available"]],
  ["D", "Zone D", "2", ["occupied", "occupied", "available", "occupied", "available"]],
];

export const mockParkingSlots = layout.flatMap(([letter, location, floor, statuses]) =>
  statuses.map((status, i) => ({
    slot_id: `${letter}-10${i + 1}`,
    location,
    floor,
    status,
    sensor_id: `SENSOR_${letter}10${i + 1}`,
  }))
);

export const mockUsers = [
  { _id: "u1", name: "Ali Khan", email: "ali@example.com", role: "user", status: "active", createdAt: "2026-04-02" },
  { _id: "u2", name: "Sara Ahmed", email: "sara@example.com", role: "user", status: "active", createdAt: "2026-04-10" },
  { _id: "u3", name: "Usman Raza", email: "usman@example.com", role: "user", status: "inactive", createdAt: "2026-04-18" },
  { _id: "u4", name: "Admin User", email: "admin@example.com", role: "admin", status: "active", createdAt: "2026-03-01" },
];

export const mockActiveBookings = 3;

export function getSlotCounts(slots = mockParkingSlots) {
  const count = (s) => slots.filter((slot) => slot.status === s).length;
  return { total: slots.length, available: count("available"), occupied: count("occupied"), reserved: count("reserved") };
}

// DEVELOPMENT DATA ONLY: starting bookings for the logged-in demo user.
export const mockBookings = [
  { _id: "b1", slot_id: "A-105", date: "2026-10-09", start: "11:00", end: "13:00", status: "confirmed" },
  { _id: "b2", slot_id: "C-103", date: "2026-10-12", start: "14:00", end: "16:00", status: "confirmed" },
  { _id: "b3", slot_id: "B-104", date: "2026-10-01", start: "09:00", end: "11:00", status: "completed" },
  { _id: "b4", slot_id: "D-103", date: "2026-09-28", start: "16:00", end: "18:00", status: "cancelled" },
];

// DEVELOPMENT DATA ONLY: sample notifications (SRS 5.1.5: parking, booking, system alerts).
export const mockNotifications = [
  { _id: "n1", type: "parking", message: "Zone B is almost full: 1 slot left.", time: "10 min ago", read: false },
  { _id: "n2", type: "booking", message: "Your booking for slot A-105 starts tomorrow at 11:00.", time: "2 hours ago", read: false },
  { _id: "n3", type: "parking", message: "Slot C-101 is now available.", time: "Yesterday", read: true },
  { _id: "n4", type: "system", message: "Scheduled maintenance on Sunday, 02:00 to 03:00.", time: "2 days ago", read: true },
];

// DEVELOPMENT DATA ONLY: placeholder prediction values. No AI model or API is connected.
export const mockPrediction = {
  currentOccupancy: 60,
  predictedOccupancy: 85,
  estimatedAvailableSlots: 3,
  peakPeriod: "6 PM to 8 PM",
  demandLevel: "High",
  recommendation: "High demand expected in the evening. Arrive before 5 PM or book a slot in advance.",
  generatedAt: "Sample data, not generated",
};

// Predicted occupancy (%) by hour, 6 AM to 10 PM. Sample shape only.
export const mockForecast = [
  { hour: "6 AM", value: 10 }, { hour: "8 AM", value: 35 }, { hour: "10 AM", value: 55 },
  { hour: "12 PM", value: 62 }, { hour: "2 PM", value: 58 }, { hour: "4 PM", value: 72 },
  { hour: "6 PM", value: 85 }, { hour: "8 PM", value: 70 }, { hour: "10 PM", value: 30 },
];

// DEVELOPMENT DATA ONLY: sample bookings across users for the admin table.
export const mockAdminBookings = [
  { _id: "BK-1001", user: "Ali Khan", slot_id: "A-105", date: "2026-10-09", start: "11:00", end: "13:00", status: "confirmed" },
  { _id: "BK-1002", user: "Sara Ahmed", slot_id: "C-103", date: "2026-10-12", start: "14:00", end: "16:00", status: "confirmed" },
  { _id: "BK-1003", user: "Ali Khan", slot_id: "B-104", date: "2026-10-01", start: "09:00", end: "11:00", status: "completed" },
  { _id: "BK-1004", user: "Usman Raza", slot_id: "D-103", date: "2026-09-28", start: "16:00", end: "18:00", status: "cancelled" },
];
