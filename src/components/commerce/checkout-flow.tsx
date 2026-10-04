'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, CreditCard, CheckCircle2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  createAddressAction,
  startCheckoutAction,
  confirmPaymentAction,
} from '@/server/actions/checkout';
import { useUiSound } from '@/components/audio/audio-controller';

interface Address {
  id: string;
  fullName: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function CheckoutFlow({
  addresses,
  totals,
}: {
  addresses: Address[];
  totals: { subtotal: number; shipping: number; tax: number; total: number; count: number };
}) {
  const router = useRouter();
  const [step, setStep] = useState<'address' | 'payment' | 'done'>('address');
  const [selectedAddr, setSelectedAddr] = useState(addresses[0]?.id ?? '');
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [list, setList] = useState(addresses);
  const [pending, startTransition] = useTransition();
  const [orderNumber, setOrderNumber] = useState('');
  const sound = useUiSound();

  // Load Razorpay checkout script.
  useEffect(() => {
    if (window.Razorpay) return;
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  function addAddress(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createAddressAction(Object.fromEntries(form));
      if (!res.ok || !res.address) {
        toast.error(res.error ?? 'Could not save address.');
        return;
      }
      setList((l) => [...l, res.address as Address]);
      setSelectedAddr(res.address.id);
      setShowForm(false);
      toast.success('Address saved.');
    });
  }

  function proceed() {
    if (!selectedAddr) {
      toast.error('Please select an address.');
      return;
    }
    startTransition(async () => {
      const res = await startCheckoutAction(selectedAddr);
      if (!res.ok) {
        toast.error(humanizeError(res.error));
        return;
      }
      setStep('payment');
      launchRazorpay(res);
    });
  }

  function launchRazorpay(order: {
    orderId: string;
    razorpayOrderId?: string;
    amount: number;
    keyId?: string;
    mock?: boolean;
    orderNumber: string;
  }) {
    // Mock mode (no live keys) — simulate a successful payment so the
    // full flow is demonstrable locally.
    if (order.mock || !window.Razorpay) {
      confirm({
        orderId: order.orderId,
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        razorpayOrderId: order.razorpayOrderId ?? 'mock',
        signature: 'mock_signature',
      });
      return;
    }

    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: 'INR',
      name: 'Karu',
      description: `Order ${order.orderNumber}`,
      order_id: order.razorpayOrderId,
      theme: { color: '#cf9f3e' },
      handler: (response: any) => {
        confirm({
          orderId: order.orderId,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });
      },
      modal: { ondismiss: () => { setStep('address'); toast.info('Payment cancelled.'); } },
    });
    rzp.open();
  }

  function confirm(input: {
    orderId: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    signature: string;
  }) {
    startTransition(async () => {
      const res = await confirmPaymentAction(input);
      if (!res.ok) {
        toast.error('Payment verification failed.');
        setStep('address');
        return;
      }
      sound('success');
      setOrderNumber(res.orderNumber ?? '');
      setStep('done');
      router.refresh();
    });
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald/30 bg-emerald/5 py-20 text-center">
        <CheckCircle2 className="mb-4 h-16 w-16 text-emerald" />
        <h2 className="font-display text-2xl font-bold">Order confirmed!</h2>
        <p className="mt-2 text-muted-foreground">
          Your order <span className="font-mono font-medium text-foreground">{orderNumber}</span> is being prepared.
        </p>
        <div className="mt-7 flex gap-3">
          <Button variant="gold" onClick={() => router.push('/account/orders')}>Track order</Button>
          <Button variant="outline" onClick={() => router.push('/discover')}>Keep exploring</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <MapPin className="h-5 w-5 text-champagne-500" /> Shipping address
          </h2>

          {list.length > 0 && !showForm && (
            <div className="space-y-3">
              {list.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAddr(a.id)}
                  className={cn(
                    'w-full rounded-xl border p-4 text-left transition-colors',
                    selectedAddr === a.id ? 'border-champagne-500 bg-champagne-500/5' : 'border-border hover:border-foreground/20'
                  )}
                >
                  <p className="font-medium">{a.fullName}</p>
                  <p className="text-sm text-muted-foreground">{a.line1}, {a.city}, {a.state} — {a.postalCode}</p>
                </button>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" /> Add new address
              </Button>
            </div>
          )}

          {showForm && (
            <form onSubmit={addAddress} className="grid gap-3 sm:grid-cols-2">
              <Input name="fullName" placeholder="Full name" required className="sm:col-span-2" />
              <Input name="phone" placeholder="Phone" required />
              <Input name="postalCode" placeholder="PIN code" required />
              <Input name="line1" placeholder="Address line 1" required className="sm:col-span-2" />
              <Input name="line2" placeholder="Address line 2 (optional)" className="sm:col-span-2" />
              <Input name="city" placeholder="City" required />
              <Input name="state" placeholder="State" required />
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" variant="default" disabled={pending}>
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save address'}
                </Button>
                {list.length > 0 && (
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Payment</h2>
          <div className="mt-5 space-y-3 text-sm">
            <Row label={`Subtotal (${totals.count})`} value={formatPrice(totals.subtotal)} />
            <Row label="Shipping" value={totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)} />
            <Row label="Tax (GST)" value={formatPrice(totals.tax)} />
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <span className="font-medium">Total</span>
            <span className="font-display text-2xl font-bold">{formatPrice(totals.total)}</span>
          </div>
          <Button variant="gold" size="lg" className="mt-6 w-full" onClick={proceed} disabled={pending || !selectedAddr}>
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CreditCard className="h-5 w-5" /> Pay {formatPrice(totals.total)}</>}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Secured by Razorpay · UPI · Cards · Net Banking
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

function humanizeError(error?: string): string {
  if (!error) return 'Checkout failed.';
  if (error === 'CART_EMPTY') return 'Your cart is empty.';
  if (error.startsWith('OUT_OF_STOCK')) return `Out of stock: ${error.split(':')[1]}`;
  if (error === 'ADDRESS_NOT_FOUND') return 'Please select a valid address.';
  return 'Checkout failed. Please try again.';
}
