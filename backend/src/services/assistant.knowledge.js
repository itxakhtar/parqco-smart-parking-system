/**
 * Static knowledge for the assistant (the "documents" part of RAG).
 * Each entry has keywords (lower-case) used to find it, and a short text the assistant can rely on.
 * Add your own entries here (opening hours, contact details, refund policy...) and the bot will use them.
 */
export const KNOWLEDGE = [
  {
    id: 'about',
    title: 'What PARQCO and the assistant do',
    keywords: ['parqco', 'smart parking', 'what can you do', 'what do you do', 'who are you', 'help'],
    text:
      'PARQCO is a smart parking system. Drivers can see free slots live, book a slot, pay, and download a parking slip. The assistant answers questions about free slots, prices, the best or cheapest slot, your booking, your payment and when to leave. It can only read information: it cannot book, pay or cancel for you.',
  },
  {
    id: 'how-to-book',
    title: 'How to book a slot',
    keywords: ['how to book', 'how do i book', 'how can i book', 'book a slot', 'make a booking', 'booking process', 'reserve'],
    text:
      'To book: tap Book a slot, choose a free slot, enter your arrival and leaving time and your vehicle registration number (for example LEA-1234), then confirm. You receive a challan number and a PDF parking slip by email. The booking stays pending until the payment is made.',
  },
  {
    id: 'booking-rules',
    title: 'Booking rules and limits',
    keywords: ['minimum', 'maximum', 'limit', 'rules', 'rule', 'at most', 'overlap', 'double book', 'two bookings', 'same time', 'how long can', 'start time'],
    text:
      'The minimum booking is 15 minutes and the maximum is 24 hours at a time. The start time cannot be in the past. One slot cannot be booked twice for the same time, and one vehicle cannot have two bookings at the same time.',
  },
  {
    id: 'pricing-rule',
    title: 'How the price is calculated',
    keywords: ['price', 'rate', 'cost', 'charge', 'fee', 'calculated', 'per hour', 'hourly', 'rounded'],
    text:
      'Each slot has an hourly rate set by its zone and floor. The total is the number of hours, rounded up to the next full hour, multiplied by the hourly rate. For example, 1 hour 10 minutes is charged as 2 hours.',
  },
  {
    id: 'payment-flow',
    title: 'How payment and booking status work',
    keywords: ['how to pay', 'how do i pay', 'pay now', 'payment', 'paid', 'pending', 'unpaid', 'confirm', 'confirmed', 'receipt'],
    text:
      'A new booking is PENDING until its payment is made. After the payment is received it is marked paid, and the admin confirms it. The parking slip shows PENDING while unpaid and CONFIRMED once the payment is received. Complete the payment to secure your booking.',
  },
  {
    id: 'cancel',
    title: 'Cancelling a booking',
    keywords: ['cancel', 'cancellation', 'refund', 'change booking', 'modify'],
    text:
      'You can cancel your own upcoming booking from My bookings. Cancelling frees the slot for other drivers. I do not have information about refunds, so please ask the parking admin about that.',
  },
  {
    id: 'overstay',
    title: 'Staying longer than booked',
    keywords: ['overstay', 'late exit', 'exceed', 'time is over', 'stay longer', 'extend', 'more time'],
    text:
      'I do not have information about extensions or charges for staying longer than booked. If the slot is free, you can book it again for the extra time, and you can ask the parking admin about late-exit rules.',
  },
  {
    id: 'slip-challan',
    title: 'Challan number and parking slip',
    keywords: ['slip', 'challan', 'pdf', 'download', 'print', 'entrance', 'gate', 'entry', 'qr'],
    text:
      'After you book, you get a challan number such as CH-20261027-0002 and a PDF parking slip with your name, vehicle, slot, zone, floor, time, duration and amount. Show the slip or the challan number at the parking entrance. The slip is also emailed to you.',
  },
  {
    id: 'sensors',
    title: 'How live availability works',
    keywords: ['sensor', 'esp32', 'iot', 'occupied', 'detect', 'real time', 'realtime', 'live', 'accurate', 'how do you know'],
    text:
      'Slots have sensors that detect whether a car is parked. A car detected in an unbooked slot counts as occupied, so that slot is not offered as free. Free-slot counts are checked against live bookings and sensor status every time you ask.',
  },
  {
    id: 'account',
    title: 'Account, email code and password reset',
    keywords: ['otp', 'verify', 'verification', 'code', 'register', 'sign up', 'password', 'forgot', 'reset', 'login', 'log in', 'account'],
    text:
      'Registration and password reset are confirmed with a one-time code sent by email. If the email does not arrive, check your spam folder and use the resend code option. Your phone number and email on the slip come from your account.',
  },
  {
    id: 'forecast',
    title: 'Busy hours and forecast',
    keywords: ['forecast', 'predict', 'prediction', 'busy', 'peak', 'rush', 'crowd', 'best time', 'quiet'],
    text:
      'PARQCO uses an AI forecast of how busy the parking lot will be. I do not have the forecast numbers in this chat, so please check the forecast shown in the app. I can tell you what is free right now.',
  },
];

const STOP = new Set([
  'the', 'and', 'for', 'you', 'are', 'can', 'how', 'what', 'when', 'where', 'who', 'why', 'does', 'this',
  'that', 'with', 'from', 'have', 'will', 'your', 'mine', 'not', 'but', 'any', 'get', 'got', 'its',
]);

const words = (text) => String(text).toLowerCase().match(/[a-z0-9']+/g) ?? [];

/** Finds the knowledge entries that best match the question (simple keyword scoring). */
export function retrieveKnowledge(question, limit = 3) {
  const q = String(question).toLowerCase();
  const qWords = new Set(words(q).filter((w) => w.length > 2 && !STOP.has(w)));

  return KNOWLEDGE.map((doc) => {
    let score = 0;
    for (const keyword of doc.keywords) if (q.includes(keyword)) score += 3;
    for (const word of words(doc.title)) if (qWords.has(word)) score += 1;
    return { doc, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ doc, score }) => ({ id: doc.id, title: doc.title, text: doc.text, score }));
}