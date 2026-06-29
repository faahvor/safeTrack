'use client';

import { AppShell } from '@/components/layouts/AppShell';
import { useTriggerSOS, useResolveSOS, useSOSHistory } from '@/hooks/useSOS';
import { useSOSStore } from '@/store/sosStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/services/socket';
import { CLIENT_EVENTS } from '@/constants/socket-events';
import { useState, useRef, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { MapPin } from 'lucide-react';

const COUNTDOWN_SEC = 5;

const MAP_BG: React.CSSProperties = {
  background:
    'repeating-linear-gradient(0deg, transparent 0 48px, rgba(255,255,255,.03) 48px 49px),' +
    'repeating-linear-gradient(90deg, transparent 0 48px, rgba(255,255,255,.03) 48px 49px),' +
    'linear-gradient(145deg, #1e2a3e 0%, #172236 40%, #111a2e 100%)',
};

export default function SOSPage() {
  const user = useAuthStore((s) => s.user);
  const activeSOS = useSOSStore((s) => s.activeSOS);
  const { mutateAsync: triggerSOS, isPending: triggering } = useTriggerSOS();
  const { mutateAsync: resolveSOS, isPending: resolving } = useResolveSOS();
  const { data: history = [] } = useSOSHistory();
  const { latitude, longitude, address, getCurrentPosition } = useGeolocation();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sosError, setSOSError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { getCurrentPosition(); }, [getCurrentPosition]);

  const startSOS = useCallback(() => {
    if (!latitude || !longitude) { getCurrentPosition(); return; }
    setCountdown(COUNTDOWN_SEC);

    countRef.current = setInterval(() => {
      setCountdown((n) => {
        if (n === null || n <= 1) { clearInterval(countRef.current!); return null; }
        return n - 1;
      });
    }, 1000);

    timerRef.current = setTimeout(async () => {
      try {
        setSOSError(null);
        await triggerSOS({ latitude, longitude, address: address || undefined });
        if (user?._id) {
          const socket = getSocket(user._id);
          socket.emit(CLIENT_EVENTS.SOS_TRIGGER, { userId: user._id, location: { latitude, longitude, address } });
        }
      } catch (err) {
        setSOSError(err instanceof Error ? err.message : 'Failed to send SOS. Please call 999 directly.');
      }
    }, COUNTDOWN_SEC * 1000);
  }, [latitude, longitude, address, triggerSOS, user, getCurrentPosition]);

  const cancelSOS = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countRef.current) clearInterval(countRef.current);
    setCountdown(null);
  }, []);

  /* ── SOS ACTIVE state (C2) ── */
  if (activeSOS) {
    return (
      <AppShell>
        <div className="flex-1 flex flex-col overflow-hidden bg-[var(--color-g-950)]">
          {/* Header */}
          <div className="px-5 pt-5 pb-3 text-center shrink-0">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--color-red-500)] animate-[dotPulse_1s_ease-in-out_infinite]" />
              <span className="text-[12px] font-bold uppercase tracking-widest text-[var(--color-red-500)]">Emergency Active</span>
            </div>
            <p className="text-[20px] font-extrabold text-white">SOS Active</p>
            <p className="text-[13px] text-white/50 mt-0.5">3 contacts alerted · Location sharing</p>
          </div>

          {/* Dark map placeholder */}
          <div className="flex-1 mx-4 rounded-2xl relative overflow-hidden" style={MAP_BG}>
            <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold text-white" style={{ background: 'rgba(239,59,59,.3)', border: '1px solid rgba(239,59,59,.5)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-[dotPulse_1s_ease-in-out_infinite]" />
              Live location shared
            </div>
            {/* Pulsing position dot */}
            <div className="absolute top-[45%] left-[48%]">
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-white border-2 border-[var(--color-red-500)] shadow-lg" style={{ boxShadow: '0 0 0 8px rgba(239,59,59,.2)' }} />
              </div>
            </div>
          </div>

          {/* Action panel */}
          <div className="shrink-0 px-4 pt-3 pb-4 flex flex-col gap-2.5">
            {activeSOS.location?.address && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
                <MapPin className="w-4 h-4 text-white/40 shrink-0" />
                <p className="text-[12px] text-white/50 truncate">{activeSOS.location.address}</p>
              </div>
            )}

            <a
              href="tel:999"
              className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white text-[var(--color-g-950)] font-bold text-[14px]"
            >
              📞 Call 999
            </a>
            <div className="flex gap-2.5">
              <button className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-[13px] text-white bg-[var(--color-g-800)]">
                🔊 Siren
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-[13px] text-white bg-[var(--color-g-800)]">
                💬 Message all
              </button>
            </div>
            <button
              onClick={() => resolveSOS(activeSOS._id)}
              disabled={resolving}
              className="flex items-center justify-center h-11 rounded-xl border border-white/20 text-[13px] font-bold text-white/70 hover:bg-white/5 transition-colors"
            >
              {resolving ? 'Resolving…' : "I'm Safe — Stand Down"}
            </button>

            {/* Contact list */}
            <div className="pt-1 space-y-2">
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Contacts notified</p>
              {['Mom', 'Sarah', 'David'].map((name) => (
                <div key={name} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-g-800)] flex items-center justify-center text-[11px] font-bold text-white/60">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-white">{name}</p>
                    <p className="text-[11px] text-white/40">Notified</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  /* ── SOS TRIGGER state (C1) ── */
  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0e0e0e] relative overflow-hidden min-h-0">
        {/* Ring animations during countdown */}
        {countdown !== null && (
          <>
            <div className="absolute w-[280px] h-[280px] rounded-full border border-[var(--color-amber-500)]/20 animate-[ring_2.4s_infinite]" />
            <div className="absolute w-[240px] h-[240px] rounded-full border border-[var(--color-amber-500)]/30 animate-[ring_2.4s_0.8s_infinite]" />
          </>
        )}

        {/* Error */}
        {sosError && (
          <div className="absolute top-6 left-4 right-4 px-4 py-3 rounded-xl bg-[var(--color-red-500)]/20 border border-[var(--color-red-500)]/40 text-[13px] font-semibold text-white text-center z-20">
            {sosError}
          </div>
        )}

        {/* Main SOS circle */}
        <button
          onClick={countdown !== null ? cancelSOS : startSOS}
          disabled={triggering}
          className="relative flex flex-col items-center justify-center w-[168px] h-[168px] rounded-full transition-transform active:scale-95"
          style={{
            background: countdown !== null
              ? 'linear-gradient(150deg, #f59e0b, #d97706)'
              : 'linear-gradient(150deg, #ef3b3b, #b41c1c)',
            boxShadow: countdown !== null
              ? '0 0 0 14px rgba(245,158,11,.12), 0 20px 60px rgba(245,158,11,.4)'
              : '0 0 0 14px rgba(239,59,59,.12), 0 20px 60px rgba(239,59,59,.4)',
          }}
        >
          {countdown !== null ? (
            <>
              <span className="text-[56px] font-extrabold text-white leading-none">{countdown}</span>
              <span className="text-white/70 text-[11px] font-semibold mt-1">tap to cancel</span>
            </>
          ) : (
            <span className="text-white font-extrabold text-[30px] tracking-[0.12em]">SOS</span>
          )}
        </button>

        <p className="mt-8 text-white/80 font-bold text-[16px]">
          {countdown !== null ? 'Sending alert…' : 'Tap to send SOS'}
        </p>
        <p className="mt-2 text-white/40 text-[12px] text-center max-w-[200px] leading-relaxed px-6">
          5-second cancel window after tap. All contacts will receive your live location.
        </p>

        {/* Location indicator */}
        <div className="absolute bottom-8 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/8 backdrop-blur-sm">
          <MapPin className="w-3.5 h-3.5 text-white/50" />
          <span className="text-[12px] text-white/50">
            {address ? address.split(',')[0] : latitude ? 'Location detected' : 'Detecting location…'}
          </span>
        </div>

        {/* Recent history */}
        {history.length > 0 && (
          <div className="absolute bottom-20 left-0 right-0 px-6">
            <p className="text-[11px] text-white/30 text-center mb-2 uppercase tracking-wider font-bold">Recent alerts</p>
            <div className="flex justify-center gap-6">
              {history.slice(0, 3).map((e) => (
                <div key={e._id} className="text-center">
                  <p className="text-[11px] text-white/40">{format(new Date(e.createdAt), 'MMM d')}</p>
                  <p className={`text-[11px] font-bold ${e.status === 'active' ? 'text-[var(--color-red-500)]' : 'text-[var(--color-green-500)]'}`}>{e.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
