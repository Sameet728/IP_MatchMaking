import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';

const router = Router();

// GET /api/analytics/platform — Platform-wide stats (admin/broker)
router.get('/platform', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers, totalPatents, totalDeals, listedPatents,
      activeDeals, totalRoyalties,
    ] = await Promise.all([
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.patent.count(),
      prisma.deal.count(),
      prisma.patent.count({ where: { isListed: true } }),
      prisma.deal.count({ where: { status: { in: ['ACTIVE', 'NEGOTIATING', 'DUE_DILIGENCE'] } } }),
      prisma.royalty.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    ]);

    // Domain breakdown
    const domainStats = await prisma.patent.groupBy({
      by: ['domain'],
      _count: { domain: true },
      orderBy: { _count: { domain: 'desc' } },
    });

    // Deal status pipeline
    const dealPipeline = await prisma.deal.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // User role distribution
    const userRoles = await prisma.user.groupBy({
      by: ['role'],
      where: { status: 'ACTIVE' },
      _count: { role: true },
    });

    // Monthly registration trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentUsers = await prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, role: true },
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers, totalPatents, totalDeals, listedPatents, activeDeals,
          totalRoyaltiesCollected: totalRoyalties._sum.amount || 0,
        },
        domainBreakdown: domainStats.map(d => ({ domain: d.domain, count: d._count.domain })),
        dealPipeline: dealPipeline.map(d => ({ status: d.status, count: d._count.status })),
        userRoles: userRoles.map(u => ({ role: u.role, count: u._count.role })),
        recentGrowth: recentUsers,
      },
    });
  } catch (err) { next(err); }
});

// GET /api/analytics/my — Personal analytics for current user
router.get('/my', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const [patents, myDeals, royalties] = await Promise.all([
      prisma.patent.findMany({
        where: { inventorId: userId },
        select: { id: true, title: true, status: true, domain: true, viewCount: true, inquiryCount: true, saveCount: true, createdAt: true },
      }),
      prisma.deal.findMany({
        where: { participants: { some: { userId } } },
        select: { id: true, title: true, status: true, upfrontFee: true, royaltyRate: true, createdAt: true },
      }),
      prisma.royalty.findMany({
        where: { deal: { participants: { some: { userId } } } },
        select: { amount: true, status: true, period: true, dueDate: true },
      }),
    ]);

    const totalViews = patents.reduce((s, p) => s + p.viewCount, 0);
    const totalInquiries = patents.reduce((s, p) => s + p.inquiryCount, 0);
    const totalEarned = royalties.filter(r => r.status === 'PAID').reduce((s, r) => s + r.amount, 0);
    const pendingEarnings = royalties.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0);

    res.json({
      success: true,
      data: {
        overview: {
          patents: patents.length, deals: myDeals.length,
          totalViews, totalInquiries, totalEarned, pendingEarnings,
        },
        patents,
        deals: myDeals,
        royalties,
      },
    });
  } catch (err) { next(err); }
});

export default router;
