import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';

const router = Router();

// GET /api/royalties
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const royalties = await prisma.royalty.findMany({
      where: { deal: { participants: { some: { userId: req.user!.id } } } },
      include: {
        deal: { select: { id: true, title: true, company: { select: { name: true } } } },
        patent: { select: { id: true, title: true } },
      },
      orderBy: { dueDate: 'desc' },
    });

    const totalReceived = royalties.filter(r => r.status === 'PAID').reduce((s, r) => s + r.amount, 0);
    const totalPending = royalties.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0);
    const totalOverdue = royalties.filter(r => r.status === 'OVERDUE').reduce((s, r) => s + r.amount, 0);

    res.json({ success: true, data: royalties, summary: { totalReceived, totalPending, totalOverdue } });
  } catch (err) { next(err); }
});

// POST /api/royalties — Create royalty record (admin/inventor)
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { dealId, patentId, amount, period, dueDate } = req.body;
    const royalty = await prisma.royalty.create({
      data: { dealId, patentId, amount: parseFloat(amount), period, dueDate: new Date(dueDate) },
    });
    res.status(201).json({ success: true, data: royalty });
  } catch (err) { next(err); }
});

// PATCH /api/royalties/:id/mark-paid
router.patch('/:id/mark-paid', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentRef } = req.body;
    const royalty = await prisma.royalty.update({
      where: { id: (req.params as Record<string, string>).id },
      data: { status: 'PAID', paidAt: new Date(), paymentRef },
    });
    res.json({ success: true, data: royalty });
  } catch (err) { next(err); }
});

export default router;
