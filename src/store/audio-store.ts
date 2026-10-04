'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AudioState {
  enabled: boolean;
  ambient: boolean;
  volume: number;
  consented: boolean;
  setEnabled: (v: boolean) => void;
  setAmbient: (v: boolean) => void;
  setVolume: (v: number) => void;
  setConsented: (v: boolean) => void;
  toggle: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      enabled: false,
      ambient: false,
      volume: 0.4,
      consented: false,
      setEnabled: (v) => set({ enabled: v }),
      setAmbient: (v) => set({ ambient: v }),
      setVolume: (v) => set({ volume: v }),
      setConsented: (v) => set({ consented: v }),
      toggle: () => set((s) => ({ enabled: !s.enabled })),
    }),
    { name: 'karu-audio' }
  )
);
