import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getOrCreateCart, computeCartTotals } from '@/server/services/cart';
import { CartView } from '@/components/commerce/cart-view';

export const metadata: Metadata = { title: 'Your Cart' };

export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?callbackUrl=/cart');

  const cart = await getOrCreateCart(user.id);
  const totals = computeCartTotals(cart);

  return (
    <div className="container-wide pt-32">
      <h1 className="mb-10 text-display-lg font-bold">Your Cart</h1>
      <CartView
        items={cart.items.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          product: {
            slug: i.product.slug,
            title: i.product.title,
            price: i.product.price,
            media: i.product.media,
            store: { name: i.product.store.name },
          },
        }))}
        totals={totals}
      />
    </div>
  );
}
