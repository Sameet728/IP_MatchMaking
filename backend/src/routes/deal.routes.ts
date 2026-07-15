import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { db } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';
import { DealStatus, DealType } from '../types/enums';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', status } = req.query as Record<string, string>;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    let query = `
      SELECT d.*, c.id as "companyId", c.name as "companyName", c.logo as "companyLogo",
             (SELECT COUNT(*) FROM "Message" m WHERE m."dealId" = d.id) as "messagesCount",
             (SELECT COUNT(*) FROM "Royalty" r WHERE r."dealId" = d.id) as "royaltiesCount"
      FROM "Deal" d
      LEFT JOIN "Organization" c ON d."companyId" = c.id
    `;
    const countQuery = `SELECT COUNT(*) FROM "Deal" d`;
    let whereClauses: string[] = [];
    let params: any[] = [];
    
    if (req.user!.role !== 'ADMIN') {
      query += ` JOIN "DealParticipant" dp ON dp."dealId" = d.id `;
      whereClauses.push(`dp."userId" = $1`);
      params.push(req.user!.id);
    }
    
    if (status) {
       params.push(status);
       whereClauses.push(`d.status = $${params.length}`);
    }
    
    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }
    
    query += ` ORDER BY d."updatedAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    
    const { rows: dealsRows } = await db.query(query, [...params, limitNum, offset]);
    
    let countQ = countQuery;
    if (req.user!.role !== 'ADMIN') {
      countQ += ` JOIN "DealParticipant" dp ON dp."dealId" = d.id WHERE dp."userId" = $1`;
      if (status) countQ += ` AND d.status = $2`;
    } else if (status) {
      countQ += ` WHERE d.status = $1`;
    }
    const { rows: countRows } = await db.query(countQ, params);
    const total = parseInt(countRows[0].count, 10);

    const deals = dealsRows.map(d => ({
      ...d,
      company: d.companyId ? { id: d.companyId, name: d.companyName, logo: d.companyLogo } : null,
      _count: { messages: parseInt(d.messagesCount, 10), royalties: parseInt(d.royaltiesCount, 10) }
    }));

    res.json({ success: true, data: deals, pagination: { page: parseInt(page), total, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as Record<string, string>).id;
    let query = `SELECT * FROM "Deal" WHERE id = $1`;
    const params: any[] = [id];
    if (req.user!.role !== 'ADMIN') {
      query = `SELECT d.* FROM "Deal" d JOIN "DealParticipant" dp ON dp."dealId" = d.id WHERE d.id = $1 AND dp."userId" = $2`;
      params.push(req.user!.id);
    }
    const { rows: dealRows } = await db.query(query, params);
    const deal = dealRows[0];
    if (!deal) throw new AppError('Deal not found or access denied.', 404);
    
    res.json({ success: true, data: deal, _note: "Relations fetching partially stubbed for SQL rewrite" });
  } catch (err) { next(err); }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, type, companyId, patentIds, upfrontFee, royaltyRate, duration, territory } = req.body;
    if (!title || !companyId) throw new AppError('Title and companyId are required.', 400);

    const id = uuidv4();
    const { rows } = await db.query(`
      INSERT INTO "Deal" (id, title, type, "companyId", "upfrontFee", "royaltyRate", duration, territory, status, "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'NEGOTIATING', NOW())
      RETURNING *
    `, [id, title, type || 'NON_EXCLUSIVE_LICENSE', companyId, upfrontFee ? parseFloat(upfrontFee) : null, royaltyRate ? parseFloat(royaltyRate) : null, duration ? parseInt(duration) : null, territory || ['India']]);
    
    await db.query(`INSERT INTO "DealParticipant" (id, "dealId", "userId", role, "updatedAt") VALUES ($1, $2, $3, 'lead_inventor', NOW())`, [uuidv4(), id, req.user!.id]);
    
    if (patentIds?.length) {
      for (const pid of patentIds) {
         await db.query(`INSERT INTO "DealPatent" ("dealId", "patentId") VALUES ($1, $2)`, [id, pid]);
      }
    }

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
});

router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!status) throw new AppError('Status is required.', 400);

    const id = (req.params as Record<string, string>).id;
    let query = `SELECT id FROM "Deal" WHERE id = $1`;
    const params: any[] = [id];
    if (req.user!.role !== 'ADMIN') {
      query = `SELECT d.id FROM "Deal" d JOIN "DealParticipant" dp ON dp."dealId" = d.id WHERE d.id = $1 AND dp."userId" = $2`;
      params.push(req.user!.id);
    }
    const { rows: dealRows } = await db.query(query, params);
    if (dealRows.length === 0) throw new AppError('Deal not found or access denied.', 404);

    const dateFields: Record<string, string> = { NDA_SIGNED: '"ndaSignedAt"', TERM_SHEET: '"termSheetAt"', SIGNED: '"agreementAt"' };
    const dateField = dateFields[status];
    
    let updateQuery = `UPDATE "Deal" SET status = $1, "updatedAt" = NOW()`;
    if (dateField) updateQuery += `, ${dateField} = NOW()`;
    updateQuery += ` WHERE id = $2 RETURNING *`;
    
    const { rows: updated } = await db.query(updateQuery, [status, id]);
    res.json({ success: true, data: updated[0] });
  } catch (err) { next(err); }
});

router.get('/:id/messages', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id: dealId } = req.params as Record<string, string>;
    let query = `SELECT id FROM "Deal" WHERE id = $1`;
    const params: any[] = [dealId];
    if (req.user!.role !== 'ADMIN') {
      query = `SELECT d.id FROM "Deal" d JOIN "DealParticipant" dp ON dp."dealId" = d.id WHERE d.id = $1 AND dp."userId" = $2`;
      params.push(req.user!.id);
    }
    const { rows: dealRows } = await db.query(query, params);
    if (dealRows.length === 0) throw new AppError('Deal not found or access denied.', 404);

    const { rows: messages } = await db.query(`
      SELECT m.*, u.id as "senderId", u.name as "senderName", u.role as "senderRole"
      FROM "Message" m JOIN "User" u ON m."senderId" = u.id
      WHERE m."dealId" = $1 ORDER BY m."createdAt" ASC
    `, [dealId]);
    
    const formatted = messages.map(m => {
       const { senderId, senderName, senderRole, ...rest } = m;
       return { ...rest, sender: { id: senderId, name: senderName, role: senderRole } };
    });

    res.json({ success: true, data: formatted });
  } catch (err) { next(err); }
});

router.post('/:id/messages', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id: dealId } = req.params as Record<string, string>;
    const { content, type, proposal } = req.body;

    let query = `SELECT id FROM "Deal" WHERE id = $1`;
    const params: any[] = [dealId];
    if (req.user!.role !== 'ADMIN') {
      query = `SELECT d.id FROM "Deal" d JOIN "DealParticipant" dp ON dp."dealId" = d.id WHERE d.id = $1 AND dp."userId" = $2`;
      params.push(req.user!.id);
    }
    const { rows: dealRows } = await db.query(query, params);
    if (dealRows.length === 0) throw new AppError('Deal not found or access denied.', 404);

    const id = uuidv4();
    const { rows } = await db.query(`
      INSERT INTO "Message" (id, "dealId", "senderId", content, type, proposal, "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *
    `, [id, dealId, req.user!.id, content, type || 'TEXT', proposal ? JSON.stringify(proposal) : null]);
    
    const { rows: senderRows } = await db.query(`SELECT id, name, role FROM "User" WHERE id = $1`, [req.user!.id]);
    const message = { ...rows[0], sender: senderRows[0] };

    const { getIO } = require('../lib/socket');
    try {
      getIO().to(`deal_${dealId}`).emit('new_message', message);
    } catch (e) { console.error('Socket emission failed:', e); }

    res.status(201).json({ success: true, data: message });
  } catch (err) { next(err); }
});

export default router;
