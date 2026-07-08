import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';
import { UserStatus } from '@prisma/client';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, requireAdmin);

// GET /api/admin/users
router.get('/users', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', search, role, status } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(role && { role: role as never }),
      ...(status && { status: status as UserStatus }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, name: true, role: true, status: true,
          emailVerified: true, lastLoginAt: true, loginCount: true, createdAt: true,
          organization: { select: { id: true, name: true } },
          _count: { select: { patents: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: users, pagination: { page: parseInt(page), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
});

// PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const user = await prisma.user.update({
      where: { id: (req.params as Record<string, string>).id },
      data: { status: status as UserStatus },
      select: { id: true, email: true, name: true, status: true },
    });
    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'ADMIN_UPDATE_USER_STATUS', entity: 'User', entityId: (req.params as Record<string, string>).id, newValue: { status } },
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// GET /api/admin/stats
router.get('/stats', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [users, patents, deals, royalties, auditLogs] = await Promise.all([
      prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
      prisma.patent.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.deal.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.royalty.aggregate({ _sum: { amount: true }, _count: true }),
      prisma.auditLog.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) } } }),
    ]);

    res.json({
      success: true,
      data: {
        users: users.map(u => ({ role: u.role, count: u._count.role })),
        patents: patents.map(p => ({ status: p.status, count: p._count.status })),
        deals: deals.map(d => ({ status: d.status, count: d._count.status })),
        royalties: { total: royalties._sum.amount || 0, count: royalties._count },
        activityLast24h: auditLogs,
      },
    });
  } catch (err) { next(err); }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '50' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      }),
      prisma.auditLog.count(),
    ]);

    res.json({ success: true, data: logs, pagination: { page: parseInt(page), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
});

export default router;
