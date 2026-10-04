import { Suspense } from 'react';
import { Hero } from '@/components/marketing/hero';
import { CraftMarquee } from '@/components/marketing/marquee';
import { FeaturedSection } from '@/components/marketing/featured-section';
import { StoryChapters } from '@/components/marketing/story-chapters';
import { CategoriesSection } from '@/components/marketing/categories-section';
import { TrustSection } from '@/components/marketing/trust-section';
import { CtaSection } from '@/components/marketing/cta-section';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CraftMarquee />
      <Suspense fallback={<SectionFallback />}>
        <FeaturedSection />
      </Suspense>
      <StoryChapters />
      <Suspense fallback={<SectionFallback />}>
        <CategoriesSection />
      </Suspense>
      <TrustSection />
      <CtaSection />
    </>
  );
}

function SectionFallback() {
  return (
    <div className="container-wide py-28">
      <Skeleton className="mb-14 h-12 w-72" />
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5]" />
        ))}
      </div>
    </div>
  );
}
