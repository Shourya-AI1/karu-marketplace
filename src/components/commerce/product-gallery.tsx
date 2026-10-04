'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ProductGallery({
  media,
  title,
}: {
  media: { url: string; alt?: string | null }[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const images = media.length ? media : [{ url: '', alt: title }];

  return (
    <div className="grid gap-4 sm:grid-cols-[80px_1fr]">
      <div className="order-2 flex gap-3 sm:order-1 sm:flex-col">
        {images.map((m, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              'relative aspect-square w-20 overflow-hidden rounded-xl border-2 transition-colors',
              active === i ? 'border-champagne-500' : 'border-transparent opacity-60 hover:opacity-100'
            )}
            aria-label={`View image ${i + 1}`}
          >
            {m.url && <Image src={m.url} alt="" fill className="object-cover" sizes="80px" />}
          </button>
        ))}
      </div>

      <div className="relative order-1 aspect-[4/5] overflow-hidden rounded-3xl bg-secondary sm:order-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {images[active].url && (
              <Image
                src={images[active].url}
                alt={images[active].alt ?? title}
                fill
                priority
                className="object-cover"
                sizes="(max-width:640px) 100vw, 50vw"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
