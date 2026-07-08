import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';
import { processAIAnalysisJob } from '../lib/ai.worker';

const router = Router();

// POST /api/ai/analyze/:patentId — Trigger AI analysis job
router.post('/analyze/:patentId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { patentId } = req.params as { patentId: string };

    const patent = await prisma.patent.findUnique({ where: { id: patentId } });
    if (!patent) throw new AppError('Patent not found.', 404);

    if (patent.inventorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('Access denied.', 403);
    }

    // Check if already processing
    const existingJob = await prisma.aIAnalysisJob.findFirst({
      where: { patentId, status: { in: ['queued', 'processing'] } },
    });
    if (existingJob) {
      return res.json({ success: true, message: 'Analysis already in progress.', job: existingJob });
    }

    const job = await prisma.aIAnalysisJob.create({
      data: { patentId, userId: req.user!.id },
    });

    // Run worker in background (no await)
    processAIAnalysisJob(job.id, patentId).catch(err => console.error('Background worker error:', err));
    console.log(`🤖 AI analysis job ${job.id} queued for patent ${patentId}`);

    res.status(202).json({
      success: true,
      message: 'AI analysis job queued. This typically takes 30-60 seconds.',
      job: { id: job.id, status: job.status, createdAt: job.createdAt },
    });
  } catch (err) { next(err); }
});

// GET /api/ai/analyze/:patentId/status — Check job status
router.get('/analyze/:patentId/status', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.aIAnalysisJob.findFirst({
      where: { patentId: (req.params as Record<string, string>).patentId },
      orderBy: { createdAt: 'desc' },
    });

    if (!job) return res.json({ success: true, data: null });
    res.json({ success: true, data: job });
  } catch (err) { next(err); }
});

// GET /api/ai/report/:patentId — Get AI report
router.get('/report/:patentId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const report = await prisma.aIReport.findUnique({
      where: { patentId: (req.params as Record<string, string>).patentId },
      include: { patent: { select: { id: true, title: true, domain: true, status: true } } },
    });

    if (!report) throw new AppError('AI report not found. Please run analysis first.', 404);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
});

// GET /api/ai/match/:patentId — AI company matching for a patent
router.get('/match/:patentId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const matches = await prisma.matchResult.findMany({
      where: { patentId: (req.params as Record<string, string>).patentId },
      orderBy: { matchScore: 'desc' },
      take: 20,
      include: { matchRequest: { include: { organization: { select: { id: true, name: true, industry: true, stage: true } } } } },
    });

    res.json({ success: true, data: matches });
  } catch (err) { next(err); }
});

export default router;
