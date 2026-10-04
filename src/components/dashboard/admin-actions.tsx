'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Flag, Ban, Loader2 } from 'lucide-react';
import {
  approveStoreAction,
  moderateProductAction,
  moderateReviewAction,
  suspendUserAction,
} from '@/server/actions/admin';
import { Button } from '@/components/ui/button';

function useAction() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<unknown>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  return { pending, run };
}

export function ApproveStoreButton({ storeId }: { storeId: string }) {
  const { pending, run } = useAction();
  return (
    <Button size="sm" disabled={pending} onClick={() => run(() => approveStoreAction(storeId))}>
      {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
      Approve
    </Button>
  );
}

export function ModerateProductButtons({ productId }: { productId: string }) {
  const { pending, run } = useAction();
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run(() => moderateProductAction(productId, 'APPROVED'))}
      >
        <Check className="mr-1.5 h-3.5 w-3.5" /> Approve
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => run(() => moderateProductAction(productId, 'FLAGGED'))}
      >
        <Flag className="mr-1.5 h-3.5 w-3.5" /> Flag
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-destructive"
        disabled={pending}
        onClick={() => run(() => moderateProductAction(productId, 'REJECTED'))}
      >
        <X className="mr-1.5 h-3.5 w-3.5" /> Reject
      </Button>
    </div>
  );
}

export function ModerateReviewButtons({ reviewId }: { reviewId: string }) {
  const { pending, run } = useAction();
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => moderateReviewAction(reviewId, 'APPROVED'))}>
        <Check className="mr-1.5 h-3.5 w-3.5" /> Approve
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-destructive"
        disabled={pending}
        onClick={() => run(() => moderateReviewAction(reviewId, 'REJECTED'))}
      >
        <X className="mr-1.5 h-3.5 w-3.5" /> Reject
      </Button>
    </div>
  );
}

export function SuspendUserButton({ userId }: { userId: string }) {
  const { pending, run } = useAction();
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-destructive"
      disabled={pending}
      onClick={() => run(() => suspendUserAction(userId))}
    >
      {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Ban className="mr-1.5 h-3.5 w-3.5" />}
      Suspend
    </Button>
  );
}
