import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { supabaseConfigured } from '@/lib/supabase'
import { Button, cx, Field } from '@/components/ui'
import { SovereigntyIndicator } from '@/components/Sovereignty'
import { ProvenanceBadge, SourceChip } from '@/components/Provenance'
import { ArrowRight, Mark } from '@/icons'

type Mode = 'signin' | 'signup'

export function Login() {
  const { signIn, signUp, signInDemo } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    const res =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password, name || email.split('@')[0])
    setBusy(false)
    if (res.error) {
      setError(res.error)
      return
    }
    if ('needsConfirm' in res && res.needsConfirm) {
      setNotice('Check your email to confirm, then sign in.')
      setMode('signin')
      return
    }
    navigate('/memory')
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Editorial brand panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-rule bg-paper-sunk/50 px-12 py-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, var(--color-evergreen), transparent 70%)' }}
        />
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-evergreen text-veil">
            <Mark size={22} />
          </span>
          <div className="leading-tight">
            <div
              className="font-display text-[1.35rem] font-[600] text-ink"
              style={{ fontVariationSettings: "'SOFT' 2, 'WONK' 1, 'opsz' 144" }}
            >
              Anant
            </div>
            <div className="text-[0.6875rem] tracking-[0.06em] text-ink-faint">by Neural AI</div>
          </div>
        </div>

        <div className="max-w-lg">
          <p className="eyebrow mb-5">Sovereign cognitive memory</p>
          <h1
            className="font-display text-[3.25rem] font-[600] leading-[1.03] text-ink"
            style={{ fontVariationSettings: "'SOFT' 4, 'WONK' 1, 'opsz' 144" }}
          >
            It doesn&rsquo;t just answer.
            <br />
            It remembers.
          </h1>
          <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-ink-muted">
            A private memory that turns conversation and your own tools into durable, traceable
            knowledge — and never leaves your machine.
          </p>

          {/* A quiet demonstration: memory forming, with provenance */}
          <div className="mt-9 space-y-3">
            <div className="rise rounded-[var(--radius-lg)] border border-rule bg-paper-raised p-4" style={{ animationDelay: '120ms' }}>
              <div className="mb-2 flex items-center gap-2">
                <ProvenanceBadge provenance="stated" />
                <SourceChip source={{ kind: 'slack', label: 'Slack · #engineering' }} />
              </div>
              <p className="font-display text-[0.9375rem] text-ink" style={{ fontVariationSettings: "'opsz' 32" }}>
                Oliver now leads design — he moved off the backend team last month.
              </p>
            </div>
            <div className="rise rounded-[var(--radius-lg)] border border-rule bg-paper-raised p-4" style={{ animationDelay: '320ms' }}>
              <div className="mb-2 flex items-center gap-2">
                <ProvenanceBadge provenance="inferred" note="from 14 signals" />
              </div>
              <p className="font-display text-[0.9375rem] text-ink" style={{ fontVariationSettings: "'opsz' 32" }}>
                Tends to do focused work in the late evening rather than the morning.
              </p>
            </div>
          </div>
        </div>

        <SovereigntyIndicator className="self-start" />
      </section>

      {/* Auth panel */}
      <section className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-evergreen text-veil">
              <Mark size={24} />
            </span>
          </div>

          <h2
            className="font-display text-[1.75rem] font-[600] text-ink"
            style={{ fontVariationSettings: "'SOFT' 2, 'WONK' 1, 'opsz' 90" }}
          >
            {mode === 'signin' ? 'Welcome back' : 'Create your memory'}
          </h2>
          <p className="mt-1.5 text-[0.9375rem] text-ink-muted">
            {mode === 'signin'
              ? 'Sign in to your private workspace.'
              : 'A workspace that remembers, for you and your team.'}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === 'signup' && (
              <Field
                label="Name"
                placeholder="Your name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <Field
              label="Work email"
              type="email"
              required
              placeholder="you@company.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Field
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="rounded-[var(--radius)] border border-[color-mix(in_srgb,var(--color-supersede)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-supersede)_8%,transparent)] px-3 py-2 text-[0.8125rem] text-[var(--color-supersede)]">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-[var(--radius)] border border-evergreen/30 bg-evergreen-soft px-3 py-2 text-[0.8125rem] text-evergreen">
                {notice}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={busy} trailing={<ArrowRight size={17} />}>
              {busy ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Create workspace'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[0.75rem] text-ink-faint">
            <span className="h-px flex-1 bg-rule" />
            or
            <span className="h-px flex-1 bg-rule" />
          </div>

          <Button variant="outline" className="w-full" onClick={() => { signInDemo(); navigate('/memory') }}>
            Explore the demo workspace
          </Button>

          <p className="mt-6 text-center text-[0.875rem] text-ink-muted">
            {mode === 'signin' ? 'New to Anant?' : 'Already have a workspace?'}{' '}
            <button
              className="font-[600] text-evergreen hover:underline"
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>

          {!supabaseConfigured && (
            <p className={cx('mt-6 text-center text-[0.75rem] text-ink-faint')}>
              Running without a backend — the demo workspace is fully browsable.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
