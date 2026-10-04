import { db } from '@/lib/db';
import { createRefund } from '@/lib/payments';
import { sendEmail } from '@/lib/email';
import { refundEmail } from '@/emails/templates';
import { formatPrice } from '@/lib/utils';

export async function requestRefund(input: {
  orderId: string;
  amount?: number; // partial amount in paise; omit for full
  reason?: string;
}) {
  const order = await db.order.findUnique({
    where: { id: input.orderId },
    include: { payment: true, user: true, refunds: true },
  });
  if (!order || !order.payment?.razorpayPaymentId) throw new Error('ORDER_NOT_REFUNDABLE');

  const alreadyRefunded = order.refunds
    .filter((r) => r.status === 'COMPLETED')
    .reduce((s, r) => s + r.amount, 0);
  const refundable = order.total - alreadyRefunded;
  const amount = Math.min(input.amount ?? refundable, refundable);
  if (amount <= 0) throw new Error('NOTHING_TO_REFUND');

  const isPartial = amount < order.total;

  const rzp = await createRefund(order.payment.razorpayPaymentId, amount);

  const refund = await db.$transaction(async (tx) => {
    const r = await tx.refund.create({
      data: {
        orderId: order.id,
        amount,
        reason: input.reason,
        status: 'COMPLETED',
        razorpayRefundId: rzp.id,
        isPartial,
      },
    });
    await tx.payment.update({
      where: { orderId: order.id },
      data: { status: isPartial ? 'PARTIALLY_REFUNDED' : 'REFUNDED' },
    });
    await tx.order.update({
      where: { id: order.id },
      data: { status: isPartial ? 'PARTIALLY_REFUNDED' : 'REFUNDED' },
    });
    return r;
  });

  const mail = refundEmail({
    name: order.user.name ?? 'there',
    orderNumber: order.orderNumber,
    amount: formatPrice(amount),
    partial: isPartial,
  });
  await sendEmail({ to: order.user.email, ...mail, idempotencyKey: `refund-${refund.id}` });

  return refund;
}
