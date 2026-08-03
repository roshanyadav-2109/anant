import { useRef, useState } from 'react'
import { clearLogo, fileToLogo, setLogo, useLogo } from '@/lib/brand'
import { Dismiss } from '@/icons'

/**
 * The workspace/account logo. `editable` shows an upload affordance (click to
 * pick an image, hover to change, small × to remove). Otherwise it just
 * displays the logo, falling back to an initial.
 */
export function IdentityLogo({
  fallback,
  size = 44,
  rounded = 8,
  editable = false,
  onError,
}: {
  fallback: string
  size?: number
  rounded?: number
  editable?: boolean
  onError?: (message: string) => void
}) {
  const logo = useLogo()
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setBusy(true)
    try {
      setLogo(await fileToLogo(f))
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Could not use that image.')
    } finally {
      setBusy(false)
    }
  }

  const style = { width: size, height: size, borderRadius: rounded, fontSize: size * 0.4 }
  const boxCls = 'flex items-center justify-center overflow-hidden bg-royal font-[500] text-white'
  const inner = logo ? (
    <img src={logo} alt="" className="h-full w-full object-cover" />
  ) : (
    <span>{fallback}</span>
  )

  if (!editable) {
    return (
      <span className={boxCls} style={style}>
        {inner}
      </span>
    )
  }

  return (
    <div className="group relative shrink-0">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={`focus-ring relative ${boxCls} transition-opacity hover:opacity-95`}
        style={style}
        title="Upload a logo"
      >
        {busy ? <span>…</span> : inner}
        <span
          className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-ink/45 text-[0.6rem] font-[500] text-white group-hover:flex"
          style={{ borderRadius: rounded }}
        >
          {logo ? 'Change' : 'Upload'}
        </span>
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onFile} />
      {logo && (
        <button
          type="button"
          onClick={clearLogo}
          aria-label="Remove logo"
          className="focus-ring absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-paper-raised text-ink-muted shadow-[var(--shadow-card)] ring-1 ring-rule transition-colors hover:text-[var(--color-alert)]"
        >
          <Dismiss size={11} />
        </button>
      )}
    </div>
  )
}
