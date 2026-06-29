import { create } from 'zustand';

interface LocationState {
  currentLocation: { latitude: number; longitude: number } | null;
  address: string | null;
  trackingEnabled: boolean;
  setLocation: (loc: { latitude: number; longitude: number }) => void;
  setAddress: (address: string) => void;
  setTrackingEnabled: (enabled: boolean) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  address: null,
  trackingEnabled: false,
  setLocation: (loc) => set({ currentLocation: loc }),
  setAddress: (address) => set({ address }),
  setTrackingEnabled: (enabled) => set({ trackingEnabled: enabled }),
}));
