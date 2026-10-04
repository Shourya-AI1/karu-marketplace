'use client';

import { useState, useTransition } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitReviewAction } from '@/server/actions/products';
import { cn } from '@/lib/utils';

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitReviewAction({
        productId,
        rating,
        title: String(form.get('title') ?? ''),
        body: String(form.get('body') ?? ''),
      });
      if (!res.ok) {
        toast.error(res.error === 'SIGN_IN_REQUIRED' ? 'Please sign in to review.' : res.error ?? 'Failed.');
        return;
      }
      toast.success('Thank you for your review!');
      (e.target as HTMLFormElement).reset();
      setRating(0);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
      <h3 className="font-display text-lg font-semibold">Share your experience</h3>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            aria-label={`${n} stars`}
            aria-checked={rating === n}
            role="radio"
          >
            <Star
              className={cn(
                'h-7 w-7 transition-colors',
                (hover || rating) >= n ? 'fill-champagne-500 text-champagne-500' : 'text-muted-foreground'
              )}
            />
          </button>
        ))}
      </div>
      <Input name="title" placeholder="Summarise your review (optional)" maxLength={120} />
      <Textarea name="body" placeholder="What did you love about this piece?" required minLength={5} />
      <Button type="submit" variant="gold" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit review'}
      </Button>
    </form>
  );
}
