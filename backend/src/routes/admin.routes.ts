import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate';
import { db } from '../lib/db';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';
import { UserStatus } from '../types/enums';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/users', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', search, role, status } = req.query as Record<string, string>;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    let query = `
      SELECT u.id, u.email, u.name, u.role, u.status, u."emailVerified", u."lastLoginAt", u."loginCount", u."createdAt",
             o.id as "organizationId", o.name as "organizationName",
             (SELECT COUNT(*) FROM "Patent" p WHERE p."inventorId" = u.id) as "patentsCount"
      FROM "User" u LEFT JOIN "Organization" o ON u."organizationId" = o.id
    `;
    const params: any[] = [];
    const countParams: any[] = [];
    let countQuery = `SELECT COUNT(*) FROM "User" u`;
    let whereClauses: string[] = [];

    if (search) {
      whereClauses.push(`(u.name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }
    if (role) {
      whereClauses.push(`u.role = $${params.length + 1}`);
      params.push(role);
      countParams.push(role);
    }
    if (status) {
      whereClauses.push(`u.status = $${params.length + 1}`);
      params.push(status);
      countParams.push(status);
    }
    
    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
      countQuery += ` WHERE ${whereClauses.join(' AND ')}`;
    }
    
    query += ` ORDER BY u."createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    
    const { rows: userRows } = await db.query(query, [...params, limitNum, offset]);
    const { rows: countRows } = await db.query(countQuery, countParams);
    const total = parseInt(countRows[0].count, 10);
    
    const users = userRows.map(u => ({
       ...u,
       organization: u.organizationId ? { id: u.organizationId, name: u.organizationName } : null,
       _count: { patents: parseInt(u.patentsCount, 10) }
    }));

    res.json({ success: true, data: users, pagination: { page: parseInt(page), total, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) { next(err); }
});

router.patch('/users/:id/status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const { rows } = await db.query(`
      UPDATE "User" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id, email, name, status
    `, [status, (req.params as Record<string, string>).id]);
    const user = rows[0];
    
    await db.query(`
      INSERT INTO "AuditLog" (id, "userId", action, entity, "entityId", "newValue", "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [uuidv4(), req.user!.id, 'ADMIN_UPDATE_USER_STATUS', 'User', user.id, JSON.stringify({ status })]);
    
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.get('/stats', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [usersRes, patentsRes, dealsRes, royaltiesRes, auditLogsRes] = await Promise.all([
      db.query(`SELECT role, COUNT(*) FROM "User" GROUP BY role`),
      db.query(`SELECT status, COUNT(*) FROM "Patent" GROUP BY status`),
      db.query(`SELECT status, COUNT(*) FROM "Deal" GROUP BY status`),
      db.query(`SELECT SUM(amount), COUNT(*) FROM "Royalty"`),
      db.query(`SELECT COUNT(*) FROM "AuditLog" WHERE "createdAt" >= NOW() - INTERVAL '24 hours'`),
    ]);

    res.json({
      success: true,
      data: {
        users: usersRes.rows.map(u => ({ role: u.role, count: parseInt(u.count) })),
        patents: patentsRes.rows.map(p => ({ status: p.status, count: parseInt(p.count) })),
        deals: dealsRes.rows.map(d => ({ status: d.status, count: parseInt(d.count) })),
        royalties: { total: parseFloat(royaltiesRes.rows[0].sum || '0'), count: parseInt(royaltiesRes.rows[0].count) },
        activityLast24h: parseInt(auditLogsRes.rows[0].count),
      },
    });
  } catch (err) { next(err); }
});

router.get('/audit-logs', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '50' } = req.query as Record<string, string>;
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

    const { rows: logs } = await db.query(`
      SELECT a.*, u.id as "userId", u.name as "userName", u.email as "userEmail", u.role as "userRole"
      FROM "AuditLog" a LEFT JOIN "User" u ON a."userId" = u.id
      ORDER BY a."createdAt" DESC LIMIT $1 OFFSET $2
    `, [limitNum, offset]);
    
    const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM "AuditLog"`);
    const total = parseInt(countRows[0].count, 10);
    
    const formattedLogs = logs.map(l => {
      const { userName, userEmail, userRole, ...rest } = l;
      return { ...rest, user: l.userId ? { id: l.userId, name: userName, email: userEmail, role: userRole } : null };
    });

    res.json({ success: true, data: formattedLogs, pagination: { page: parseInt(page), total, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) { next(err); }
});

export default router;
