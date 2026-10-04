'use client';

import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this would report to Sentry / OpenTelemetry.
    console.error('[app:error]', error);
  }, [error]);

  return (
    <div className="container-wide flex min-h-[70vh] flex-col items-center justify-center pt-32 text-center">
      <p className="font-display text-[6rem] font-bold leading-none text-burgundy-500">Oops</p>
      <h1 className="mt-2 text-display-md font-bold">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        We hit an unexpected snag. Our team has been notified. You can try again.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">ref: {error.digest}</p>
      )}
      <Button size="lg" className="mt-8" onClick={reset}>
        <RotateCcw className="mr-2 h-4 w-4" /> Try again
      </Button>
    </div>
  );
}
