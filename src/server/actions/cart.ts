'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import {
  addToCart,
  updateCartItem,
  removeFromCart,
  getOrCreateCart,
  computeCartTotals,
} from '@/server/services/cart';
import { addToCartSchema } from '@/lib/validators';
import { track } from '@/server/services/audit';

export async function addToCartAction(input: {
  productId: string;
  variantId?: string;
  quantity?: number;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'SIGN_IN_REQUIRED' as const };

  const parsed = addToCartSchema.safeParse({ ...input, quantity: input.quantity ?? 1 });
  if (!parsed.success) return { ok: false, error: 'INVALID_INPUT' as const };

  await addToCart(user.id, parsed.data);
  await track('add_to_cart', { userId: user.id, entityId: input.productId });
  revalidatePath('/cart');
  const cart = await getOrCreateCart(user.id);
  return { ok: true as const, totals: computeCartTotals(cart) };
}

export async function updateCartItemAction(itemId: string, quantity: number) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'SIGN_IN_REQUIRED' as const };
  await updateCartItem(user.id, itemId, quantity);
  revalidatePath('/cart');
  const cart = await getOrCreateCart(user.id);
  return { ok: true as const, totals: computeCartTotals(cart) };
}

export async function removeCartItemAction(itemId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'SIGN_IN_REQUIRED' as const };
  await removeFromCart(user.id, itemId);
  revalidatePath('/cart');
  const cart = await getOrCreateCart(user.id);
  return { ok: true as const, totals: computeCartTotals(cart) };
}
