import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getFeaturedProducts } from '@/server/services/products';
import { ProductCard, type ProductCardData } from '@/components/commerce/product-card';
import { Reveal, StaggerGroup } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

export async function FeaturedSection() {
  const products = await getFeaturedProducts(8);

  return (
    <section className="container-wide py-28">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <Reveal>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-champagne-500">
            Curated this week
          </p>
          <h2 className="text-display-lg font-bold">Treasures worth discovering.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <Link href="/discover">
            <Button variant="ghost" className="group">
              View all
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </Reveal>
      </div>

      <StaggerGroup className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {(products as unknown as ProductCardData[]).map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </StaggerGroup>
    </section>
  );
}
