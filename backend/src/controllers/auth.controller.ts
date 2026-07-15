import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '../types/enums';
import { sendOTP, sendPasswordReset } from '../lib/email';
import { logAudit } from '../lib/audit';

// ─── Token helpers ───────────────────────────────────────────────
const generateTokens = (payload: { id: string; email: string; role: UserRole; organizationId: string | null }) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  } as jwt.SignOptions);

  const refreshToken = jwt.sign({ id: payload.id }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── POST /api/auth/register ─────────────────────────────────────
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, role, organizationName, organizationType } = req.body;

    if (!email || !password || !name || !role) {
      throw new AppError('Email, password, name, and role are required.', 400);
    }

    if (!Object.values(UserRole).includes(role)) {
      throw new AppError(`Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}`, 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long.', 400);
    }

    const { rows } = await db.query('SELECT id FROM "User" WHERE email = $1', [email.toLowerCase()]);
    if (rows.length > 0) throw new AppError('An account with this email already exists.', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); 

    let organizationId: string | undefined;
    if (organizationName) {
      const orgId = uuidv4();
      await db.query(
        'INSERT INTO "Organization" (id, name, type, industry, "updatedAt") VALUES ($1, $2, $3, $4, NOW())',
        [orgId, organizationName, role, organizationType || null]
      );
      organizationId = orgId;
    }

    const userId = uuidv4();
    await db.query(
      `INSERT INTO "User" (id, email, "passwordHash", name, role, "otpCode", "otpExpiresAt", "organizationId", status, "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING_VERIFICATION', NOW())`,
      [userId, email.toLowerCase(), passwordHash, name, role, otp, otpExpiry, organizationId || null]
    );

    const user = { id: userId, email: email.toLowerCase(), name, role, organizationId, status: 'PENDING_VERIFICATION', createdAt: new Date() };

    // Send OTP via Resend
    await sendOTP(email.toLowerCase(), otp);

    const auditId = uuidv4();
    await db.query(
      `INSERT INTO "AuditLog" (id, "userId", action, entity, "entityId") VALUES ($1, $2, $3, $4, $5)`,
      [auditId, user.id, 'REGISTER', 'User', user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent.',
      user,
      ...(process.env.NODE_ENV === 'development' && { _devOtp: otp }),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/verify-otp ────────────────────────────────────
export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) throw new AppError('Email and OTP are required.', 400);

    const { rows } = await db.query('SELECT * FROM "User" WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];
    if (!user) throw new AppError('User not found.', 404);
    if (user.emailVerified) throw new AppError('Email already verified.', 400);

    if (!user.otpCode || user.otpCode !== otp) throw new AppError('Invalid OTP.', 400);
    if (!user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) throw new AppError('OTP expired. Request a new one.', 400);

    const { accessToken, refreshToken } = generateTokens({
      id: user.id, email: user.email, role: user.role, organizationId: user.organizationId,
    });

    await db.query(
      `UPDATE "User" SET "emailVerified" = true, "emailVerifiedAt" = NOW(), status = 'ACTIVE', "otpCode" = null, "otpExpiresAt" = null, "refreshToken" = $1, "refreshTokenExp" = $2, "lastLoginAt" = NOW(), "loginCount" = "loginCount" + 1, "updatedAt" = NOW() WHERE id = $3`,
      [refreshToken, new Date(Date.now() + 7 * 24 * 3600 * 1000), user.id]
    );

    res.json({
      success: true,
      message: 'Email verified. Welcome to IP COS!',
      accessToken,
      refreshToken,
      user: {
        id: user.id, email: user.email, name: user.name,
        role: user.role, organizationId: user.organizationId,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password are required.', 400);

    const { rows } = await db.query('SELECT * FROM "User" WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];

    if (!user) throw new AppError('Invalid email or password.', 401);

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) throw new AppError('Invalid email or password.', 401);

    if (!user.emailVerified) throw new AppError('Please verify your email before logging in.', 403);
    if (user.status === 'SUSPENDED') throw new AppError('Account suspended. Contact support@ipcos.in', 403);
    if (user.status === 'INACTIVE') throw new AppError('Account inactive.', 403);

    const { accessToken, refreshToken } = generateTokens({
      id: user.id, email: user.email, role: user.role, organizationId: user.organizationId,
    });

    await db.query(
      `UPDATE "User" SET "refreshToken" = $1, "refreshTokenExp" = $2, "lastLoginAt" = NOW(), "loginCount" = "loginCount" + 1, "updatedAt" = NOW() WHERE id = $3`,
      [refreshToken, new Date(Date.now() + 7 * 24 * 3600 * 1000), user.id]
    );

    let organization = null;
    if (user.organizationId) {
      const orgRes = await db.query('SELECT id, name, type FROM "Organization" WHERE id = $1', [user.organizationId]);
      organization = orgRes.rows[0];
    }

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id, email: user.email, name: user.name, role: user.role,
        avatar: user.avatar, organizationId: user.organizationId,
        organization,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/refresh ───────────────────────────────────────
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new AppError('Refresh token required.', 400);

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string };

    const { rows } = await db.query('SELECT id, email, role, "organizationId", "refreshToken", "refreshTokenExp", status FROM "User" WHERE id = $1', [decoded.id]);
    const user = rows[0];

    if (!user || user.refreshToken !== token) throw new AppError('Invalid refresh token.', 401);
    if (!user.refreshTokenExp || new Date(user.refreshTokenExp) < new Date()) throw new AppError('Refresh token expired.', 401);
    if (user.status !== 'ACTIVE') throw new AppError('Account is not active.', 403);

    const tokens = generateTokens({
      id: user.id, email: user.email, role: user.role, organizationId: user.organizationId,
    });

    await db.query(
      `UPDATE "User" SET "refreshToken" = $1, "refreshTokenExp" = $2, "updatedAt" = NOW() WHERE id = $3`,
      [tokens.refreshToken, new Date(Date.now() + 7 * 24 * 3600 * 1000), user.id]
    );

    res.json({ success: true, ...tokens });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/logout ────────────────────────────────────────
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      const decoded = jwt.decode(token) as { id?: string } | null;
      if (decoded?.id) {
        await db.query(
          `UPDATE "User" SET "refreshToken" = null, "refreshTokenExp" = null, "updatedAt" = NOW() WHERE id = $1 AND "refreshToken" = $2`,
          [decoded.id, token]
        );
      }
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/forgot-password ──────────────────────────────
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required.', 400);

    const { rows } = await db.query('SELECT id, email FROM "User" WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a reset OTP has been sent.' });
    }

    const otp = generateOTP();
    await db.query(
      `UPDATE "User" SET "otpCode" = $1, "otpExpiresAt" = $2, "updatedAt" = NOW() WHERE id = $3`,
      [otp, new Date(Date.now() + 15 * 60 * 1000), user.id]
    );

    // Send password reset email via Resend
    await sendPasswordReset(email.toLowerCase(), otp);

    res.json({
      success: true,
      message: 'If an account exists, a reset OTP has been sent.',
      ...(process.env.NODE_ENV === 'development' && { _devOtp: otp }),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/reset-password ───────────────────────────────
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) throw new AppError('Email, OTP, and new password are required.', 400);
    if (newPassword.length < 8) throw new AppError('Password must be at least 8 characters.', 400);

    const { rows } = await db.query('SELECT id, "otpCode", "otpExpiresAt" FROM "User" WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];
    
    if (!user) throw new AppError('Invalid request.', 400);
    if (!user.otpCode || user.otpCode !== otp) throw new AppError('Invalid or expired OTP.', 400);
    if (!user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) throw new AppError('OTP expired.', 400);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.query(
      `UPDATE "User" SET "passwordHash" = $1, "otpCode" = null, "otpExpiresAt" = null, "refreshToken" = null, "lastLoginAt" = NOW(), "loginCount" = "loginCount" + 1, "updatedAt" = NOW() WHERE id = $2`,
      [passwordHash, user.id]
    );

    await logAudit({
      userId: user.id, action: 'PASSWORD_RESET', entity: 'User', entityId: user.id,
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/resend-otp ────────────────────────────────────
export const resendOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required.', 400);

    const { rows } = await db.query('SELECT id, "emailVerified" FROM "User" WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];
    
    if (!user) return res.json({ success: true, message: 'OTP sent if account exists.' });
    if (user.emailVerified) throw new AppError('Email already verified.', 400);

    const otp = generateOTP();
    await db.query(
      `UPDATE "User" SET "otpCode" = $1, "otpExpiresAt" = $2, "updatedAt" = NOW() WHERE id = $3`,
      [otp, new Date(Date.now() + 15 * 60 * 1000), user.id]
    );

    // Resend OTP via Resend
    await sendOTP(email.toLowerCase(), otp);
    res.json({
      success: true,
      message: 'OTP resent.',
      ...(process.env.NODE_ENV === 'development' && { _devOtp: otp }),
    });
  } catch (err) {
    next(err);
  }
};
