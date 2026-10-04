'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { createProduct, updateProductRating } from '@/server/services/products';
import { productSchema, reviewSchema } from '@/lib/validators';
import { isSeller } from '@/lib/rbac';
import { logAudit } from '@/server/services/audit';
import { autoTag } from '@/lib/ai';

export async function createProductAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user || !isSeller(user.role)) return { ok: false as const, error: 'FORBIDDEN' };

  const store = await db.store.findUnique({ where: { ownerId: user.id } });
  if (!store) return { ok: false as const, error: 'NO_STORE' };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message };

  // Auto-tag if no tags provided.
  let tags = parsed.data.tags;
  if (!tags) {
    const auto = await autoTag({ title: parsed.data.title, description: parsed.data.description });
    tags = auto.join(',');
  }

  const product = await createProduct(store.id, { ...parsed.data, tags });
  await logAudit({ actorId: user.id, action: 'product.create', entity: 'Product', entityId: product.id });
  revalidatePath('/seller/products');
  return { ok: true as const, slug: product.slug };
}

export async function toggleWishlistAction(productId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: 'SIGN_IN_REQUIRED' };

  const existing = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath('/wishlist');
    return { ok: true as const, added: false };
  }
  await db.wishlistItem.create({ data: { userId: user.id, productId } });
  revalidatePath('/wishlist');
  return { ok: true as const, added: true };
}

export async function submitReviewAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: 'SIGN_IN_REQUIRED' };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message };

  // Verified purchase check.
  const purchased = await db.orderItem.findFirst({
    where: { productId: parsed.data.productId, order: { userId: user.id, status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] } } },
  });

  await db.review.upsert({
    where: { productId_userId: { productId: parsed.data.productId, userId: user.id } },
    create: {
      productId: parsed.data.productId,
      userId: user.id,
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body,
      verified: Boolean(purchased),
    },
    update: {
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body,
    },
  });

  await updateProductRating(parsed.data.productId);
  revalidatePath('/');
  return { ok: true as const };
}
