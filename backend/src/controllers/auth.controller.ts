import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';
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

    // Validate required fields
    if (!email || !password || !name || !role) {
      throw new AppError('Email, password, name, and role are required.', 400);
    }

    if (!Object.values(UserRole).includes(role)) {
      throw new AppError(`Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}`, 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long.', 400);
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) throw new AppError('An account with this email already exists.', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create organization if needed
    let organizationId: string | undefined;
    if (organizationName) {
      const org = await prisma.organization.create({
        data: {
          name: organizationName,
          type: role as UserRole,
          ...(organizationType && { industry: organizationType }),
        },
      });
      organizationId = org.id;
    }

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: role as UserRole,
        otpCode: otp,
        otpExpiresAt: otpExpiry,
        ...(organizationId && { organizationId }),
      },
      select: {
        id: true, email: true, name: true, role: true,
        organizationId: true, status: true, createdAt: true,
      },
    });

    // Send OTP via Resend
    await sendOTP(email.toLowerCase(), otp);

    // Audit log
    await prisma.auditLog.create({
      data: { userId: user.id, action: 'REGISTER', entity: 'User', entityId: user.id },
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent.',
      user,
      // Only return OTP in dev for testing
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

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new AppError('User not found.', 404);
    if (user.emailVerified) throw new AppError('Email already verified.', 400);

    if (!user.otpCode || user.otpCode !== otp) throw new AppError('Invalid OTP.', 400);
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) throw new AppError('OTP expired. Request a new one.', 400);

    const { accessToken, refreshToken } = generateTokens({
      id: user.id, email: user.email, role: user.role, organizationId: user.organizationId,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        status: 'ACTIVE',
        otpCode: null,
        otpExpiresAt: null,
        refreshToken,
        refreshTokenExp: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    });

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

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { organization: { select: { id: true, name: true, type: true } } },
    });

    if (!user) throw new AppError('Invalid email or password.', 401);

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) throw new AppError('Invalid email or password.', 401);

    if (!user.emailVerified) throw new AppError('Please verify your email before logging in.', 403);
    if (user.status === 'SUSPENDED') throw new AppError('Account suspended. Contact support@ipcos.in', 403);
    if (user.status === 'INACTIVE') throw new AppError('Account inactive.', 403);

    const { accessToken, refreshToken } = generateTokens({
      id: user.id, email: user.email, role: user.role, organizationId: user.organizationId,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        refreshTokenExp: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    });

    await logAudit({
      userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id,
      ipAddress: req.ip, userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id, email: user.email, name: user.name, role: user.role,
        avatar: user.avatar, organizationId: user.organizationId,
        organization: user.organization,
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, organizationId: true, refreshToken: true, refreshTokenExp: true, status: true },
    });

    if (!user || user.refreshToken !== token) throw new AppError('Invalid refresh token.', 401);
    if (!user.refreshTokenExp || user.refreshTokenExp < new Date()) throw new AppError('Refresh token expired.', 401);
    if (user.status !== 'ACTIVE') throw new AppError('Account is not active.', 403);

    const tokens = generateTokens({
      id: user.id, email: user.email, role: user.role, organizationId: user.organizationId,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken, refreshTokenExp: new Date(Date.now() + 7 * 24 * 3600 * 1000) },
    });

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
        await prisma.user.updateMany({
          where: { id: decoded.id, refreshToken: token },
          data: { refreshToken: null, refreshTokenExp: null },
        });
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

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a reset OTP has been sent.' });
    }

    const otp = generateOTP();
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000) },
    });

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

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new AppError('Invalid request.', 400);
    if (!user.otpCode || user.otpCode !== otp) throw new AppError('Invalid or expired OTP.', 400);
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) throw new AppError('OTP expired.', 400);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        otpCode: null,
        otpExpiresAt: null,
        refreshToken: null,
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    });

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

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.json({ success: true, message: 'OTP sent if account exists.' });
    if (user.emailVerified) throw new AppError('Email already verified.', 400);

    const otp = generateOTP();
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000) },
    });

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
