type BadgeVariant = 'safe' | 'active' | 'sos' | 'pending' | 'completed' | 'cancelled' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  safe: 'bg-[var(--color-green-50)] text-[var(--color-green-600)]',
  active: 'bg-[var(--color-blue-50)] text-[var(--color-blue-500)]',
  sos: 'bg-[var(--color-red-50)] text-[var(--color-red-500)]',
  pending: 'bg-[var(--color-amber-50)] text-[var(--color-amber-600)]',
  completed: 'bg-[var(--color-green-50)] text-[var(--color-green-600)]',
  cancelled: 'bg-[var(--color-g-100)] text-[var(--color-g-500)]',
  default: 'bg-[var(--color-g-100)] text-[var(--color-g-700)]',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
