/**
 * Motion design tokens — a unified animation language.
 * Durations, easings, springs, and orchestrated variants used
 * across the entire experience for a coherent, premium feel.
 */
import type { Variants, Transition } from 'framer-motion';

export const EASING = {
  // Apple-style "out expo" — the signature Karu easing.
  signature: [0.16, 1, 0.3, 1] as [number, number, number, number],
  smooth: [0.4, 0, 0.2, 1] as [number, number, number, number],
  snappy: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  linear: [0, 0, 1, 1] as [number, number, number, number],
} as const;

export const DURATION = {
  fast: 0.25,
  base: 0.5,
  slow: 0.8,
  cinematic: 1.2,
} as const;

export const SPRING = {
  soft: { type: 'spring', stiffness: 120, damping: 20, mass: 1 } as Transition,
  snappy: { type: 'spring', stiffness: 400, damping: 30 } as Transition,
  gentle: { type: 'spring', stiffness: 80, damping: 18 } as Transition,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASING.signature },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.base, ease: EASING.smooth } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASING.signature },
  },
};

export const staggerContainer = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const blurReveal: Variants = {
  hidden: { opacity: 0, filter: 'blur(12px)', y: 20 },
  show: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: DURATION.cinematic, ease: EASING.signature },
  },
};

export const drawLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.4, ease: EASING.smooth },
  },
};

/** Respect prefers-reduced-motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
