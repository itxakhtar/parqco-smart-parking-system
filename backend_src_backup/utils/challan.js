import Counter from '../models/Counter.js';
import { ymd } from './format.js';

/**
 * Challan number such as CH-20261025-0001.
 * The sequence restarts every day and is incremented atomically in MongoDB,
 * so two drivers booking at the same moment can never receive the same number.
 */
export async function nextChallanNumber(date = new Date()) {
  const day = ymd(date);
  const counter = await Counter.findOneAndUpdate(
    { _id: `challan-${day}` },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return `CH-${day}-${String(counter.seq).padStart(4, '0')}`;
}
