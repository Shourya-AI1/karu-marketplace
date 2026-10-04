import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { listUserOrders } from '@/server/services/orders';
import { formatPrice, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'My Orders' };

const STATUS_VARIANT: Record<string, 'gold' | 'success' | 'secondary' | 'destructive'> = {
  CONFIRMED: 'gold',
  PROCESSING: 'gold',
  SHIPPED: 'gold',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  REFUNDED: 'destructive',
  PARTIALLY_REFUNDED: 'destructive',
  PENDING: 'secondary',
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?callbackUrl=/account/orders');

  const orders = await listUserOrders(user.id);

  return (
    <div className="container-wide pt-32">
      <h1 className="mb-10 text-display-lg font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <Package className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="font-display text-xl font-semibold">No orders yet</h2>
          <Link href="/discover" className="mt-6"><Button variant="gold">Start shopping</Button></Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
                <div>
                  <p className="font-mono text-sm font-medium">{o.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">Placed {formatDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[o.status] ?? 'secondary'}>{o.status.replace('_', ' ')}</Badge>
                  <span className="font-display text-lg font-semibold">{formatPrice(o.total)}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                {o.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-secondary">
                      {item.product.media[0]?.url && (
                        <Image src={item.product.media[0].url} alt={item.title} fill className="object-cover" sizes="56px" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              {o.trackingNumber && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Tracking: <span className="font-medium text-foreground">{o.trackingCarrier} · {o.trackingNumber}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
