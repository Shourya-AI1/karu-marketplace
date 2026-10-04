'use client';

import dynamic from 'next/dynamic';

// Client-only lazy loader for the 3D product viewer. `ssr: false` is only
// permitted inside a Client Component in Next.js 15, so this wrapper isolates
// it from the server-rendered product page.
const ProductViewer = dynamic(
  () => import('@/components/three/product-viewer').then((m) => m.ProductViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-secondary">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-champagne-500/30 border-t-champagne-500" />
      </div>
    ),
  }
);

export function ProductViewerLazy({ color }: { color?: string }) {
  return <ProductViewer color={color} />;
}
