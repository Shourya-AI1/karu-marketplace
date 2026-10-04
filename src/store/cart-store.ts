'use client';

import { create } from 'zustand';

interface CartUiState {
  open: boolean;
  count: number;
  setOpen: (v: boolean) => void;
  setCount: (n: number) => void;
}

export const useCartUi = create<CartUiState>((set) => ({
  open: false,
  count: 0,
  setOpen: (v) => set({ open: v }),
  setCount: (n) => set({ count: n }),
}));
