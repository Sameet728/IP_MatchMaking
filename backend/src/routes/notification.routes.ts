import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';

const router = Router();

// GET /api/notifications
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { unread } = req.query;
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user!.id,
        ...(unread === 'true' && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({ where: { userId: req.user!.id, read: false } });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) { next(err); }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true, readAt: new Date() },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { id: (req.params as Record<string, string>).id, userId: req.user!.id },
      data: { read: true, readAt: new Date() },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
