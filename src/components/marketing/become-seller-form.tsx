'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Store } from 'lucide-react';
import { becomeSellerAction } from '@/server/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function BecomeSellerForm({ userId, isSeller }: { userId: string | null; isSeller: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isSeller) {
    return (
      <Button size="lg" onClick={() => router.push('/seller')}>
        <Store className="mr-2 h-4 w-4" /> Go to your studio
      </Button>
    );
  }

  if (!userId) {
    return (
      <Button size="lg" onClick={() => router.push('/sign-in?callbackUrl=/sell')}>
        Sign in to start selling
      </Button>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 3) {
      setError('Store name must be at least 3 characters.');
      return;
    }
    startTransition(async () => {
      const res = await becomeSellerAction(userId!, name.trim());
      if (res.ok) {
        router.push('/seller');
        router.refresh();
      } else {
        setError('Could not create your store. Please try again.');
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your store name"
        className="h-12"
      />
      <Button type="submit" size="lg" disabled={pending} className="shrink-0">
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create store
      </Button>
      {error && <p className="text-sm text-destructive sm:absolute sm:mt-14">{error}</p>}
    </form>
  );
}
