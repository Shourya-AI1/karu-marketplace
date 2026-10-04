'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Heart, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { addToCartAction } from '@/server/actions/cart';
import { toggleWishlistAction } from '@/server/actions/products';
import { useCartUi } from '@/store/cart-store';
import { useUiSound } from '@/components/audio/audio-controller';

export function AddToCart({
  productId,
  inStock,
  initialWishlisted = false,
}: {
  productId: string;
  inStock: boolean;
  initialWishlisted?: boolean;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const { count, setCount } = useCartUi();
  const sound = useUiSound();

  function handleAdd() {
    startTransition(async () => {
      const res = await addToCartAction({ productId, quantity: qty });
      if (!res.ok) {
        if (res.error === 'SIGN_IN_REQUIRED') {
          toast.error('Please sign in to add items to your cart.');
          router.push('/sign-in?callbackUrl=/cart');
          return;
        }
        toast.error('Could not add to cart.');
        return;
      }
      sound('cart');
      setCount(res.totals?.count ?? count + qty);
      setAdded(true);
      toast.success('Added to your cart.');
      setTimeout(() => setAdded(false), 1800);
    });
  }

  function handleWishlist() {
    startTransition(async () => {
      const res = await toggleWishlistAction(productId);
      if (!res.ok) {
        toast.error('Please sign in to save items.');
        router.push('/sign-in');
        return;
      }
      setWishlisted(res.added);
      sound('wishlist');
      toast.success(res.added ? 'Saved to wishlist.' : 'Removed from wishlist.');
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-xl border border-border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-medium" aria-live="polite">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <Button
          variant="gold"
          size="lg"
          className="flex-1"
          onClick={handleAdd}
          disabled={pending || !inStock}
        >
          {pending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : added ? (
            <><Check className="h-5 w-5" /> Added</>
          ) : (
            <><ShoppingBag className="h-5 w-5" /> {inStock ? 'Add to cart' : 'Out of stock'}</>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14"
          onClick={handleWishlist}
          disabled={pending}
          aria-label="Toggle wishlist"
          aria-pressed={wishlisted}
        >
          <Heart className={wishlisted ? 'fill-champagne-500 text-champagne-500' : ''} />
        </Button>
      </div>
    </div>
  );
}
