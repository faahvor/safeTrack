'use client';

import { SideRail } from './SideRail';
import { BottomNav } from './BottomNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideRail />
      <main
        className="flex-1 flex flex-col min-w-0 pb-[56px] lg:pb-0 overflow-hidden"
        style={{
          backgroundColor: '#f6f7f9',
          backgroundImage:
            'linear-gradient(#d4d8e0 1px, transparent 1px), linear-gradient(90deg, #d4d8e0 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
