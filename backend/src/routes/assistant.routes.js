import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { ask, askStream } from '../services/assistant.service.js';

const router = Router();

// Simple per-user limit: 20 messages per minute (each message is a paid Gemini call).
const WINDOW_MS = 60_000;
const MAX_MESSAGES = 20;
const hits = new Map(); // userId -> timestamps

function chatLimit(req, res, next) {
  const key = String(req.user?._id ?? req.ip);
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_MESSAGES) {
    return res.status(429).json({ success: false, message: 'You are sending messages too fast. Please wait a moment.' });
  }
  recent.push(now);
  hits.set(key, recent);
  next();
}

const readQuestion = (req) => String(req.body?.question ?? req.body?.message ?? '').trim();

// POST /api/assistant/chat (also /ask): the whole answer in one JSON reply
const handleAsk = async (req, res) => {
  const question = readQuestion(req);
  if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

  try {
    const { answer, context, source, model, suggestions } = await ask({
      user: req.user,
      question,
      history: req.body?.history,
      from: req.body?.from,
      to: req.body?.to,
    });

    res.json({
      success: true,
      answer,
      source, // 'gemini' or 'offline'
      model,
      suggestions,
      stats: { total: context.totalUsableSlots, empty: context.emptySlots, booked: context.bookedSlots },
    });
  } catch (err) {
    console.error('[assistant]', err);
    res.status(500).json({ success: false, message: 'Assistant is unavailable right now' });
  }
};

// POST /api/assistant/chat/stream: the answer arrives piece by piece, one JSON object per line.
const handleStream = async (req, res) => {
  const question = readQuestion(req);
  if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

  res.status(200).set({
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  const send = (payload) => {
    res.write(`${JSON.stringify(payload)}\n`);
    res.flush?.();
  };

  try {
    const { context, source, model, suggestions } = await askStream({
      user: req.user,
      question,
      history: req.body?.history,
      from: req.body?.from,
      to: req.body?.to,
      onDelta: (text) => send({ type: 'delta', text }),
    });

    send({
      type: 'done',
      source,
      model,
      suggestions,
      stats: { total: context.totalUsableSlots, empty: context.emptySlots, booked: context.bookedSlots },
    });
  } catch (err) {
    console.error('[assistant]', err);
    send({ type: 'error', message: 'Assistant is unavailable right now' });
  }
  res.end();
};

router.post('/chat/stream', protect, chatLimit, handleStream);
router.post('/chat', protect, chatLimit, handleAsk);
router.post('/ask', protect, chatLimit, handleAsk);

export default router;