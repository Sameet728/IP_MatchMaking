import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { db } from '../lib/db';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { unread } = req.query;
    let query = 'SELECT * FROM "Notification" WHERE "userId" = $1 ';
    const params: any[] = [req.user!.id];
    
    if (unread === 'true') {
      query += 'AND read = false ';
    }
    query += 'ORDER BY "createdAt" DESC LIMIT 50';
    
    const { rows: notifications } = await db.query(query, params);
    const { rows: countRows } = await db.query('SELECT COUNT(*) FROM "Notification" WHERE "userId" = $1 AND read = false', [req.user!.id]);
    
    res.json({ success: true, data: notifications, unreadCount: parseInt(countRows[0].count, 10) });
  } catch (err) { next(err); }
});

router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await db.query('UPDATE "Notification" SET read = true, "readAt" = NOW(), "updatedAt" = NOW() WHERE "userId" = $1 AND read = false', [req.user!.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as Record<string, string>).id;
    await db.query('UPDATE "Notification" SET read = true, "readAt" = NOW(), "updatedAt" = NOW() WHERE id = $1 AND "userId" = $2', [id, req.user!.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
