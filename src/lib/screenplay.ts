import type { ElType, Project, ScriptEl } from './types'
import { uid } from './util'

export const EL_TYPES: ElType[] = ['scene', 'action', 'character', 'parenthetical', 'dialogue', 'transition']

export const EL_LABEL: Record<ElType, string> = {
  scene: 'Scene',
  action: 'Action',
  character: 'Character',
  parenthetical: 'Paren',
  dialogue: 'Dialogue',
  transition: 'Transition',
}

// What Enter creates after each element type (Final Draft style).
export const NEXT_TYPE: Record<ElType, ElType> = {
  scene: 'action',
  action: 'action',
  character: 'dialogue',
  parenthetical: 'dialogue',
  dialogue: 'character',
  transition: 'scene',
}

export const newEl = (type: ElType, text = ''): ScriptEl => ({ id: uid(), type, text })

// Line widths in a standard Courier 12pt screenplay.
const WIDTH: Record<ElType, number> = {
  scene: 61,
  action: 61,
  character: 38,
  parenthetical: 25,
  dialogue: 35,
  transition: 61,
}

const LINES_PER_PAGE = 55

function wrapLines(text: string, width: number) {
  if (!text) return 1
  return text.split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / width)), 0)
}

export function estimatePages(els: ScriptEl[]) {
  let lines = 0
  for (const el of els) {
    const blankBefore = el.type === 'dialogue' || el.type === 'parenthetical' ? 0 : 1
    lines += blankBefore + wrapLines(el.text, WIDTH[el.type])
  }
  return lines / LINES_PER_PAGE
}

export const loggedPages = (p: Project) => p.pageLogs.reduce((s, l) => s + (Number(l.pages) || 0), 0)

export const totalPages = (p: Project) => estimatePages(p.script) + loggedPages(p)

export const HEADING_RE = /^(INT\.?\s*\/\s*EXT\.?|EXT\.?\s*\/\s*INT\.?|I\/E\.?|INT\.|EXT\.|EST\.|INT |EXT )/i

export function parseHeading(text: string) {
  const t = text.trim().toUpperCase()
  const m = t.match(HEADING_RE)
  const rest = m ? t.slice(m[0].length).trim() : t.replace(/^\./, '').trim()
  const parts = rest.split(/\s+[-–—]\s+/)
  const time = parts.length > 1 ? parts.pop()!.trim() : ''
  const location = parts.join(' - ').trim()
  return { prefix: m ? m[0].trim() : '', location, time }
}

export function cleanCharacter(name: string) {
  return name
    .replace(/\(.*?\)/g, '')
    .replace(/\^$/, '')
    .trim()
    .toUpperCase()
}

// ---- Fountain export / import (plain text that Final Draft, Highland, WriterDuet and others open) ----

export function toFountain(p: Project) {
  const out: string[] = []
  if (p.title.trim()) out.push(`Title: ${p.title.trim()}`, '')
  for (let i = 0; i < p.script.length; i++) {
    const el = p.script[i]
    const text = el.text.trim()
    if (!text && el.type !== 'action') continue
    switch (el.type) {
      case 'scene': {
        const up = text.toUpperCase()
        out.push('', HEADING_RE.test(up) ? up : `.${up}`)
        break
      }
      case 'character': {
        const up = text.toUpperCase()
        out.push('', /[A-Z]/.test(up) ? up : `@${text}`)
        break
      }
      case 'parenthetical':
        out.push(text.startsWith('(') ? text : `(${text})`)
        break
      case 'dialogue':
        out.push(text)
        break
      case 'transition': {
        const up = text.toUpperCase()
        out.push('', up.endsWith('TO:') ? up : `> ${up}`)
        break
      }
      default:
        out.push('', text)
    }
  }
  return out.join('\n').replace(/^\n+/, '') + '\n'
}

export function fromFountain(src: string): ScriptEl[] {
  const text = src.replace(/\r\n?/g, '\n').replace(/\/\*[\s\S]*?\*\//g, '')
  const lines = text.split('\n')
  let i = 0
  // Skip title page (key: value lines at the top).
  if (/^[A-Za-z ]+:/.test(lines[0] ?? '')) {
    while (i < lines.length && lines[i].trim() !== '') i++
  }
  const blocks: string[][] = []
  let cur: string[] = []
  for (; i < lines.length; i++) {
    const l = lines[i]
    if (l.trim() === '') {
      if (cur.length) blocks.push(cur)
      cur = []
    } else cur.push(l)
  }
  if (cur.length) blocks.push(cur)

  const els: ScriptEl[] = []
  for (const b of blocks) {
    const first = b[0].trim()
    if (first.startsWith('#') || first.startsWith('=')) continue
    if (first.startsWith('.') && !first.startsWith('..')) {
      els.push(newEl('scene', first.slice(1).trim()))
      if (b.length > 1) els.push(newEl('action', b.slice(1).join('\n')))
    } else if (HEADING_RE.test(first)) {
      els.push(newEl('scene', first))
      if (b.length > 1) els.push(newEl('action', b.slice(1).join('\n')))
    } else if (first.startsWith('>') && !first.endsWith('<')) {
      els.push(newEl('transition', first.slice(1).trim()))
    } else if (/^[A-Z0-9 .'-]+TO:$/.test(first)) {
      els.push(newEl('transition', first))
    } else if (
      b.length > 1 &&
      (first.startsWith('@') || (first === first.toUpperCase() && /[A-Z]/.test(first) && !first.startsWith('!')))
    ) {
      els.push(newEl('character', first.replace(/^@/, '')))
      let dia: string[] = []
      const flush = () => {
        if (dia.length) els.push(newEl('dialogue', dia.join('\n')))
        dia = []
      }
      for (const l of b.slice(1)) {
        const t = l.trim()
        if (t.startsWith('(') && t.endsWith(')')) {
          flush()
          els.push(newEl('parenthetical', t))
        } else dia.push(t)
      }
      flush()
    } else {
      els.push(newEl('action', b.map((l) => l.replace(/^!/, '')).join('\n')))
    }
  }
  return els
}
