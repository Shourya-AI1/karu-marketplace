import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BadgeCheck, MapPin, Star } from 'lucide-react';
import { db } from '@/lib/db';
import { listProducts } from '@/server/services/products';
import { ProductCard, type ProductCardData } from '@/components/commerce/product-card';
import { StaggerGroup } from '@/components/motion/reveal';
import { Reveal } from '@/components/motion/reveal';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await db.store.findUnique({ where: { slug } });
  if (!store) return { title: 'Store not found' };
  return {
    title: store.name,
    description: store.tagline ?? `Handcrafted pieces from ${store.name} on Karu.`,
  };
}

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await db.store.findUnique({ where: { slug } });
  if (!store || store.status !== 'ACTIVE') notFound();

  const result = await listProducts({ storeId: store.id, pageSize: 24 });

  return (
    <div className="pt-16">
      {/* Banner */}
      <div className="relative h-64 w-full bg-secondary md:h-80">
        {store.bannerUrl && (
          <Image src={store.bannerUrl} alt="" fill className="object-cover" priority sizes="100vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="container-wide -mt-20 relative">
        <Reveal className="flex flex-col items-start gap-6 md:flex-row md:items-end">
          <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-background bg-secondary shadow-xl">
            {store.logoUrl && (
              <Image src={store.logoUrl} alt="" fill className="object-cover" sizes="112px" />
            )}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-display-md font-bold">{store.name}</h1>
              {store.verified && <BadgeCheck className="h-6 w-6 text-champagne-500" />}
            </div>
            {store.tagline && <p className="mt-1 text-muted-foreground">{store.tagline}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {store.region && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {store.region}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-champagne-500 text-champagne-500" />
                {store.rating.toFixed(1)} ({store.ratingCount} reviews)
              </span>
              {store.craftType && <span>{store.craftType}</span>}
            </div>
          </div>
        </Reveal>

        {store.story && (
          <Reveal className="mt-10 max-w-3xl">
            <h2 className="mb-3 font-display text-lg font-semibold">Our story</h2>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{store.story}</p>
          </Reveal>
        )}

        <section className="mt-14 pb-24">
          <h2 className="mb-8 font-display text-xl font-semibold">
            The collection ({result.total})
          </h2>
          {result.items.length === 0 ? (
            <p className="text-muted-foreground">No products listed yet.</p>
          ) : (
            <StaggerGroup className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {(result.items as unknown as ProductCardData[]).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </StaggerGroup>
          )}
        </section>
      </div>
    </div>
  );
}
