'use client';

import { AppShell } from '@/components/layouts/AppShell';
import { useGetSOSPrivacy, useUpdateSOSPrivacy } from '@/hooks/useSOSPrivacy';
import { useContacts } from '@/hooks/useContacts';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { SOSPrivacy, PerContactPrivacy } from '@/types';

const FIELD_COLS = ['location', 'status', 'bloodType', 'allergies', 'conditions', 'medications', 'surgeries'] as const;
type PrivacyField = typeof FIELD_COLS[number];

const fieldLabels: Record<PrivacyField, string> = {
  location: 'Location',
  status: 'Status',
  bloodType: 'Blood Type',
  allergies: 'Allergies',
  conditions: 'Conditions',
  medications: 'Medications',
  surgeries: 'Surgeries',
};

export default function SOSSettingsPage() {
  const { data: privacy, isLoading } = useGetSOSPrivacy();
  const { data: contacts } = useContacts();
  const { mutateAsync: update, isPending } = useUpdateSOSPrivacy();

  const [local, setLocal] = useState<SOSPrivacy | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (privacy && !local) setLocal(privacy);
  }, [privacy, local]);

  if (isLoading || !local) {
    return <AppShell><div className="flex-1 flex items-center justify-center text-[var(--color-g-400)] text-[13px]">Loading…</div></AppShell>;
  }

  const toggle = (key: keyof Omit<SOSPrivacy, 'perContact'>) => {
    setLocal((prev) => prev ? { ...prev, [key]: !prev[key] } : prev);
  };

  const toggleContactField = (contactId: string, field: PrivacyField) => {
    setLocal((prev) => {
      if (!prev) return prev;
      const existing = prev.perContact.find((p) => p.contactId === contactId);
      if (existing) {
        return {
          ...prev,
          perContact: prev.perContact.map((p) =>
            p.contactId === contactId ? { ...p, [field]: !p[field] } : p
          ),
        };
      }
      const defaults: PerContactPrivacy = {
        contactId,
        location: true, status: true, bloodType: true,
        allergies: true, conditions: true, medications: false, surgeries: false,
        [field]: true,
      };
      return { ...prev, perContact: [...prev.perContact, defaults] };
    });
  };

  const getContactField = (contactId: string, field: PrivacyField): boolean => {
    const p = local.perContact.find((x) => x.contactId === contactId);
    if (!p) return field === 'location' || field === 'status' || field === 'bloodType' || field === 'allergies' || field === 'conditions';
    return p[field];
  };

  const handleSave = async () => {
    await update(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6">

          {/* Back header */}
          <div className="flex items-center gap-3">
            <Link href={ROUTES.PROFILE} className="w-9 h-9 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-g-50)] transition-colors">
              <ChevronLeft className="w-4 h-4 text-[var(--color-g-700)]" />
            </Link>
            <div>
              <h1 className="text-[18px] font-extrabold text-[var(--color-g-900)]">SOS Settings &amp; Privacy</h1>
              <p className="text-[12px] text-[var(--color-g-500)]">Granular control: what each contact sees when SOS is triggered</p>
            </div>
          </div>

          {/* Section 1: When SOS is triggered */}
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-5 max-w-xl">
            <h3 className="text-[11px] font-bold text-[var(--color-g-400)] uppercase tracking-widest mb-4">When SOS is triggered, send:</h3>
            <div className="space-y-3">
              <CheckRow label="Your live location" checked={local.sendLocation} onChange={() => toggle('sendLocation')} />
              <CheckRow label="Your safety status" checked={local.sendStatus} onChange={() => toggle('sendStatus')} />
              <CheckRow label="Selected health information" checked={local.sendHealth} onChange={() => toggle('sendHealth')} />
            </div>
          </div>

          {/* Section 2: Default medical data */}
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-5 max-w-xl">
            <h3 className="text-[11px] font-bold text-[var(--color-g-400)] uppercase tracking-widest mb-4">Default medical data in SOS</h3>
            <p className="text-[12px] text-[var(--color-g-500)] mb-4">Always included by default when health info is shared</p>
            <div className="space-y-3">
              <CheckRow label="Blood type" checked={local.includeBloodType} onChange={() => toggle('includeBloodType')} />
              <CheckRow label="Allergies (critical)" checked={local.includeAllergies} onChange={() => toggle('includeAllergies')} />
              <CheckRow label="Critical conditions" checked={local.includeConditions} onChange={() => toggle('includeConditions')} />
              <CheckRow label="Current medications" checked={local.includeMedications} onChange={() => toggle('includeMedications')} />
              <CheckRow label="Recent surgeries" checked={local.includeSurgeries} onChange={() => toggle('includeSurgeries')} />
            </div>
          </div>

          {/* Section 3: Per-contact privacy matrix */}
          {contacts && contacts.length > 0 && (
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--color-border)]">
                <h2 className="text-[16px] font-extrabold text-[var(--color-g-900)]">Per-Contact Privacy Matrix</h2>
                <p className="text-[12px] text-[var(--color-g-500)] mt-0.5">Customize what each emergency contact can see when SOS is sent</p>
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--color-g-50)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-[var(--color-g-500)] uppercase tracking-wide">Contact</th>
                      {FIELD_COLS.map((f) => (
                        <th key={f} className="px-3 py-3 text-center text-[11px] font-bold text-[var(--color-g-500)] uppercase tracking-wide">{fieldLabels[f]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c) => (
                      <tr key={c._id} className="border-t border-[var(--color-border)]">
                        <td className="px-4 py-3.5 text-[13px] font-semibold text-[var(--color-g-900)]">{c.name}</td>
                        {FIELD_COLS.map((f) => (
                          <td key={f} className="px-3 py-3.5">
                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={getContactField(c._id, f)}
                                onChange={() => toggleContactField(c._id, f)}
                                className="w-4 h-4 cursor-pointer accent-[var(--color-blue-500)]"
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile stacked cards */}
              <div className="lg:hidden p-4 space-y-4">
                {contacts.map((c) => (
                  <div key={c._id} className="bg-[var(--color-g-50)] border border-[var(--color-border)] rounded-xl p-4">
                    <p className="text-[13px] font-bold text-[var(--color-g-900)] mb-3">{c.name}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {FIELD_COLS.map((f) => (
                        <label key={f} className="flex items-center gap-2 p-2 bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={getContactField(c._id, f)}
                            onChange={() => toggleContactField(c._id, f)}
                            className="w-4 h-4 accent-[var(--color-blue-500)]"
                          />
                          <span className="text-[12px] font-semibold text-[var(--color-g-700)]">{fieldLabels[f]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="flex items-center gap-3 pb-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="h-10 px-6 rounded-xl bg-[var(--color-blue-500)] text-white text-[13px] font-bold disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
            {saved && <span className="text-[13px] font-semibold text-[var(--color-green-500)]">Saved!</span>}
          </div>

        </div>
      </div>
    </AppShell>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 p-3 bg-[var(--color-g-50)] border border-[var(--color-border)] rounded-xl cursor-pointer hover:bg-[var(--color-g-100)] transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 accent-[var(--color-blue-500)]"
      />
      <span className="text-[13px] font-semibold text-[var(--color-g-700)]">{label}</span>
    </label>
  );
}
