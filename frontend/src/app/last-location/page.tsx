'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layouts/AppShell';
import { locationApi } from '@/services/api';
import { format } from 'date-fns';
import Link from 'next/link';
import { MapPin, Clock, Navigation, RefreshCw, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { DynamicMap } from '@/components/map/DynamicMap';

interface LastLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
  journeyId: string;
  isActive: boolean;
}

export default function LastLocationPage() {
  const [data, setData] = useState<LastLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await locationApi.latest();
      setData(res);
    } catch {
      setError('Could not load location data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-4 py-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={ROUTES.DASHBOARD} className="w-8 h-8 rounded-full bg-[var(--color-g-100)] flex items-center justify-center hover:bg-[var(--color-g-200)] transition-colors">
                <ArrowLeft className="w-4 h-4 text-[var(--color-g-700)]" />
              </Link>
              <h1 className="text-[18px] font-extrabold text-[var(--color-g-900)]">Last Known Location</h1>
            </div>
            <button
              onClick={load}
              className="flex items-center gap-1.5 text-[12px] text-[var(--color-blue-500)] font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] h-40 flex items-center justify-center">
              <p className="text-[13px] text-[var(--color-g-400)]">Loading location…</p>
            </div>
          ) : error ? (
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] py-10 text-center">
              <p className="text-[14px] font-bold text-[var(--color-g-900)] mb-2">{error}</p>
              <button onClick={load} className="text-[13px] text-[var(--color-blue-500)] font-bold hover:underline">
                Try again
              </button>
            </div>
          ) : !data ? (
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] py-12 text-center">
              <MapPin className="w-10 h-10 text-[var(--color-g-300)] mx-auto mb-3" />
              <p className="text-[15px] font-bold text-[var(--color-g-900)] mb-1">No location data yet</p>
              <p className="text-[13px] text-[var(--color-g-500)]">Start a journey to track your location</p>
            </div>
          ) : (
            <>
              {/* Map area */}
              <div className="h-[220px] rounded-2xl relative overflow-hidden">
                <DynamicMap userPosition={[data.latitude, data.longitude]} />
              </div>

              {/* Details card */}
              <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-blue-50)] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[var(--color-blue-500)]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[var(--color-g-400)] font-semibold uppercase tracking-wide mb-0.5">Coordinates</p>
                    <p className="text-[13px] font-bold text-[var(--color-g-900)] font-mono">
                      {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-amber-50)] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-[var(--color-amber-500)]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[var(--color-g-400)] font-semibold uppercase tracking-wide mb-0.5">Last Seen</p>
                    <p className="text-[13px] font-bold text-[var(--color-g-900)]">
                      {format(new Date(data.timestamp), 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-green-50)] flex items-center justify-center shrink-0">
                    <Navigation className="w-4 h-4 text-[var(--color-green-500)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[var(--color-g-400)] font-semibold uppercase tracking-wide mb-0.5">Journey</p>
                    <div className="flex items-center gap-2">
                      <Link href={ROUTES.JOURNEY(data.journeyId)} className="text-[13px] font-bold text-[var(--color-blue-500)] hover:underline">
                        View journey details
                      </Link>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        data.isActive
                          ? 'bg-[var(--color-blue-50)] text-[var(--color-blue-500)]'
                          : 'bg-[var(--color-green-50)] text-[var(--color-green-600)]'
                      }`}>
                        {data.isActive ? 'Active' : 'Completed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Maps link */}
              <a
                href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-11 w-full rounded-xl border border-[var(--color-border)] text-[13px] font-semibold text-[var(--color-g-700)] hover:bg-[var(--color-g-50)] transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Open in Google Maps
              </a>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
