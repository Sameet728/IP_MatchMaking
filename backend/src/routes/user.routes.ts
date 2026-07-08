import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';

const router = Router();

// GET /api/users/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, name: true, role: true, status: true,
        phone: true, avatar: true, bio: true, designation: true,
        linkedinUrl: true, googleScholar: true, organizationId: true,
        emailVerified: true, lastLoginAt: true, loginCount: true, createdAt: true,
        organization: true,
      },
    });
    if (!user) throw new AppError('User not found.', 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// PATCH /api/users/me
router.patch('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const allowedFields = ['name', 'phone', 'bio', 'designation', 'linkedinUrl', 'googleScholar'];
    const updateData: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, phone: true, bio: true, designation: true },
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// GET /api/users/me/stats
router.get('/me/stats', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const [patents, deals, royalties, savedCount] = await Promise.all([
      prisma.patent.count({ where: { inventorId: userId } }),
      prisma.dealParticipant.count({ where: { userId } }),
      prisma.royalty.findMany({
        where: { deal: { participants: { some: { userId } } } },
        select: { amount: true, status: true },
      }),
      prisma.savedPatent.count({ where: { userId } }),
    ]);

    const totalRoyalties = royalties.filter(r => r.status === 'PAID').reduce((s, r) => s + r.amount, 0);
    const pendingRoyalties = royalties.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0);

    res.json({
      success: true,
      data: { patents, deals, totalRoyalties, pendingRoyalties, savedPatents: savedCount },
    });
  } catch (err) { next(err); }
});

export default router;
