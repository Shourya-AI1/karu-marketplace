import { db } from '@/lib/db';

const CART_INCLUDE = {
  items: {
    include: {
      product: {
        include: {
          media: { orderBy: { position: 'asc' as const }, take: 1 },
          store: { select: { name: true, slug: true } },
          inventory: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

export async function getOrCreateCart(userId: string) {
  let cart = await db.cart.findUnique({ where: { userId }, include: CART_INCLUDE });
  if (!cart) {
    cart = await db.cart.create({ data: { userId }, include: CART_INCLUDE });
  }
  return cart;
}

export async function addToCart(
  userId: string,
  input: { productId: string; variantId?: string; quantity: number; notes?: string }
) {
  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find(
    (i) => i.productId === input.productId && i.variantId === (input.variantId ?? null)
  );
  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + input.quantity },
    });
  } else {
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId: input.productId,
        variantId: input.variantId,
        quantity: input.quantity,
        notes: input.notes,
      },
    });
  }
  return getOrCreateCart(userId);
}

export async function updateCartItem(userId: string, itemId: string, quantity: number) {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => i.id === itemId);
  if (!item) throw new Error('Item not found');
  if (quantity <= 0) {
    await db.cartItem.delete({ where: { id: itemId } });
  } else {
    await db.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }
  return getOrCreateCart(userId);
}

export async function removeFromCart(userId: string, itemId: string) {
  const cart = await getOrCreateCart(userId);
  if (cart.items.some((i) => i.id === itemId)) {
    await db.cartItem.delete({ where: { id: itemId } });
  }
  return getOrCreateCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  await db.cartItem.deleteMany({ where: { cartId: cart.id } });
}

export function computeCartTotals(cart: Awaited<ReturnType<typeof getOrCreateCart>>) {
  const subtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = subtotal > 200000 || subtotal === 0 ? 0 : 5900; // free over ₹2000
  const tax = Math.round(subtotal * 0.03); // 3% indicative GST handling
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total, count: cart.items.reduce((s, i) => s + i.quantity, 0) };
}
