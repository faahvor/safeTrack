'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface Props {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
}

export function MobileHeader({ title, backHref, action }: Props) {
  const router = useRouter();
  return (
    <header className="flex items-center gap-3 h-14 px-4 bg-[var(--color-card)] border-b border-[var(--color-border)] sticky top-0 z-30 lg:hidden">
      {backHref && (
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-g-100)] transition-colors -ml-1"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 text-[var(--color-g-700)]" />
        </button>
      )}
      <h1 className="flex-1 text-[15px] font-semibold text-[var(--color-foreground)]">{title}</h1>
      {action && <div>{action}</div>}
    </header>
  );
}
