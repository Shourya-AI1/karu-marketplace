import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { DashboardShell, StatCard, type NavItem } from '@/components/dashboard/shell';

export const metadata: Metadata = { title: 'Admin · Karu' };

export const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: 'dashboard' },
  { href: '/admin/sellers', label: 'Sellers', icon: 'store' },
  { href: '/admin/moderation', label: 'Moderation', icon: 'moderation' },
  { href: '/admin/users', label: 'Users', icon: 'users' },
  { href: '/admin/orders', label: 'Orders', icon: 'orders' },
];

export default async function AdminDashboard() {
  const [users, stores, products, orders, pendingStores, pendingProducts, paidOrders] =
    await Promise.all([
      db.user.count(),
      db.store.count(),
      db.product.count({ where: { deletedAt: null } }),
      db.order.count(),
      db.store.count({ where: { status: 'PENDING_REVIEW' } }),
      db.product.count({ where: { moderation: 'PENDING' } }),
      db.order.findMany({ where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } }, select: { total: true } }),
    ]);

  const gmv = paidOrders.reduce((s, o) => s + o.total, 0);

  return (
    <DashboardShell
      title="Platform overview"
      subtitle="Marketplace health at a glance."
      nav={ADMIN_NAV}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="GMV" value={formatPrice(gmv)} delta={`${paidOrders.length} paid orders`} icon="revenue" />
        <StatCard label="Users" value={String(users)} icon="users" />
        <StatCard label="Stores" value={String(stores)} icon="store" />
        <StatCard label="Products" value={String(products)} icon="package" />
        <StatCard label="Total orders" value={String(orders)} icon="orders" />
        <StatCard label="Stores pending approval" value={String(pendingStores)} delta="needs review" icon="clock" />
        <StatCard label="Products in moderation" value={String(pendingProducts)} delta="needs review" icon="moderation" />
      </div>
    </DashboardShell>
  );
}
