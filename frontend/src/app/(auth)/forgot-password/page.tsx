'use client';

import Link from 'next/link';
import { Shield, Mail } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ROUTES } from '@/constants/routes';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a full implementation, call an API endpoint here
    setSent(true);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: '#f6f7f9',
        backgroundImage:
          'linear-gradient(#d4d8e0 1px, transparent 1px), linear-gradient(90deg, #d4d8e0 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-blue-500)] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-[20px] text-[var(--color-foreground)]">SafeTrack</span>
        </div>

        <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-green-50)] flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-[var(--color-green-500)]" />
              </div>
              <h2 className="text-[18px] font-extrabold text-[var(--color-foreground)] mb-2">Check your email</h2>
              <p className="text-[13px] text-[var(--color-muted)]">
                We&apos;ve sent a reset link to <strong>{email}</strong>
              </p>
              <Link
                href={ROUTES.LOGIN}
                className="inline-block mt-6 text-[14px] font-semibold text-[var(--color-blue-500)] hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-[22px] font-extrabold text-[var(--color-foreground)] mb-1">Reset password</h1>
              <p className="text-[14px] text-[var(--color-muted)] mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" fullWidth size="lg">
                  Send reset link
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[13px] text-[var(--color-muted)] mt-6">
          <Link href={ROUTES.LOGIN} className="text-[var(--color-blue-500)] font-semibold hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
