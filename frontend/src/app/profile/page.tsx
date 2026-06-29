'use client';

import { AppShell } from '@/components/layouts/AppShell';
import { useAuthStore } from '@/store/authStore';
import { useContacts } from '@/hooks/useContacts';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { useState } from 'react';
import { Shield, Bell, Clock, Heart, ChevronRight, LogOut, Plus, User } from 'lucide-react';

const settingsNav = [
  { icon: Heart, label: 'Medical Information', href: ROUTES.MEDICAL, desc: 'Blood type, allergies, conditions' },
  { icon: Shield, label: 'SOS Settings & Privacy', href: ROUTES.SOS_SETTINGS, desc: 'Control what contacts see in SOS' },
  { icon: Bell, label: 'Notifications', href: ROUTES.NOTIFICATIONS, desc: 'Alerts and activity' },
  { icon: Clock, label: 'Safety Check-ins', href: ROUTES.CHECKINS, desc: 'View your safety history' },
];

type Tab = 'personal' | 'account' | 'contacts';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();
  const { data: contacts } = useContacts();
  const [activeTab, setActiveTab] = useState<Tab>('personal');

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const handleLogout = () => { clearAuth(); router.push(ROUTES.LOGIN); };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6">

          {/* ── Profile header ── */}
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-6">
            {/* Desktop layout */}
            <div className="hidden lg:grid grid-cols-[auto_1fr] gap-8 items-start">
              <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-[var(--color-blue-500)] to-[var(--color-blue-600)] flex items-center justify-center text-white text-[36px] font-extrabold shrink-0 overflow-hidden">
                {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : initials}
              </div>
              <div>
                <h1 className="text-[26px] font-extrabold text-[var(--color-g-900)]">{user?.name || 'Your Account'}</h1>
                <p className="text-[14px] text-[var(--color-g-500)] mt-1 mb-4">{user?.email}</p>
                <div className="flex gap-3">
                  <Link href={ROUTES.MEDICAL} className="h-9 px-5 rounded-xl bg-[var(--color-blue-500)] text-white text-[13px] font-bold flex items-center">
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="flex flex-col items-center lg:hidden">
              <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[var(--color-blue-500)] to-[var(--color-blue-600)] flex items-center justify-center text-white text-[26px] font-extrabold overflow-hidden mb-3">
                {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : initials}
              </div>
              <p className="text-[17px] font-extrabold text-[var(--color-g-900)]">{user?.name || 'Your Account'}</p>
              <p className="text-[13px] text-[var(--color-g-500)] mt-0.5">{user?.email}</p>
            </div>
          </div>

          {/* ── Desktop: 2-col info cards ── */}
          <div className="hidden lg:grid grid-cols-2 gap-6">
            {/* Personal Info card */}
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-5">
              <h3 className="text-[11px] font-bold text-[var(--color-g-400)] uppercase tracking-widest mb-4">Personal Information</h3>
              <InfoField label="Full Name" value={user?.name} />
              <InfoField label="Email" value={user?.email} />
              <InfoField label="Phone" value={user?.phone || '—'} />
              <InfoField label="Account Status" value="Active" valueClass="text-[var(--color-green-500)] font-bold" />
            </div>

            {/* Account Settings card */}
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-5">
              <h3 className="text-[11px] font-bold text-[var(--color-g-400)] uppercase tracking-widest mb-4">Account Settings</h3>
              <InfoField label="Member Since" value={memberSince} />
              <InfoField label="Two-Factor Auth" value="Disabled" valueClass="text-[var(--color-amber-500)] font-bold" />
              <InfoField label="Last Login" value="Today" />
            </div>
          </div>

          {/* ── Mobile: tab navigation ── */}
          <div className="lg:hidden bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="flex border-b border-[var(--color-border)]">
              {(['personal', 'account', 'contacts'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex-1 py-3 text-[13px] font-semibold capitalize transition-colors border-b-2 ${
                    activeTab === t
                      ? 'text-[var(--color-blue-500)] border-[var(--color-blue-500)]'
                      : 'text-[var(--color-g-400)] border-transparent'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-3">
              {activeTab === 'personal' && (
                <>
                  <MobileField label="Full Name" value={user?.name} />
                  <MobileField label="Email" value={user?.email} />
                  <MobileField label="Phone" value={user?.phone || '—'} />
                </>
              )}
              {activeTab === 'account' && (
                <>
                  <MobileField label="Member Since" value={memberSince} />
                  <MobileField label="Account Status" value="Active" />
                  <MobileField label="Two-Factor Auth" value="Disabled" />
                </>
              )}
              {activeTab === 'contacts' && (
                <ContactsList contacts={contacts} />
              )}
            </div>
          </div>

          {/* ── Emergency contacts table (desktop) ── */}
          <div className="hidden lg:block bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-[16px] font-extrabold text-[var(--color-g-900)]">Emergency Contacts</h2>
            </div>
            {contacts && contacts.length > 0 ? (
              <table className="w-full">
                <thead className="bg-[var(--color-g-50)]">
                  <tr>
                    {['Name', 'Relationship / Email', 'Phone', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-[var(--color-g-500)] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c._id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-blue-50)] transition-colors">
                      <td className="px-4 py-3.5 text-[13px] font-semibold text-[var(--color-g-900)]">{c.name}</td>
                      <td className="px-4 py-3.5 text-[13px] text-[var(--color-g-500)]">{c.email}</td>
                      <td className="px-4 py-3.5 text-[13px] text-[var(--color-g-700)]">{c.phone}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--color-green-50)] text-[var(--color-green-600)]">
                          Verified
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={ROUTES.CONTACTS} className="text-[12px] font-semibold text-[var(--color-blue-500)] hover:underline">Edit</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-5 py-8 text-center text-[13px] text-[var(--color-g-400)]">No emergency contacts yet.</div>
            )}
            <div className="px-5 py-4 border-t border-[var(--color-border)]">
              <Link href={ROUTES.CONTACTS} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--color-blue-500)] text-white text-[13px] font-bold">
                <Plus className="w-4 h-4" /> Add Emergency Contact
              </Link>
            </div>
          </div>

          {/* ── Settings navigation ── */}
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            {settingsNav.map(({ icon: Icon, label, href, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 px-4 py-4 hover:bg-[var(--color-g-50)] transition-colors"
              >
                <span className="w-9 h-9 rounded-xl bg-[var(--color-g-100)] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[var(--color-g-700)]" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--color-g-900)]">{label}</p>
                  <p className="text-[11px] text-[var(--color-g-500)] mt-0.5">{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--color-g-400)] shrink-0" />
              </Link>
            ))}
          </div>

          {/* ── Sign out ── */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-[var(--color-red-500)]/30 bg-[var(--color-red-50)] text-[var(--color-red-500)] font-semibold text-[13px] hover:bg-[var(--color-red-500)] hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function InfoField({ label, value, valueClass = '' }: { label: string; value?: string | null; valueClass?: string }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-[11px] text-[var(--color-g-500)] mb-1">{label}</p>
      <p className={`text-[14px] font-semibold text-[var(--color-g-900)] ${valueClass}`}>{value || '—'}</p>
    </div>
  );
}

function MobileField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="bg-[var(--color-g-50)] border border-[var(--color-border)] rounded-xl px-4 py-3">
      <p className="text-[11px] font-semibold text-[var(--color-g-400)] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[14px] font-semibold text-[var(--color-g-900)]">{value || '—'}</p>
    </div>
  );
}

function ContactsList({ contacts }: { contacts?: { _id: string; name: string; email: string; phone: string }[] }) {
  if (!contacts || contacts.length === 0) {
    return (
      <div className="text-center py-6 text-[13px] text-[var(--color-g-400)]">
        <p>No emergency contacts yet.</p>
        <Link href={ROUTES.CONTACTS} className="mt-2 inline-block text-[var(--color-blue-500)] font-semibold">Add one →</Link>
      </div>
    );
  }
  return (
    <>
      {contacts.map((c) => {
        const initials = c.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
        return (
          <div key={c._id} className="flex items-center gap-3 py-2.5 border-b border-[var(--color-border)] last:border-0">
            <div className="w-10 h-10 rounded-full bg-[var(--color-blue-100)] flex items-center justify-center text-[13px] font-bold text-[var(--color-blue-600)] shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[var(--color-g-900)] truncate">{c.name}</p>
              <p className="text-[11px] text-[var(--color-g-500)] truncate">{c.phone} · Verified</p>
            </div>
            <Link href={ROUTES.CONTACTS} className="text-[var(--color-g-400)]">⋮</Link>
          </div>
        );
      })}
      <Link href={ROUTES.CONTACTS} className="w-full mt-2 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-[var(--color-blue-500)] text-white text-[13px] font-bold">
        <Plus className="w-4 h-4" /> Add Emergency Contact
      </Link>
    </>
  );
}
