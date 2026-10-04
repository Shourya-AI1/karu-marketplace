'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Plus,
  Store,
  ShieldCheck,
  Users,
  IndianRupee,
  Star,
  TrendingUp,
  Clock,
  type LucideIcon,
} from 'lucide-react';

// Icon names are passed as strings (serializable) from Server Components and
// resolved here in the client. Passing icon component functions across the
// server→client boundary is not allowed in Next.js 15.
export type IconName =
  | 'dashboard'
  | 'package'
  | 'orders'
  | 'plus'
  | 'store'
  | 'moderation'
  | 'users'
  | 'revenue'
  | 'rating'
  | 'trending'
  | 'clock';

const ICONS: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  package: Package,
  orders: ShoppingBag,
  plus: Plus,
  store: Store,
  moderation: ShieldCheck,
  users: Users,
  revenue: IndianRupee,
  rating: Star,
  trending: TrendingUp,
  clock: Clock,
};

function Icon({ name, className }: { name: IconName; className?: string }) {
  const Cmp = ICONS[name] ?? LayoutDashboard;
  return <Cmp className={className} />;
}

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

export function DashboardShell({
  title,
  subtitle,
  nav,
  children,
}: {
  title: string;
  subtitle?: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container-wide pt-28 pb-24">
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <nav className="space-y-1" aria-label="Dashboard">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== nav[0]?.href && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div>
          <header className="mb-10">
            <h1 className="text-display-md font-bold">{title}</h1>
            {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: IconName;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 lift">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-champagne-500/10 text-champagne-500">
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-bold tracking-tight">{value}</p>
      {delta && <p className="mt-1 text-xs text-emerald-500">{delta}</p>}
    </div>
  );
}

export function DataTable({
  columns,
  children,
  empty,
}: {
  columns: string[];
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              {columns.map((c) => (
                <th key={c} className="px-5 py-3.5 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">{children}</tbody>
        </table>
      </div>
      {empty && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No records to display yet.
        </div>
      )}
    </div>
  );
}
