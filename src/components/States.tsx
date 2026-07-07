import type { ComponentType, ReactNode } from 'react'
import type { IconProps } from '@/icons'
import { cx } from '@/components/ui'

/** Empty states should teach — explain what will appear and offer a first step. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon: ComponentType<IconProps>
  title: string
  body: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('flex flex-col items-center px-6 py-20 text-center', className)}>
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-[14px] border border-rule bg-paper-raised text-evergreen">
        <Icon size={26} />
      </span>
      <h3
        className="font-display text-[1.25rem] font-[500] text-ink"
        style={{ fontVariationSettings: "'SOFT' 2, 'opsz' 72" }}
      >
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-ink-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

/** A calm skeleton row for loading memory / lists. */
export function SkeletonCard() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-rule bg-paper-raised p-5">
      <div className="flex gap-2">
        <div className="h-6 w-24 animate-pulse rounded-full bg-paper-sunk" />
        <div className="h-6 w-32 animate-pulse rounded-full bg-paper-sunk" />
      </div>
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-paper-sunk" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-paper-sunk" />
    </div>
  )
}
