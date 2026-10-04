'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Star, BadgeCheck } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { fadeUp } from '@/lib/motion';

export interface ProductCardData {
  id: string;
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  rating: number;
  ratingCount: number;
  media: { url: string; alt?: string | null }[];
  store: { name: string; slug: string; verified: boolean; region?: string | null };
  featured?: boolean;
}

export function ProductCard({ product, index = 0 }: { product: ProductCardData; index?: number }) {
  const img = product.media[0]?.url;
  const hoverImg = product.media[1]?.url ?? img;
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  return (
    <motion.article variants={fadeUp} className="group">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary lift">
          {img && (
            <>
              <Image
                src={img}
                alt={product.media[0]?.alt ?? product.title}
                fill
                sizes="(max-width:768px) 50vw, 25vw"
                className="object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-0"
                priority={index < 4}
              />
              <Image
                src={hoverImg}
                alt=""
                fill
                sizes="(max-width:768px) 50vw, 25vw"
                aria-hidden
                className="object-cover opacity-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-100"
              />
            </>
          )}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <div className="flex flex-col gap-1.5">
              {product.featured && <Badge variant="gold">Featured</Badge>}
              {discount > 0 && <Badge variant="destructive">−{discount}%</Badge>}
            </div>
            <button
              aria-label="Add to wishlist"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-background/70 opacity-0 backdrop-blur transition-all duration-300 hover:bg-background group-hover:opacity-100"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{product.store.name}</span>
            {product.store.verified && <BadgeCheck className="h-3.5 w-3.5 text-champagne-500" />}
          </div>
          <h3 className="line-clamp-1 font-medium leading-snug transition-colors group-hover:text-champagne-600 dark:group-hover:text-champagne-400">
            {product.title}
          </h3>
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-semibold">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            {product.ratingCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-champagne-500 text-champagne-500" />
                {product.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function ProductGrid({ products, className }: { products: ProductCardData[]; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4', className)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}
