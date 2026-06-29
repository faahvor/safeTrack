'use client';

import { AppShell } from '@/components/layouts/AppShell';
import { Toggle } from '@/components/common/Toggle';
import { Input } from '@/components/common/Input';
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact } from '@/hooks/useContacts';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Mail, Phone, Pencil, Trash2 } from 'lucide-react';
import type { Contact } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone required'),
  permissions: z.object({
    location: z.boolean(),
    journeyUpdates: z.boolean(),
    emergencyAlerts: z.boolean(),
  }),
});
type FormData = z.infer<typeof schema>;
const defaultPerms = { location: true, journeyUpdates: true, emergencyAlerts: true };

function ContactForm({ initial, onSave, onCancel, loading }: {
  initial?: Contact; onSave: (d: FormData) => void; onCancel: () => void; loading: boolean;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? { name: initial.name, email: initial.email, phone: initial.phone, permissions: initial.permissions }
      : { permissions: defaultPerms },
  });
  const perms = watch('permissions');
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-3.5">
      <Input label="Full Name" leftIcon={<User className="w-4 h-4" />} error={errors.name?.message} {...register('name')} />
      <Input label="Email" type="email" leftIcon={<Mail className="w-4 h-4" />} error={errors.email?.message} {...register('email')} />
      <Input label="Phone" type="tel" leftIcon={<Phone className="w-4 h-4" />} error={errors.phone?.message} {...register('phone')} />
      <div>
        <p className="text-[13px] font-semibold text-[var(--color-g-700)] mb-2.5">Permissions</p>
        <div className="space-y-2.5">
          <Toggle checked={perms?.location ?? true} onChange={(v) => setValue('permissions.location', v)} label="Location Access" />
          <Toggle checked={perms?.journeyUpdates ?? true} onChange={(v) => setValue('permissions.journeyUpdates', v)} label="Journey Updates" />
          <Toggle checked={perms?.emergencyAlerts ?? true} onChange={(v) => setValue('permissions.emergencyAlerts', v)} label="SOS Notifications" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading} className="flex-1 h-10 bg-[var(--color-blue-500)] text-white text-[13px] font-bold rounded-xl disabled:opacity-60">
          {loading ? 'Saving…' : initial ? 'Update' : 'Add Contact'}
        </button>
        <button type="button" onClick={onCancel} className="h-10 px-4 rounded-xl border border-[var(--color-border)] text-[13px] font-semibold text-[var(--color-g-700)]">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ContactsPage() {
  const { data: contacts = [], isLoading } = useContacts();
  const { mutateAsync: createContact, isPending: creating } = useCreateContact();
  const { mutateAsync: updateContact, isPending: updating } = useUpdateContact();
  const { mutateAsync: deleteContact } = useDeleteContact();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);

  const handleSave = async (data: FormData) => {
    if (editing) { await updateContact({ id: editing._id, data }); setEditing(null); }
    else { await createContact(data); setShowForm(false); }
  };

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-4 py-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[18px] font-extrabold text-[var(--color-g-900)]">Trusted Contacts</h1>
              <p className="text-[12px] text-[var(--color-g-500)] mt-0.5">
                {contacts.length > 0
                  ? `${contacts.length} contact${contacts.length !== 1 ? 's' : ''} can receive your alerts`
                  : 'Add trusted people to your network'}
              </p>
            </div>
            <button
              onClick={() => { setShowForm(true); setEditing(null); }}
              className="w-8 h-8 rounded-lg bg-[var(--color-blue-600)] flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>

          {/* Add / Edit form */}
          {(showForm || editing) && (
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-bold text-[var(--color-foreground)]">
                  {editing ? 'Edit Contact' : 'New Contact'}
                </h2>
                <button onClick={() => { setShowForm(false); setEditing(null); }}>
                  <X className="w-4 h-4 text-[var(--color-g-400)]" />
                </button>
              </div>
              <ContactForm
                initial={editing ?? undefined}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditing(null); }}
                loading={creating || updating}
              />
            </div>
          )}

          {/* Contact list */}
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)]">
            {isLoading ? (
              <div className="p-8 text-center text-[13px] text-[var(--color-g-400)]">Loading…</div>
            ) : contacts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[14px] font-bold text-[var(--color-foreground)] mb-1">No contacts yet</p>
                <p className="text-[13px] text-[var(--color-g-500)]">Add trusted people to your network</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 h-9 px-4 rounded-xl   text-[13px] font-semibold bg-[var(--color-blue-500)] text-white text-[13px] hover:bg-[var(--color-blue-600)] transition-colors"
                >
                  + Add First Contact
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {contacts.map((c, i) => (
                  <div key={c._id} className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-[38px] h-[38px] rounded-full bg-[var(--color-blue-100)] flex items-center justify-center text-[13px] font-bold text-[var(--color-blue-600)] shrink-0">
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-[var(--color-g-900)]">{c.name}</p>
                      <p className="text-[12px] text-[var(--color-g-500)] truncate">
                        {c.permissions.emergencyAlerts ? 'Can receive alerts' : 'Alerts off'}
                      </p>
                    </div>
                    {i === 0 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-green-50)] text-[var(--color-green-600)]">Priority</span>
                    ) : (
                      <div className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${c.permissions.emergencyAlerts ? 'bg-[var(--color-blue-500)]' : 'bg-[var(--color-g-200)]'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${c.permissions.emergencyAlerts ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                    )}
                    <div className="flex gap-0.5 ml-1">
                      <button
                        onClick={() => { setEditing(c); setShowForm(false); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-g-100)] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[var(--color-g-500)]" />
                      </button>
                      <button
                        onClick={() => deleteContact(c._id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-red-50)] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[var(--color-red-500)]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add ghost button */}
          {contacts.length > 0 && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full h-11 rounded-xl border border-[var(--color-border)] text-[13px] font-semibold text-[var(--color-g-700)] hover:bg-[var(--color-g-50)] transition-colors"
            >
              + Add Trusted Contact
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
