import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { DashboardShell, DataTable } from '@/components/dashboard/shell';
import { SELLER_NAV } from '@/app/seller/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Products · Seller Studio' };

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default',
  DRAFT: 'secondary',
  ARCHIVED: 'outline',
  OUT_OF_STOCK: 'destructive',
};

export default async function SellerProducts() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?callbackUrl=/seller/products');
  const store = await db.store.findUnique({ where: { ownerId: user.id } });
  if (!store) redirect('/sell');

  const products = await db.product.findMany({
    where: { storeId: store.id, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { media: { take: 1, orderBy: { position: 'asc' } }, inventory: true },
  });

  return (
    <DashboardShell
      title="Products"
      subtitle={`${products.length} item(s) in your catalogue`}
      nav={SELLER_NAV}
    >
      <div className="mb-6 flex justify-end">
        <Link href="/seller/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New product
          </Button>
        </Link>
      </div>

      <DataTable
        columns={['Product', 'Price', 'Stock', 'Status', 'Moderation']}
        empty={products.length === 0}
      >
        {products.map((p) => (
          <tr key={p.id} className="hover:bg-secondary/40">
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-secondary">
                  {p.media[0]?.url && (
                    <Image src={p.media[0].url} alt="" fill className="object-cover" sizes="48px" />
                  )}
                </div>
                <Link href={`/product/${p.slug}`} className="font-medium hover:underline">
                  {p.title}
                </Link>
              </div>
            </td>
            <td className="px-5 py-4 font-medium">{formatPrice(p.price)}</td>
            <td className="px-5 py-4">{p.inventory?.available ?? 0}</td>
            <td className="px-5 py-4">
              <Badge variant={statusVariant[p.status] ?? 'secondary'}>{p.status}</Badge>
            </td>
            <td className="px-5 py-4">
              <Badge variant={p.moderation === 'APPROVED' ? 'default' : 'secondary'}>
                {p.moderation}
              </Badge>
            </td>
          </tr>
        ))}
      </DataTable>
    </DashboardShell>
  );
}
