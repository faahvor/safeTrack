'use client';

import { AppShell } from '@/components/layouts/AppShell';
import { useAuthStore } from '@/store/authStore';
import { useJourneys } from '@/hooks/useJourney';
import { useContacts } from '@/hooks/useContacts';
import { useLocationStore } from '@/store/locationStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { format } from 'date-fns';
import type { Journey } from '@/types';
import { DynamicMap } from '@/components/map/DynamicMap';

function JourneyRow({ j }: { j: Journey }) {
  const statusColor =
    j.status === 'active' ? 'text-[var(--color-blue-500)] bg-[var(--color-blue-50)]'
    : j.status === 'completed' ? 'text-[var(--color-green-600)] bg-[var(--color-green-50)]'
    : 'text-[var(--color-g-500)] bg-[var(--color-g-100)]';
  return (
    <Link href={ROUTES.JOURNEY(j._id)} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
      <div>
        <p className="text-[13px] font-bold text-[var(--color-g-900)]">{j.destination.address || 'Journey'}</p>
        <p className="text-[11px] text-[var(--color-g-500)] mt-0.5">
          {format(new Date(j.startedAt || j.createdAt), 'MMM d · h:mm a')}
          {j.meetingPersonName ? ` · ${j.meetingPersonName}` : ''}
        </p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor}`}>
        {j.status === 'completed' ? 'Arrived' : j.status}
      </span>
    </Link>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: journeys = [] } = useJourneys();
  const { data: contacts = [] } = useContacts();
  const { setLocation } = useLocationStore();
  const { latitude, longitude, address, getCurrentPosition } = useGeolocation();

  useEffect(() => { getCurrentPosition(); }, [getCurrentPosition]);
  useEffect(() => {
    if (latitude && longitude) setLocation({ latitude, longitude });
  }, [latitude, longitude, setLocation]);

  const activeJourney = journeys.find((j) => j.status === 'active');
  const recentJourneys = journeys.slice(0, 3);
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  /* ── Desktop: two-column layout ── */
  const desktopPanel = (
    <div className="hidden lg:flex flex-1 overflow-hidden">
      {/* Left panel */}
      <div className="w-[300px] flex flex-col border-r border-[var(--color-border)] bg-[var(--color-card)] overflow-y-auto shrink-0">
        <div className="px-5 pt-5 pb-4 border-b border-[var(--color-border)]">
          <p className="text-[15px] font-extrabold text-[var(--color-g-900)]">My Journeys</p>
          <p className="text-[12px] text-[var(--color-g-500)] mt-0.5">
            {activeJourney ? '1 active journey' : 'No active journey'}
          </p>
        </div>

        <div className="px-4 py-3 flex flex-col gap-2 flex-1">
          <Link
            href={ROUTES.JOURNEYS_CREATE}
            className="flex items-center justify-center h-10 rounded-xl bg-[var(--color-blue-500)] text-white text-[13px] font-bold"
          >
            + Start a New Journey
          </Link>

          {activeJourney && (
            <Link href={ROUTES.JOURNEY(activeJourney._id)} className="p-3 rounded-xl border border-[var(--color-blue-500)] bg-[var(--color-blue-50)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-bold text-[var(--color-g-900)]">{activeJourney.destination.address || 'Active Journey'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-blue-500)] text-white">Live</span>
              </div>
              <p className="text-[11px] text-[var(--color-g-500)]">Started {format(new Date(activeJourney.startedAt || activeJourney.createdAt), 'h:mm a')}</p>
            </Link>
          )}

          {recentJourneys.length > 0 && (
            <>
              <p className="text-[12px] font-bold text-[var(--color-g-500)] mt-2">Recent</p>
              {recentJourneys.map((j) => (
                <Link key={j._id} href={ROUTES.JOURNEY(j._id)} className={`p-3 rounded-xl border ${j.status === 'completed' ? 'opacity-55' : ''} border-[var(--color-border)]`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[var(--color-g-900)] truncate mr-2">{j.destination.address || 'Journey'}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      j.status === 'completed' ? 'bg-[var(--color-green-50)] text-[var(--color-green-600)]' : 'bg-[var(--color-g-100)] text-[var(--color-g-500)]'
                    }`}>{j.status === 'completed' ? 'Arrived' : j.status}</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-g-500)] mt-0.5">{format(new Date(j.createdAt), 'MMM d, h:mm a')}</p>
                </Link>
              ))}
            </>
          )}

          <div className="mt-4 border-t border-[var(--color-border)] pt-4">
            <p className="text-[12px] font-bold text-[var(--color-g-500)] mb-2">Trusted contacts</p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {contacts.slice(0, 3).map((c) => (
                  <div key={c._id} className="w-7 h-7 rounded-full bg-[var(--color-blue-100)] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[var(--color-blue-600)]">
                    {c.name[0]}
                  </div>
                ))}
              </div>
              <span className="text-[12px] text-[var(--color-g-500)]">
                {contacts.length === 0 ? 'No contacts yet' : contacts.map(c => c.name).join(', ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          <DynamicMap userPosition={latitude && longitude ? [latitude, longitude] : null} />
        </div>
        {/* Search */}
        <div className="absolute top-4 left-4 right-4 flex gap-2 z-[1000]">
          <div className="flex-1 h-10 bg-white rounded-xl shadow-md flex items-center px-3 gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-[var(--color-g-400)]">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="text-[13px] text-[var(--color-g-400)]">Search people or places…</span>
          </div>
          <div className="h-10 px-4 bg-white rounded-xl shadow-md flex items-center gap-1.5 text-[12px] font-bold text-[var(--color-g-700)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-green-500)]" />
            {contacts.length} live
          </div>
        </div>
        {/* Status overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] px-3 py-1.5 rounded-full bg-[rgba(28,32,40,.75)] text-white text-[12px] font-semibold flex items-center gap-1.5 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--color-green-500)]" />
          {activeJourney ? '1 active journey' : 'All safe'}
        </div>
      </div>
    </div>
  );

  /* ── Mobile: map-first + pull-up sheet ── */
  const mobileLayout = (
    <div className="flex flex-col flex-1 lg:hidden overflow-hidden">
      {/* Map */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          <DynamicMap userPosition={latitude && longitude ? [latitude, longitude] : null} />
        </div>
        {/* Search bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center gap-2 z-[1000]">
          <div className="flex-1 h-10 bg-white rounded-xl shadow-md flex items-center px-3 gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-[var(--color-g-400)]">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="text-[13px] text-[var(--color-g-400)]">Search places…</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center text-[11px] font-bold text-[var(--color-blue-600)]">
            {initials}
          </div>
        </div>
      </div>

      {/* Pull-up sheet */}
      <div className="bg-[var(--color-card)] rounded-t-3xl -mt-6 relative z-10 px-4 pt-2 pb-4 flex flex-col gap-3" style={{ boxShadow: '0 -4px 24px rgba(0,0,0,.08)' }}>
        {/* Grab handle */}
        <div className="w-10 h-1 bg-[var(--color-g-200)] rounded-full mx-auto mb-1" />

        <div className="flex items-center justify-between">
          <span className="text-[17px] font-extrabold text-[var(--color-g-900)]">
            {activeJourney ? activeJourney.destination.address || 'Active Journey' : "You're here"}
          </span>
          {activeJourney ? (
            <span className="px-2.5 py-1 rounded-full text-[12px] font-bold bg-[var(--color-blue-50)] text-[var(--color-blue-500)]">
              Journey Active
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[12px] font-bold bg-[var(--color-green-50)] text-[var(--color-green-600)]">
              All safe
            </span>
          )}
        </div>

        {/* Contact status */}
        {contacts[0] && (
          <div className="flex items-center gap-3 p-3 bg-[var(--color-g-50)] rounded-xl">
            <div className="w-[30px] h-[30px] rounded-full bg-[var(--color-blue-100)] flex items-center justify-center text-[12px] font-bold text-[var(--color-blue-600)] shrink-0">
              {contacts[0].name[0]}
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[var(--color-g-900)]">{contacts[0].name}</p>
              <p className="text-[11px] text-[var(--color-g-500)]">Trusted contact</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-green-50)] text-[var(--color-green-600)]">Safe</span>
          </div>
        )}

        {activeJourney ? (
          <Link
            href={ROUTES.JOURNEY(activeJourney._id)}
            className="flex items-center justify-center h-11 bg-[var(--color-blue-500)] text-white rounded-xl font-bold text-[14px]"
          >
            View Live Journey
          </Link>
        ) : (
          <Link
            href={ROUTES.JOURNEYS_CREATE}
            className="flex items-center justify-center h-11 bg-[var(--color-blue-500)] text-white rounded-xl font-bold text-[14px]"
          >
            + Start a Journey
          </Link>
        )}

        {/* Recent journeys */}
        {recentJourneys.length > 0 && (
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-bold text-[var(--color-g-900)]">Journey History</p>
              <Link href={ROUTES.HISTORY} className="text-[12px] text-[var(--color-blue-500)] font-semibold">View all</Link>
            </div>
            <div>
              {recentJourneys.map((j) => <JourneyRow key={j._id} j={j} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppShell>
      {mobileLayout}
      {desktopPanel}
    </AppShell>
  );
}
