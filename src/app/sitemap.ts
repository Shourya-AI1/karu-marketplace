import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/discover',
    '/stores',
    '/sell',
    '/about',
    '/support',
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  try {
    const [products, stores, campaigns] = await Promise.all([
      db.product.findMany({
        where: { status: 'ACTIVE', moderation: 'APPROVED', deletedAt: null },
        select: { slug: true, updatedAt: true },
        take: 1000,
      }),
      db.store.findMany({
        where: { status: 'ACTIVE', deletedAt: null },
        select: { slug: true, updatedAt: true },
        take: 500,
      }),
      db.campaign.findMany({ select: { slug: true, createdAt: true }, take: 100 }),
    ]);

    return [
      ...staticRoutes,
      ...products.map((p) => ({
        url: `${BASE}/product/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...stores.map((s) => ({
        url: `${BASE}/stores/${s.slug}`,
        lastModified: s.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
      ...campaigns.map((c) => ({
        url: `${BASE}/campaigns/${c.slug}`,
        lastModified: c.createdAt,
        changeFrequency: 'daily' as const,
        priority: 0.5,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
