import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { db } from '../lib/db';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';

const router = Router();

router.get('/platform', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsersRes, totalPatentsRes, totalDealsRes, listedPatentsRes,
      activeDealsRes, totalRoyaltiesRes, domainStatsRes, dealPipelineRes, userRolesRes
    ] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM "User" WHERE status = 'ACTIVE'`),
      db.query(`SELECT COUNT(*) FROM "Patent"`),
      db.query(`SELECT COUNT(*) FROM "Deal"`),
      db.query(`SELECT COUNT(*) FROM "Patent" WHERE "isListed" = true`),
      db.query(`SELECT COUNT(*) FROM "Deal" WHERE status IN ('ACTIVE', 'NEGOTIATING', 'DUE_DILIGENCE')`),
      db.query(`SELECT SUM(amount) FROM "Royalty" WHERE status = 'PAID'`),
      db.query(`SELECT domain, COUNT(*) FROM "Patent" GROUP BY domain ORDER BY COUNT(*) DESC`),
      db.query(`SELECT status, COUNT(*) FROM "Deal" GROUP BY status`),
      db.query(`SELECT role, COUNT(*) FROM "User" WHERE status = 'ACTIVE' GROUP BY role`)
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const { rows: recentUsers } = await db.query(`SELECT "createdAt", role FROM "User" WHERE "createdAt" >= $1`, [sixMonthsAgo]);

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers: parseInt(totalUsersRes.rows[0].count),
          totalPatents: parseInt(totalPatentsRes.rows[0].count),
          totalDeals: parseInt(totalDealsRes.rows[0].count),
          listedPatents: parseInt(listedPatentsRes.rows[0].count),
          activeDeals: parseInt(activeDealsRes.rows[0].count),
          totalRoyaltiesCollected: parseFloat(totalRoyaltiesRes.rows[0].sum || '0'),
        },
        domainBreakdown: domainStatsRes.rows.map(d => ({ domain: d.domain, count: parseInt(d.count) })),
        dealPipeline: dealPipelineRes.rows.map(d => ({ status: d.status, count: parseInt(d.count) })),
        userRoles: userRolesRes.rows.map(u => ({ role: u.role, count: parseInt(u.count) })),
        recentGrowth: recentUsers,
      },
    });
  } catch (err) { next(err); }
});

router.get('/my', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const [patentsRes, myDealsRes, royaltiesRes] = await Promise.all([
      db.query(`SELECT id, title, status, domain, "viewCount", "inquiryCount", "saveCount", "createdAt" FROM "Patent" WHERE "inventorId" = $1`, [userId]),
      db.query(`SELECT d.id, d.title, d.status, d."upfrontFee", d."royaltyRate", d."createdAt" FROM "Deal" d JOIN "DealParticipant" dp ON dp."dealId" = d.id WHERE dp."userId" = $1`, [userId]),
      db.query(`SELECT r.amount, r.status, r.period, r."dueDate" FROM "Royalty" r JOIN "DealParticipant" dp ON dp."dealId" = r."dealId" WHERE dp."userId" = $1`, [userId]),
    ]);

    const patents = patentsRes.rows;
    const myDeals = myDealsRes.rows;
    const royalties = royaltiesRes.rows;

    const totalViews = patents.reduce((s, p) => s + parseInt(p.viewCount || '0'), 0);
    const totalInquiries = patents.reduce((s, p) => s + parseInt(p.inquiryCount || '0'), 0);
    const totalEarned = royalties.filter(r => r.status === 'PAID').reduce((s, r) => s + parseFloat(r.amount || '0'), 0);
    const pendingEarnings = royalties.filter(r => r.status === 'PENDING').reduce((s, r) => s + parseFloat(r.amount || '0'), 0);

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
