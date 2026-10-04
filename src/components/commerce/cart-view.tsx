'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { updateCartItemAction, removeCartItemAction } from '@/server/actions/cart';
import { useCartUi } from '@/store/cart-store';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    slug: string;
    title: string;
    price: number;
    media: { url: string }[];
    store: { name: string };
  };
}

export function CartView({
  items,
  totals,
}: {
  items: CartItem[];
  totals: { subtotal: number; shipping: number; tax: number; total: number; count: number };
}) {
  const [list, setList] = useState(items);
  const [t, setT] = useState(totals);
  const [pending, startTransition] = useTransition();
  const { setCount } = useCartUi();

  function update(id: string, qty: number) {
    startTransition(async () => {
      const res = await updateCartItemAction(id, qty);
      if (res.ok && res.totals) {
        setT(res.totals);
        setCount(res.totals.count);
        setList((l) =>
          qty <= 0 ? l.filter((i) => i.id !== id) : l.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
        );
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await removeCartItemAction(id);
      if (res.ok && res.totals) {
        setT(res.totals);
        setCount(res.totals.count);
        setList((l) => l.filter((i) => i.id !== id));
      }
    });
  }

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
        <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="font-display text-xl font-semibold">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">Discover something handcrafted to treasure.</p>
        <Link href="/discover" className="mt-6">
          <Button variant="gold">Start exploring</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5" aria-busy={pending}>
        {list.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-2xl border border-border/60 bg-card p-4">
            <Link href={`/product/${item.product.slug}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
              {item.product.media[0]?.url && (
                <Image src={item.product.media[0].url} alt={item.product.title} fill className="object-cover" sizes="96px" />
              )}
            </Link>
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{item.product.store.name}</p>
                  <Link href={`/product/${item.product.slug}`} className="font-medium hover:text-champagne-500">
                    {item.product.title}
                  </Link>
                </div>
                <button onClick={() => remove(item.id)} aria-label="Remove" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center rounded-lg border border-border">
                  <button onClick={() => update(item.id, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center" aria-label="Decrease">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => update(item.id, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center" aria-label="Increase">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="font-display font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <Row label={`Subtotal (${t.count} items)`} value={formatPrice(t.subtotal)} />
            <Row label="Shipping" value={t.shipping === 0 ? 'Free' : formatPrice(t.shipping)} />
            <Row label="Tax (GST)" value={formatPrice(t.tax)} />
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <span className="font-medium">Total</span>
            <span className="font-display text-2xl font-bold">{formatPrice(t.total)}</span>
          </div>
          <Link href="/checkout">
            <Button variant="gold" size="lg" className="mt-6 w-full group">
              Checkout <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Free shipping on orders over ₹2,000
          </p>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
