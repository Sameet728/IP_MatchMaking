import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AppError } from './errorHandler';
import { UserRole } from '@prisma/client';

// Extend Request type to include user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    organizationId: string | null;
  };
}

// ─── Verify JWT token ────────────────────────────────────────────
export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided. Please log in.', 401);
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET!;

    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: UserRole;
      organizationId: string | null;
    };

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, organizationId: true, status: true },
    });

    if (!user) throw new AppError('User no longer exists.', 401);
    if (user.status === 'SUSPENDED') throw new AppError('Account suspended. Contact support.', 403);
    if (user.status === 'INACTIVE') throw new AppError('Account inactive.', 403);

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    next();
  } catch (err) {
    next(err);
  }
};

// ─── Role-based access control ───────────────────────────────────
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Access denied. Required role: ${roles.join(' or ')}.`, 403));
    }
    next();
  };
};

// ─── Admin only shorthand ────────────────────────────────────────
export const requireAdmin = requireRole(UserRole.ADMIN);

// ─── Optional auth (public + private endpoints) ──────────────────
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: UserRole; organizationId: string | null };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, organizationId: true },
    });

    if (user) req.user = user;
    next();
  } catch {
    // Ignore invalid tokens for optional auth
    next();
  }
};
