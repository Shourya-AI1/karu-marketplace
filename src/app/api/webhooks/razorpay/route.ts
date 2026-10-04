import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/payments';
import { confirmOrderPayment } from '@/server/services/orders';
import { db } from '@/lib/db';
import { logAudit } from '@/server/services/audit';

/**
 * Razorpay webhook handler.
 * - Verifies HMAC signature before processing.
 * - Idempotent: confirmOrderPayment no-ops on already-confirmed orders.
 * - Handles payment.captured and payment.failed events.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Bad payload' }, { status: 400 });
  }

  const type = event.event as string;
  const entity = event.payload?.payment?.entity;

  try {
    if (type === 'payment.captured' && entity) {
      const payment = await db.payment.findFirst({
        where: { razorpayOrderId: entity.order_id },
      });
      if (payment) {
        await confirmOrderPayment({
          orderId: payment.orderId,
          razorpayPaymentId: entity.id,
        });
      }
    } else if (type === 'payment.failed' && entity) {
      const payment = await db.payment.findFirst({
        where: { razorpayOrderId: entity.order_id },
      });
      if (payment) {
        await db.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
        await db.order.update({ where: { id: payment.orderId }, data: { status: 'CANCELLED' } });
      }
    }
    await logAudit({ action: `webhook.${type}`, entity: 'Payment', entityId: entity?.id });
  } catch (e) {
    console.error('[webhook:error]', e);
    return NextResponse.json({ received: true, processed: false }, { status: 200 });
  }

  return NextResponse.json({ received: true });
}
