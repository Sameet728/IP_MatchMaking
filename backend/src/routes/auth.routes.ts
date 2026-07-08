import { Router } from 'express';
import {
  register, login, verifyOTP, refreshToken, logout,
  forgotPassword, resetPassword, resendOTP,
} from '../controllers/auth.controller';
import { logAudit } from '../lib/audit';

const router = Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
