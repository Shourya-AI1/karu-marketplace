import type { Metadata } from 'next';
import Link from 'next/link';
import { listProducts } from '@/server/services/products';
import { db } from '@/lib/db';
import { ProductGrid, type ProductCardData } from '@/components/commerce/product-card';
import { FilterBar } from '@/components/commerce/filters';
import { StaggerGroup } from '@/components/motion/reveal';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Discover Handcrafted Treasures',
  description: 'Browse thousands of handmade pieces from verified Indian artisans.',
};

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const [result, categories] = await Promise.all([
    listProducts({
      q: sp.q,
      category: sp.category,
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      sort: (sp.sort as any) ?? 'relevance',
      page: sp.page ? Number(sp.page) : 1,
      pageSize: 16,
    }),
    db.category.findMany({ where: { parentId: null }, select: { name: true, slug: true } }),
  ]);

  return (
    <div className="container-wide pt-32">
      <header className="mb-12">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-champagne-500">
          {sp.q ? `Results for "${sp.q}"` : 'The collection'}
        </p>
        <h1 className="text-display-lg font-bold">
          {sp.category
            ? categories.find((c) => c.slug === sp.category)?.name ?? 'Discover'
            : 'Discover'}
        </h1>
        <p className="mt-3 text-muted-foreground">{result.total} pieces · handcrafted with care</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <FilterBar categories={categories} />
        </aside>

        <div>
          {result.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
              <SearchX className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="font-display text-xl font-semibold">No pieces found</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Try adjusting your filters or exploring a different craft category.
              </p>
              <Link href="/discover" className="mt-6">
                <Button variant="outline">Clear filters</Button>
              </Link>
            </div>
          ) : (
            <StaggerGroup className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3">
              {(result.items as unknown as ProductCardData[]).map((p, i) => (
                <ProductCardWrapper key={p.id} product={p} index={i} />
              ))}
            </StaggerGroup>
          )}

          {result.totalPages > 1 && (
            <Pagination current={result.page} total={result.totalPages} sp={sp} />
          )}
        </div>
      </div>
    </div>
  );
}

import { ProductCard } from '@/components/commerce/product-card';
function ProductCardWrapper({ product, index }: { product: ProductCardData; index: number }) {
  return <ProductCard product={product} index={index} />;
}

function Pagination({
  current,
  total,
  sp,
}: {
  current: number;
  total: number;
  sp: Record<string, string | undefined>;
}) {
  const make = (page: number) => {
    const params = new URLSearchParams(sp as Record<string, string>);
    params.set('page', String(page));
    return `/discover?${params.toString()}`;
  };
  return (
    <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Pagination">
      {Array.from({ length: total }).map((_, i) => {
        const page = i + 1;
        return (
          <Link
            key={page}
            href={make(page)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm transition-colors ${
              page === current
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            {page}
          </Link>
        );
      })}
    </nav>
  );
}
