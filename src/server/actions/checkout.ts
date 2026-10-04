'use server';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { createOrderFromCart, confirmOrderPayment } from '@/server/services/orders';
import { verifyPaymentSignature, isMockMode } from '@/lib/payments';
import { addressSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

export async function createAddressAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: 'SIGN_IN_REQUIRED' };
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message };

  // first address becomes default
  const count = await db.address.count({ where: { userId: user.id } });
  const address = await db.address.create({
    data: { ...parsed.data, userId: user.id, isDefault: count === 0 },
  });
  revalidatePath('/checkout');
  return { ok: true as const, address };
}

export async function startCheckoutAction(addressId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: 'SIGN_IN_REQUIRED' };

  try {
    const order = await createOrderFromCart(user.id, addressId);
    return {
      ok: true as const,
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: order.razorpayOrderId,
      amount: order.total,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      mock: isMockMode,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'CHECKOUT_FAILED';
    return { ok: false as const, error: msg };
  }
}

export async function confirmPaymentAction(input: {
  orderId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  signature: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: 'SIGN_IN_REQUIRED' };

  const valid = verifyPaymentSignature({
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    signature: input.signature,
  });
  if (!valid) return { ok: false as const, error: 'INVALID_SIGNATURE' };

  const order = await confirmOrderPayment({
    orderId: input.orderId,
    razorpayPaymentId: input.razorpayPaymentId,
    signature: input.signature,
  });
  revalidatePath('/account/orders');
  return { ok: true as const, orderNumber: order?.orderNumber };
}
