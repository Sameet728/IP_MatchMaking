import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { db } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import { Request, Response, NextFunction } from 'express';
import { logAudit } from '../lib/audit';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/billing/plans
router.get('/plans', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await db.query('SELECT * FROM "SubscriptionPlan" WHERE "isActive" = true ORDER BY price ASC');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

// POST /api/billing/subscribe
router.post('/subscribe', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { planId } = req.body;
    if (!planId) throw new AppError('Plan ID is required.', 400);

    const user = req.user!;
    if (!user.organizationId) {
      throw new AppError('You must be part of an organization to subscribe to a plan.', 400);
    }

    const { rows: planRows } = await db.query('SELECT * FROM "SubscriptionPlan" WHERE id = $1', [planId]);
    const plan = planRows[0];
    if (!plan || !plan.isActive) {
      throw new AppError('Invalid or inactive plan.', 400);
    }

    const { rows: existingRows } = await db.query('SELECT id FROM "Subscription" WHERE "organizationId" = $1', [user.organizationId]);
    let subscription;
    
    if (existingRows.length > 0) {
      const { rows } = await db.query(`
        UPDATE "Subscription" 
        SET "planId" = $1, status = 'active', "currentPeriodEnd" = $2, "updatedAt" = NOW()
        WHERE "organizationId" = $3 RETURNING *
      `, [plan.id, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), user.organizationId]);
      subscription = rows[0];
    } else {
      const id = uuidv4();
      const { rows } = await db.query(`
        INSERT INTO "Subscription" (id, "organizationId", "planId", status, "currentPeriodStart", "currentPeriodEnd", "stripeCustomerId", "stripeSubscriptionId", "updatedAt")
        VALUES ($1, $2, $3, 'active', NOW(), $4, $5, $6, NOW())
        RETURNING *
      `, [
        id, user.organizationId, plan.id, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        'mock_cus_' + user.id, 'mock_sub_' + Math.floor(Math.random() * 1000000)
      ]);
      subscription = rows[0];
    }

    await logAudit({
      userId: user.id,
      action: 'UPGRADE_SUBSCRIPTION',
      entity: 'Subscription',
      entityId: subscription.id,
      newValue: { plan: plan.name },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true, message: `Successfully upgraded to ${plan.name} plan.`, data: subscription });
  } catch (err) { next(err); }
});

export default router;
