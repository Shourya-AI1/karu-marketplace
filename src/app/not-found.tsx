import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container-wide flex min-h-[70vh] flex-col items-center justify-center pt-32 text-center">
      <p className="font-display text-[8rem] font-bold leading-none gold-text">404</p>
      <h1 className="mt-2 text-display-md font-bold">This piece has wandered off</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you're looking for doesn't exist or has been moved. Let's get you back to the
        collection.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/">
          <Button size="lg">Back home</Button>
        </Link>
        <Link href="/discover">
          <Button size="lg" variant="outline">
            Explore the collection
          </Button>
        </Link>
      </div>
    </div>
  );
}
