import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { db } from '../lib/db';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/royalties
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { rows: royalties } = await db.query(`
      SELECT r.*, d.title as "dealTitle", p.title as "patentTitle", c.name as "companyName"
      FROM "Royalty" r
      JOIN "DealParticipant" dp ON r."dealId" = dp."dealId"
      JOIN "Deal" d ON r."dealId" = d.id
      LEFT JOIN "Organization" c ON d."companyId" = c.id
      LEFT JOIN "Patent" p ON r."patentId" = p.id
      WHERE dp."userId" = $1
      ORDER BY r."dueDate" DESC
    `, [req.user!.id]);

    const formattedRoyalties = royalties.map(r => ({
      ...r,
      deal: { id: r.dealId, title: r.dealTitle, company: { name: r.companyName } },
      patent: { id: r.patentId, title: r.patentTitle }
    }));

    const totalReceived = royalties.filter(r => r.status === 'PAID').reduce((s, r) => s + parseFloat(r.amount), 0);
    const totalPending = royalties.filter(r => r.status === 'PENDING').reduce((s, r) => s + parseFloat(r.amount), 0);
    const totalOverdue = royalties.filter(r => r.status === 'OVERDUE').reduce((s, r) => s + parseFloat(r.amount), 0);

    res.json({ success: true, data: formattedRoyalties, summary: { totalReceived, totalPending, totalOverdue } });
  } catch (err) { next(err); }
});

// POST /api/royalties
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { dealId, patentId, amount, period, dueDate } = req.body;
    const id = uuidv4();
    const { rows } = await db.query(`
      INSERT INTO "Royalty" (id, "dealId", "patentId", amount, period, "dueDate", status, "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', NOW())
      RETURNING *
    `, [id, dealId, patentId, parseFloat(amount), period, new Date(dueDate)]);
    
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
});

// PATCH /api/royalties/:id/mark-paid
router.patch('/:id/mark-paid', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentRef } = req.body;
    const { rows } = await db.query(`
      UPDATE "Royalty" 
      SET status = 'PAID', "paidAt" = NOW(), "paymentRef" = $1, "updatedAt" = NOW()
      WHERE id = $2
      RETURNING *
    `, [paymentRef, (req.params as Record<string, string>).id]);
    
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
});

export default router;
