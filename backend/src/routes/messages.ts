import { Router, Response } from 'express';
import { pool } from '../config/db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes in this file require a valid JWT
router.use(authMiddleware);

// ─── GET /api/messages ──────────────────────────────────────────────────────
// Returns the last 50 messages in reverse-chronological order (newest last),
// joined with the username of the sender.
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT
         m.id,
         m.content,
         m.created_at,
         u.id       AS user_id,
         u.username
       FROM messages m
       JOIN users u ON m.user_id = u.id
       ORDER BY m.created_at DESC
       LIMIT 50`
    );

    // SQL returns newest-first; reverse so the chat window shows oldest at top
    const messages = result.rows.reverse();

    return res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    return res.status(500).json({ error: 'Could not load messages' });
  }
});

export default router;
