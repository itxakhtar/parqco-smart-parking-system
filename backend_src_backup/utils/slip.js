import pdfLib from 'pdf-lib'; // CommonJS package: take the names from the default export
import { env } from '../config/env.js';
import { formatDateTime, formatDuration } from './format.js';

const { PDFDocument, StandardFonts, rgb } = pdfLib;

/** The standard PDF fonts only support Latin-1; swap anything else so PDF generation can never throw. */
const safe = (value) => String(value ?? '').replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');

/** Everything printed on the challan / parking slip, already formatted for display. */
export function buildSlipData({ booking, user, slot }) {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const status = String(booking.status || 'confirmed');

  return {
    challanNumber: booking.challanNumber || '-',
    bookingId: String(booking._id),
    status: status.charAt(0).toUpperCase() + status.slice(1),
    driverName: booking.driverName || user?.name || '-',
    vehicleNumber: booking.vehiclePlate || '-',
    email: user?.email || '-',
    phone: user?.phone || '-',
    slotId: booking.slotId,
    floor: slot?.floor ?? '-',
    zone: slot?.zone || '-',
    start: formatDateTime(start),
    end: formatDateTime(end),
    duration: formatDuration(end - start),
    amount: `${env.currency} ${Number(booking.amount || 0).toFixed(2)}`,
    bookedAt: formatDateTime(booking.createdAt || Date.now()),
  };
}

/** Renders the slip as a one-page PDF and returns it as a Buffer. */
export async function buildSlipPdf(slip) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([420, 600]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  const asphalt = rgb(0.086, 0.098, 0.122);
  const paint = rgb(0.949, 0.718, 0.02);
  const grey = rgb(0.4, 0.4, 0.45);
  const dark = rgb(0.07, 0.09, 0.15);

  // Cuts text that would run past the page instead of letting it overflow.
  const fit = (text, usedFont, size, maxWidth) => {
    let clean = safe(text);
    while (clean.length > 1 && usedFont.widthOfTextAtSize(clean, size) > maxWidth) clean = clean.slice(0, -1);
    return clean;
  };

  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: asphalt });
  page.drawText('PARQCO', { x: 24, y: height - 40, size: 24, font: bold, color: paint });
  page.drawText('Smart Parking System  -  PARKING SLIP', { x: 24, y: height - 62, size: 11, font, color: rgb(0.85, 0.87, 0.9) });

  page.drawText('CHALLAN NO.', { x: 24, y: height - 112, size: 9, font, color: grey });
  page.drawText(fit(slip.challanNumber, bold, 22, width - 48), { x: 24, y: height - 136, size: 22, font: bold, color: dark });

  const rows = [
    ['Driver name', slip.driverName],
    ['Vehicle Reg. No.', slip.vehicleNumber],
    ['Slot', `${slip.slotId}  (Floor ${slip.floor})`],
    ['Zone', slip.zone],
    ['Start', slip.start],
    ['End', slip.end],
    ['Duration', slip.duration],
    ['Amount', slip.amount],
    ['Status', slip.status],
    ['Phone', slip.phone],
    ['Booked at', slip.bookedAt],
  ];

  let y = height - 175;
  rows.forEach(([label, value], index) => {
    if (index % 2 === 0) page.drawRectangle({ x: 16, y: y - 8, width: width - 32, height: 30, color: rgb(0.96, 0.97, 0.99) });
    page.drawText(safe(label), { x: 26, y, size: 10, font, color: grey });
    page.drawText(fit(value, bold, 12, 230), { x: 150, y, size: 12, font: bold, color: dark });
    y -= 30;
  });

  page.drawLine({ start: { x: 24, y: 60 }, end: { x: width - 24, y: 60 }, thickness: 0.7, color: rgb(0.8, 0.8, 0.85), dashArray: [4, 3] });
  page.drawText('Show this slip (or the challan number) at the parking entrance.', { x: 24, y: 42, size: 9, font, color: grey });
  page.drawText(fit(`Booking ID: ${slip.bookingId}`, font, 8, width - 48), { x: 24, y: 28, size: 8, font, color: grey });

  return Buffer.from(await pdf.save());
}
