import { pathToFileURL } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Slot from '../models/Slot.js';
import Booking from '../models/Booking.js';
import SensorData from '../models/SensorData.js';
import Prediction from '../models/Prediction.js';
import Counter from '../models/Counter.js';
import { nextChallanNumber } from './challan.js';

/**
 * Demo data so the app looks alive on first run:
 *  - an admin and a demo driver
 *  - 30 parking slots over 3 floors, each linked to a sensor
 *  - 28 days of hourly sensor history (this is what the ML forecast learns from)
 *  - a couple of bookings for the demo driver
 */

// Typical share of slots occupied at each hour on a weekday (index = hour of day)
const WEEKDAY_CURVE = [0.05, 0.04, 0.04, 0.04, 0.05, 0.07, 0.14, 0.32, 0.56, 0.76, 0.8, 0.72, 0.65, 0.6, 0.62, 0.6, 0.68, 0.85, 0.92, 0.9, 0.7, 0.45, 0.2, 0.1];
const WEEKEND_FACTOR = 0.72;

const randomBetween = (min, max) => min + Math.random() * (max - min);
const chance = (probability) => Math.random() < probability;

function buildSlots() {
  const floors = [
    { floor: 1, zone: 'Zone A', letter: 'A', base: 101 },
    { floor: 2, zone: 'Zone B', letter: 'B', base: 201 },
    { floor: 3, zone: 'Zone C', letter: 'C', base: 301 },
  ];
  return floors.flatMap(({ floor, zone, letter, base }) =>
    Array.from({ length: 10 }, (_, index) => {
      const number = base + index;
      return {
        slotId: `${letter}-${number}`,
        zone,
        floor,
        sensorId: `SENSOR_${letter}${number}`,
        hourlyRate: floor === 1 ? 150 : 100, // ground floor is closest to the exit
        status: 'available',
      };
    })
  );
}

function buildHistory(slots) {
  const readings = [];
  const now = new Date();
  now.setMinutes(0, 0, 0);

  for (let hoursAgo = 28 * 24; hoursAgo >= 1; hoursAgo -= 1) {
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const isWeekend = [0, 6].includes(timestamp.getDay());
    const recentBoost = hoursAgo <= 7 * 24 ? 1.08 : 1; // demand grew a little this week
    const probability = Math.min(
      0.98,
      WEEKDAY_CURVE[timestamp.getHours()] * (isWeekend ? WEEKEND_FACTOR : 1) * recentBoost * randomBetween(0.92, 1.08)
    );
    for (const slot of slots) {
      readings.push({
        sensorId: slot.sensorId,
        slotId: slot.slotId,
        occupied: chance(probability) ? 1 : 0,
        battery: Math.round(randomBetween(60, 100)),
        timestamp,
      });
    }
  }
  return readings;
}

export async function seedDatabase({ quiet = false } = {}) {
  await Promise.all([
    User.deleteMany(),
    Slot.deleteMany(),
    Booking.deleteMany(),
    SensorData.deleteMany(),
    Prediction.deleteMany(),
    Counter.deleteMany(), // challan numbers start again from 0001
  ]);

  // Users (password is hashed by the User model)
  const admin = await User.create({ name: 'PARQCO Admin', email: 'admin@parqco.com', password: 'Admin@123', phone: '03001234567', role: 'admin' });
  const driver = await User.create({ name: 'Ali Khan', email: 'demo@parqco.com', password: 'Demo@123', phone: '03123456789', role: 'user' });

  // Slots with a "current" status based on the current hour
  const slotDefinitions = buildSlots();
  const currentProbability = WEEKDAY_CURVE[new Date().getHours()];
  const slots = await Slot.insertMany(
    slotDefinitions.map((slot) => ({ ...slot, status: chance(currentProbability) ? 'occupied' : 'available' }))
  );

  // History + one fresh reading per sensor (so every sensor shows as "online")
  const history = buildHistory(slotDefinitions);
  const freshReadings = slots.map((slot) => ({
    sensorId: slot.sensorId,
    slotId: slot.slotId,
    occupied: slot.status === 'occupied' ? 1 : 0,
    battery: Math.round(randomBetween(60, 100)),
    timestamp: new Date(),
  }));
  await SensorData.insertMany([...history, ...freshReadings], { ordered: false });

  // A few bookings for the demo driver
  const free = slots.filter((slot) => slot.status === 'available');
  const hour = 60 * 60 * 1000;
  const startA = new Date(Date.now() + 2 * hour);
  const startB = new Date(Date.now() + 26 * hour);
  if (free.length >= 2) {
    const demoBookings = [
      { slot: free[0], start: startA, hours: 2 },
      { slot: free[1], start: startB, hours: 3 },
    ];
    for (const { slot, start, hours } of demoBookings) {
      await Booking.create({
        user: driver._id,
        slot: slot._id,
        slotId: slot.slotId,
        challanNumber: await nextChallanNumber(),
        driverName: driver.name,
        vehiclePlate: 'LEA-1234',
        startTime: start,
        endTime: new Date(start.getTime() + hours * hour),
        amount: hours * slot.hourlyRate,
      });
    }
  }

  if (!quiet) {
    console.log(`🌱 Seeded ${slots.length} slots and ${history.length + freshReadings.length} sensor readings`);
    console.log(`   Admin: ${admin.email} / Admin@123`);
    console.log(`   Driver: ${driver.email} / Demo@123`);
  }
}

// Allow:  npm run seed
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await connectDB();
  await seedDatabase();
  await mongoose.disconnect();
}
