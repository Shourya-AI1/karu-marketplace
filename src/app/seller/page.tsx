import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { DashboardShell, StatCard, DataTable, type NavItem } from '@/components/dashboard/shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Seller Studio' };

export const SELLER_NAV: NavItem[] = [
  { href: '/seller', label: 'Overview', icon: 'dashboard' },
  { href: '/seller/products', label: 'Products', icon: 'package' },
  { href: '/seller/orders', label: 'Orders', icon: 'orders' },
  { href: '/seller/products/new', label: 'Add Product', icon: 'plus' },
];

export default async function SellerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?callbackUrl=/seller');

  const store = await db.store.findUnique({ where: { ownerId: user.id } });
  if (!store) {
    return (
      <DashboardShell title="Seller Studio" nav={SELLER_NAV}>
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <h2 className="font-display text-xl font-semibold">No store yet</h2>
          <p className="mt-2 text-muted-foreground">Set up your storefront to start selling.</p>
          <Link href="/sell" className="mt-6 inline-block">
            <Button>Create your store</Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const [productCount, activeCount, orderItems, recentOrders] = await Promise.all([
    db.product.count({ where: { storeId: store.id, deletedAt: null } }),
    db.product.count({ where: { storeId: store.id, status: 'ACTIVE', deletedAt: null } }),
    db.orderItem.findMany({ where: { storeId: store.id }, select: { price: true, quantity: true } }),
    db.orderItem.findMany({
      where: { storeId: store.id },
      orderBy: { order: { createdAt: 'desc' } },
      take: 6,
      include: { order: { select: { orderNumber: true, status: true, createdAt: true } } },
    }),
  ]);

  const revenue = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const unitsSold = orderItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <DashboardShell
      title={store.name}
      subtitle={
        store.status === 'ACTIVE'
          ? 'Your store is live and discoverable.'
          : `Status: ${store.status} — awaiting approval.`
      }
      nav={SELLER_NAV}
    >
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatPrice(revenue)} delta="lifetime gross" icon="revenue" />
        <StatCard label="Units sold" value={String(unitsSold)} icon="trending" />
        <StatCard label="Active products" value={`${activeCount}/${productCount}`} icon="package" />
        <StatCard
          label="Store rating"
          value={store.rating.toFixed(1)}
          delta={`${store.ratingCount} reviews`}
          icon="rating"
        />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Recent orders</h2>
        <Link href="/seller/orders">
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </Link>
      </div>

      <DataTable columns={['Order', 'Item', 'Qty', 'Total', 'Status']} empty={recentOrders.length === 0}>
        {recentOrders.map((it) => (
          <tr key={it.id} className="hover:bg-secondary/40">
            <td className="px-5 py-4 font-mono text-xs">{it.order.orderNumber}</td>
            <td className="px-5 py-4">{it.title}</td>
            <td className="px-5 py-4">{it.quantity}</td>
            <td className="px-5 py-4 font-medium">{formatPrice(it.price * it.quantity)}</td>
            <td className="px-5 py-4">
              <Badge variant="secondary">{it.fulfillment}</Badge>
            </td>
          </tr>
        ))}
      </DataTable>
    </DashboardShell>
  );
}
