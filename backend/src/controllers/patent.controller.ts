import { Response, NextFunction } from 'express';
import { db } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { logAudit } from '../lib/audit';
import { PatentStatus, TechDomain } from '../types/enums';
import { v4 as uuidv4 } from 'uuid';

// ─── GET /api/patents ─────────────────────────────────────────────
export const getPatents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1', limit = '20', search, status, domain,
      isListed, sortBy = 'createdAt', sortOrder = 'desc',
      inventorId, organizationId,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT p.*, 
             u.id as "inventorId", u.name as "inventorName", 
             o.id as "orgId", o.name as "orgName",
             (SELECT COUNT(*) FROM "DealPatent" dp WHERE dp."patentId" = p.id) as "dealsCount",
             (SELECT COUNT(*) FROM "SavedPatent" sp WHERE sp."patentId" = p.id) as "savedCount",
             (SELECT COUNT(*) FROM "PatentDocument" pd WHERE pd."patentId" = p.id) as "documentsCount"
      FROM "Patent" p
      LEFT JOIN "User" u ON p."inventorId" = u.id
      LEFT JOIN "Organization" o ON p."organizationId" = o.id
    `;
    let countQuery = `SELECT COUNT(*) FROM "Patent" p`;
    
    let whereClauses: string[] = [];
    let params: any[] = [];
    
    if (search) {
      whereClauses.push(`(p.title ILIKE $${params.length + 1} OR p.abstract ILIKE $${params.length + 1} OR p."patentNumber" ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    if (status) { whereClauses.push(`p.status = $${params.length + 1}`); params.push(status); }
    if (domain) { whereClauses.push(`p.domain = $${params.length + 1}`); params.push(domain); }
    if (isListed !== undefined) { whereClauses.push(`p."isListed" = $${params.length + 1}`); params.push(isListed === 'true'); }
    if (inventorId) { whereClauses.push(`p."inventorId" = $${params.length + 1}`); params.push(inventorId); }
    if (organizationId) { whereClauses.push(`p."organizationId" = $${params.length + 1}`); params.push(organizationId); }
    
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'STARTUP' && req.user?.role !== 'ENTERPRISE') {
      let roleClauses: string[] = [];
      if (req.user?.id) { roleClauses.push(`p."inventorId" = $${params.length + 1}`); params.push(req.user.id); }
      if (req.user?.organizationId) { roleClauses.push(`p."organizationId" = $${params.length + 1}`); params.push(req.user.organizationId); }
      roleClauses.push(`p."isListed" = true`);
      whereClauses.push(`(${roleClauses.join(' OR ')})`);
    }
    
    if (whereClauses.length > 0) {
      const clause = ` WHERE ${whereClauses.join(' AND ')}`;
      query += clause; countQuery += clause;
    }
    
    const safeSortBy = ['createdAt', 'title', 'viewCount', 'askingPrice'].includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY p."${safeSortBy}" ${safeSortOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    
    const { rows: patentRows } = await db.query(query, [...params, limitNum, offset]);
    const { rows: countRows } = await db.query(countQuery, params);
    const total = parseInt(countRows[0].count, 10);
    
    const patents = patentRows.map(p => {
       const { inventorName, orgId, orgName, dealsCount, savedCount, documentsCount, ...rest } = p;
       return {
         ...rest,
         inventor: { id: p.inventorId, name: inventorName, organization: orgName ? { name: orgName } : null },
         organization: orgId ? { id: orgId, name: orgName } : null,
         _count: { deals: parseInt(dealsCount), saved: parseInt(savedCount), documents: parseInt(documentsCount) }
       };
    });

    res.json({
      success: true, data: patents,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum), hasMore: offset + limitNum < total },
    });
  } catch (err) { next(err); }
};

// ─── GET /api/patents/:id ─────────────────────────────────────────
export const getPatentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };

    const { rows: patentRows } = await db.query(`
      SELECT p.*, u.id as "inventorId", u.name as "inventorName", u.email as "inventorEmail", u.designation as "inventorDesignation",
             o.id as "orgId", o.name as "orgName",
             (SELECT COUNT(*) FROM "DealPatent" dp WHERE dp."patentId" = p.id) as "dealsCount",
             (SELECT COUNT(*) FROM "SavedPatent" sp WHERE sp."patentId" = p.id) as "savedCount"
      FROM "Patent" p
      LEFT JOIN "User" u ON p."inventorId" = u.id
      LEFT JOIN "Organization" o ON p."organizationId" = o.id
      WHERE p.id = $1
    `, [id]);
    
    const p = patentRows[0];
    if (!p) throw new AppError('Patent not found.', 404);
    
    await db.query(`UPDATE "Patent" SET "viewCount" = "viewCount" + 1 WHERE id = $1`, [id]);
    
    let isSaved = false;
    if (req.user) {
      const { rows: savedRows } = await db.query('SELECT 1 FROM "SavedPatent" WHERE "userId" = $1 AND "patentId" = $2', [req.user.id, id]);
      isSaved = savedRows.length > 0;
    }
    
    const { inventorName, inventorEmail, inventorDesignation, orgId, orgName, dealsCount, savedCount, ...rest } = p;
    const patent = {
      ...rest,
      inventor: { id: p.inventorId, name: inventorName, email: inventorEmail, designation: inventorDesignation, organization: orgName ? { name: orgName } : null },
      organization: orgId ? { id: orgId, name: orgName } : null,
      _count: { deals: parseInt(dealsCount), saved: parseInt(savedCount) }
    };

    res.json({ success: true, data: { ...patent, isSaved } });
  } catch (err) { next(err); }
};

// ─── POST /api/patents ────────────────────────────────────────────
export const createPatent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      title, patentNumber, applicationNumber, status, type, filingDate, grantDate,
      expiryDate, country, ipcCodes, cpcCodes, abstract, description, claims,
      domain, subDomain, keywords, trl, isListed, askingPrice, royaltyRate,
      licenseType, isExclusive, coInventors,
    } = req.body;

    if (!title || !abstract || !domain) throw new AppError('Title, abstract, and domain are required.', 400);

    const id = uuidv4();
    const { rows } = await db.query(`
      INSERT INTO "Patent" (id, title, "patentNumber", "applicationNumber", status, type, "filingDate", "grantDate", "expiryDate", country, "ipcCodes", "cpcCodes", abstract, description, claims, domain, "subDomain", keywords, trl, "isListed", "askingPrice", "royaltyRate", "licenseType", "isExclusive", "coInventors", "inventorId", "organizationId", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, NOW()) RETURNING *
    `, [id, title, patentNumber || null, applicationNumber || null, status || 'FILED', type || 'UTILITY', filingDate ? new Date(filingDate) : null, grantDate ? new Date(grantDate) : null, expiryDate ? new Date(expiryDate) : null, country || 'India', ipcCodes || [], cpcCodes || [], abstract, description || null, claims || null, domain, subDomain || null, keywords || [], trl ? parseInt(trl) : 1, isListed || false, askingPrice ? parseFloat(askingPrice) : null, royaltyRate ? parseFloat(royaltyRate) : null, licenseType || null, isExclusive || false, coInventors || [], req.user!.id, req.user!.organizationId || null]);
    
    const patent = rows[0];

    await db.query(`INSERT INTO "AuditLog" (id, "userId", action, entity, "entityId", "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())`, [uuidv4(), req.user!.id, 'CREATE_PATENT', 'Patent', patent.id]);

    await logAudit({
      userId: req.user!.id, action: 'CREATE_PATENT', entity: 'Patent', entityId: patent.id,
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(201).json({ success: true, data: patent });
  } catch (err) { next(err); }
};

// ─── POST /api/patents/bulk ───────────────────────────────────────
export const createBulkPatents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { patents } = req.body;
    if (!Array.isArray(patents) || patents.length === 0) {
      throw new AppError('An array of patents is required.', 400);
    }

    let successCount = 0;
    const errors: { index: number; title: string; error: string }[] = [];

    // Process each patent sequentially
    // In a production environment with massive CSVs, a bulk INSERT or transaction is better.
    // For this implementation, looping with individual inserts works fine for normal batches (100s).
    for (let i = 0; i < patents.length; i++) {
      const p = patents[i];
      try {
        if (!p.title || !p.abstract || !p.domain) {
          errors.push({ index: i, title: p.title || 'Unknown', error: 'Missing required fields: title, abstract, or domain.' });
          continue;
        }

        const id = uuidv4();
        await db.query(`
          INSERT INTO "Patent" (id, title, "patentNumber", "applicationNumber", status, type, "filingDate", "grantDate", "expiryDate", country, "ipcCodes", "cpcCodes", abstract, description, claims, domain, "subDomain", keywords, trl, "isListed", "askingPrice", "royaltyRate", "licenseType", "isExclusive", "coInventors", "inventorId", "organizationId", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, NOW())
        `, [
          id, p.title, p.patentNumber || null, p.applicationNumber || null, p.status || 'FILED', p.type || 'UTILITY',
          p.filingDate ? new Date(p.filingDate) : null, p.grantDate ? new Date(p.grantDate) : null, p.expiryDate ? new Date(p.expiryDate) : null,
          p.country || 'India', p.ipcCodes || [], p.cpcCodes || [], p.abstract, p.description || null, p.claims || null,
          p.domain, p.subDomain || null, p.keywords || [], p.trl ? parseInt(p.trl) : 1, p.isListed || false,
          p.askingPrice ? parseFloat(p.askingPrice) : null, p.royaltyRate ? parseFloat(p.royaltyRate) : null,
          p.licenseType || null, p.isExclusive || false, p.coInventors || [], req.user!.id, req.user!.organizationId || null
        ]);

        successCount++;
        await logAudit({
          userId: req.user!.id, action: 'CREATE_PATENT_BULK', entity: 'Patent', entityId: id,
          ipAddress: req.ip, userAgent: req.headers['user-agent']
        });
      } catch (err: any) {
        errors.push({ index: i, title: p.title, error: err.message });
      }
    }

    res.status(201).json({
      success: true,
      data: { count: successCount, errors }
    });
  } catch (err) { next(err); }
};

// ─── PATCH /api/patents/:id ───────────────────────────────────────
export const updatePatent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };

    const { rows: existingRows } = await db.query('SELECT * FROM "Patent" WHERE id = $1', [id]);
    const existing = existingRows[0];
    if (!existing) throw new AppError('Patent not found.', 404);

    if (existing.inventorId !== req.user!.id && existing.organizationId !== req.user!.organizationId && req.user!.role !== 'ADMIN') {
      throw new AppError('You do not have permission to update this patent.', 403);
    }

    const allowedFields = ['title', 'status', 'abstract', 'description', 'claims', 'keywords', 'trl', 'isListed', 'askingPrice', 'royaltyRate', 'licenseType', 'isExclusive', 'subDomain', 'ipcCodes', 'cpcCodes', 'coInventors', 'filingDate', 'grantDate', 'expiryDate'];
    
    let updateFields: string[] = [];
    let values: any[] = [];
    let queryIdx = 1;
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateFields.push(`"${field}" = $${queryIdx++}`);
        values.push(req.body[field]);
      }
    }
    
    if (req.body.isListed === true && !existing.isListed) {
       updateFields.push(`"listingDate" = NOW()`);
    }

    if (updateFields.length === 0) return res.json({ success: true, data: existing });

    updateFields.push(`"updatedAt" = NOW()`);
    values.push(id);
    
    const query = `UPDATE "Patent" SET ${updateFields.join(', ')} WHERE id = $${queryIdx} RETURNING *`;
    const { rows: updatedRows } = await db.query(query, values);
    const updated = updatedRows[0];

    await db.query(`INSERT INTO "AuditLog" (id, "userId", action, entity, "entityId", "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())`, [uuidv4(), req.user!.id, 'UPDATE_PATENT', 'Patent', id]);

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

// ─── DELETE /api/patents/:id ──────────────────────────────────────
export const deletePatent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };

    const { rows: existingRows } = await db.query('SELECT * FROM "Patent" WHERE id = $1', [id]);
    const existing = existingRows[0];
    if (!existing) throw new AppError('Patent not found.', 404);

    if (existing.inventorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('You do not have permission to delete this patent.', 403);
    }

    await db.query('DELETE FROM "Patent" WHERE id = $1', [id]);
    await db.query(`INSERT INTO "AuditLog" (id, "userId", action, entity, "entityId", "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())`, [uuidv4(), req.user!.id, 'DELETE_PATENT', 'Patent', id]);

    res.json({ success: true, message: 'Patent deleted successfully.' });
  } catch (err) { next(err); }
};

// ─── POST /api/patents/:id/save ────────────────────────────────────
export const toggleSavePatent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user!.id;

    const { rows: existingRows } = await db.query('SELECT 1 FROM "SavedPatent" WHERE "userId" = $1 AND "patentId" = $2', [userId, id]);

    if (existingRows.length > 0) {
      await db.query('DELETE FROM "SavedPatent" WHERE "userId" = $1 AND "patentId" = $2', [userId, id]);
      await db.query(`UPDATE "Patent" SET "saveCount" = "saveCount" - 1 WHERE id = $1`, [id]);
      res.json({ success: true, saved: false });
    } else {
      await db.query(`INSERT INTO "SavedPatent" ("userId", "patentId") VALUES ($1, $2)`, [userId, id]);
      await db.query(`UPDATE "Patent" SET "saveCount" = "saveCount" + 1 WHERE id = $1`, [id]);
      res.json({ success: true, saved: true });
    }
  } catch (err) { next(err); }
};

// ─── GET /api/patents/saved ────────────────────────────────────────
export const getSavedPatents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { rows } = await db.query(`
      SELECT p.* FROM "Patent" p JOIN "SavedPatent" sp ON p.id = sp."patentId" WHERE sp."userId" = $1 ORDER BY sp."savedAt" DESC
    `, [req.user!.id]);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// ─── GET /api/patents/:id/ai-report/download ───────────────────────
export const downloadAIReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };

    const { rows: patentRows } = await db.query(`SELECT p.*, r."overallScore", r."noveltyScore", r."commercialScore", r."marketFitScore", r."executiveSummary", r."generatedAt" FROM "Patent" p JOIN "AIReport" r ON p.id = r."patentId" WHERE p.id = $1`, [id]);
    const patent = patentRows[0];

    if (!patent) { return res.status(404).json({ success: false, error: 'AI Report not found.' }); }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="AI_Report_${patent.patentNumber || patent.id}.pdf"`);

    doc.pipe(res);

    doc.fontSize(24).fillColor('#1E293B').text('AI Patent Analysis Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).fillColor('#2563EB').text(patent.title, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).fillColor('#475569');
    doc.text(`Patent Number: ${patent.patentNumber || 'N/A'}`);
    doc.text(`Domain: ${patent.domain}`);
    doc.text(`Generated On: ${new Date(patent.generatedAt).toLocaleDateString()}`);
    doc.moveDown(2);

    doc.fontSize(16).fillColor('#1E293B').text('Scores Overview');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#475569');
    doc.text(`Overall Score: ${patent.overallScore}/100`);
    doc.text(`Novelty: ${patent.noveltyScore}/100`);
    doc.text(`Commercial Value: ${patent.commercialScore}/100`);
    doc.text(`Market Fit: ${patent.marketFitScore}/100`);
    
    doc.moveDown(2);
    doc.fontSize(16).fillColor('#1E293B').text('Executive Summary');
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#475569').text(patent.executiveSummary);
    
    doc.end();
  } catch (err) { next(err); }
};
