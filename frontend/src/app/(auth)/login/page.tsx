'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { useState, Suspense } from 'react';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/common/Input';
import { ROUTES } from '@/constants/routes';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const { data: res } = await authApi.login(data);
      setAuth(res.user, res.token);
      const from = searchParams.get('from') || ROUTES.DASHBOARD;
      router.push(from);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        leftIcon={<Lock className="w-4 h-4" />}
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="flex justify-end">
        <Link href={ROUTES.FORGOT_PASSWORD} className="text-[12px] text-[var(--color-blue-500)] font-semibold hover:underline">
          Forgot password?
        </Link>
      </div>

      {serverError && (
        <p className="text-[13px] text-[var(--color-red-500)] bg-[var(--color-red-50)] px-3 py-2 rounded-xl">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-xl bg-[var(--color-blue-500)] text-white font-bold text-[14px] disabled:opacity-60 mt-1"
      >
        {isSubmitting ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: '#f6f7f9',
        backgroundImage:
          'linear-gradient(#d4d8e0 1px, transparent 1px), linear-gradient(90deg, #d4d8e0 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo + wordmark */}
        <div className="flex flex-col items-center gap-3 mb-7">
          <div className="w-[52px] h-[52px] rounded-2xl bg-[var(--color-blue-500)] flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
            </svg>
          </div>
          <span className="text-[20px] font-extrabold text-[var(--color-g-900)] tracking-tight">SafeTrack</span>
        </div>

        <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-6">
          <h1 className="text-[22px] font-extrabold text-[var(--color-g-900)] mb-1">Welcome back</h1>
          <p className="text-[13px] text-[var(--color-g-500)] mb-5">Sign in to your account</p>

          <Suspense fallback={<div className="h-40 flex items-center justify-center text-[13px] text-[var(--color-g-400)]">Loading…</div>}>
            <LoginForm />
          </Suspense>

          {/* Divider */}
          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-[11px] text-[var(--color-g-400)]">or</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          <Link
            href={ROUTES.REGISTER}
            className="flex items-center justify-center w-full h-11 rounded-xl border border-[var(--color-border)] text-[13px] font-semibold text-[var(--color-g-700)] hover:bg-[var(--color-g-50)] transition-colors"
          >
            Create an account
          </Link>
        </div>

        <p className="text-center text-[11px] text-[var(--color-g-500)] mt-5">
          By continuing you agree to our Terms &amp; Privacy
        </p>
      </div>
    </div>
  );
}
