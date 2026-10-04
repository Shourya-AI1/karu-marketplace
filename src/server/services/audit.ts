import { db } from '@/lib/db';

export async function logAudit(input: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
  userAgent?: string;
}) {
  try {
    await db.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        before: input.before ? JSON.stringify(input.before) : null,
        after: input.after ? JSON.stringify(input.after) : null,
        ip: input.ip,
        userAgent: input.userAgent,
      },
    });
  } catch (e) {
    console.error('[audit:error]', e);
  }
}

export async function track(type: string, opts?: {
  userId?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await db.analyticsEvent.create({
      data: {
        type,
        userId: opts?.userId,
        entityId: opts?.entityId,
        metadata: opts?.metadata ? JSON.stringify(opts.metadata) : null,
      },
    });
  } catch (e) {
    console.error('[analytics:error]', e);
  }
}
