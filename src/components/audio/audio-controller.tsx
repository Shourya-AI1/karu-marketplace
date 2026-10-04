'use client';

import { useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioStore } from '@/store/audio-store';
import { playIntro, setMasterVolume, playSound } from './audio-engine';
import { cn } from '@/lib/utils';

/**
 * Always-visible, accessible audio toggle.
 * - Never autoplays. The intro chime plays only after the user enables sound.
 * - Persists preference (zustand persist).
 */
export function AudioController() {
  const { enabled, consented, volume, toggle, setConsented } = useAudioStore();

  useEffect(() => {
    setMasterVolume(enabled ? volume : 0);
  }, [enabled, volume]);

  function handleToggle() {
    const next = !enabled;
    toggle();
    if (next) {
      if (!consented) setConsented(true);
      playIntro(volume);
    } else {
      playSound('click', 0.2);
    }
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.4, type: 'spring', stiffness: 200, damping: 18 }}
      onClick={handleToggle}
      aria-label={enabled ? 'Mute sound' : 'Enable sound'}
      aria-pressed={enabled}
      className={cn(
        'fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-border/70 glass shadow-lg transition-colors hover:border-champagne-400/60',
        enabled && 'border-champagne-400/60'
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {enabled ? (
          <motion.span key="on" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Volume2 className="h-5 w-5 text-champagne-500" />
          </motion.span>
        ) : (
          <motion.span key="off" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <VolumeX className="h-5 w-5 text-muted-foreground" />
          </motion.span>
        )}
      </AnimatePresence>
      {enabled && (
        <motion.span
          className="absolute inset-0 rounded-full border border-champagne-400/40"
          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </motion.button>
  );
}

/** Hook to play UI sounds respecting the user's preference. */
export function useUiSound() {
  const { enabled, volume } = useAudioStore();
  return (name: 'cart' | 'wishlist' | 'success' | 'notify' | 'click') => {
    if (enabled) playSound(name, volume);
  };
}
