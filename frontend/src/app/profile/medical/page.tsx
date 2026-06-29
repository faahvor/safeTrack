'use client';

import { AppShell } from '@/components/layouts/AppShell';
import { useGetMedical, useUpdateMedical } from '@/hooks/useMedical';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/common/Input';
import { useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ChevronLeft, AlertCircle, Plus, X, Pencil, Trash2 } from 'lucide-react';
import type { Medical, MedicalCondition, MedicalMedication, MedicalSurgery } from '@/types';

export default function MedicalPage() {
  const { data: medical, isLoading } = useGetMedical();
  const { mutateAsync: update, isPending } = useUpdateMedical();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  if (isLoading) return <AppShell><div className="flex-1 flex items-center justify-center text-[var(--color-g-400)] text-[13px]">Loading…</div></AppShell>;

  const med = medical ?? { bloodType: '', allergies: [], conditions: [], medications: [], surgeries: [] };

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
              <h1 className="text-[18px] font-extrabold text-[var(--color-g-900)]">Medical Information</h1>
              <p className="text-[12px] text-[var(--color-g-500)]">Sent with SOS alerts to selected contacts</p>
            </div>
          </div>

          {/* Critical conditions warning banner */}
          {med.conditions.length > 0 && (
            <div className="flex gap-3 bg-[var(--color-red-50)] border border-[#fca5a5] rounded-xl p-4">
              <div className="w-8 h-8 rounded-full bg-[#fca5a5] flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-[var(--color-red-700)]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[var(--color-red-700)]">Critical Conditions</p>
                <p className="text-[12px] text-[var(--color-red-600)] mt-0.5">
                  {med.conditions.map((c) => `${c.name}${c.notes ? ` (${c.notes})` : ''}`).join(' · ')}
                </p>
              </div>
            </div>
          )}

          {/* 2-col grid: Blood Type & Allergies | Critical Conditions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blood Type & Allergies */}
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-5">
              <h3 className="text-[11px] font-bold text-[var(--color-g-400)] uppercase tracking-widest mb-4">Blood Type &amp; Allergies</h3>

              <div className="mb-4">
                <p className="text-[11px] text-[var(--color-g-500)] mb-1">Blood Type</p>
                {editingField === 'bloodType' ? (
                  <BloodTypeForm
                    current={med.bloodType}
                    onSave={async (val) => { await update({ bloodType: val }); setEditingField(null); }}
                    onCancel={() => setEditingField(null)}
                    saving={isPending}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-semibold text-[var(--color-g-900)]">{med.bloodType || '—'}</p>
                    <button onClick={() => setEditingField('bloodType')} className="text-[12px] font-semibold text-[var(--color-blue-500)] flex items-center gap-1">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>
                )}
              </div>

              <div>
                <p className="text-[11px] text-[var(--color-g-500)] mb-2">Allergies</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {med.allergies.map((a, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--color-red-50)] text-[var(--color-red-700)] text-[12px] font-semibold rounded-full border border-[#fca5a5]">
                      {a}
                      <button onClick={async () => {
                        const next = med.allergies.filter((_, j) => j !== i);
                        await update({ allergies: next });
                      }} className="ml-1 hover:text-[var(--color-red-600)]"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                {editingField === 'allergy' ? (
                  <QuickAddForm
                    label="Allergy"
                    placeholder="e.g. Penicillin"
                    onSave={async (val) => { await update({ allergies: [...med.allergies, val] }); setEditingField(null); }}
                    onCancel={() => setEditingField(null)}
                    saving={isPending}
                  />
                ) : (
                  <button onClick={() => setEditingField('allergy')} className="text-[12px] font-semibold text-[var(--color-blue-500)] flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Allergy
                  </button>
                )}
              </div>
            </div>

            {/* Critical Conditions */}
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-5">
              <h3 className="text-[11px] font-bold text-[var(--color-g-400)] uppercase tracking-widest mb-4">Critical Conditions</h3>
              <div className="space-y-3 mb-3">
                {med.conditions.map((c, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 p-3 bg-[var(--color-red-50)] border border-[#fca5a5] rounded-xl">
                    <div>
                      <p className="text-[13px] font-bold text-[var(--color-g-900)]">{c.name}</p>
                      {c.notes && <p className="text-[11px] text-[var(--color-g-500)] mt-0.5">{c.notes}</p>}
                    </div>
                    <button onClick={async () => {
                      const next = med.conditions.filter((_, j) => j !== i);
                      await update({ conditions: next });
                    }} className="text-[var(--color-g-400)] hover:text-[var(--color-red-500)] shrink-0 mt-0.5">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {editingField === 'condition' ? (
                <ConditionForm
                  onSave={async (val) => { await update({ conditions: [...med.conditions, val] }); setEditingField(null); }}
                  onCancel={() => setEditingField(null)}
                  saving={isPending}
                />
              ) : (
                <button onClick={() => setEditingField('condition')} className="text-[12px] font-semibold text-[var(--color-blue-500)] flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Condition
                </button>
              )}
            </div>
          </div>

          {/* Current Medications */}
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-5">
            <h3 className="text-[11px] font-bold text-[var(--color-g-400)] uppercase tracking-widest mb-4">Current Medications</h3>
            <div className="space-y-2 mb-3">
              {med.medications.map((m, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 bg-[var(--color-g-50)] border border-[var(--color-border)] rounded-xl">
                  <div>
                    <p className="text-[13px] font-bold text-[var(--color-g-900)]">{m.name}</p>
                    <p className="text-[12px] text-[var(--color-g-500)] mt-0.5">{m.dosage}{m.purpose ? ` · ${m.purpose}` : ''}</p>
                  </div>
                  <button onClick={async () => {
                    const next = med.medications.filter((_, j) => j !== i);
                    await update({ medications: next });
                  }} className="text-[var(--color-g-400)] hover:text-[var(--color-red-500)] shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {editingField === 'medication' ? (
              <MedicationForm
                onSave={async (val) => { await update({ medications: [...med.medications, val] }); setEditingField(null); }}
                onCancel={() => setEditingField(null)}
                saving={isPending}
              />
            ) : (
              <button onClick={() => setEditingField('medication')} className="h-9 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-g-50)] text-[13px] font-semibold text-[var(--color-g-700)] flex items-center gap-1.5 hover:bg-[var(--color-g-100)] transition-colors">
                <Plus className="w-4 h-4" /> Add Medication
              </button>
            )}
          </div>

          {/* Medical History */}
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-5">
            <h3 className="text-[11px] font-bold text-[var(--color-g-400)] uppercase tracking-widest mb-4">Medical History</h3>
            <div className="space-y-2 mb-3">
              {med.surgeries.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-[var(--color-border)] last:border-0">
                  <div>
                    <p className="text-[13px] font-bold text-[var(--color-g-900)]">{s.name}</p>
                    <p className="text-[12px] text-[var(--color-g-500)]">{s.year}</p>
                  </div>
                  <button onClick={async () => {
                    const next = med.surgeries.filter((_, j) => j !== i);
                    await update({ surgeries: next });
                  }} className="text-[var(--color-g-400)] hover:text-[var(--color-red-500)]">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {med.surgeries.length === 0 && (
                <p className="text-[13px] text-[var(--color-g-400)]">No surgeries or procedures recorded.</p>
              )}
            </div>
            {editingField === 'surgery' ? (
              <SurgeryForm
                onSave={async (val) => { await update({ surgeries: [...med.surgeries, val] }); setEditingField(null); }}
                onCancel={() => setEditingField(null)}
                saving={isPending}
              />
            ) : (
              <button onClick={() => setEditingField('surgery')} className="h-9 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-g-50)] text-[13px] font-semibold text-[var(--color-g-700)] flex items-center gap-1.5 hover:bg-[var(--color-g-100)] transition-colors">
                <Plus className="w-4 h-4" /> Add Surgery / Procedure
              </button>
            )}
          </div>

        </div>
      </div>
    </AppShell>
  );
}

/* ── Inline form helpers ─────────────────────────────────────────────────── */

function BloodTypeForm({ current, onSave, onCancel, saving }: {
  current?: string; onSave: (v: string) => void; onCancel: () => void; saving: boolean;
}) {
  const [val, setVal] = useState(current ?? '');
  return (
    <div className="flex gap-2 mt-1">
      <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="e.g. O+" className="flex-1" />
      <button onClick={() => onSave(val)} disabled={saving} className="h-10 px-4 rounded-xl bg-[var(--color-blue-500)] text-white text-[13px] font-bold disabled:opacity-50">Save</button>
      <button onClick={onCancel} className="h-10 px-3 rounded-xl bg-[var(--color-g-100)] text-[var(--color-g-700)] text-[13px] font-semibold">Cancel</button>
    </div>
  );
}

function QuickAddForm({ label, placeholder, onSave, onCancel, saving }: {
  label: string; placeholder: string; onSave: (v: string) => void; onCancel: () => void; saving: boolean;
}) {
  const [val, setVal] = useState('');
  return (
    <div className="flex gap-2 mt-1">
      <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder={placeholder} className="flex-1" />
      <button onClick={() => val.trim() && onSave(val.trim())} disabled={saving || !val.trim()} className="h-10 px-4 rounded-xl bg-[var(--color-blue-500)] text-white text-[13px] font-bold disabled:opacity-50">Add</button>
      <button onClick={onCancel} className="h-10 px-3 rounded-xl bg-[var(--color-g-100)] text-[var(--color-g-700)] text-[13px] font-semibold">Cancel</button>
    </div>
  );
}

function ConditionForm({ onSave, onCancel, saving }: { onSave: (v: MedicalCondition) => void; onCancel: () => void; saving: boolean; }) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  return (
    <div className="space-y-2 mt-2 p-3 bg-[var(--color-g-50)] rounded-xl border border-[var(--color-border)]">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Condition name (e.g. Asthma)" />
      <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (e.g. Mild, inhaler on hand)" />
      <div className="flex gap-2 pt-1">
        <button onClick={() => name.trim() && onSave({ name: name.trim(), notes: notes.trim() })} disabled={saving || !name.trim()} className="h-9 px-4 rounded-xl bg-[var(--color-blue-500)] text-white text-[13px] font-bold disabled:opacity-50">Add</button>
        <button onClick={onCancel} className="h-9 px-3 rounded-xl bg-[var(--color-g-100)] text-[var(--color-g-700)] text-[13px] font-semibold">Cancel</button>
      </div>
    </div>
  );
}

function MedicationForm({ onSave, onCancel, saving }: { onSave: (v: MedicalMedication) => void; onCancel: () => void; saving: boolean; }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [purpose, setPurpose] = useState('');
  return (
    <div className="space-y-2 mt-2 p-3 bg-[var(--color-g-50)] rounded-xl border border-[var(--color-border)]">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Medication name (e.g. Lisinopril)" />
      <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="Dosage (e.g. 10mg daily)" />
      <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Purpose (e.g. For blood pressure)" />
      <div className="flex gap-2 pt-1">
        <button onClick={() => name.trim() && onSave({ name: name.trim(), dosage: dosage.trim(), purpose: purpose.trim() })} disabled={saving || !name.trim()} className="h-9 px-4 rounded-xl bg-[var(--color-blue-500)] text-white text-[13px] font-bold disabled:opacity-50">Add</button>
        <button onClick={onCancel} className="h-9 px-3 rounded-xl bg-[var(--color-g-100)] text-[var(--color-g-700)] text-[13px] font-semibold">Cancel</button>
      </div>
    </div>
  );
}

function SurgeryForm({ onSave, onCancel, saving }: { onSave: (v: MedicalSurgery) => void; onCancel: () => void; saving: boolean; }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  return (
    <div className="space-y-2 mt-2 p-3 bg-[var(--color-g-50)] rounded-xl border border-[var(--color-border)]">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Procedure name (e.g. Appendectomy)" />
      <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year (e.g. 2015)" />
      <div className="flex gap-2 pt-1">
        <button onClick={() => name.trim() && onSave({ name: name.trim(), year: year.trim() })} disabled={saving || !name.trim()} className="h-9 px-4 rounded-xl bg-[var(--color-blue-500)] text-white text-[13px] font-bold disabled:opacity-50">Add</button>
        <button onClick={onCancel} className="h-9 px-3 rounded-xl bg-[var(--color-g-100)] text-[var(--color-g-700)] text-[13px] font-semibold">Cancel</button>
      </div>
    </div>
  );
}
