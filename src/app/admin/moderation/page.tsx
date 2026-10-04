import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { DashboardShell } from '@/components/dashboard/shell';
import { ADMIN_NAV } from '@/app/admin/page';
import { ModerateProductButtons, ModerateReviewButtons } from '@/components/dashboard/admin-actions';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Moderation · Admin' };

export default async function AdminModeration() {
  const [products, reviews] = await Promise.all([
    db.product.findMany({
      where: { moderation: { in: ['PENDING', 'FLAGGED'] }, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { media: { take: 1, orderBy: { position: 'asc' } }, store: { select: { name: true } } },
      take: 50,
    }),
    db.review.findMany({
      where: { moderation: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } }, product: { select: { title: true, slug: true } } },
      take: 50,
    }),
  ]);

  return (
    <DashboardShell title="Moderation queue" subtitle="Keep the marketplace trustworthy." nav={ADMIN_NAV}>
      <section className="mb-12">
        <h2 className="mb-4 font-display text-lg font-semibold">
          Products ({products.length})
        </h2>
        {products.length === 0 ? (
          <EmptyState label="No products awaiting moderation." />
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-card p-4"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-secondary">
                  {p.media[0]?.url && (
                    <Image src={p.media[0].url} alt="" fill className="object-cover" sizes="64px" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${p.slug}`} className="font-medium hover:underline">
                    {p.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {p.store.name} · {formatPrice(p.price)}
                  </p>
                </div>
                <Badge variant="secondary">{p.moderation}</Badge>
                <ModerateProductButtons productId={p.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <EmptyState label="No reviews awaiting moderation." />
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border/60 bg-card p-4">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="text-sm">
                    <span className="font-medium">{r.user.name}</span> on{' '}
                    <Link href={`/product/${r.product.slug}`} className="hover:underline">
                      {r.product.title}
                    </Link>
                  </p>
                  <Badge variant="outline">{r.rating}★</Badge>
                </div>
                {r.title && <p className="font-medium">{r.title}</p>}
                <p className="mb-3 text-sm text-muted-foreground">{r.body}</p>
                <ModerateReviewButtons reviewId={r.id} />
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
      <ShieldCheck className="mb-3 h-8 w-8" />
      {label}
    </div>
  );
}
