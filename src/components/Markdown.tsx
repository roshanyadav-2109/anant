import type { ReactNode } from 'react'

/**
 * A tiny, dependency-free markdown renderer for engine/LLM output. Covers the
 * common cases — **bold**, *italic*, `code`, [links](url), #/##/### headings,
 * and bullet / numbered lists. Renders real React nodes (never raw HTML), so
 * it's XSS-safe.
 */

const INLINE =
  /(`[^`]+`)|(\*\*[^*]+?\*\*)|(__[^_]+?__)|(\*[^*\s][^*]*?\*)|(_[^_\s][^_]*?_)|(\[[^\]]+\]\([^)]+\))/

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  let rest = text
  let k = 0
  while (rest.length) {
    const m = rest.match(INLINE)
    if (!m || m.index === undefined) {
      out.push(rest)
      break
    }
    if (m.index > 0) out.push(rest.slice(0, m.index))
    const tok = m[0]
    if (tok.startsWith('`')) {
      out.push(
        <code key={k} className="rounded bg-paper-sunk px-1 py-0.5 text-[0.9em]">
          {tok.slice(1, -1)}
        </code>,
      )
    } else if (tok.startsWith('**') || tok.startsWith('__')) {
      out.push(
        <strong key={k} className="font-[600]">
          {inline(tok.slice(2, -2))}
        </strong>,
      )
    } else if (tok.startsWith('[')) {
      const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)
      if (mm)
        out.push(
          <a key={k} href={mm[2]} target="_blank" rel="noreferrer" className="text-[var(--color-royal)] hover:underline">
            {mm[1]}
          </a>,
        )
    } else if (tok.startsWith('*') || tok.startsWith('_')) {
      out.push(<em key={k}>{inline(tok.slice(1, -1))}</em>)
    }
    rest = rest.slice(m.index + tok.length)
    k++
  }
  return out
}

const bullet = /^\s*[-*•]\s+/
const numbered = /^\s*\d+[.)]\s+/
const heading = /^\s*(#{1,3})\s+(.*)/

export function Markdown({ text, className }: { text: string; className?: string }) {
  const lines = (text || '').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }
    const h = heading.exec(line)
    if (h) {
      blocks.push(
        <p key={key++} className={h[1].length === 1 ? 'text-[1.1em] font-[600]' : 'font-[600]'}>
          {inline(h[2])}
        </p>,
      )
      i++
      continue
    }
    if (bullet.test(line)) {
      const items: string[] = []
      while (i < lines.length && bullet.test(lines[i])) {
        items.push(lines[i].replace(bullet, ''))
        i++
      }
      blocks.push(
        <ul key={key++} className="list-disc space-y-1 pl-5">
          {items.map((it, j) => (
            <li key={j}>{inline(it)}</li>
          ))}
        </ul>,
      )
      continue
    }
    if (numbered.test(line)) {
      const items: string[] = []
      while (i < lines.length && numbered.test(lines[i])) {
        items.push(lines[i].replace(numbered, ''))
        i++
      }
      blocks.push(
        <ol key={key++} className="list-decimal space-y-1 pl-5">
          {items.map((it, j) => (
            <li key={j}>{inline(it)}</li>
          ))}
        </ol>,
      )
      continue
    }
    const para: string[] = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() &&
      !bullet.test(lines[i]) &&
      !numbered.test(lines[i]) &&
      !heading.test(lines[i])
    ) {
      para.push(lines[i])
      i++
    }
    blocks.push(
      <p key={key++} className="leading-relaxed">
        {inline(para.join(' '))}
      </p>,
    )
  }
  return <div className={className ?? 'space-y-2'}>{blocks}</div>
}
