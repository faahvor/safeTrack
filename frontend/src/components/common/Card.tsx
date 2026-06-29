interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export function Card({ padding = 'md', className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] ${paddingMap[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
