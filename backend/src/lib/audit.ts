import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

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
    await db.query(`
      INSERT INTO "AuditLog" (id, "userId", action, entity, "entityId", "oldValue", "newValue", "ipAddress", "userAgent", "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `, [
      uuidv4(), options.userId || null, options.action, options.entity || null, options.entityId || null, 
      options.oldValue ? JSON.stringify(options.oldValue) : null, options.newValue ? JSON.stringify(options.newValue) : null, 
      options.ipAddress || null, options.userAgent || null
    ]);
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};
