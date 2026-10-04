import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { BadgeCheck, MapPin, Star } from 'lucide-react';
import { db } from '@/lib/db';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion/reveal';

export const metadata: Metadata = {
  title: 'Artisan Stores',
  description: 'Meet the verified makers and studios behind every handcrafted piece on Karu.',
};

export default async function StoresPage() {
  const stores = await db.store.findMany({
    where: { status: 'ACTIVE', deletedAt: null },
    orderBy: [{ verified: 'desc' }, { rating: 'desc' }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="container-wide pt-32">
      <Reveal className="mb-14 max-w-2xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-champagne-500">
          The makers
        </p>
        <h1 className="text-display-lg font-bold">Artisan stores</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Every store is an independent studio, verified and stewarded by the hands behind the craft.
        </p>
      </Reveal>

      {stores.length === 0 ? (
        <p className="text-muted-foreground">No active stores yet.</p>
      ) : (
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((s) => (
            <StaggerItem key={s.id}>
              <Link
                href={`/stores/${s.slug}`}
                className="group block overflow-hidden rounded-2xl border border-border/60 bg-card lift"
              >
                <div className="relative aspect-[16/9] bg-secondary">
                  {s.bannerUrl && (
                    <Image
                      src={s.bannerUrl}
                      alt=""
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">{s.name}</h2>
                    {s.verified && <BadgeCheck className="h-4 w-4 text-champagne-500" />}
                  </div>
                  {s.tagline && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.tagline}</p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    {s.region && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {s.region}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-champagne-500 text-champagne-500" />
                      {s.rating.toFixed(1)}
                    </span>
                    <span>{s._count.products} pieces</span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
