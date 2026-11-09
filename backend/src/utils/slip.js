import PDFDocument from 'pdfkit';
import { slipStatusOf } from './bookingStatus.js';

const C = {
  navy: '#0F172A',
  navySoft: '#1E293B',
  orange: '#F59E0B',
  text: '#0F172A',
  label: '#64748B',
  rowAlt: '#F8FAFC',
  line: '#E2E8F0',
  muted: '#94A3B8',
};

const STATUS_STYLE = {
  confirmed: { bg: '#D1FAE5', fg: '#059669' },
  paid: { bg: '#DBEAFE', fg: '#2563EB' },
  pending: { bg: '#FEF3C7', fg: '#B45309' },
  cancelled: { bg: '#FEE2E2', fg: '#DC2626' },
  completed: { bg: '#E2E8F0', fg: '#475569' },
};

const formatDateTime = (value) =>
  new Date(value)
    .toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Karachi',
    })
    .replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());

const formatDuration = (start, end) => {
  const hours = Math.round(((new Date(end) - new Date(start)) / 36e5) * 10) / 10;
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
};

const formatMoney = (n = 0) =>
  `PKR ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Collects everything the slip needs. Phone and email come from the
 * driver's registered account. Old and new field names are both included
 * so the e-mail template keeps working.
 *
 * `booking` should come from withPaymentStatus() so it carries `paymentStatus`.
 * The slip status follows the PAYMENT:
 *   no payment / pending -> PENDING   (amount due)
 *   paid / confirmed     -> CONFIRMED (amount paid)
 *   paid + time over     -> COMPLETED
 *   cancelled            -> CANCELLED
 */
export function buildSlipData({ booking, user, slot }) {
  const floor = slot?.floor;
  const floorText = floor ? (/floor/i.test(String(floor)) ? String(floor) : `Floor ${floor}`) : '';
  const label = slipStatusOf(booking);

  return {
    bookingId: String(booking._id),
    challanNumber: booking.challanNumber,
    status: label.key, // pending | confirmed | completed | cancelled
    statusBadge: label.badge, // text printed in the badge
    amountLabel: label.amountLabel, // AMOUNT DUE | AMOUNT PAID | AMOUNT
    statusNote: label.note, // one-line message under the amount box
    paymentStatus: booking.paymentStatus ?? 'pending',
    name: booking.driverName || user?.name || '-',
    driverName: booking.driverName || user?.name || '-',
    vehicle: booking.vehiclePlate,
    vehiclePlate: booking.vehiclePlate,
    slotId: booking.slotId,
    floor: floorText,
    zone: slot?.zone || '-',
    startTime: booking.startTime,
    endTime: booking.endTime,
    duration: formatDuration(booking.startTime, booking.endTime),
    phone: user?.phone || '-',
    email: user?.email || '-',
    amount: booking.amount,
    bookedAt: booking.createdAt,
  };
}

/** Draws the PARQCO slip and resolves with the PDF as a Buffer. */
export function buildSlipPdf(slip) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width;
    const H = doc.page.height;
    const PAD = 35;

    const rows = [
      ['Name', slip.name],
      ['Vehicle', slip.vehicle],
      ['Slot', `${slip.slotId}${slip.floor ? ` (${slip.floor})` : ''}`],
      ['Zone', slip.zone],
      ['Start', formatDateTime(slip.startTime)],
      ['End', formatDateTime(slip.endTime)],
      ['Duration', slip.duration],
      ['Phone', slip.phone],
      ['Email', slip.email],
    ];

    // ---------- Header ----------
    doc.rect(0, 0, W, 113).fill(C.navy);
    doc.font('Helvetica-Bold').fontSize(32).fillColor(C.orange).text('PARQCO', PAD, 22, { lineBreak: false });
    doc.font('Helvetica').fontSize(12).fillColor(C.muted).text('Smart Parking System', PAD, 62, { lineBreak: false });
    doc.roundedRect(PAD, 80, 138, 22, 4).fill(C.navySoft);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(C.orange)
      .text('PARKING SLIP', PAD, 87, { width: 138, align: 'center', lineBreak: false });

    // ---------- Challan number + status badge ----------
    doc.font('Helvetica').fontSize(11).fillColor(C.label).text('CHALLAN NO.', PAD, 133, { lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(25).fillColor(C.text).text(slip.challanNumber, PAD, 148, { lineBreak: false });

    const st = STATUS_STYLE[slip.status] || STATUS_STYLE.pending;
    const badgeW = 112;
    const badgeX = W - PAD - badgeW;
    doc.roundedRect(badgeX, 146, badgeW, 28, 14).fill(st.bg);
    doc.circle(badgeX + 16, 160, 3.5).fill(st.fg);
    doc.font('Helvetica-Bold').fontSize(12).fillColor(st.fg)
      .text(String(slip.statusBadge || slip.status || 'pending').toUpperCase(), badgeX + 26, 154, { lineBreak: false });

    doc.moveTo(PAD, 190).lineTo(W - PAD, 190).lineWidth(1).strokeColor(C.line).stroke();

    // ---------- Detail rows ----------
    const ROW_H = 36;
    let y = 196;
    rows.forEach(([key, value], i) => {
      if (i % 2 === 0) doc.rect(28, y, W - 56, ROW_H).fill(C.rowAlt);
      doc.font('Helvetica').fontSize(11.5).fillColor(C.label).text(`${key} :`, 44, y + 12, { lineBreak: false });
      doc.font('Helvetica-Bold').fontSize(13).fillColor(C.text)
        .text(String(value ?? '-'), 165, y + 11, { width: W - 165 - PAD, lineBreak: false });
      y += ROW_H;
    });

    // ---------- Amount box ----------
    y += 14;
    doc.roundedRect(28, y, W - 56, 68, 12).fill(C.navy);
    doc.font('Helvetica').fontSize(10.5).fillColor(C.muted)
      .text(slip.amountLabel || 'AMOUNT DUE', 47, y + 12, { lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(27).fillColor(C.orange)
      .text(formatMoney(slip.amount), 47, y + 28, { lineBreak: false });
    doc.font('Helvetica').fontSize(10.5).fillColor(C.label)
      .text(`Booked ${formatDateTime(slip.bookedAt)}`, 0, y + 42, { width: W - 47, align: 'right', lineBreak: false });

    // ---------- Status message (follows the payment) ----------
    y += 68 + 12;
    if (slip.statusNote) {
      doc.roundedRect(28, y, W - 56, 30, 8).fill(st.bg);
      doc.font('Helvetica-Bold').fontSize(11).fillColor(st.fg)
        .text(slip.statusNote, 28, y + 9, { width: W - 56, align: 'center', lineBreak: false });
      y += 30;
    }

    // ---------- Notes ----------
    y += 20;
    doc.font('Helvetica-Bold').fontSize(12).fillColor(C.text)
      .text('Show this slip (or the challan number) at the parking entrance.', 0, y, { width: W, align: 'center', lineBreak: false });
    doc.font('Helvetica').fontSize(10.5).fillColor(C.label)
      .text(`Booking ID : ${slip.bookingId}`, 0, y + 20, { width: W, align: 'center', lineBreak: false });

    // ---------- Footer ----------
    doc.rect(0, H - 48, W, 3).fill(C.orange);
    doc.rect(0, H - 45, W, 45).fill(C.navy);
    doc.font('Helvetica').fontSize(9.5).fillColor(C.muted)
      .text('PARQCO  •  Smart Parking System  •  Valid for booked slot only', 0, H - 28, {
        width: W,
        align: 'center',
        lineBreak: false,
      });

    doc.end();
  });
}