import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { formatPrice, formatDate } from '@/lib/utils';
import { DashboardShell, DataTable } from '@/components/dashboard/shell';
import { ADMIN_NAV } from '@/app/admin/page';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Orders · Admin' };

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DELIVERED: 'default',
  PAID: 'default',
  SHIPPED: 'secondary',
  PENDING: 'outline',
  CANCELLED: 'destructive',
  REFUNDED: 'destructive',
};

export default async function AdminOrders() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
  });

  return (
    <DashboardShell title="Orders" subtitle={`${orders.length} most recent orders`} nav={ADMIN_NAV}>
      <DataTable
        columns={['Order', 'Customer', 'Items', 'Total', 'Status', 'Date']}
        empty={orders.length === 0}
      >
        {orders.map((o) => (
          <tr key={o.id} className="hover:bg-secondary/40">
            <td className="px-5 py-4 font-mono text-xs">{o.orderNumber}</td>
            <td className="px-5 py-4 text-muted-foreground">{o.user.email}</td>
            <td className="px-5 py-4">{o._count.items}</td>
            <td className="px-5 py-4 font-medium">{formatPrice(o.total)}</td>
            <td className="px-5 py-4">
              <Badge variant={statusVariant[o.status] ?? 'outline'}>{o.status}</Badge>
            </td>
            <td className="px-5 py-4 text-muted-foreground">{formatDate(o.createdAt)}</td>
          </tr>
        ))}
      </DataTable>
    </DashboardShell>
  );
}
