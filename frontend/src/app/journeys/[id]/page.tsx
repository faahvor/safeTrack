'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layouts/AppShell';
import { useJourney, useEndJourney } from '@/hooks/useJourney';
import { useGeolocation } from '@/hooks/useGeolocation';
import { locationApi } from '@/services/api';
import { getSocket } from '@/services/socket';
import { SERVER_EVENTS, CLIENT_EVENTS } from '@/constants/socket-events';
import { format } from 'date-fns';
import { MapPin, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { DynamicMap } from '@/components/map/DynamicMap';

export default function ActiveJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: journey, refetch } = useJourney(id);
  const { mutateAsync: endJourney, isPending: ending } = useEndJourney();
  const { latitude, longitude } = useGeolocation(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [livePos, setLivePos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    const socket = getSocket(user._id);
    if (!socket.connected) socket.connect();
    socket.emit(CLIENT_EVENTS.JOURNEY_JOIN, id);
    socket.on(SERVER_EVENTS.LOCATION_UPDATED, (data) => {
      if (data.journeyId === id) setLivePos({ lat: data.latitude, lng: data.longitude });
    });
    return () => {
      socket.off(SERVER_EVENTS.LOCATION_UPDATED);
      socket.emit(CLIENT_EVENTS.JOURNEY_LEAVE, id);
    };
  }, [user, id]);

  useEffect(() => {
    if (!latitude || !longitude || journey?.status !== 'active') return;
    const push = async () => {
      try {
        await locationApi.update({ journeyId: id, latitude, longitude });
        const socket = getSocket(user?._id);
        socket.emit(CLIENT_EVENTS.LOCATION_UPDATE, { journeyId: id, latitude, longitude });
      } catch {}
    };
    push();
    intervalRef.current = setInterval(push, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [latitude, longitude, journey?.status, id, user]);

  const handleEnd = async () => {
    await endJourney(id);
    const socket = getSocket(user?._id);
    socket.emit(CLIENT_EVENTS.JOURNEY_END, { journeyId: id });
    router.push(ROUTES.HISTORY);
  };

  if (!journey) return (
    <AppShell>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[var(--color-g-500)] text-[14px]">Loading journey…</p>
      </div>
    </AppShell>
  );

  const isActive = journey.status === 'active';
  const pos = livePos ?? (latitude && longitude ? { lat: latitude, lng: longitude } : null);
  const userPos: [number, number] | null = pos ? [pos.lat, pos.lng] : null;
  const destPos: [number, number] | null =
    (journey.destination.latitude && journey.destination.longitude)
      ? [journey.destination.latitude, journey.destination.longitude]
      : null;

  return (
    <AppShell>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Map area */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0">
            <DynamicMap userPosition={userPos} destinationPosition={destPos} />
          </div>

          {/* Back button */}
          <Link
            href={ROUTES.HISTORY}
            className="absolute top-4 left-4 z-[1000] w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--color-g-700)]" />
          </Link>

          {/* Live badge */}
          {isActive && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(28,32,40,.8)] text-white text-[12px] font-bold backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-[dotPulse_2.4s_ease-in-out_infinite]" />
                LIVE · {journey.estimatedArrivalTime
                  ? `ETA ${format(new Date(journey.estimatedArrivalTime), 'h:mm a')}`
                  : 'Tracking'}
              </div>
            </div>
          )}
        </div>

        {/* Pull-up sheet (B4 style) */}
        <div className="bg-[var(--color-card)] rounded-t-3xl -mt-5 relative z-10 px-4 pt-2 pb-4 shrink-0"
          style={{ boxShadow: '0 -4px 24px rgba(0,0,0,.08)' }}>
          <div className="w-10 h-1 bg-[var(--color-g-200)] rounded-full mx-auto mb-3" />

          <div className="flex items-center justify-between mb-2">
            <span className="text-[17px] font-extrabold text-[var(--color-g-900)]">
              {journey.destination.address || 'Destination'}
            </span>
            {journey.estimatedArrivalTime && (
              <span className="px-2.5 py-1 rounded-full text-[12px] font-bold bg-[var(--color-amber-50)] text-[var(--color-amber-600)]">
                {format(new Date(journey.estimatedArrivalTime), 'h:mm a')}
              </span>
            )}
          </div>

          {/* Journey meta */}
          <div className="flex items-center gap-3 mb-3">
            {journey.meetingPersonName && (
              <span className="text-[12px] text-[var(--color-g-500)]">
                Meeting {journey.meetingPersonName}
              </span>
            )}
            {pos && (
              <span className="text-[11px] text-[var(--color-g-400)] font-mono ml-auto">
                {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}
              </span>
            )}
          </div>

          {/* Actions (B4: Pause + I've Arrived) */}
          {isActive ? (
            <div className="flex gap-2.5">
              <button className="flex-1 h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-g-50)] text-[13px] font-bold text-[var(--color-g-700)]">
                Pause
              </button>
              <button
                onClick={handleEnd}
                disabled={ending}
                className="flex-1 h-11 rounded-xl bg-[var(--color-blue-500)] text-white text-[13px] font-bold disabled:opacity-60"
              >
                {ending ? 'Ending…' : "I've Arrived"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                journey.status === 'completed' ? 'bg-[var(--color-green-50)] text-[var(--color-green-600)]'
                : 'bg-[var(--color-g-100)] text-[var(--color-g-500)]'
              } capitalize`}>
                {journey.status === 'completed' ? 'Arrived safely' : journey.status}
              </span>
              <span className="text-[12px] text-[var(--color-g-500)]">
                {format(new Date(journey.startedAt || journey.createdAt), 'MMM d, h:mm a')}
              </span>
            </div>
          )}

          {/* Notes */}
          {journey.notes && (
            <p className="mt-3 text-[12px] text-[var(--color-g-500)] pt-3 border-t border-[var(--color-border)]">
              {journey.notes}
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
