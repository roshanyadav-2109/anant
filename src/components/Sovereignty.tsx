import { Sovereign } from '@/icons'
import { cx } from '@/components/ui'

/**
 * The persistent sovereignty signal. It is a headline, not a footnote — a
 * quiet, always-present reassurance that everything stays on this machine.
 */
export function SovereigntyIndicator({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-evergreen)_25%,transparent)] bg-evergreen-soft px-3 py-1.5 text-[0.75rem] font-[600] text-evergreen',
        className,
      )}
      title="Anant runs locally. No data leaves this machine."
    >
      <Sovereign size={15} />
      <span className="tracking-[0.01em]">Local</span>
      <span className="h-3 w-px bg-[color-mix(in_srgb,var(--color-evergreen)_30%,transparent)]" />
      <span className="font-[400] text-[color-mix(in_srgb,var(--color-evergreen)_80%,var(--color-ink))]">
        no data leaves
      </span>
    </span>
  )
}
