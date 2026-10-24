import { useSyncExternalStore } from 'react'

export type Look = 'original' | 'paper' | 'board' | 'game'

export const LOOKS: { key: Look; name: string; desc: string; swatch: string[] }[] = [
  { key: 'paper', name: 'Revision Pages', desc: 'Clean script paper, typewriter type, revision-page colors.', swatch: ['#ffffff', '#2c55c9', '#c93c5c', '#e8d36a', '#2f8a4c'] },
  { key: 'board', name: 'The Board', desc: 'Cork board, index cards, pushpins and marker.', swatch: ['#b48a5f', '#fffdf6', '#d2412b', '#2f6db3', '#3a281a'] },
  { key: 'game', name: 'Game Night', desc: 'Bright, chunky game UI with coins and violet.', swatch: ['#f1efff', '#6a45ff', '#ffbe0b', '#18b85a', '#24214d'] },
  { key: 'original', name: 'Night Desk', desc: 'The original dark gold look.', swatch: ['#14110f', '#211c18', '#f2b544', '#7fcf8a', '#f4ede1'] },
]

const KEY = 'wr-look'
const listeners = new Set<() => void>()

function read(): Look {
  try {
    const v = localStorage.getItem(KEY) as Look | null
    if (v && LOOKS.some((l) => l.key === v)) return v
  } catch {
    /* storage unavailable */
  }
  return 'paper'
}

let current: Look = read()

function apply() {
  document.documentElement.dataset.style = current
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
