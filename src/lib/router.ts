import { useEffect, useState } from 'react'

const read = () => window.location.hash.replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean)

export function useRoute() {
  const [parts, setParts] = useState(read)
  useEffect(() => {
    const on = () => {
      setParts(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return parts
}

export const go = (path: string) => {
  window.location.hash = `#/${path.replace(/^\//, '')}`
}

export const href = (path: string) => `#/${path.replace(/^\//, '')}`

export function focusField(id: string) {
  // Wait for the target tab to render.
  setTimeout(() => {
    const el = document.getElementById(`f-${id}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.querySelector<HTMLElement>('textarea, input, select')?.focus({ preventScroll: true })
    el.classList.add('flash')
    setTimeout(() => el.classList.remove('flash'), 1200)
  }, 80)
}
