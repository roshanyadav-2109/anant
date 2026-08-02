import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Export, Forget } from '@/icons'

/* ============================================================
   Settings — enterprise layout.
   Each section: a label + description on the left, its controls on
   the right. Left-aligned, plain language, no header bar.
   ============================================================ */

function Section({
  title,
  desc,
  children,
}: {
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <section className="grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-[220px_1fr]">
      <div>
        <h2 className="text-[0.95rem] font-[500] text-ink">{title}</h2>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-soft">{desc}</p>
      </div>
      <div className="rounded-[3px] bg-paper-raised p-5 shadow-[0_1px_2px_rgba(12,14,20,0.05)] ring-1 ring-rule/70">
        {children}
      </div>
    </section>
  )
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rule/70 py-3 first:pt-0 last:border-0 last:pb-0">
      <span className="text-[0.875rem] text-ink-soft">{label}</span>
      {value ? <span className="text-[0.875rem] font-[500] text-ink">{value}</span> : children}
    </div>
  )
}

function Toggle({ defaultOn }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn)
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className={
        'focus-ring inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ' +
        (on ? 'bg-royal' : 'bg-paper-sunk ring-1 ring-rule')
      }
    >
      <span className={'h-4 w-4 rounded-full bg-white shadow-sm transition-transform ' + (on ? 'translate-x-4' : '')} />
    </button>
  )
}

export function SettingsPage() {
  const { user } = useAuth()
  const initials = (user?.name ?? 'A')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="max-w-4xl px-9 py-9 pb-16">
        <div className="flex flex-col gap-10">
          {/* Account */}
          <Section title="Account" desc="Your profile in this workspace.">
            <div className="mb-4 flex items-center gap-3 border-b border-rule/70 pb-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-royal-soft)] text-[0.875rem] font-[500] text-[var(--color-royal)]">
                {initials}
              </span>
              <div>
                <div className="text-[0.9375rem] font-[500] text-ink">{user?.name ?? '—'}</div>
                <div className="text-[0.8125rem] text-ink-soft">{user?.email ?? '—'}</div>
              </div>
            </div>
            <Row label="Workspace" value={user?.workspace ?? '—'} />
            <Row label="Role" value={user?.role ?? '—'} />
          </Section>

          {/* How Anant works */}
          <Section title="How Anant works" desc="How it thinks and learns over time.">
            <Row label="Answer style" value="Balanced" />
            <Row label="Learns from new activity" value="Every night" />
            <Row label="Show answers as they type">
              <Toggle defaultOn />
            </Row>
            <Row label="Suggest connections it notices">
              <Toggle defaultOn />
            </Row>
          </Section>

          {/* Notifications */}
          <Section title="Notifications" desc="What Anant reaches out about, and how.">
            <Row label="Weekly memory brief by email">
              <Toggle defaultOn />
            </Row>
            <Row label="Ping me when it notices something important">
              <Toggle />
            </Row>
          </Section>

          {/* Your data */}
          <Section
            title="Your data"
            desc="Your memory is yours. Take a full copy or clear it, whenever you want."
          >
            <div className="flex flex-wrap items-center gap-2">
              <button className="focus-ring inline-flex items-center gap-2 rounded-[var(--radius)] px-3.5 py-2 text-[0.875rem] text-ink-soft ring-1 ring-rule transition-colors hover:text-ink">
                <Export size={16} />
                Export everything
              </button>
              <button className="focus-ring inline-flex items-center gap-2 rounded-[var(--radius)] px-3.5 py-2 text-[0.875rem] font-[500] text-[var(--color-alert)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-alert)_10%,transparent)]">
                <Forget size={16} />
                Delete everything
              </button>
            </div>
            <p className="mt-3 text-[0.8125rem] text-ink-soft">
              A copy comes as a single file you can open anywhere. Deleting is permanent after 30 days.
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}
