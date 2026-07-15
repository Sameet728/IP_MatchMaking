import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { db } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';
import { processAIAnalysisJob } from '../lib/ai.worker';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/analyze/:patentId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { patentId } = req.params as { patentId: string };

    const { rows: patentRows } = await db.query('SELECT * FROM "Patent" WHERE id = $1', [patentId]);
    const patent = patentRows[0];
    if (!patent) throw new AppError('Patent not found.', 404);

    if (patent.inventorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('Access denied.', 403);
    }

    const { rows: jobRows } = await db.query('SELECT * FROM "AIAnalysisJob" WHERE "patentId" = $1 AND status IN ($2, $3)', [patentId, 'queued', 'processing']);
    if (jobRows.length > 0) {
      return res.json({ success: true, message: 'Analysis already in progress.', job: jobRows[0] });
    }

    const id = uuidv4();
    const { rows } = await db.query(`
      INSERT INTO "AIAnalysisJob" (id, "patentId", "userId", status)
      VALUES ($1, $2, $3, 'queued') RETURNING *
    `, [id, patentId, req.user!.id]);
    const job = rows[0];

    processAIAnalysisJob(job.id, patentId).catch(err => console.error('Background worker error:', err));
    console.log(`🤖 AI analysis job ${job.id} queued for patent ${patentId}`);

    res.status(202).json({
      success: true,
      message: 'AI analysis job queued. This typically takes 30-60 seconds.',
      job: { id: job.id, status: job.status, createdAt: job.createdAt },
    });
  } catch (err) { next(err); }
});

router.get('/analyze/:patentId/status', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { rows } = await db.query('SELECT * FROM "AIAnalysisJob" WHERE "patentId" = $1 ORDER BY "createdAt" DESC LIMIT 1', [(req.params as Record<string, string>).patentId]);
    if (rows.length === 0) return res.json({ success: true, data: null });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
});

router.get('/report/:patentId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { rows } = await db.query(`
      SELECT r.*, p.title as "patentTitle", p.domain as "patentDomain", p.status as "patentStatus"
      FROM "AIReport" r JOIN "Patent" p ON r."patentId" = p.id
      WHERE r."patentId" = $1
    `, [(req.params as Record<string, string>).patentId]);
    const report = rows[0];
    if (!report) throw new AppError('AI report not found. Please run analysis first.', 404);
    
    const { patentTitle, patentDomain, patentStatus, ...rest } = report;
    const formatted = { ...rest, patent: { id: report.patentId, title: patentTitle, domain: patentDomain, status: patentStatus } };

    res.json({ success: true, data: formatted });
  } catch (err) { next(err); }
});

router.get('/match/:patentId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { rows } = await db.query('SELECT * FROM "MatchResult" WHERE "patentId" = $1 ORDER BY "matchScore" DESC LIMIT 20', [(req.params as Record<string, string>).patentId]);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

export default router;
