import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { DashboardShell, DataTable } from '@/components/dashboard/shell';
import { ADMIN_NAV } from '@/app/admin/page';
import { ApproveStoreButton } from '@/components/dashboard/admin-actions';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Sellers · Admin' };

export default async function AdminSellers() {
  const stores = await db.store.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: { owner: { select: { name: true, email: true } }, _count: { select: { products: true } } },
  });

  return (
    <DashboardShell title="Sellers" subtitle={`${stores.length} storefronts`} nav={ADMIN_NAV}>
      <DataTable
        columns={['Store', 'Owner', 'Products', 'KYC', 'Status', 'Joined', 'Action']}
        empty={stores.length === 0}
      >
        {stores.map((s) => (
          <tr key={s.id} className="hover:bg-secondary/40">
            <td className="px-5 py-4">
              <Link href={`/stores/${s.slug}`} className="font-medium hover:underline">
                {s.name}
              </Link>
              {s.verified && <span className="ml-2 text-xs text-champagne-500">verified</span>}
            </td>
            <td className="px-5 py-4 text-muted-foreground">{s.owner.email}</td>
            <td className="px-5 py-4">{s._count.products}</td>
            <td className="px-5 py-4">
              <Badge variant="secondary">{s.kycStatus}</Badge>
            </td>
            <td className="px-5 py-4">
              <Badge variant={s.status === 'ACTIVE' ? 'default' : 'outline'}>{s.status}</Badge>
            </td>
            <td className="px-5 py-4 text-muted-foreground">{formatDate(s.createdAt)}</td>
            <td className="px-5 py-4">
              {s.status !== 'ACTIVE' && <ApproveStoreButton storeId={s.id} />}
            </td>
          </tr>
        ))}
      </DataTable>
    </DashboardShell>
  );
}
