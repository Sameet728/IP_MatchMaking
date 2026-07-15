import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { db } from '../lib/db';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/reports
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { rows } = await db.query('SELECT * FROM "Report" WHERE "userId" = $1 ORDER BY "createdAt" DESC', [req.user!.id]);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

// POST /api/reports — Generate a new report
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, name, format = 'PDF', period, params } = req.body;
    const id = uuidv4();
    const { rows } = await db.query(`
      INSERT INTO "Report" (id, "userId", type, name, format, period, params, status, "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'GENERATING', NOW())
      RETURNING *
    `, [id, req.user!.id, type, name, format, period, params ? JSON.stringify(params) : null]);
    console.log(`📊 Report ${id} queued for generation`);
    res.status(202).json({ success: true, message: 'Report generation queued.', data: rows[0] });
  } catch (err) { next(err); }
});

// PATCH /api/reports/:id/star
router.patch('/:id/star', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as Record<string, string>).id;
    const { rows: reportRows } = await db.query('SELECT * FROM "Report" WHERE id = $1 AND "userId" = $2', [id, req.user!.id]);
    const report = reportRows[0];
    if (!report) return res.status(404).json({ success: false, error: 'Report not found.' });
    const { rows: updatedRows } = await db.query(`
      UPDATE "Report" SET "isStarred" = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *
    `, [!report.isStarred, id]);
    res.json({ success: true, data: updatedRows[0] });
  } catch (err) { next(err); }
});

// DELETE /api/reports/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as Record<string, string>).id;
    await db.query('DELETE FROM "Report" WHERE id = $1 AND "userId" = $2', [id, req.user!.id]);
    res.json({ success: true, message: 'Report deleted.' });
  } catch (err) { next(err); }
});

// GET /api/reports/:id/download
router.get('/:id/download', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as Record<string, string>).id;
    const { rows } = await db.query('SELECT * FROM "Report" WHERE id = $1 AND "userId" = $2', [id, req.user!.id]);
    const report = rows[0];
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });

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
      doc.text(typeof report.params === 'string' ? report.params : JSON.stringify(report.params, null, 2));
    } else {
      doc.text('This is an automatically generated system report summarizing platform activities.');
      doc.moveDown();
      doc.text('A comprehensive analysis based on real-time data is presented in the digital dashboard.');
    }

    doc.end();
  } catch (err) { next(err); }
});

export default router;
