import { create } from 'zustand';
import type { Journey, LocationPoint } from '@/types';

interface JourneyState {
  activeJourney: Journey | null;
  destination: LocationPoint | null;
  eta: string | null;
  setActiveJourney: (journey: Journey | null) => void;
  setDestination: (dest: LocationPoint | null) => void;
  setEta: (eta: string | null) => void;
}

export const useJourneyStore = create<JourneyState>((set) => ({
  activeJourney: null,
  destination: null,
  eta: null,
  setActiveJourney: (journey) => set({ activeJourney: journey }),
  setDestination: (dest) => set({ destination: dest }),
  setEta: (eta) => set({ eta }),
}));
