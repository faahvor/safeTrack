'use client';

import { AppShell } from '@/components/layouts/AppShell';
import { Input } from '@/components/common/Input';
import { useCreateJourney } from '@/hooks/useJourney';
import { useContacts } from '@/hooks/useContacts';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, User, Phone, Locate, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ROUTES } from '@/constants/routes';
import { useJourneyStore } from '@/store/journeyStore';
import Link from 'next/link';

const schema = z.object({
  destAddress: z.string().min(2, 'Destination required'),
  meetingPersonName: z.string().optional(),
  meetingPersonPhone: z.string().optional(),
  notes: z.string().optional(),
  estimatedArrivalTime: z.string().optional(),
  notifiedContacts: z.array(z.string()).optional(),
});
type FormData = z.infer<typeof schema>;

const MAP_BG: React.CSSProperties = {
  background: 'linear-gradient(145deg, #3d5a8a 0%, #2e4a7a 40%, #1f3a6a 100%)',
};
const MAP_GRID: React.CSSProperties = {
  background:
    'repeating-linear-gradient(0deg, transparent 0 48px, rgba(255,255,255,.04) 48px 49px),' +
    'repeating-linear-gradient(90deg, transparent 0 48px, rgba(255,255,255,.04) 48px 49px)',
};

export default function CreateJourneyPage() {
  const router = useRouter();
  const { data: contacts = [] } = useContacts();
  const { mutateAsync: createJourney, isPending } = useCreateJourney();
  const { setActiveJourney } = useJourneyStore();
  const { latitude, longitude, address, loading: geoLoading, getCurrentPosition } = useGeolocation();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  useEffect(() => { getCurrentPosition(); }, [getCurrentPosition]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const toggleContact = (id: string) =>
    setSelectedContacts((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const onSubmit = async (data: FormData) => {
    if (!latitude || !longitude) return;
    const { data: journey } = await createJourney({
      startLocation: { latitude, longitude, address: address || undefined },
      destination: { address: data.destAddress },
      meetingPersonName: data.meetingPersonName,
      meetingPersonPhone: data.meetingPersonPhone,
      notes: data.notes,
      estimatedArrivalTime: data.estimatedArrivalTime || undefined,
      notifiedContacts: selectedContacts,
    });
    setActiveJourney(journey);
    router.push(ROUTES.JOURNEY(journey._id));
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Map area with "Where to?" (B2 design) */}
        <div className="flex-none h-[180px] relative overflow-hidden" style={MAP_BG}>
          <div className="absolute inset-0" style={MAP_GRID} />

          {/* Back */}
          <Link href={ROUTES.DASHBOARD} className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-[var(--color-g-700)]" />
          </Link>

          {/* Search bar */}
          <div className="absolute top-4 left-16 right-4 z-10">
            <div className="h-10 bg-white rounded-xl shadow-md flex items-center px-3 gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-4 h-4 text-[var(--color-g-400)]">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span className="text-[13px] text-[var(--color-g-400)]">Where to?</span>
            </div>
          </div>

          {/* Current position pin */}
          {latitude && (
            <div className="absolute top-[55%] left-[55%] z-10">
              <div className="w-4 h-4 rounded-full bg-[var(--color-blue-500)] border-2 border-white shadow-lg" />
            </div>
          )}
        </div>

        {/* Sheet: form area (B2/B3 style) */}
        <div className="flex-1 bg-[var(--color-card)] rounded-t-3xl -mt-4 relative z-10 overflow-y-auto"
          style={{ boxShadow: '0 -4px 24px rgba(0,0,0,.08)' }}>
          <div className="w-10 h-1 bg-[var(--color-g-200)] rounded-full mx-auto mt-2 mb-4" />

          <form onSubmit={handleSubmit(onSubmit)} className="px-4 pb-6 space-y-4">
            {/* Destination input */}
            <Input
              label="Destination"
              placeholder="Where are you going?"
              leftIcon={<MapPin className="w-4 h-4" />}
              error={errors.destAddress?.message}
              {...register('destAddress')}
            />

            {/* Current location display */}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[var(--color-g-50)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[var(--color-blue-50)] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-blue-500)" strokeWidth="1.8" strokeLinecap="round" className="w-3.5 h-3.5">
                    <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>
                  </svg>
                </div>
                <p className="text-[13px] font-semibold text-[var(--color-g-900)] truncate">
                  {address ? address.split(',')[0] : latitude ? 'Location detected' : 'Detecting…'}
                </p>
              </div>
              <button type="button" onClick={getCurrentPosition} className="flex items-center gap-1 text-[12px] text-[var(--color-blue-500)] font-semibold shrink-0 ml-2">
                <Locate className="w-3.5 h-3.5" />
                {geoLoading ? 'Finding…' : 'Refresh'}
              </button>
            </div>

            {/* Meeting info */}
            <Input
              label="Meeting Person (optional)"
              placeholder="Who are you meeting?"
              leftIcon={<User className="w-4 h-4" />}
              {...register('meetingPersonName')}
            />
            <Input
              label="Their Phone (optional)"
              type="tel"
              placeholder="+1 555 000 0000"
              leftIcon={<Phone className="w-4 h-4" />}
              {...register('meetingPersonPhone')}
            />

            {/* Arrival time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[var(--color-g-700)]">Estimated Arrival</label>
              <input
                type="datetime-local"
                className="w-full h-10 px-3 text-[14px] rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] text-[var(--color-input-text)] focus:outline-none focus:border-[var(--color-blue-500)] focus:ring-2 focus:ring-[var(--color-blue-200)] transition-colors"
                {...register('estimatedArrivalTime')}
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[var(--color-g-700)]">Notes (optional)</label>
              <textarea
                rows={2}
                placeholder="Any extra details…"
                className="w-full px-3 py-2.5 text-[14px] rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] text-[var(--color-input-text)] placeholder:text-[var(--color-g-400)] focus:outline-none focus:border-[var(--color-blue-500)] focus:ring-2 focus:ring-[var(--color-blue-200)] resize-none transition-colors"
                {...register('notes')}
              />
            </div>

            {/* Invite watchers (B3 style) */}
            {contacts.length > 0 && (
              <div>
                <p className="text-[12px] font-bold text-[var(--color-g-500)] mb-2">Invite watchers</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {contacts.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => toggleContact(c._id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[13px] font-semibold transition-colors ${
                        selectedContacts.includes(c._id)
                          ? 'border-[var(--color-blue-500)] bg-[var(--color-blue-50)] text-[var(--color-blue-500)]'
                          : 'border-[var(--color-border)] text-[var(--color-g-700)] hover:bg-[var(--color-g-50)]'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-[var(--color-blue-100)] flex items-center justify-center text-[10px] font-bold text-[var(--color-blue-600)]">
                        {c.name[0]}
                      </div>
                      {c.name}
                    </button>
                  ))}
                </div>
                {selectedContacts.length > 0 && (
                  <p className="text-[11px] text-[var(--color-blue-500)] font-semibold mt-1.5">
                    {contacts.filter(c => selectedContacts.includes(c._id)).map(c => c.name).join(', ')} will be notified
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || !latitude}
              className="w-full h-12 rounded-xl bg-[var(--color-blue-500)] text-white font-bold text-[14px] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
                <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/>
              </svg>
              {isPending ? 'Starting…' : 'Start & Share Live'}
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
