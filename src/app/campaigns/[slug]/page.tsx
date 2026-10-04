import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/db';
import { ProductCard, type ProductCardData } from '@/components/commerce/product-card';
import { StaggerGroup } from '@/components/motion/reveal';
import { Reveal } from '@/components/motion/reveal';

const PRODUCT_INCLUDE = {
  media: { orderBy: { position: 'asc' } as const },
  store: { select: { id: true, name: true, slug: true, verified: true, region: true } },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await db.campaign.findUnique({ where: { slug } });
  if (!campaign) return { title: 'Campaign not found' };
  return {
    title: campaign.headline ?? campaign.name,
    description: campaign.description ?? `Shop the ${campaign.name} collection on Karu.`,
  };
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await db.campaign.findUnique({ where: { slug } });
  if (!campaign) notFound();

  const ids = campaign.productIds
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const products =
    ids.length > 0
      ? await db.product.findMany({
          where: { id: { in: ids }, status: 'ACTIVE', deletedAt: null },
          include: PRODUCT_INCLUDE,
        })
      : await db.product.findMany({
          where: { status: 'ACTIVE', moderation: 'APPROVED', featured: true, deletedAt: null },
          include: PRODUCT_INCLUDE,
          take: 12,
        });

  return (
    <div className="pt-16">
      <section className="relative flex min-h-[60vh] items-center overflow-hidden">
        {campaign.heroImage && (
          <Image
            src={campaign.heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="container-wide relative">
          <Reveal className="max-w-2xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-champagne-400">
              {campaign.theme} edit
            </p>
            <h1 className="text-display-xl font-bold leading-[1.05]">
              {campaign.headline ?? campaign.name}
            </h1>
            {campaign.description && (
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {campaign.description}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      <section className="container-wide py-20">
        <h2 className="mb-10 font-display text-xl font-semibold">Curated for the occasion</h2>
        {products.length === 0 ? (
          <p className="text-muted-foreground">This collection is being curated. Check back soon.</p>
        ) : (
          <StaggerGroup className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {(products as unknown as ProductCardData[]).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </StaggerGroup>
        )}
      </section>
    </div>
  );
}
