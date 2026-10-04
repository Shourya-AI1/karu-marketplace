'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const SORTS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export function FilterBar({
  categories,
}: {
  categories: { name: string; slug: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(key: string, value?: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    router.push(`${pathname}?${next.toString()}`);
  }

  const activeCat = params.get('category');
  const activeSort = params.get('sort') ?? 'relevance';

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="h-4 w-4 text-champagne-500" /> Categories
        </h3>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
          <button
            onClick={() => setParam('category')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm transition-colors',
              !activeCat ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
            )}
          >
            All crafts
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setParam('category', c.slug)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                activeCat === c.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Sort by</h3>
        <select
          value={activeSort}
          onChange={(e) => setParam('sort', e.target.value)}
          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Price range</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Under ₹1,500', max: '150000' },
            { label: '₹1,500–₹3,000', min: '150000', max: '300000' },
            { label: 'Over ₹3,000', min: '300000' },
          ].map((p) => (
            <button
              key={p.label}
              onClick={() => {
                const next = new URLSearchParams(params.toString());
                p.min ? next.set('minPrice', p.min) : next.delete('minPrice');
                p.max ? next.set('maxPrice', p.max) : next.delete('maxPrice');
                next.delete('page');
                router.push(`${pathname}?${next.toString()}`);
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-champagne-400/60 hover:text-foreground"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
