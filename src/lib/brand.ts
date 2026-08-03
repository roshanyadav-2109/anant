import { useEffect, useState } from 'react'

/**
 * A user-supplied workspace/account logo. The engine has no avatar-upload
 * endpoint yet, so we keep it in the browser as a small data URL. When the
 * engine adds logo storage, this becomes the fallback.
 */
const KEY = 'anant.logo'
const EVT = 'anant-logo-change'

export function getLogo(): string | null {
  return localStorage.getItem(KEY)
}
export function setLogo(dataUrl: string) {
  localStorage.setItem(KEY, dataUrl)
  window.dispatchEvent(new Event(EVT))
}
export function clearLogo() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event(EVT))
}

/** Reactive access to the current logo (updates when it changes anywhere). */
export function useLogo(): string | null {
  const [logo, setState] = useState<string | null>(getLogo())
  useEffect(() => {
    const h = () => setState(getLogo())
    window.addEventListener(EVT, h)
    window.addEventListener('storage', h) // other tabs
    return () => {
      window.removeEventListener(EVT, h)
      window.removeEventListener('storage', h)
    }
  }, [])
  return logo
}

/** Read an image file, downscale to <= max px, return a PNG data URL. */
export function fileToLogo(file: File, max = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'))
      return
    }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Could not process the image.'))
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That image could not be read.'))
    }
    img.src = url
  })
}
