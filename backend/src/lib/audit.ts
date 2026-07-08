import { prisma } from './prisma';

interface AuditLogOptions {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

export const logAudit = async (options: AuditLogOptions) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: options.userId,
        action: options.action,
        entity: options.entity,
        entityId: options.entityId,
        oldValue: options.oldValue || undefined,
        newValue: options.newValue || undefined,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
      }
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};
