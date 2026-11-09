import { Router } from 'express';
import { ask } from '../services/assistant.service.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/assistant/ask  { question, from?, to? }
router.post('/ask', requireAuth, async (req, res) => {
  const question = String(req.body?.question || '').trim();
  if (!question) return res.status(400).json({ message: 'Question is required' });

  try {
    const { answer, context } = await ask({
      user: req.user,
      question,
      from: req.body.from,
      to: req.body.to,
    });
    res.json({ answer, stats: { total: context.totalSlots, empty: context.emptySlots, booked: context.bookedSlots } });
  } catch (err) {
    console.error('[assistant]', err);
    res.status(500).json({ message: 'Assistant is unavailable right now' });
  }
});

export default router;
