import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatPrice, formatDate } from '@/lib/utils';
import { DashboardShell, DataTable } from '@/components/dashboard/shell';
import { SELLER_NAV } from '@/app/seller/page';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Orders · Seller Studio' };

export default async function SellerOrders() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?callbackUrl=/seller/orders');
  const store = await db.store.findUnique({ where: { ownerId: user.id } });
  if (!store) redirect('/sell');

  const items = await db.orderItem.findMany({
    where: { storeId: store.id },
    orderBy: { order: { createdAt: 'desc' } },
    include: {
      order: { select: { orderNumber: true, status: true, createdAt: true, shippingAddress: true } },
    },
  });

  return (
    <DashboardShell
      title="Orders"
      subtitle={`${items.length} line item(s) across all orders`}
      nav={SELLER_NAV}
    >
      <DataTable
        columns={['Order', 'Date', 'Item', 'Qty', 'Total', 'Fulfillment', 'Order status']}
        empty={items.length === 0}
      >
        {items.map((it) => (
          <tr key={it.id} className="hover:bg-secondary/40">
            <td className="px-5 py-4 font-mono text-xs">{it.order.orderNumber}</td>
            <td className="px-5 py-4 text-muted-foreground">{formatDate(it.order.createdAt)}</td>
            <td className="px-5 py-4">{it.title}</td>
            <td className="px-5 py-4">{it.quantity}</td>
            <td className="px-5 py-4 font-medium">{formatPrice(it.price * it.quantity)}</td>
            <td className="px-5 py-4">
              <Badge variant="secondary">{it.fulfillment}</Badge>
            </td>
            <td className="px-5 py-4">
              <Badge variant={it.order.status === 'DELIVERED' ? 'default' : 'outline'}>
                {it.order.status}
              </Badge>
            </td>
          </tr>
        ))}
      </DataTable>
    </DashboardShell>
  );
}
