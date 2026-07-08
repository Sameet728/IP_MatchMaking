import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';
import { DealStatus, DealType } from '@prisma/client';

const router = Router();

// GET /api/deals
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', status } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(req.user!.role !== 'ADMIN' && { participants: { some: { userId: req.user!.id } } }),
      ...(status && { status: status as DealStatus }),
    };

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          company: { select: { id: true, name: true, logo: true } },
          patents: { include: { patent: { select: { id: true, title: true } } } },
          participants: { include: { user: { select: { id: true, name: true, role: true } } } },
          milestones: true,
          _count: { select: { messages: true, royalties: true } },
        },
      }),
      prisma.deal.count({ where }),
    ]);

    res.json({ success: true, data: deals, pagination: { page: parseInt(page), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
});

// GET /api/deals/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const deal = await prisma.deal.findFirst({
      where: { 
        id: (req.params as Record<string, string>).id, 
        ...(req.user!.role !== 'ADMIN' && { participants: { some: { userId: req.user!.id } } }) 
      },
      include: {
        company: true,
        patents: { include: { patent: { include: { aiReport: { select: { overallScore: true } } } } } },
        participants: { include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } } },
        milestones: { orderBy: { dueDate: 'asc' } },
        royalties: { orderBy: { dueDate: 'desc' } },
        messages: { take: 5, orderBy: { createdAt: 'desc' }, include: { sender: { select: { id: true, name: true } } } },
      },
    });

    if (!deal) throw new AppError('Deal not found or access denied.', 404);
    res.json({ success: true, data: deal });
  } catch (err) { next(err); }
});

// POST /api/deals
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, type, companyId, patentIds, upfrontFee, royaltyRate, duration, territory } = req.body;
    if (!title || !companyId) throw new AppError('Title and companyId are required.', 400);

    const deal = await prisma.deal.create({
      data: {
        title,
        type: (type as DealType) || 'NON_EXCLUSIVE_LICENSE',
        companyId,
        upfrontFee: upfrontFee ? parseFloat(upfrontFee) : null,
        royaltyRate: royaltyRate ? parseFloat(royaltyRate) : null,
        duration: duration ? parseInt(duration) : null,
        territory: territory || ['India'],
        participants: { create: { userId: req.user!.id, role: 'lead_inventor' } },
        ...(patentIds?.length && {
          patents: { create: patentIds.map((pid: string) => ({ patentId: pid })) },
        }),
      },
      include: { company: { select: { id: true, name: true } }, patents: true },
    });

    res.status(201).json({ success: true, data: deal });
  } catch (err) { next(err); }
});

// PATCH /api/deals/:id/status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!status) throw new AppError('Status is required.', 400);

    const deal = await prisma.deal.findFirst({
      where: { 
        id: (req.params as Record<string, string>).id, 
        ...(req.user!.role !== 'ADMIN' && { participants: { some: { userId: req.user!.id } } }) 
      },
    });
    if (!deal) throw new AppError('Deal not found or access denied.', 404);

    const dateFields: Record<string, string> = {
      NDA_SIGNED: 'ndaSignedAt', TERM_SHEET: 'termSheetAt', SIGNED: 'agreementAt',
    };

    const updated = await prisma.deal.update({
      where: { id: (req.params as Record<string, string>).id },
      data: {
        status: status as DealStatus,
        ...(dateFields[status] && { [dateFields[status]]: new Date() }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// GET /api/deals/:id/messages
router.get('/:id/messages', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id: dealId } = req.params as Record<string, string>;

    const deal = await prisma.deal.findFirst({
      where: { 
        id: dealId, 
        ...(req.user!.role !== 'ADMIN' && { participants: { some: { userId: req.user!.id } } }) 
      },
    });
    if (!deal) throw new AppError('Deal not found or access denied.', 404);

    const messages = await prisma.message.findMany({
      where: { dealId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });

    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
});

// POST /api/deals/:id/messages
router.post('/:id/messages', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id: dealId } = req.params as Record<string, string>;
    const { content, type, proposal } = req.body;

    const deal = await prisma.deal.findFirst({
      where: { 
        id: dealId, 
        ...(req.user!.role !== 'ADMIN' && { participants: { some: { userId: req.user!.id } } }) 
      },
    });
    if (!deal) throw new AppError('Deal not found or access denied.', 404);

    const message = await prisma.message.create({
      data: {
        dealId,
        senderId: req.user!.id,
        content,
        type: type || 'TEXT',
        proposal,
      },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });

    // Broadcast to WebSocket Deal Room
    const { getIO } = require('../lib/socket');
    try {
      getIO().to(\`deal_\${dealId}\`).emit('new_message', message);
    } catch (e) {
      console.error('Socket emission failed:', e);
    }

    res.status(201).json({ success: true, data: message });
  } catch (err) { next(err); }
});

export default router;
