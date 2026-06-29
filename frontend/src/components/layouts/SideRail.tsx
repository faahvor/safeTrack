'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

/* ── unchanged ── */
function NavIcon({ id, active }: { id: string; active: boolean }) {
  const color = active ? '#3b5bff' : 'rgba(255,255,255,.45)';
  const base = `w-5 h-5`;
  if (id === 'home') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={base}>
      <path d="M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5"/>
    </svg>
  );
  if (id === 'journey') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={base}>
      <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/>
      <circle cx="12" cy="10" r="2.5"/>
    </svg>
  );
  if (id === 'contacts') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={base}>
      <circle cx="12" cy="8" r="3.2"/>
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>
    </svg>
  );
  if (id === 'profile') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={base}>
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21a8 8 0 0 1 16 0"/>
    </svg>
  );
  if (id === 'notifications') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" className={base}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <circle cx="12" cy="21" r="1"/>
    </svg>
  );
  return null;
}

/* ── unchanged ── */
const navItems = [
  { href: ROUTES.DASHBOARD, id: 'home', label: 'Home' },
  { href: ROUTES.HISTORY, id: 'journey', label: 'Journeys' },
  { href: ROUTES.CONTACTS, id: 'contacts', label: 'Contacts' },
  { href: ROUTES.NOTIFICATIONS, id: 'notifications', label: 'Notifications' },
  { href: ROUTES.PROFILE, id: 'profile', label: 'Profile' },
];

export function SideRail() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const isActive = (href: string) =>
    pathname === href || (href !== ROUTES.DASHBOARD && pathname.startsWith(href));

  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen bg-[var(--color-g-950)] sticky top-0 shrink-0 py-4 gap-1 transition-all duration-300 overflow-hidden ${
        collapsed ? 'w-16 items-center' : 'w-[220px] items-start'
      }`}
    >
      {/* ── Logo row ── */}
      <div className={`flex items-center mb-3 shrink-0 ${collapsed ? 'justify-center w-full' : 'gap-2.5 px-4 w-full'}`}>
        <Link
          href={ROUTES.DASHBOARD}
          className="w-9 h-9 rounded-xl bg-[var(--color-blue-600)] flex items-center justify-center shrink-0"
          title="SafeTrack"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" className="w-[18px] h-[18px]">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
          </svg>
        </Link>
        {!collapsed && (
          <span className="text-white font-extrabold text-[15px] tracking-tight">SafeTrack</span>
        )}
      </div>

      {/* ── Collapse / expand toggle ── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={`flex items-center justify-center h-8 rounded-lg hover:bg-[rgba(255,255,255,.07)] transition-colors shrink-0 mb-1 ${
          collapsed ? 'w-10' : 'w-full px-4 gap-2'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,.4)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 shrink-0"
          style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}
        >
          <path d="m15 18-6-6 6-6"/>
        </svg>
        {!collapsed && (
          <span className="text-[12px] text-[rgba(255,255,255,.35)] font-medium">Collapse</span>
        )}
      </button>

      {/* ── Nav items ── */}
      {navItems.map(({ href, id, label }) => {
        const badge = id === 'notifications' && unreadCount > 0 ? unreadCount : 0;
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={`flex items-center rounded-xl transition-colors shrink-0 ${
              collapsed
                ? `w-10 h-10 justify-center relative ${isActive(href) ? 'bg-[rgba(59,91,255,.18)]' : 'hover:bg-[rgba(255,255,255,.07)]'}`
                : `w-full h-11 gap-3 px-4 ${isActive(href) ? 'bg-[rgba(59,91,255,.18)]' : 'hover:bg-[rgba(255,255,255,.07)]'}`
            }`}
          >
            <span className="relative">
              <NavIcon id={id} active={isActive(href)} />
              {collapsed && badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-red-500)] text-white text-[9px] font-bold flex items-center justify-center">{badge > 9 ? '9+' : badge}</span>
              )}
            </span>
            {!collapsed && (
              <>
                <span className={`text-[13px] font-semibold flex-1 ${isActive(href) ? 'text-[#3b5bff]' : 'text-[rgba(255,255,255,.6)]'}`}>
                  {label}
                </span>
                {badge > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[var(--color-red-500)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </>
            )}
          </Link>
        );
      })}

      <div className="flex-1" />

      {/* ── SOS — unchanged ── */}
      <Link
        href={ROUTES.SOS}
        title="SOS Emergency"
        className={`rounded-xl bg-[var(--color-red-500)] flex items-center justify-center text-white font-extrabold text-[11px] tracking-widest shrink-0 mb-2 ${
          collapsed ? 'w-10 h-10' : 'w-[calc(100%-32px)] mx-4 h-10 gap-2'
        }`}
        style={{ boxShadow: '0 4px 14px rgba(239,59,59,.45)' }}
      >
        SOS
        {!collapsed && <span className="text-[11px] font-bold tracking-normal normal-case">Emergency</span>}
      </Link>

      {/* ── Avatar — unchanged ── */}
      <Link
        href={ROUTES.PROFILE}
        title="Profile"
        className={`rounded-full bg-[var(--color-blue-100)] flex items-center justify-center text-[11px] font-bold text-[var(--color-blue-600)] shrink-0 overflow-hidden ${
          collapsed ? 'w-8 h-8' : 'w-8 h-8 ml-4'
        }`}
      >
        {user?.avatar
          ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          : initials}
      </Link>
    </aside>
  );
}
