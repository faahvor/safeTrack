import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-semibold text-[var(--color-g-700)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-g-400)]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-10 px-3 text-[14px] rounded-lg
              bg-[var(--color-input-bg)] border border-[var(--color-border)]
              text-[var(--color-input-text)] placeholder:text-[var(--color-g-400)]
              focus:outline-none focus:border-[var(--color-blue-500)] focus:ring-2 focus:ring-[var(--color-blue-200)]
              transition-colors
              ${leftIcon ? 'pl-9' : ''}
              ${error ? 'border-[var(--color-red-500)] focus:ring-[var(--color-red-50)]' : ''}
              ${className}
            `.trim()}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[12px] text-[var(--color-red-500)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
