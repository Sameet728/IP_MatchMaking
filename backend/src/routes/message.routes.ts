import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';
import { MessageType } from '@prisma/client';

const router = Router();

// GET /api/messages/:dealId — Get messages for a deal
router.get('/:dealId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { dealId } = req.params as { dealId: string };
    const { cursor, limit = '30' } = req.query as Record<string, string>;

    // Verify user is a participant in this deal
    const participant = await prisma.dealParticipant.findFirst({
      where: { dealId, userId: req.user!.id },
    });
    if (!participant) throw new AppError('Access denied to this conversation.', 403);

    const messages = await prisma.message.findMany({
      where: { dealId, ...(cursor && { createdAt: { lt: new Date(cursor) } }) },
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
    });

    // Mark messages as read
    const unreadIds = messages.filter(m => !m.readBy.includes(req.user!.id)).map(m => m.id);
    if (unreadIds.length > 0) {
      await prisma.message.updateMany({
        where: { id: { in: unreadIds } },
        data: { readBy: { push: req.user!.id } },
      });
    }

    res.json({ success: true, data: messages.reverse(), hasMore: messages.length === parseInt(limit) });
  } catch (err) { next(err); }
});

// POST /api/messages/:dealId — Send a message
router.post('/:dealId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { dealId } = req.params as { dealId: string };
    const { type = 'TEXT', content, proposal, fileName, fileUrl, fileSize, fileType } = req.body;

    if (!content && !fileUrl && !proposal) throw new AppError('Message content is required.', 400);

    const participant = await prisma.dealParticipant.findFirst({ where: { dealId, userId: req.user!.id } });
    if (!participant) throw new AppError('Access denied to this conversation.', 403);

    const message = await prisma.message.create({
      data: {
        dealId,
        senderId: req.user!.id,
        type: type as MessageType,
        content: content || null,
        proposal: proposal || null,
        fileName: fileName || null,
        fileUrl: fileUrl || null,
        fileSize: fileSize ? parseInt(fileSize) : null,
        fileType: fileType || null,
        readBy: [req.user!.id],
      },
      include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
    });

    res.status(201).json({ success: true, data: message });
  } catch (err) { next(err); }
});

export default router;
