import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { db } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';
import { MessageType } from '../types/enums';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/:dealId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { dealId } = req.params as { dealId: string };
    const { cursor, limit = '30' } = req.query as Record<string, string>;

    const { rows: participantRows } = await db.query('SELECT 1 FROM "DealParticipant" WHERE "dealId" = $1 AND "userId" = $2', [dealId, req.user!.id]);
    if (participantRows.length === 0) throw new AppError('Access denied to this conversation.', 403);

    let query = `
      SELECT m.*, u.id as "senderId", u.name as "senderName", u.avatar as "senderAvatar", u.role as "senderRole"
      FROM "Message" m
      JOIN "User" u ON m."senderId" = u.id
      WHERE m."dealId" = $1
    `;
    const params: any[] = [dealId];
    
    if (cursor) {
      query += ` AND m."createdAt" < $2`;
      params.push(new Date(cursor));
    }
    
    query += ` ORDER BY m."createdAt" DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit, 10));

    const { rows: messageRows } = await db.query(query, params);
    
    const messages = messageRows.map(m => {
       const { senderId, senderName, senderAvatar, senderRole, ...rest } = m;
       return { ...rest, sender: { id: senderId, name: senderName, avatar: senderAvatar, role: senderRole } };
    });

    const unreadIds = messages.filter(m => !m.readBy || !m.readBy.includes(req.user!.id)).map(m => m.id);
    if (unreadIds.length > 0) {
      await db.query(`
        UPDATE "Message" 
        SET "readBy" = array_append(COALESCE("readBy", '{}'), $1), "updatedAt" = NOW()
        WHERE id = ANY($2::text[])
      `, [req.user!.id, unreadIds]);
    }

    res.json({ success: true, data: messages.reverse(), hasMore: messages.length === parseInt(limit, 10) });
  } catch (err) { next(err); }
});

router.post('/:dealId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { dealId } = req.params as { dealId: string };
    const { type = 'TEXT', content, proposal, fileName, fileUrl, fileSize, fileType } = req.body;

    if (!content && !fileUrl && !proposal) throw new AppError('Message content is required.', 400);

    const { rows: participantRows } = await db.query('SELECT 1 FROM "DealParticipant" WHERE "dealId" = $1 AND "userId" = $2', [dealId, req.user!.id]);
    if (participantRows.length === 0) throw new AppError('Access denied to this conversation.', 403);

    const id = uuidv4();
    const { rows } = await db.query(`
      INSERT INTO "Message" (id, "dealId", "senderId", type, content, proposal, "fileName", "fileUrl", "fileSize", "fileType", "readBy", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ARRAY[$3]::text[], NOW())
      RETURNING *
    `, [id, dealId, req.user!.id, type, content || null, proposal ? JSON.stringify(proposal) : null, fileName || null, fileUrl || null, fileSize ? parseInt(fileSize) : null, fileType || null]);
    
    const { rows: senderRows } = await db.query('SELECT id, name, avatar, role FROM "User" WHERE id = $1', [req.user!.id]);
    const message = { ...rows[0], sender: senderRows[0] };

    res.status(201).json({ success: true, data: message });
  } catch (err) { next(err); }
});

export default router;
