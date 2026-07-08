import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { Response, NextFunction } from 'express';
import { logAudit } from '../lib/audit';

const router = Router();

// GET /api/billing/plans — Fetch all active subscription plans
router.get('/plans', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });
    res.json({ success: true, data: plans });
  } catch (err) { next(err); }
});

// POST /api/billing/subscribe — Mock Stripe Subscription Creation
router.post('/subscribe', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { planId } = req.body;
    if (!planId) throw new AppError('Plan ID is required.', 400);

    const user = req.user!;
    if (!user.organizationId) {
      throw new AppError('You must be part of an organization to subscribe to a plan.', 400);
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw new AppError('Invalid or inactive plan.', 400);
    }

    // Upsert subscription (mocking Stripe success)
    const subscription = await prisma.subscription.upsert({
      where: { organizationId: user.organizationId },
      create: {
        organizationId: user.organizationId,
        planId: plan.id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        stripeCustomerId: 'mock_cus_' + user.id,
        stripeSubscriptionId: 'mock_sub_' + Math.floor(Math.random() * 1000000)
      },
      update: {
        planId: plan.id,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    });

    await logAudit({
      userId: user.id,
      action: 'UPGRADE_SUBSCRIPTION',
      entity: 'Subscription',
      entityId: subscription.id,
      newValue: { plan: plan.name },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: \`Successfully upgraded to \${plan.name} plan.\`,
      data: subscription
    });
  } catch (err) { next(err); }
});

export default router;
