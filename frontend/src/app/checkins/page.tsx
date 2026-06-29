'use client';

import { AppShell } from '@/components/layouts/AppShell';
import { useCheckIns, useCreateCheckIn } from '@/hooks/useCheckIns';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function CheckInsPage() {
  return (
    <Suspense fallback={null}>
      <CheckInsInner />
    </Suspense>
  );
}

function CheckInsInner() {
  const searchParams = useSearchParams();
  const showPrompt = searchParams.get('prompt') === '1';
  const journeyId = searchParams.get('journeyId') ?? undefined;

  const { data: checkins, isLoading } = useCheckIns();
  const { mutateAsync: createCheckIn, isPending } = useCreateCheckIn();

  if (showPrompt) {
    return <SafePrompt journeyId={journeyId} createCheckIn={createCheckIn} isPending={isPending} />;
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 py-6 space-y-4">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[18px] font-extrabold text-[var(--color-g-900)]">Safety Check-ins</h1>
              <p className="text-[12px] text-[var(--color-g-500)] mt-0.5">Your &ldquo;I&apos;m safe&rdquo; confirmations</p>
            </div>
            <button
              onClick={() => createCheckIn({})}
              disabled={isPending}
              className="h-9 px-4 rounded-xl bg-[var(--color-green-500)] text-white text-[13px] font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              I&apos;m Safe
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-[13px] text-[var(--color-g-400)]">Loading…</div>
          ) : !checkins || checkins.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Desktop: vertical timeline */}
              <div className="hidden lg:block bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-6">
                <div className="border-l-[3px] border-[var(--color-g-200)] pl-6 space-y-7">
                  {checkins.map((c) => (
                    <div key={c._id} className="relative">
                      <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[var(--color-green-500)] border-[3px] border-white block" />
                      <p className="text-[14px] font-bold text-[var(--color-g-900)]">You&apos;re safe!</p>
                      <p className="text-[12px] text-[var(--color-g-500)] mt-0.5">{formatDate(c.createdAt)}</p>
                      {c.message && c.message !== "I'm safe!" && (
                        <p className="text-[13px] text-[var(--color-g-600)] mt-1">{c.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile: bubbles */}
              <div className="lg:hidden space-y-3">
                {checkins.map((c) => (
                  <div key={c._id} className="bg-[var(--color-green-50)] border-2 border-[var(--color-green-500)] rounded-2xl p-4 text-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-green-600)" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5 mx-auto mb-2" style={{ color: '#0f8847' }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <p className="text-[13px] font-bold text-[var(--color-green-600)]" style={{ color: '#0f8847' }}>You&apos;re safe!</p>
                    <p className="text-[12px] text-[var(--color-g-500)] mt-1">{formatDate(c.createdAt)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function SafePrompt({ journeyId, createCheckIn, isPending }: {
  journeyId?: string;
  createCheckIn: (data?: { journeyId?: string; message?: string }) => Promise<unknown>;
  isPending: boolean;
}) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-5 px-6 text-center text-white"
      style={{ background: 'linear-gradient(135deg, #18a957, #0d7540)' }}>
      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" className="w-8 h-8">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div>
        <h1 className="text-[22px] font-extrabold">You&apos;re Safe!</h1>
        <p className="text-[14px] opacity-90 mt-2 leading-relaxed">Let your contacts know you arrived safely.</p>
      </div>
      <button
        onClick={() => createCheckIn({ journeyId })}
        disabled={isPending}
        className="mt-2 h-12 px-8 rounded-2xl bg-white text-[var(--color-green-600)] font-extrabold text-[15px] disabled:opacity-50"
        style={{ color: '#0f8847' }}
      >
        {isPending ? 'Sending…' : 'Mark Myself Safe'}
      </button>
      <Link href={ROUTES.CHECKINS} className="h-10 px-6 rounded-2xl border border-white/30 bg-white/15 text-white text-[14px] font-semibold flex items-center">
        Later
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] py-16 text-center px-6">
      <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-[var(--color-g-300)]" />
      <p className="text-[14px] font-semibold text-[var(--color-g-500)]">No check-ins yet</p>
      <p className="text-[12px] text-[var(--color-g-400)] mt-1">After completing a journey, mark yourself safe to notify your contacts.</p>
    </div>
  );
}

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "MMMM d 'at' h:mm a");
  } catch {
    return dateStr;
  }
}
