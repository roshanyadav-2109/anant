import { Sovereign } from '@/icons'
import { cx } from '@/components/ui'

/**
 * The persistent sovereignty signal. It is a headline, not a footnote — a
 * quiet, always-present reassurance that everything stays on this machine.
 * Kept monochrome so it reads as a fact, not a decoration.
 */
export function SovereigntyIndicator({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-2 rounded-[var(--radius)] border border-rule bg-paper-sunk px-3 py-1.5 text-[0.75rem] font-[400] text-ink-soft',
        className,
      )}
      title="Anant runs locally. No data leaves this machine."
    >
      <Sovereign size={15} className="text-ink" />
      <span className="font-[500] text-ink">Local</span>
      <span className="h-3 w-px bg-rule" />
      <span className="text-ink-muted">no data leaves</span>
    </span>
  )
}
