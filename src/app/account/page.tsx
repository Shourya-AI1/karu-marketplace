import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, Heart, MapPin, Award, ChevronRight, Settings } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatPrice, initials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Reveal } from '@/components/motion/reveal';

export const metadata: Metadata = { title: 'Your Account' };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?callbackUrl=/account');

  const [fullUser, orderCount, wishlistCount, recentOrders] = await Promise.all([
    db.user.findUnique({ where: { id: user.id } }),
    db.order.count({ where: { userId: user.id } }),
    db.wishlistItem.count({ where: { userId: user.id } }),
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { items: true },
    }),
  ]);

  const links = [
    { href: '/account/orders', icon: Package, label: 'My Orders', value: `${orderCount} orders` },
    { href: '/wishlist', icon: Heart, label: 'Wishlist', value: `${wishlistCount} saved` },
    { href: '/account/addresses', icon: MapPin, label: 'Addresses', value: 'Manage' },
    { href: '/support', icon: Settings, label: 'Support', value: 'Get help' },
  ];

  return (
    <div className="container-wide pt-32">
      <Reveal className="mb-12 flex items-center gap-5">
        <Avatar className="h-16 w-16 border border-border">
          {fullUser?.image && <AvatarImage src={fullUser.image} alt="" />}
          <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-display-lg font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full border border-champagne-400/40 bg-champagne-400/10 px-4 py-2">
          <Award className="h-5 w-5 text-champagne-500" />
          <span className="text-sm font-medium">{fullUser?.loyaltyPoints ?? 0} points</span>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group flex items-center justify-between rounded-2xl border border-border/60 bg-card p-6 lift"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-champagne-500/10 text-champagne-500">
                <l.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium">{l.label}</p>
                <p className="text-sm text-muted-foreground">{l.value}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      {recentOrders.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 font-display text-xl font-semibold">Recent orders</h2>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                href="/account/orders"
                className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-5 hover:border-champagne-400/40"
              >
                <div>
                  <p className="font-mono text-sm font-medium">{o.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{o.items.length} item(s) · {o.status}</p>
                </div>
                <span className="font-display font-semibold">{formatPrice(o.total)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
