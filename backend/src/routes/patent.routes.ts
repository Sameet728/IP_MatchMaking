import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/authenticate';
import {
  getPatents, getPatentById, createPatent, updatePatent,
  deletePatent, toggleSavePatent, getSavedPatents, downloadAIReport
} from '../controllers/patent.controller';
import { logAudit } from '../lib/audit';

const router = Router();

// Public marketplace listing — auth optional for personalization
router.get('/', optionalAuth, getPatents);
router.get('/saved', authenticate, getSavedPatents);
router.get('/:id', optionalAuth, getPatentById);
router.get('/:id/ai-report/download', optionalAuth, downloadAIReport);

// Protected — must be logged in
router.post('/', authenticate, createPatent);
router.patch('/:id', authenticate, updatePatent);
router.delete('/:id', authenticate, deletePatent);
router.post('/:id/save', authenticate, toggleSavePatent);

export default router;
