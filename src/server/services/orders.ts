import { db } from '@/lib/db';
import { getOrCreateCart, computeCartTotals, clearCart } from './cart';
import { createRazorpayOrder, generateIdempotencyKey } from '@/lib/payments';
import { sendEmail } from '@/lib/email';
import {
  orderConfirmationEmail,
  shippingUpdateEmail,
  refundEmail,
  sellerNewOrderEmail,
} from '@/emails/templates';
import { formatPrice } from '@/lib/utils';
import { track } from './audit';

function generateOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `KARU-${ymd}-${rand}`;
}

/**
 * Creates an order from the user's cart with inventory reservation.
 * Wrapped in a transaction to guarantee order/payment/inventory consistency.
 */
export async function createOrderFromCart(userId: string, addressId: string) {
  const cart = await getOrCreateCart(userId);
  if (cart.items.length === 0) throw new Error('CART_EMPTY');

  const address = await db.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new Error('ADDRESS_NOT_FOUND');

  const totals = computeCartTotals(cart);

  // Validate inventory availability up front.
  for (const item of cart.items) {
    const avail = item.product.inventory?.available ?? 0;
    if (avail < item.quantity) {
      throw new Error(`OUT_OF_STOCK:${item.product.title}`);
    }
  }

  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        status: 'PENDING',
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        shippingAddress: JSON.stringify(address),
        items: {
          create: cart.items.map((i) => ({
            productId: i.productId,
            storeId: i.product.storeId,
            title: i.product.title,
            price: i.product.price,
            quantity: i.quantity,
            variantInfo: i.variantId ?? null,
          })),
        },
      },
      include: { items: true },
    });

    // Reserve inventory.
    for (const item of cart.items) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: {
          available: { decrement: item.quantity },
          reserved: { increment: item.quantity },
        },
      });
    }

    // Create payment record + Razorpay order.
    const rzpOrder = await createRazorpayOrder(totals.total, 'INR', created.orderNumber);
    await tx.payment.create({
      data: {
        orderId: created.id,
        razorpayOrderId: rzpOrder.id,
        amount: totals.total,
        status: 'CREATED',
        idempotencyKey: generateIdempotencyKey('pay'),
      },
    });

    return { ...created, razorpayOrderId: rzpOrder.id };
  });

  await track('order_created', { userId, entityId: order.id, metadata: { total: totals.total } });
  return order;
}

/**
 * Confirms payment after client-side verification. Idempotent — repeat
 * calls (webhook + client) won't double-process.
 */
export async function confirmOrderPayment(input: {
  orderId: string;
  razorpayPaymentId: string;
  signature?: string;
}) {
  const order = await db.order.findUnique({
    where: { id: input.orderId },
    include: { payment: true, items: true, user: true },
  });
  if (!order) throw new Error('ORDER_NOT_FOUND');
  if (order.status === 'PAID' || order.status === 'CONFIRMED') return order; // idempotent

  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { orderId: order.id },
      data: {
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.signature,
        status: 'CAPTURED',
      },
    });
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED' },
    });
    // Convert reserved → consumed.
    for (const item of order.items) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: { reserved: { decrement: item.quantity } },
      });
    }
  });

  await clearCart(order.userId);

  // Buyer confirmation email (idempotent).
  const conf = orderConfirmationEmail({
    name: order.user.name ?? 'there',
    orderNumber: order.orderNumber,
    total: formatPrice(order.total),
    items: order.items.map((i) => ({
      title: i.title,
      qty: i.quantity,
      price: formatPrice(i.price * i.quantity),
    })),
  });
  await sendEmail({
    to: order.user.email,
    ...conf,
    idempotencyKey: `order-conf-${order.id}`,
  });

  // Seller notifications grouped by store.
  const storeIds = [...new Set(order.items.map((i) => i.storeId))];
  for (const storeId of storeIds) {
    const store = await db.store.findUnique({
      where: { id: storeId },
      include: { owner: true },
    });
    if (store) {
      const items = order.items.filter((i) => i.storeId === storeId);
      const mail = sellerNewOrderEmail({
        storeName: store.name,
        orderNumber: order.orderNumber,
        itemCount: items.length,
      });
      await sendEmail({
        to: store.owner.email,
        ...mail,
        idempotencyKey: `seller-order-${order.id}-${storeId}`,
      });
    }
  }

  await track('purchase', { userId: order.userId, entityId: order.id, metadata: { total: order.total } });
  return db.order.findUnique({ where: { id: order.id }, include: { items: true, payment: true } });
}

export async function listUserOrders(userId: string) {
  return db.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: { include: { media: { take: 1 } } } } },
      payment: true,
      refunds: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function shipOrder(orderId: string, carrier: string, tracking: string) {
  const order = await db.order.update({
    where: { id: orderId },
    data: { status: 'SHIPPED', trackingCarrier: carrier, trackingNumber: tracking },
    include: { user: true },
  });
  const mail = shippingUpdateEmail({
    name: order.user.name ?? 'there',
    orderNumber: order.orderNumber,
    carrier,
    tracking,
  });
  await sendEmail({ to: order.user.email, ...mail, idempotencyKey: `ship-${order.id}` });
  return order;
}

export async function markDelivered(orderId: string) {
  return db.order.update({ where: { id: orderId }, data: { status: 'DELIVERED' } });
}
