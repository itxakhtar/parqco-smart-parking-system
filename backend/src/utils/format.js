import { env } from '../config/env.js';

/** "25 Oct 2026, 02:30 PM" in the parking lot's timezone. */
export function formatDateTime(value) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: env.timezone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
    .format(new Date(value))
    .replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
}

/** "20261025" in the parking lot's timezone (used inside challan numbers). */
export function ymd(value = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: env.timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(new Date(value))
      .map((part) => [part.type, part.value])
  );
  return `${parts.year}${parts.month}${parts.day}`;
}

/** 5400000 ms -> "1h 30m" */
export function formatDuration(ms) {
  const minutes = Math.round(ms / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h ? `${h}h` : '', m || !h ? `${m}m` : ''].filter(Boolean).join(' ');
}
