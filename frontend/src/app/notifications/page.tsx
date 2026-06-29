'use client';

import { AppShell } from '@/components/layouts/AppShell';
import { useNotifications, useMarkRead, useMarkAllRead } from '@/hooks/useNotifications';
import type { AppNotification, NotificationType } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const TYPE_CONFIG: Record<NotificationType, { border: string; bg: string; iconBg: string; icon: React.ReactNode }> = {
  sos: {
    border: 'border-l-[var(--color-red-500)]',
    bg: 'bg-[var(--color-red-50)]',
    iconBg: 'bg-[#fca5a5]',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-red-700)" strokeWidth="2" strokeLinecap="round" className="w-4 h-4" style={{ color: '#b41c1c' }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
      </svg>
    ),
  },
  journey: {
    border: 'border-l-[var(--color-green-500)]',
    bg: 'bg-[var(--color-green-50)]',
    iconBg: 'bg-[var(--color-green-50)]',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#0f8847" strokeWidth="2.2" strokeLinecap="round" className="w-4 h-4">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  warning: {
    border: 'border-l-[var(--color-amber-500)]',
    bg: 'bg-[var(--color-amber-50)]',
    iconBg: 'bg-[var(--color-amber-50)]',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
        <path d="M12 2L2 20h20L12 2Z"/>
      </svg>
    ),
  },
  info: {
    border: 'border-l-[var(--color-blue-500)]',
    bg: '',
    iconBg: 'bg-[var(--color-blue-100)]',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#2545e8" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  contact: {
    border: 'border-l-[var(--color-green-500)]',
    bg: 'bg-[var(--color-green-50)]',
    iconBg: 'bg-[var(--color-green-50)]',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#0f8847" strokeWidth="1.8" strokeLinecap="round" className="w-4 h-4">
        <circle cx="12" cy="8" r="3.2"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>
      </svg>
    ),
  },
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const { mutate: markRead } = useMarkRead();
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllRead();

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 py-6 space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[18px] font-extrabold text-[var(--color-g-900)]">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-[12px] font-bold text-[var(--color-g-500)] mt-0.5">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  disabled={markingAll}
                  className="h-8 px-3 rounded-xl bg-[var(--color-g-100)] text-[var(--color-g-700)] text-[12px] font-semibold hover:bg-[var(--color-g-200)] transition-colors disabled:opacity-50"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          {isLoading ? (
            <div className="text-center py-12 text-[13px] text-[var(--color-g-400)]">Loading…</div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] py-16 text-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 mx-auto mb-3 text-[var(--color-g-300)]">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <circle cx="12" cy="21" r="1"/>
              </svg>
              <p className="text-[14px] font-semibold text-[var(--color-g-500)]">No notifications yet</p>
              <p className="text-[12px] text-[var(--color-g-400)] mt-1">You'll see SOS alerts, journey updates, and more here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <NotificationCard key={n._id} notification={n} onMarkRead={() => markRead(n._id)} />
              ))}
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}

function NotificationCard({ notification: n, onMarkRead }: { notification: AppNotification; onMarkRead: () => void }) {
  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
  const timeAgo = (() => {
    try { return formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }); }
    catch { return ''; }
  })();

  return (
    <div className={`flex gap-3 p-4 rounded-xl border border-transparent border-l-4 ${cfg.border} ${n.read ? 'bg-[var(--color-card)]' : cfg.bg || 'bg-[var(--color-blue-50)]'} border-[var(--color-border)]`}
      style={{ borderLeftWidth: '4px' }}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[var(--color-g-900)]">{n.title}</p>
        <p className="text-[12px] text-[var(--color-g-600)] mt-0.5 leading-relaxed">{n.body}</p>
        <p className="text-[11px] text-[var(--color-g-400)] mt-1">{timeAgo}</p>
      </div>
      <button
        onClick={onMarkRead}
        title={n.read ? 'Read' : 'Mark as read'}
        className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 transition-colors ${
          n.read
            ? 'bg-[var(--color-green-500)] border-[var(--color-green-500)]'
            : 'border-[var(--color-g-300)] hover:border-[var(--color-blue-500)]'
        }`}
      >
        {n.read && (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className="w-full h-full p-0.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </button>
    </div>
  );
}
