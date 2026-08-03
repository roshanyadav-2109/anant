import { api } from '@/lib/anant'

/** Download a full copy of the signed-in user's memory as JSON. */
export async function exportMemory(): Promise<void> {
  const data = await api.exportJson()
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'anant-memory.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Permanently erase this tenant's memory (destructive — confirm in the UI). */
export async function forgetAll(): Promise<void> {
  await api.forget()
}
