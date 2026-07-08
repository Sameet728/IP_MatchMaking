import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/authenticate';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg', 'image/png', 'image/webp',
    'application/zip',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${file.mimetype} not allowed.`, 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 50) * 1024 * 1024 },
});

// POST /api/upload/patent/:patentId — Upload document for a patent
router.post('/patent/:patentId', authenticate, upload.single('file'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError('No file uploaded.', 400);

    const { patentId } = req.params as { patentId: string };
    const { isPublic = 'false' } = req.body;

    const patent = await prisma.patent.findUnique({ where: { id: patentId } });
    if (!patent) throw new AppError('Patent not found.', 404);
    if (patent.inventorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('Access denied.', 403);
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const doc = await prisma.patentDocument.create({
      data: {
        patentId,
        name: req.file.originalname,
        type: req.file.mimetype,
        url: fileUrl,
        size: req.file.size,
        isPublic: isPublic === 'true',
      },
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
});

// POST /api/upload/avatar — Upload user avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError('No file uploaded.', 400);

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedImageTypes.includes(req.file.mimetype)) {
      throw new AppError('Avatar must be JPEG, PNG, or WebP.', 400);
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatar: avatarUrl },
    });

    res.json({ success: true, data: { avatarUrl } });
  } catch (err) { next(err); }
});

export default router;
