// Remix: translate an existing work (left column, factual) into the writer's own version (right column).
import { BEATS, emptyBeats } from './framework'
import type { BeatKey, Kind, Project, Remix, Source } from './types'
import { filled } from './util'

export type SectionKey = 'pitch' | 'tv' | 'characters' | 'beats' | 'setPieces' | 'locations' | 'objects' | 'notable'

export const SECTIONS: { key: SectionKey; title: string; blurb: string; addLabel?: string }[] = [
  { key: 'pitch', title: 'Core pitch', blurb: 'The hero, the want, the obstacle, the world — in your genre.' },
  { key: 'tv', title: 'Series engine', blurb: 'What makes a new story every week.' },
  { key: 'characters', title: 'Characters', blurb: 'Who are they in your version? Merge, split, cut or invent.', addLabel: '+ New character of your own' },
  { key: 'beats', title: 'The 9 beats', blurb: 'Their story circle vs. yours.' },
  { key: 'setPieces', title: 'Set pieces', blurb: 'The big memorable sequences.', addLabel: '+ New set piece' },
  { key: 'locations', title: 'Places', blurb: 'Every location is a cost — Simens.', addLabel: '+ New place' },
  { key: 'objects', title: 'Objects & MacGuffins', blurb: 'The things everyone is chasing or using.', addLabel: '+ New object' },
  { key: 'notable', title: 'Other notable elements', blurb: 'Motifs, devices and signatures worth translating for inspiration.', addLabel: '+ New element' },
]

type Right = { kind: 'field'; field: 'title' | 'hero' | 'want' | 'obstacle' | 'logline' | 'theme' | 'engine' } | { kind: 'beat'; beat: BeatKey } | { kind: 'note' }

export interface Row {
  key: string
  section: SectionKey
  label: string
  sub?: string
  left: string
  // Path into Source for editing the left column.
  path: (string | number)[]
  right: Right
  questions: string[]
}

const q = (genre: string, ...lines: string[]) => lines.map((l) => l.replace(/\{g\}/g, genre || 'your genre'))

export function rows(p: Project): Row[] {
  const r = p.remix
  if (!r) return []
  const s = r.source
  const g = p.genre || 'your genre'
  const out: Row[] = []
  const pitch = (key: string, label: string, path: string, right: Right, questions: string[]) =>
    out.push({ key, section: 'pitch', label, left: String((s as unknown as Record<string, string>)[path] ?? ''), path: [path], right, questions })

  pitch('title', 'Title', 'title', { kind: 'field', field: 'title' }, q(g, 'What is your version called?'))
  pitch('hero', 'The hero', 'hero', { kind: 'field', field: 'hero' }, q(g, 'Who is the hero in your {g}?', 'What do they do for a living in your world?', 'What is their flaw in your version?'))
  pitch('want', 'The want', 'heroWant', { kind: 'field', field: 'want' }, q(g, 'What does your hero want — one thing we can see?', 'Is it the same want in new clothes, or something different?'))
  pitch('obstacle', 'What stands in the way', 'obstacle', { kind: 'field', field: 'obstacle' }, q(g, 'Who or what opposes your hero in your {g}?', 'What is the {g} version of this force?'))
  pitch('logline', 'Logline', 'logline', { kind: 'field', field: 'logline' }, q(g, 'Now say your version in one sentence.', 'Could someone tell what genre it is from the logline alone?'))
  pitch('theme', 'Theme question', 'theme', { kind: 'field', field: 'theme' }, q(g, 'Does your version ask the same question — or a new one?', 'What question does your ending answer?'))
  pitch('tone', 'Tone', 'tone', { kind: 'note' }, q(g, 'What is the tone of your version?', 'What does {g} do to the tone?'))
  pitch('world', 'The world', 'world', { kind: 'note' }, q(g, 'Where and when is your version set?', 'What world does your {g} live in?'))
  pitch('worldRules', 'The world’s rules', 'worldRules', { kind: 'note' }, q(g, 'What are the special rules of your world?', 'What replaces these rules in your {g}?'))

  if (s.kind === 'tv' || p.kind === 'tv')
    out.push({
      key: 'engine',
      section: 'tv',
      label: 'Engine',
      left: s.engine,
      path: ['engine'],
      right: { kind: 'field', field: 'engine' },
      questions: q(g, 'What conflict makes a new story every week in your version?', 'What keeps your characters stuck together?'),
    })

  s.characters.forEach((c, i) =>
    out.push({
      key: `char:${i}`,
      section: 'characters',
      label: c.name,
      sub: c.role,
      left: [c.description, c.want && `Wants: ${c.want}`, c.flaw && `Flaw: ${c.flaw}`].filter(Boolean).join('\n'),
      path: ['characters', i, 'description'],
      right: { kind: 'note' },
      questions: q(g, `Who is the ${c.role.toLowerCase()} in your {g}?`, 'What is their name, job and want in your version?', 'Keep, merge with someone else, or cut?'),
    })
  )

  BEATS.forEach((b) =>
    out.push({
      key: `beat:${b.key}`,
      section: 'beats',
      label: `${b.n}. ${b.title}`,
      sub: b.short,
      left: s.beats[b.key] ?? '',
      path: ['beats', b.key],
      right: { kind: 'beat', beat: b.key },
      questions: q(g, `How does this beat play in your {g}?`, ...b.questions.slice(0, 2)),
    })
  )

  const named = (section: 'setPieces' | 'locations' | 'objects', list: { name: string; description: string }[], qs: string[]) =>
    list.forEach((x, i) =>
      out.push({ key: `${section}:${i}`, section, label: x.name, left: x.description, path: [section, i, 'description'], right: { kind: 'note' }, questions: qs })
    )
  named('setPieces', s.setPieces, q(g, 'What is the {g} version of this sequence?', 'Keep it, replace it, or cut it?'))
  named('locations', s.locations, q(g, 'Where does this happen in your world?', 'Could it share a location with another scene? (budget)'))
  named('objects', s.objects, q(g, 'What is this object in your {g}?', 'Who wants it, and why?'))
  s.notable.forEach((x, i) =>
    out.push({
      key: `notable:${i}`,
      section: 'notable',
      label: x.label,
      left: x.text,
      path: ['notable', i, 'text'],
      right: { kind: 'note' },
      questions: q(g, 'How does this translate into your {g}?', 'Keep it, twist it, or drop it?'),
    })
  )
  return out
}

export function getRight(p: Project, row: Row): string {
  if (row.right.kind === 'field') return p[row.right.field]
  if (row.right.kind === 'beat') return p.beats[row.right.beat]
  return p.remix?.notes[row.key] ?? ''
}

export function setRight(p: Project, row: Row, v: string): Project {
  if (row.right.kind === 'field') return { ...p, [row.right.field]: v }
  if (row.right.kind === 'beat') return { ...p, beats: { ...p.beats, [row.right.beat]: v } }
  return { ...p, remix: { ...p.remix!, notes: { ...p.remix!.notes, [row.key]: v } } }
}

export function setLeft(p: Project, row: Row, v: string): Project {
  const src = structuredClone(p.remix!.source) as unknown as Record<string, unknown>
  let cur = src as Record<string | number, unknown>
  row.path.slice(0, -1).forEach((k) => (cur = cur[k] as Record<string | number, unknown>))
  cur[row.path[row.path.length - 1]] = v
  return { ...p, remix: { ...p.remix!, source: src as unknown as Source } }
}

export const rowDone = (p: Project, row: Row) => filled(getRight(p, row)) || !!p.remix?.skipped[row.key]

export function remixProgress(p: Project) {
  const rs = rows(p)
  const done = rs.filter((r) => rowDone(p, r)).length
  return { done, total: rs.length }
}

export function emptySource(title: string, kind: Kind): Source {
  return {
    found: true,
    message: '',
    title,
    year: '',
    kind,
    genre: '',
    tone: '',
    logline: '',
    theme: '',
    world: '',
    worldRules: '',
    hero: '',
    heroWant: '',
    obstacle: '',
    characters: [
      { name: 'Hero', role: 'Hero', description: '', want: '', flaw: '' },
      { name: 'Villain', role: 'Villain', description: '', want: '', flaw: '' },
    ],
    beats: emptyBeats(),
    engine: '',
    setPieces: [],
    locations: [],
    objects: [],
    notable: [],
  }
}

export function newRemix(source: Source, fromClaude: boolean): Remix {
  return { source, fetchedAt: Date.now(), fromClaude, notes: {}, skipped: {}, extras: [] }
}

export async function fetchBreakdown(title: string, kind: Kind | '', token?: string): Promise<Source> {
  const res = await fetch('/api/breakdown', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ title, kind }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data) throw new Error(data?.error ?? `Breakdown failed (${res.status}). Is the app deployed with ANTHROPIC_API_KEY set?`)
  return data as Source
}
