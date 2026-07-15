import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/authenticate';
import { db } from '../lib/db';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

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

// POST /api/upload/patent/:patentId
router.post('/patent/:patentId', authenticate, upload.single('file'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError('No file uploaded.', 400);

    const { patentId } = req.params as { patentId: string };
    const { isPublic = 'false' } = req.body;

    const { rows: patentRows } = await db.query('SELECT "inventorId" FROM "Patent" WHERE id = $1', [patentId]);
    const patent = patentRows[0];
    if (!patent) throw new AppError('Patent not found.', 404);
    if (patent.inventorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('Access denied.', 403);
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const docId = uuidv4();
    const { rows: docRows } = await db.query(`
      INSERT INTO "PatentDocument" (id, "patentId", name, type, url, size, "isPublic", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `, [docId, patentId, req.file.originalname, req.file.mimetype, fileUrl, req.file.size, isPublic === 'true']);

    res.status(201).json({ success: true, data: docRows[0] });
  } catch (err) { next(err); }
});

// POST /api/upload/avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError('No file uploaded.', 400);

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedImageTypes.includes(req.file.mimetype)) {
      throw new AppError('Avatar must be JPEG, PNG, or WebP.', 400);
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    await db.query('UPDATE "User" SET avatar = $1, "updatedAt" = NOW() WHERE id = $2', [avatarUrl, req.user!.id]);

    res.json({ success: true, data: { avatarUrl } });
  } catch (err) { next(err); }
});

export default router;
