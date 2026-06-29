import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('st_token', token);
        // proxy.ts (middleware) reads cookies — keep them in sync
        document.cookie = `st_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        set({ user, token });
      },
      updateUser: (updates) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...updates } });
      },
      clearAuth: () => {
        localStorage.removeItem('st_token');
        document.cookie = 'st_token=; path=/; max-age=0';
        set({ user: null, token: null });
      },
    }),
    {
      name: 'safetrack-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
