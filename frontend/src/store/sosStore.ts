import { create } from 'zustand';
import type { SOSEvent } from '@/types';

interface SOSState {
  activeSOS: SOSEvent | null;
  setActiveSOS: (event: SOSEvent | null) => void;
}

export const useSOSStore = create<SOSState>((set) => ({
  activeSOS: null,
  setActiveSOS: (event) => set({ activeSOS: event }),
}));
