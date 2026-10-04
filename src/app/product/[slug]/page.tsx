import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, BadgeCheck, Truck, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { getProductBySlug, getRelatedProducts } from '@/server/services/products';
import { summarizeReviews } from '@/lib/ai';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatPrice, parseTags, formatDate, initials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProductGallery } from '@/components/commerce/product-gallery';
import { AddToCart } from '@/components/commerce/add-to-cart';
import { ReviewForm } from '@/components/commerce/review-form';
import { ProductCard, type ProductCardData } from '@/components/commerce/product-card';
import { Reveal } from '@/components/motion/reveal';
import { ProductViewerLazy } from '@/components/three/product-viewer-lazy';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Not found' };
  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      images: product.media[0]?.url ? [{ url: product.media[0].url }] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, user] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId),
    getCurrentUser(),
  ]);

  const wishlisted = user
    ? Boolean(
        await db.wishlistItem.findUnique({
          where: { userId_productId: { userId: user.id, productId: product.id } },
        })
      )
    : false;

  const aiSummary = await summarizeReviews(product.reviews.map((r) => r.body));
  const inStock = (product.inventory?.available ?? 0) > 0;
  const tags = parseTags(product.tags);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.media.map((m) => m.url),
    brand: { '@type': 'Brand', name: product.store.name },
    aggregateRating:
      product.ratingCount > 0
        ? { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.ratingCount }
        : undefined,
    offers: {
      '@type': 'Offer',
      price: (product.price / 100).toFixed(2),
      priceCurrency: 'INR',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="container-wide pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/discover" className="hover:text-foreground">Discover</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/discover?category=${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <ProductGallery media={product.media} title={product.title} />
          <ProductViewerLazy color="#cf9f3e" />
        </div>

        <div className="lg:sticky lg:top-28 lg:h-fit">
          <Link
            href={`/stores/${product.store.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {product.store.name}
            {product.store.verified && <BadgeCheck className="h-4 w-4 text-champagne-500" />}
          </Link>

          <h1 className="mt-2 font-display text-display-lg font-bold leading-tight">{product.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            {product.ratingCount > 0 && (
              <span className="flex items-center gap-1.5 text-sm">
                <Star className="h-4 w-4 fill-champagne-500 text-champagne-500" />
                <span className="font-medium">{product.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({product.ratingCount} reviews)</span>
              </span>
            )}
            {product.store.region && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {product.store.region}
              </span>
            )}
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {product.customizable && <Badge variant="gold">Customizable</Badge>}
            {product.bulkAvailable && <Badge variant="secondary">Bulk orders</Badge>}
            {tags.slice(0, 4).map((t) => (
              <Badge key={t} variant="outline" className="capitalize">{t}</Badge>
            ))}
          </div>

          <Separator className="my-7" />

          <AddToCart productId={product.id} inStock={inStock} initialWishlisted={wishlisted} />

          <div className="mt-7 grid grid-cols-3 gap-4 text-center">
            <Trust icon={<Truck className="h-5 w-5" />} label={`Ships in ${product.leadTimeDays}d`} />
            <Trust icon={<ShieldCheck className="h-5 w-5" />} label="Verified maker" />
            <Trust icon={<Sparkles className="h-5 w-5" />} label="Handcrafted" />
          </div>

          {product.story && (
            <div className="mt-7 rounded-2xl border border-border/60 bg-secondary/40 p-5">
              <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-champagne-500">
                The Story
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{product.story}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-24" id="reviews">
        <Reveal>
          <h2 className="text-display-lg font-bold">Reviews</h2>
        </Reveal>

        <div className="mt-6 rounded-2xl border border-champagne-400/30 bg-champagne-400/5 p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-champagne-700 dark:text-champagne-300">
            <Sparkles className="h-4 w-4" /> AI Review Summary
          </p>
          <p className="mt-2 text-muted-foreground">{aiSummary}</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {product.reviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet. Be the first to share your experience.</p>
            ) : (
              product.reviews.map((r) => (
                <div key={r.id} className="border-b border-border/40 pb-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback>{initials(r.user.name)}</AvatarFallback></Avatar>
                    <div>
                      <p className="text-sm font-medium">{r.user.name ?? 'Anonymous'}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-champagne-500 text-champagne-500' : 'text-muted-foreground/30'}`}
                            />
                          ))}
                        </div>
                        {r.verified && <Badge variant="success" className="text-[10px]">Verified purchase</Badge>}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                  </div>
                  {r.title && <p className="mt-3 font-medium">{r.title}</p>}
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                </div>
              ))
            )}
          </div>
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <ReviewForm productId={product.id} />
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-10 text-display-lg font-bold">You may also love</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {(related as unknown as ProductCardData[]).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border/50 py-4">
      <span className="text-champagne-500">{icon}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
