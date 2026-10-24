import { useSyncExternalStore } from 'react'

export type Look = 'original' | 'paper' | 'board' | 'game'

export const LOOKS: { key: Look; name: string; desc: string; swatch: string[] }[] = [
  { key: 'game', name: 'Game Night', desc: 'Bright, chunky game UI with coins and violet.', swatch: ['#f1efff', '#6a45ff', '#ffbe0b', '#18b85a', '#24214d'] },
  { key: 'paper', name: 'Revision Pages', desc: 'Clean script paper, typewriter type, revision-page colors.', swatch: ['#ffffff', '#2c55c9', '#c93c5c', '#e8d36a', '#2f8a4c'] },
  { key: 'board', name: 'The Board', desc: 'Cork board, index cards, pushpins and marker.', swatch: ['#b48a5f', '#fffdf6', '#d2412b', '#2f6db3', '#3a281a'] },
  { key: 'original', name: 'Night Desk', desc: 'The original dark gold look.', swatch: ['#14110f', '#211c18', '#f2b544', '#7fcf8a', '#f4ede1'] },
]

export type Palette = 'auto' | 'neonday' | 'arcade' | 'ocean' | 'sunset' | 'mint' | 'bubblegum' | 'midnight' | 'neon'

// Colour palettes for the Game Night look.
export const PALETTES: { key: Palette; name: string; swatch: string[] }[] = [
  { key: 'auto', name: 'Auto (Day / Night)', swatch: ['#f4f7fb', '#00a37c', '#ffd60a', '#0d1117', '#00e5a8'] },
  { key: 'neonday', name: 'Neon Day', swatch: ['#f4f7fb', '#00a37c', '#ffd60a', '#1d4ed8', '#0d1117'] },
  { key: 'neon', name: 'Neon Night', swatch: ['#0d1117', '#00e5a8', '#ffe14d', '#00e5a8', '#161b26'] },
  { key: 'arcade', name: 'Arcade Violet', swatch: ['#f1efff', '#6a45ff', '#ffbe0b', '#18b85a', '#24214d'] },
  { key: 'ocean', name: 'Ocean Pop', swatch: ['#e4f4ff', '#0a74ff', '#ffb703', '#06c48a', '#0b2545'] },
  { key: 'sunset', name: 'Sunset Strip', swatch: ['#fff0e3', '#ff4f3f', '#ffc93c', '#1fa97a', '#3b1a1f'] },
  { key: 'mint', name: 'Mint & Coral', swatch: ['#e6f8f0', '#ff6b5e', '#ffd166', '#12a37f', '#183a33'] },
  { key: 'bubblegum', name: 'Bubblegum', swatch: ['#ffeaf4', '#ff3d8b', '#ffd23f', '#1db97a', '#3d1840'] },
  { key: 'midnight', name: 'Midnight Arcade', swatch: ['#141128', '#ff3d8b', '#ffd23f', '#2ee68f', '#221d42'] },
]

const KEY = 'wr-look'
const PKEY = 'wr-palette'
const listeners = new Set<() => void>()

function read(): Look {
  try {
    const v = localStorage.getItem(KEY) as Look | null
    if (v && LOOKS.some((l) => l.key === v)) return v
  } catch {
    /* storage unavailable */
  }
  return 'game'
}

let current: Look = read()

function readPalette(): Palette {
  try {
    const v = localStorage.getItem(PKEY) as Palette | null
    if (v && PALETTES.some((p) => p.key === v)) return v
  } catch {
    /* storage unavailable */
  }
  return 'auto'
}

let palette: Palette = readPalette()

// "Auto" follows the device's light/dark setting.
const darkQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null
darkQuery?.addEventListener?.('change', () => {
  if (palette === 'auto') apply()
})

function apply() {
  document.documentElement.dataset.style = current
  document.documentElement.dataset.palette = palette === 'auto' ? (darkQuery?.matches ? 'neon' : 'neonday') : palette
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg || '#14110f')
}

export function initLook() {
  apply()
}

export function setLook(l: Look) {
  current = l
  try {
    localStorage.setItem(KEY, l)
  } catch {
    /* storage unavailable */
  }
  apply()
  listeners.forEach((f) => f())
}

export function setPalette(p: Palette) {
  palette = p
  try {
    localStorage.setItem(PKEY, p)
  } catch {
    /* storage unavailable */
  }
  apply()
  listeners.forEach((f) => f())
}

export function usePalette() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => {
        listeners.delete(l)
      }
    },
    () => palette
  )
}

export function useLook() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => {
        listeners.delete(l)
      }
    },
    () => current
  )
}
