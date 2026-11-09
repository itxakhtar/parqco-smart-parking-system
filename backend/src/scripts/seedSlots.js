// Run from the backend folder: node src/scripts/seedSlots.js
// Safe to re-run: existing slots keep their status, only missing ones are added.
import 'dotenv/config';
import mongoose from 'mongoose';
import Slot from '../models/Slot.js';
import { buildSlotDefinitions } from '../config/zones.js';

async function main() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const defs = buildSlotDefinitions();

  const ops = defs.map((d) => ({
    updateOne: {
      filter: { slotId: d.slotId },
      update: { $setOnInsert: { ...d, status: 'available' } },
      upsert: true,
    },
  }));

  const res = await Slot.bulkWrite(ops);
  console.log(`Slots in config: ${defs.length}, newly added: ${res.upsertedCount}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
