import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: [
          'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          'linear-gradient(150deg, #2545e8, #1c34c6)',
        ].join(', '),
        backgroundSize: '44px 44px, 44px 44px, 100% 100%',
      }}
    >
      {/* Status bar area */}
      <div className="flex items-center justify-between px-6 pt-12 pb-0 text-white/70 text-[13px]" />

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-5">
        {/* Logo */}
        <div className="w-[68px] h-[68px] rounded-[17px] flex items-center justify-center" style={{ background: 'rgba(255,255,255,.18)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
          </svg>
        </div>

        <div>
          <h1 className="text-[28px] font-extrabold text-white tracking-tight">Stay Safe</h1>
          <p className="text-[14px] text-white/85 max-w-[240px] mx-auto leading-relaxed mt-2">
            Share your live location with trusted contacts. Get help in seconds.
          </p>
        </div>

        {/* Carousel dots */}
        <div className="flex items-center gap-1.5">
          <div className="w-[7px] h-[7px] rounded-full bg-white" />
          <div className="w-[7px] h-[7px] rounded-full bg-white/35" />
          <div className="w-[7px] h-[7px] rounded-full bg-white/35" />
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full max-w-[280px] mt-2">
          <Link
            href={ROUTES.REGISTER}
            className="flex items-center justify-center h-12 rounded-xl bg-white text-[var(--color-blue-600)] font-bold text-[15px] shadow-lg"
          >
            Get Started
          </Link>
          <Link
            href={ROUTES.LOGIN}
            className="flex items-center justify-center h-12 rounded-xl font-bold text-[15px] text-white"
            style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)' }}
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features row at bottom */}
      <div className="px-6 pb-12 pt-6">
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          {[
            { icon: '📍', label: 'Live Tracking' },
            { icon: '👥', label: 'Trusted Contacts' },
            { icon: '🆘', label: 'SOS Alert' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,.1)' }}>
              <span className="text-[22px]">{icon}</span>
              <span className="text-[11px] font-semibold text-white/80 text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
