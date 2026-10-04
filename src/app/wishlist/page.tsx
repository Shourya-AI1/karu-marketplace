import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProductCard, type ProductCardData } from '@/components/commerce/product-card';
import { StaggerGroup } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Your Wishlist' };

const PRODUCT_INCLUDE = {
  media: { orderBy: { position: 'asc' } as const },
  store: { select: { id: true, name: true, slug: true, verified: true, region: true } },
} as const;

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?callbackUrl=/wishlist');

  const items = await db.wishlistItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { product: { include: PRODUCT_INCLUDE } },
  });

  const products = items
    .map((i) => i.product)
    .filter(Boolean) as unknown as ProductCardData[];

  return (
    <div className="container-wide pt-32">
      <header className="mb-12">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-champagne-500">
          Saved for later
        </p>
        <h1 className="text-display-lg font-bold">Your Wishlist</h1>
        <p className="mt-3 text-muted-foreground">{products.length} piece(s) you love</p>
      </header>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="font-display text-xl font-semibold">Nothing saved yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Tap the heart on any piece to keep it here for later.
          </p>
          <Link href="/discover" className="mt-6">
            <Button>Explore the collection</Button>
          </Link>
        </div>
      ) : (
        <StaggerGroup className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
