import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';
import { ReportType, ReportFormat } from '@prisma/client';

const router = Router();

// GET /api/reports
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reports = await prisma.report.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reports });
  } catch (err) { next(err); }
});

// POST /api/reports — Generate a new report
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, name, format = 'PDF', period, params } = req.body;

    const report = await prisma.report.create({
      data: {
        userId: req.user!.id,
        type: type as ReportType,
        name,
        format: format as ReportFormat,
        period,
        params,
        status: 'GENERATING',
      },
    });

    // TODO: Queue report generation job (Phase 5B)
    console.log(`📊 Report ${report.id} queued for generation`);

    res.status(202).json({
      success: true,
      message: 'Report generation queued.',
      data: report,
    });
  } catch (err) { next(err); }
});

// PATCH /api/reports/:id/star
router.patch('/:id/star', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const report = await prisma.report.findFirst({ where: { id: (req.params as Record<string, string>).id, userId: req.user!.id } });
    if (!report) { res.status(404).json({ success: false, error: 'Report not found.' }); return; }
    const updated = await prisma.report.update({ where: { id: (req.params as Record<string, string>).id }, data: { isStarred: !report.isStarred } });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// DELETE /api/reports/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.report.deleteMany({ where: { id: (req.params as Record<string, string>).id, userId: req.user!.id } });
    res.json({ success: true, message: 'Report deleted.' });
  } catch (err) { next(err); }
});

// GET /api/reports/:id/download
router.get('/:id/download', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const report = await prisma.report.findFirst({
      where: { id: (req.params as Record<string, string>).id, userId: req.user!.id },
    });
    
    if (!report) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.name.replace(/[^a-z0-9]/gi, '_')}.pdf"`);

    doc.pipe(res);

    doc.fontSize(24).fillColor('#1E293B').text('IP COS Platform', { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).fillColor('#2563EB').text(report.name, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).fillColor('#475569');
    doc.text(`Report Type: ${report.type}`);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`);
    if (report.period) doc.text(`Period: ${report.period}`);
    
    doc.moveDown(2);
    doc.fontSize(14).fillColor('#1E293B').text('Summary of Parameters:');
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#475569');
    if (report.params) {
      doc.text(JSON.stringify(report.params, null, 2));
    } else {
      doc.text('This is an automatically generated system report summarizing platform activities.');
      doc.moveDown();
      doc.text('A comprehensive analysis based on real-time data is presented in the digital dashboard.');
    }

    doc.end();
  } catch (err) { next(err); }
});

export default router;
