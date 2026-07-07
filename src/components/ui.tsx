import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { ChevronDown } from '@/icons'

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

/* ---- Button ------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'quiet'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md'
  leading?: ReactNode
  trailing?: ReactNode
}

const buttonBase =
  'focus-ring inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-[500] transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none select-none'

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-evergreen text-veil hover:bg-evergreen-deep border border-transparent shadow-[0_1px_0_rgba(0,0,0,0.06)]',
  outline: 'bg-paper-raised text-ink border border-rule hover:border-ink-faint hover:bg-veil',
  ghost: 'bg-transparent text-ink-soft hover:bg-paper-sunk border border-transparent',
  quiet: 'bg-transparent text-ink-muted hover:text-ink border border-transparent',
}

export function Button({
  variant = 'outline',
  size = 'md',
  leading,
  trailing,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(
        buttonBase,
        buttonVariants[variant],
        size === 'sm' ? 'h-8 px-3 text-[0.8125rem]' : 'h-10 px-4 text-[0.875rem]',
        className,
      )}
      {...rest}
    >
      {leading}
      {children}
      {trailing}
    </button>
  )
}

export function IconButton({
  className,
  children,
  label,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx(
        'focus-ring inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-paper-sunk hover:text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ---- Segmented control (e.g. List / Graph) ----------------------------- */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode }[]
}) {
  return (
    <div className="inline-flex rounded-[var(--radius)] border border-rule bg-paper-raised p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'focus-ring inline-flex items-center gap-1.5 rounded-[5px] px-3 py-1 text-[0.8125rem] font-[500] transition-colors',
            value === o.value ? 'bg-evergreen text-veil' : 'text-ink-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ---- Filter chip (dropdown affordance, visual) ------------------------- */

export function FilterChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={cx(
        'focus-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.8125rem] transition-colors',
        active
          ? 'border-evergreen/40 bg-evergreen-soft text-evergreen'
          : 'border-rule bg-paper-raised text-ink-soft hover:border-ink-faint',
      )}
    >
      {label}
      <ChevronDown size={13} className="opacity-60" />
    </button>
  )
}

/* ---- Field ------------------------------------------------------------- */

export function Field({
  label,
  hint,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.8125rem] font-[500] text-ink-soft">{label}</span>
      <input
        className={cx(
          'focus-ring w-full rounded-[var(--radius)] border border-rule bg-veil px-3.5 py-2.5 text-[0.9375rem] text-ink placeholder:text-ink-faint',
          className,
        )}
        {...rest}
      />
      {hint && <span className="mt-1.5 block text-[0.75rem] text-ink-faint">{hint}</span>}
    </label>
  )
}

/* ---- Card -------------------------------------------------------------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cx(
        'rounded-[var(--radius-lg)] border border-rule bg-paper-raised',
        className,
      )}
    >
      {children}
    </div>
  )
}
