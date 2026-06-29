'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useNotifications } from '@/hooks/useNotifications';

function NavIcon({ id }: { id: string }) {
  const base = 'w-[22px] h-[22px]';
  if (id === 'home') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={base}>
      <path d="M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5"/>
    </svg>
  );
  if (id === 'journey') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={base}>
      <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/>
      <circle cx="12" cy="10" r="2.5"/>
    </svg>
  );
  if (id === 'contacts') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={base}>
      <circle cx="12" cy="8" r="3.2"/>
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>
    </svg>
  );
  if (id === 'profile') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={base}>
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21a8 8 0 0 1 16 0"/>
    </svg>
  );
  if (id === 'notifications') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={base}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <circle cx="12" cy="21" r="1"/>
    </svg>
  );
  return null;
}

const left = [
  { href: ROUTES.DASHBOARD, id: 'home', label: 'Home' },
  { href: ROUTES.HISTORY, id: 'journey', label: 'Journeys' },
];
const right = [
  { href: ROUTES.NOTIFICATIONS, id: 'notifications', label: 'Alerts' },
  { href: ROUTES.PROFILE, id: 'profile', label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;
  const isActive = (href: string) =>
    pathname === href || (href !== ROUTES.DASHBOARD && pathname.startsWith(href));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[var(--color-card)] border-t border-[var(--color-border)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-end h-[56px]">
        {left.map(({ href, id, label }) => (
          <Link key={href} href={href} className="flex-1 flex flex-col items-center justify-center gap-[3px] pb-2 pt-1">
            <span className={isActive(href) ? 'text-[var(--color-blue-500)]' : 'text-[var(--color-g-400)]'}>
              <NavIcon id={id} />
            </span>
            <span className={`text-[10px] font-semibold ${isActive(href) ? 'text-[var(--color-blue-500)]' : 'text-[var(--color-g-400)]'}`}>
              {label}
            </span>
          </Link>
        ))}

        {/* Centre SOS */}
        <div className="flex-none w-[72px] flex flex-col items-center justify-end pb-1">
          <Link href={ROUTES.SOS} className="flex flex-col items-center -mt-5">
            <span
              className="relative w-[54px] h-[54px] flex items-center justify-center rounded-full bg-[var(--color-red-500)]"
              style={{ boxShadow: '0 4px 16px rgba(239,59,59,.45)' }}
            >
              <span className="absolute inset-0 rounded-full border-2 border-[var(--color-red-500)] opacity-30 animate-[ring_2.4s_infinite]" />
              <span className="absolute inset-0 rounded-full border-2 border-[var(--color-red-500)] opacity-20 animate-[ring_2.4s_0.8s_infinite]" />
              <span className="text-white font-extrabold text-[13px] relative z-10 tracking-widest">SOS</span>
            </span>
            <span className="text-[10px] font-bold text-[var(--color-red-500)] mt-0.5">SOS</span>
          </Link>
        </div>

        {right.map(({ href, id, label }) => {
          const badge = id === 'notifications' && unreadCount > 0 ? unreadCount : 0;
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center justify-center gap-[3px] pb-2 pt-1 relative">
              <span className={`relative ${isActive(href) ? 'text-[var(--color-blue-500)]' : 'text-[var(--color-g-400)]'}`}>
                <NavIcon id={id} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-red-500)] text-white text-[9px] font-bold flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </span>
              <span className={`text-[10px] font-semibold ${isActive(href) ? 'text-[var(--color-blue-500)]' : 'text-[var(--color-g-400)]'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
