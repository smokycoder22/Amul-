import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatProductImageUrl(imageUrl?: string | null, updatedAt?: string | null): string | null {
  if (!imageUrl || !imageUrl.trim()) return null
  const url = imageUrl.trim()

  // 1. If it's a full URL (Supabase or external)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (updatedAt) {
      const timestamp = new Date(updatedAt).getTime()
      if (!isNaN(timestamp)) {
        return `${url}?t=${timestamp}`
      }
    }
    return url
  }

  // 2. If it's a relative local file path, e.g. "001-taaza-500ml.webp" or "/products/001-taaza-500ml.webp"
  let clean = url.startsWith('/') ? url : `/products/${url}`
  clean = clean.replace(/\.webp$/i, '.png')
  return clean
}

