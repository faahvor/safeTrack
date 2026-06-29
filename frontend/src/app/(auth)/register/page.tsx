'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/common/Input';
import { ROUTES } from '@/constants/routes';
import { User, Mail, Phone, Lock } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ confirmPassword, ...data }: FormData) => {
    setServerError('');
    try {
      const { data: res } = await authApi.register(data);
      setAuth(res.user, res.token);
      router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto"
      style={{
        backgroundColor: '#f6f7f9',
        backgroundImage:
          'linear-gradient(#d4d8e0 1px, transparent 1px), linear-gradient(90deg, #d4d8e0 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    >
      <div className="w-full max-w-sm">
        {/* Back link */}
        <Link href={ROUTES.HOME} className="flex items-center gap-1.5 text-[12px] text-[var(--color-g-400)] font-semibold mb-5 hover:text-[var(--color-g-700)] transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back
        </Link>

        <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-6">
          <h1 className="text-[22px] font-extrabold text-[var(--color-g-900)] mb-1">Create Account</h1>
          <p className="text-[13px] text-[var(--color-g-500)] mb-5">Start sharing your safety</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <Input label="Full Name" type="text" placeholder="Jane Smith" leftIcon={<User className="w-4 h-4" />} error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" placeholder="you@example.com" leftIcon={<Mail className="w-4 h-4" />} error={errors.email?.message} {...register('email')} />
            <Input label="Phone Number" type="tel" placeholder="+1 555 000 0000" leftIcon={<Phone className="w-4 h-4" />} error={errors.phone?.message} {...register('phone')} />
            <Input label="Password" type="password" placeholder="Min. 8 characters" leftIcon={<Lock className="w-4 h-4" />} error={errors.password?.message} {...register('password')} />
            <Input label="Confirm Password" type="password" placeholder="Repeat password" leftIcon={<Lock className="w-4 h-4" />} error={errors.confirmPassword?.message} {...register('confirmPassword')} />

            {serverError && (
              <p className="text-[13px] text-[var(--color-red-500)] bg-[var(--color-red-50)] px-3 py-2 rounded-xl">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-[var(--color-blue-500)] text-white font-bold text-[14px] disabled:opacity-60 mt-2"
            >
              {isSubmitting ? 'Creating account…' : 'Continue'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-[11px] text-[var(--color-g-400)]">or</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          <Link
            href={ROUTES.LOGIN}
            className="flex items-center justify-center w-full h-11 rounded-xl border border-[var(--color-border)] text-[13px] font-semibold text-[var(--color-g-700)] hover:bg-[var(--color-g-50)] transition-colors"
          >
            Sign in instead
          </Link>
        </div>

        <p className="text-center text-[11px] text-[var(--color-g-500)] mt-5 px-4">
          By continuing you agree to our Terms & Privacy
        </p>
      </div>
    </div>
  );
}
