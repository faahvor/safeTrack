'use client';

import { AppShell } from '@/components/layouts/AppShell';
import { useJourneys } from '@/hooks/useJourney';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ROUTES } from '@/constants/routes';
import type { Journey } from '@/types';

function statusLabel(s: Journey['status']) {
  if (s === 'completed') return { text: 'Arrived', cls: 'bg-[var(--color-green-50)] text-[var(--color-green-600)]' };
  if (s === 'active') return { text: 'Active', cls: 'bg-[var(--color-blue-50)] text-[var(--color-blue-500)]' };
  if (s === 'cancelled') return { text: 'Cancelled', cls: 'bg-[var(--color-g-100)] text-[var(--color-g-500)]' };
  return { text: 'Pending', cls: 'bg-[var(--color-amber-50)] text-[var(--color-amber-600)]' };
}

export default function HistoryPage() {
  const { data: journeys = [], isLoading } = useJourneys();
  const user = useAuthStore((s) => s.user);
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-4 py-5 space-y-4">
          {/* Header (B6 design) */}
          <div className="flex items-center justify-between">
            <h1 className="text-[18px] font-extrabold text-[var(--color-g-900)]">Journey History</h1>
            <div className="w-7 h-7 rounded-full bg-[var(--color-blue-100)] flex items-center justify-center text-[11px] font-bold text-[var(--color-blue-600)]">
              {initials}
            </div>
          </div>

          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-[13px] text-[var(--color-g-400)]">Loading journeys…</div>
          ) : journeys.length === 0 ? (
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-10 text-center">
              <MapPin className="w-10 h-10 text-[var(--color-g-300)] mx-auto mb-3" />
              <p className="text-[15px] font-bold text-[var(--color-foreground)] mb-1">No journeys yet</p>
              <p className="text-[13px] text-[var(--color-g-500)]">Start your first journey to see it here</p>
              <Link href={ROUTES.JOURNEYS_CREATE} className="inline-flex mt-4 h-9 px-4 items-center text-[13px] font-bold bg-[var(--color-blue-500)] text-white rounded-xl">
                Start a Journey
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                {journeys.map((j) => {
                  const { text, cls } = statusLabel(j.status);
                  return (
                    <Link key={j._id} href={ROUTES.JOURNEY(j._id)} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--color-g-50)] transition-colors">
                      <div className="w-[38px] h-[38px] rounded-full bg-[var(--color-blue-50)] flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-blue-500)" strokeWidth="1.8" strokeLinecap="round" className="w-5 h-5">
                          <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/>
                          <circle cx="12" cy="10" r="2.5"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-[13px] font-bold text-[var(--color-g-900)] truncate">
                            {j.destination.address || 'Journey'}
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cls}`}>{text}</span>
                        </div>
                        <p className="text-[11px] text-[var(--color-g-500)]">
                          {format(new Date(j.startedAt || j.createdAt), 'EEEE · h:mm a')}
                          {j.meetingPersonName ? ` · ${j.meetingPersonName}` : ''}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <p className="text-[11px] text-[var(--color-g-400)] text-center">View all history</p>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
