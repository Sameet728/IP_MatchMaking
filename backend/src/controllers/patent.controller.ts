import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { logAudit } from '../lib/audit';
import { PatentStatus, TechDomain, Prisma } from '@prisma/client';

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
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.PatentWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { abstract: { contains: search, mode: 'insensitive' } },
          { patentNumber: { contains: search, mode: 'insensitive' } },
          { keywords: { hasSome: [search] } },
        ],
      }),
      ...(status && { status: status as PatentStatus }),
      ...(domain && { domain: domain as TechDomain }),
      ...(isListed !== undefined && { isListed: isListed === 'true' }),
      ...(inventorId && { inventorId }),
      ...(organizationId && { organizationId }),
      // Role-based visibility: non-admin users only see their own or listed patents
      ...(req.user?.role !== 'ADMIN' && req.user?.role !== 'STARTUP' && req.user?.role !== 'ENTERPRISE' && {
        OR: [
          { inventorId: req.user?.id },
          { organizationId: req.user?.organizationId || undefined },
          { isListed: true },
        ],
      }),
    };

    const [patents, total] = await Promise.all([
      prisma.patent.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          inventor: { select: { id: true, name: true, organization: { select: { name: true } } } },
          organization: { select: { id: true, name: true } },
          aiReport: {
            select: {
              overallScore: true, noveltyScore: true, commercialScore: true,
              marketFitScore: true, legalStrength: true, techReadiness: true,
              potentialBuyers: true, valuationEstimate: true,
            },
          },
          _count: { select: { deals: true, saved: true, documents: true } },
        },
      }),
      prisma.patent.count({ where }),
    ]);

    res.json({
      success: true,
      data: patents,
      pagination: {
        page: pageNum, limit: limitNum, total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/patents/:id ─────────────────────────────────────────
export const getPatentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };

    const patent = await prisma.patent.findUnique({
      where: { id },
      include: {
        inventor: { select: { id: true, name: true, email: true, designation: true, organization: { select: { name: true } } } },
        organization: true,
        aiReport: true,
        documents: { where: { isPublic: true } },
        _count: { select: { deals: true, saved: true } },
      },
    });

    if (!patent) throw new AppError('Patent not found.', 404);

    // Increment view count
    await prisma.patent.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Check if saved by current user
    let isSaved = false;
    if (req.user) {
      const saved = await prisma.savedPatent.findUnique({
        where: { userId_patentId: { userId: req.user.id, patentId: id } },
      });
      isSaved = !!saved;
    }

    res.json({ success: true, data: { ...patent, isSaved } });
  } catch (err) {
    next(err);
  }
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

    if (!title || !abstract || !domain) {
      throw new AppError('Title, abstract, and domain are required.', 400);
    }

    const patent = await prisma.patent.create({
      data: {
        title,
        patentNumber: patentNumber || null,
        applicationNumber: applicationNumber || null,
        status: (status as PatentStatus) || 'FILED',
        type: type || 'UTILITY',
        filingDate: filingDate ? new Date(filingDate) : null,
        grantDate: grantDate ? new Date(grantDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        country: country || 'India',
        ipcCodes: ipcCodes || [],
        cpcCodes: cpcCodes || [],
        abstract,
        description: description || null,
        claims: claims || null,
        domain: domain as TechDomain,
        subDomain: subDomain || null,
        keywords: keywords || [],
        trl: trl ? parseInt(trl) : 1,
        isListed: isListed || false,
        askingPrice: askingPrice ? parseFloat(askingPrice) : null,
        royaltyRate: royaltyRate ? parseFloat(royaltyRate) : null,
        licenseType: licenseType || null,
        isExclusive: isExclusive || false,
        coInventors: coInventors || [],
        inventorId: req.user!.id,
        organizationId: req.user!.organizationId || undefined,
      },
      include: {
        inventor: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'CREATE_PATENT', entity: 'Patent', entityId: patent.id },
    });

    await logAudit({
      userId: req.user!.id,
      action: 'CREATE_PATENT',
      entity: 'Patent',
      entityId: patent.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({ success: true, data: patent });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/patents/:id ───────────────────────────────────────
export const updatePatent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };

    const existing = await prisma.patent.findUnique({ where: { id } });
    if (!existing) throw new AppError('Patent not found.', 404);

    // Only inventor, org members, or admin can update
    if (existing.inventorId !== req.user!.id &&
        existing.organizationId !== req.user!.organizationId &&
        req.user!.role !== 'ADMIN') {
      throw new AppError('You do not have permission to update this patent.', 403);
    }

    const allowedFields = [
      'title', 'status', 'abstract', 'description', 'claims', 'keywords',
      'trl', 'isListed', 'askingPrice', 'royaltyRate', 'licenseType', 'isExclusive',
      'subDomain', 'ipcCodes', 'cpcCodes', 'coInventors', 'filingDate', 'grantDate', 'expiryDate',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Handle listing
    if (updateData.isListed === true && !existing.isListed) {
      updateData.listingDate = new Date();
    }

    const updated = await prisma.patent.update({
      where: { id },
      data: updateData,
      include: {
        inventor: { select: { id: true, name: true } },
        aiReport: { select: { overallScore: true } },
      },
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'UPDATE_PATENT', entity: 'Patent', entityId: id, newValue: updateData },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/patents/:id ──────────────────────────────────────
export const deletePatent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };

    const existing = await prisma.patent.findUnique({ where: { id } });
    if (!existing) throw new AppError('Patent not found.', 404);

    if (existing.inventorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('You do not have permission to delete this patent.', 403);
    }

    await prisma.patent.delete({ where: { id } });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'DELETE_PATENT', entity: 'Patent', entityId: id },
    });

    res.json({ success: true, message: 'Patent deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/patents/:id/save ────────────────────────────────────
export const toggleSavePatent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user!.id;

    const existing = await prisma.savedPatent.findUnique({
      where: { userId_patentId: { userId, patentId: id } },
    });

    if (existing) {
      await prisma.savedPatent.delete({ where: { userId_patentId: { userId, patentId: id } } });
      await prisma.patent.update({ where: { id }, data: { saveCount: { decrement: 1 } } });
      res.json({ success: true, saved: false });
    } else {
      await prisma.savedPatent.create({ data: { userId, patentId: id } });
      await prisma.patent.update({ where: { id }, data: { saveCount: { increment: 1 } } });
      res.json({ success: true, saved: true });
    }
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/patents/saved ────────────────────────────────────────
export const getSavedPatents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const saved = await prisma.savedPatent.findMany({
      where: { userId: req.user!.id },
      include: {
        patent: {
          include: {
            inventor: { select: { name: true, organization: { select: { name: true } } } },
            aiReport: { select: { overallScore: true } },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    res.json({ success: true, data: saved.map(s => s.patent) });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/patents/:id/ai-report/download ───────────────────────
export const downloadAIReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };

    const patent = await prisma.patent.findUnique({
      where: { id },
      include: { aiReport: true, organization: true, inventor: true },
    });

    if (!patent || !patent.aiReport) {
      res.status(404).json({ success: false, error: 'AI Report not found.' });
      return;
    }

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
    doc.text(`Generated On: ${new Date(patent.aiReport.generatedAt).toLocaleDateString()}`);
    doc.moveDown(2);

    doc.fontSize(16).fillColor('#1E293B').text('Scores Overview');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#475569');
    doc.text(`Overall Score: ${patent.aiReport.overallScore}/100`);
    doc.text(`Novelty: ${patent.aiReport.noveltyScore}/100`);
    doc.text(`Commercial Value: ${patent.aiReport.commercialScore}/100`);
    doc.text(`Market Fit: ${patent.aiReport.marketFitScore}/100`);
    
    doc.moveDown(2);
    doc.fontSize(16).fillColor('#1E293B').text('Executive Summary');
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#475569').text(patent.aiReport.executiveSummary);
    
    doc.end();
  } catch (err) {
    next(err);
  }
};
