import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Mark } from '@/icons'

type Door = 'individual' | 'enterprise'
type Mode = 'signin' | 'signup'

export function Login() {
  const { signIn, signUpIndividual, signUpEnterprise, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [door, setDoor] = useState<Door>('individual')
  const [mode, setMode] = useState<Mode>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    let res: { error?: string }
    if (mode === 'signin') {
      res = await signIn(username.trim(), password, door)
    } else if (door === 'individual') {
      res = await signUpIndividual(username.trim(), password, name.trim() || undefined)
    } else {
      res = await signUpEnterprise({
        username: username.trim(),
        password,
        name: name.trim() || undefined,
        email: email.trim(),
        org_name: orgName.trim(),
        org_slug: orgSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      })
    }
    setBusy(false)
    if (res.error) {
      setError(res.error)
      return
    }
    navigate('/memory')
  }

  const field =
    'focus-ring w-full rounded-[var(--radius)] bg-paper-raised px-3 py-2.5 text-[0.9375rem] text-ink ring-1 ring-rule placeholder:text-ink-faint'

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Brand panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-rule bg-paper-sunk/40 px-12 py-10 lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center text-ink">
            <Mark size={28} />
          </span>
          <div className="text-[1.35rem] font-[500] tracking-[-0.02em] text-ink">Anant</div>
        </div>
        <div className="max-w-md">
          <h1 className="text-[2rem] leading-[1.15] tracking-[-0.03em] text-ink">
            Memory is the hero. Chat is the doorway.
          </h1>
          <p className="mt-4 text-[1rem] leading-relaxed text-ink-muted">
            A sovereign cognitive memory that remembers what matters — every answer backed by memory
            you can inspect.
          </p>
        </div>
        <div className="text-[0.8125rem] text-ink-faint">Anant Engine · your memory, your rules</div>
      </section>

      {/* Form */}
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <Mark size={26} className="text-ink" />
            <span className="text-[1.2rem] font-[500] text-ink">Anant</span>
          </div>

          {/* Door toggle */}
          <div className="mb-5 inline-flex w-full gap-1 rounded-full bg-paper-sunk p-1">
            {(['individual', 'enterprise'] as Door[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => { setDoor(d); setError(null) }}
                className={
                  'flex-1 rounded-full px-3 py-1.5 text-[0.8125rem] transition-colors ' +
                  (door === d ? 'bg-paper-raised font-[500] text-ink shadow-sm' : 'text-ink-soft hover:text-ink')
                }
              >
                {d === 'individual' ? 'Individual' : 'Organization'}
              </button>
            ))}
          </div>

          <h2 className="text-[1.375rem] tracking-[-0.02em] text-ink">
            {mode === 'signin' ? 'Welcome back' : door === 'enterprise' ? 'Create your organization' : 'Create your account'}
          </h2>
          <p className="mt-1 text-[0.875rem] text-ink-muted">
            {door === 'enterprise'
              ? 'Organization accounts share memory and manage access.'
              : 'A private memory space that’s just yours.'}
          </p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
            {mode === 'signup' && (
              <input className={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <input
              className={field}
              placeholder="Username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              className={field}
              type="password"
              placeholder="Password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {mode === 'signup' && door === 'enterprise' && (
              <>
                <input className={field} type="email" placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input className={field} placeholder="Organization name" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
                <input className={field} placeholder="Organization slug (e.g. neural-ai)" value={orgSlug} onChange={(e) => setOrgSlug(e.target.value)} required />
              </>
            )}

            {error && <div className="rounded-[var(--radius)] bg-[color-mix(in_srgb,var(--color-alert)_10%,transparent)] px-3 py-2 text-[0.8125rem] text-[var(--color-alert)]">{error}</div>}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 rounded-[var(--radius)] bg-royal py-2.5 text-[0.9375rem] font-[500] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? 'One moment…' : mode === 'signin' ? 'Sign in' : door === 'enterprise' ? 'Create organization' : 'Create account'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[0.75rem] text-ink-faint">
            <span className="h-px flex-1 bg-rule" />
            or
            <span className="h-px flex-1 bg-rule" />
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setError(null)
              setBusy(true)
              const res = await signInWithGoogle()
              if (res.error) {
                setError(res.error)
                setBusy(false)
              }
              // On success the browser redirects to Google.
            }}
            className="focus-ring flex w-full items-center justify-center gap-2.5 rounded-[var(--radius)] bg-paper-raised py-2.5 text-[0.9375rem] font-[500] text-ink ring-1 ring-rule transition-colors hover:ring-ink-faint disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-[0.875rem] text-ink-muted">
            {mode === 'signin' ? 'New to Anant?' : 'Already have an account?'}{' '}
            <button
              className="font-[500] text-[var(--color-royal)] hover:underline"
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </section>
    </div>
  )
}
