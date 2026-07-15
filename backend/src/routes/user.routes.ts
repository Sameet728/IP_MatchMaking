import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { db } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';

const router = Router();

// GET /api/users/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.email, u.name, u.role, u.status, u.phone, u.avatar, u.bio, u.designation, u."linkedinUrl", u."googleScholar", u."organizationId", u."emailVerified", u."lastLoginAt", u."loginCount", u."createdAt", o.name as "organizationName"
       FROM "User" u
       LEFT JOIN "Organization" o ON u."organizationId" = o.id
       WHERE u.id = $1`,
      [req.user!.id]
    );
    const user = rows[0];
    if (!user) throw new AppError('User not found.', 404);
    
    if (user.organizationId) {
       user.organization = { id: user.organizationId, name: user.organizationName };
    }
    delete user.organizationName;

    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// PATCH /api/users/me
router.patch('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const allowedFields = ['name', 'phone', 'bio', 'designation', 'linkedinUrl', 'googleScholar'];
    const updateFields: string[] = [];
    const values: any[] = [];
    let queryIdx = 1;
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateFields.push(`"${field}" = $${queryIdx++}`);
        values.push(req.body[field]);
      }
    }
    
    if (updateFields.length === 0) {
      const { rows } = await db.query('SELECT id, email, name, role, phone, bio, designation FROM "User" WHERE id = $1', [req.user!.id]);
      return res.json({ success: true, data: rows[0] });
    }

    values.push(req.user!.id);
    const query = `UPDATE "User" SET ${updateFields.join(', ')}, "updatedAt" = NOW() WHERE id = $${queryIdx} RETURNING id, email, name, role, phone, bio, designation`;
    
    const { rows } = await db.query(query, values);
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
});

// GET /api/users/me/stats
router.get('/me/stats', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const [patentsRes, dealsRes, royaltiesRes, savedCountRes] = await Promise.all([
      db.query('SELECT COUNT(*) FROM "Patent" WHERE "inventorId" = $1', [userId]),
      db.query('SELECT COUNT(*) FROM "DealParticipant" WHERE "userId" = $1', [userId]),
      db.query(`SELECT r.amount, r.status FROM "Royalty" r 
                JOIN "DealParticipant" dp ON r."dealId" = dp."dealId" 
                WHERE dp."userId" = $1`, [userId]),
      db.query('SELECT COUNT(*) FROM "SavedPatent" WHERE "userId" = $1', [userId]),
    ]);

    const patents = parseInt(patentsRes.rows[0].count, 10);
    const deals = parseInt(dealsRes.rows[0].count, 10);
    const savedPatents = parseInt(savedCountRes.rows[0].count, 10);
    
    const royalties = royaltiesRes.rows;
    const totalRoyalties = royalties.filter(r => r.status === 'PAID').reduce((s, r) => s + parseFloat(r.amount), 0);
    const pendingRoyalties = royalties.filter(r => r.status === 'PENDING').reduce((s, r) => s + parseFloat(r.amount), 0);

    res.json({
      success: true,
      data: { patents, deals, totalRoyalties, pendingRoyalties, savedPatents },
    });
  } catch (err) { next(err); }
});

export default router;
