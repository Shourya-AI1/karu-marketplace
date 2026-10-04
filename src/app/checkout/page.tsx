import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getOrCreateCart, computeCartTotals } from '@/server/services/cart';
import { CheckoutFlow } from '@/components/commerce/checkout-flow';

export const metadata: Metadata = { title: 'Checkout' };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?callbackUrl=/checkout');

  const cart = await getOrCreateCart(user.id);
  if (cart.items.length === 0) redirect('/cart');

  const totals = computeCartTotals(cart);
  const addresses = await db.address.findMany({ where: { userId: user.id } });

  return (
    <div className="container-wide pt-32">
      <h1 className="mb-10 text-display-lg font-bold">Checkout</h1>
      <CheckoutFlow addresses={addresses} totals={totals} />
    </div>
  );
}
