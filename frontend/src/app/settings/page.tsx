'use client';

import { AppShell } from '@/components/layouts/AppShell';
import { Toggle } from '@/components/common/Toggle';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  const [autoShare, setAutoShare] = useState(true);
  const [batteryShare, setBatteryShare] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => setMounted(true), []);

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-4 py-5 space-y-4">
          <div>
            <h1 className="text-[18px] font-extrabold text-[var(--color-g-900)]">Privacy Controls</h1>
            <p className="text-[12px] text-[var(--color-g-500)] mt-0.5">Control what you share and with whom</p>
          </div>

          {/* Privacy toggles (D2 design) */}
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-[13px] font-semibold text-[var(--color-g-900)]">Share precise location</p>
                <p className="text-[11px] text-[var(--color-g-500)] mt-0.5">Exact GPS coordinates</p>
              </div>
              <Toggle checked={shareLocation} onChange={setShareLocation} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-[13px] font-semibold text-[var(--color-g-900)]">Auto-share journeys</p>
                <p className="text-[11px] text-[var(--color-g-500)] mt-0.5">With priority contacts</p>
              </div>
              <Toggle checked={autoShare} onChange={setAutoShare} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-[13px] font-semibold text-[var(--color-g-900)]">Journey history</p>
                <p className="text-[11px] text-[var(--color-g-500)] mt-0.5">Keep for 30 days</p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--color-blue-50)] text-[var(--color-blue-500)]">30d</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-[13px] font-semibold text-[var(--color-g-900)]">Battery sharing</p>
                <p className="text-[11px] text-[var(--color-g-500)] mt-0.5">Show battery to watchers</p>
              </div>
              <Toggle checked={batteryShare} onChange={setBatteryShare} />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)]">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-[13px] font-semibold text-[var(--color-g-900)]">Push Notifications</p>
                <p className="text-[11px] text-[var(--color-g-500)] mt-0.5">Receive alerts when contacts trigger SOS</p>
              </div>
              <Toggle checked={notifications} onChange={setNotifications} />
            </div>
          </div>

          {/* Appearance */}
          {mounted && (
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-4">
              <p className="text-[13px] font-bold text-[var(--color-g-900)] mb-3">Appearance</p>
              <div className="grid grid-cols-3 gap-2">
                {themes.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTheme(id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors ${
                      theme === id
                        ? 'border-[var(--color-blue-500)] bg-[var(--color-blue-50)]'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-g-50)]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${theme === id ? 'text-[var(--color-blue-500)]' : 'text-[var(--color-g-500)]'}`} />
                    <span className={`text-[12px] font-semibold ${theme === id ? 'text-[var(--color-blue-500)]' : 'text-[var(--color-g-700)]'}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
