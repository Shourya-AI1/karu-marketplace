'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { isAdmin, hasPermission } from '@/lib/rbac';
import { logAudit } from '@/server/services/audit';
import { requestRefund } from '@/server/services/refunds';
import { shipOrder } from '@/server/services/orders';

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) throw new Error('FORBIDDEN');
  return user;
}

export async function approveStoreAction(storeId: string) {
  const user = await requireAdmin();
  await db.store.update({
    where: { id: storeId },
    data: { status: 'ACTIVE', verified: true, kycStatus: 'VERIFIED' },
  });
  await logAudit({ actorId: user.id, action: 'store.approve', entity: 'Store', entityId: storeId });
  revalidatePath('/admin/sellers');
  return { ok: true as const };
}

export async function moderateProductAction(productId: string, decision: 'APPROVED' | 'REJECTED' | 'FLAGGED') {
  const user = await requireAdmin();
  await db.product.update({ where: { id: productId }, data: { moderation: decision } });
  await logAudit({ actorId: user.id, action: `product.moderate.${decision}`, entity: 'Product', entityId: productId });
  revalidatePath('/admin/moderation');
  return { ok: true as const };
}

export async function moderateReviewAction(reviewId: string, decision: 'APPROVED' | 'REJECTED') {
  const user = await requireAdmin();
  await db.review.update({ where: { id: reviewId }, data: { moderation: decision } });
  await logAudit({ actorId: user.id, action: `review.moderate.${decision}`, entity: 'Review', entityId: reviewId });
  revalidatePath('/admin/moderation');
  return { ok: true as const };
}

export async function suspendUserAction(userId: string) {
  const user = await requireAdmin();
  if (!hasPermission(user.role, 'user:moderate')) return { ok: false as const, error: 'FORBIDDEN' };
  await db.user.update({ where: { id: userId }, data: { status: 'SUSPENDED' } });
  await logAudit({ actorId: user.id, action: 'user.suspend', entity: 'User', entityId: userId });
  revalidatePath('/admin/users');
  return { ok: true as const };
}

export async function issueRefundAction(orderId: string, amount?: number, reason?: string) {
  const user = await requireAdmin();
  const refund = await requestRefund({ orderId, amount, reason });
  await logAudit({ actorId: user.id, action: 'order.refund', entity: 'Order', entityId: orderId });
  revalidatePath('/admin/orders');
  return { ok: true as const, refundId: refund.id };
}

export async function shipOrderAction(orderId: string, carrier: string, tracking: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: 'FORBIDDEN' };
  await shipOrder(orderId, carrier, tracking);
  await logAudit({ actorId: user.id, action: 'order.ship', entity: 'Order', entityId: orderId });
  revalidatePath('/seller/orders');
  return { ok: true as const };
}
