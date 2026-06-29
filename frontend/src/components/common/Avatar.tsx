interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-[13px]',
  lg: 'w-12 h-12 text-[16px]',
};

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div
      className={`rounded-full bg-[var(--color-blue-100)] flex items-center justify-center font-bold text-[var(--color-blue-500)] shrink-0 overflow-hidden ${sizeMap[size]} ${className}`}
    >
      {src ? (
        <img src={src} alt={name || 'avatar'} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
