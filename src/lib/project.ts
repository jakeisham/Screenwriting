import { BEAT_KEYS, emptyBeats, lengthTarget } from './framework'
import { estimatePages, totalPages } from './screenplay'
import type { Act, Kind, Project, Scene, TvFormat } from './types'
import { countWords, filled, uid } from './util'

export function newProject(kind: Kind, tvFormat: TvFormat = 'half'): Project {
  return {
    id: uid(),
    kind,
    tvFormat,
    title: '',
    genre: '',
    genres: [],
    seed: '',
    hero: '',
    want: '',
    obstacle: '',
    logline: '',
    theme: '',
    beats: emptyBeats(),
    checks: {},
    scenes: [],
    script: [],
    pageLogs: [],
    engine: '',
    cast: [],
    seasonBeats: emptyBeats(),
    episodes: [],
    notes: '',
    credited: [],
    maxWords: 0,
    maxScriptPages: 0,
    createdAt: Date.now(),
  }
}

// Fill in any fields missing from older/partial records.
export function normalize(p: Partial<Project>): Project {
  const base = newProject(p.kind ?? 'film', p.tvFormat ?? 'half')
  return {
    ...base,
    ...p,
    beats: { ...base.beats, ...(p.beats ?? {}) },
    seasonBeats: { ...base.seasonBeats, ...(p.seasonBeats ?? {}) },
    genres: p.genres?.length ? p.genres : p.genre ? [p.genre] : [],
    remix: p.remix
      ? { ...p.remix, notes: p.remix.notes ?? {}, skipped: p.remix.skipped ?? {}, extras: p.remix.extras ?? [] }
      : undefined,
  } as Project
}

export function newScene(act: Act): Scene {
  return {
    id: uid(),
    act,
    beat: '',
    intExt: 'INT.',
    location: '',
    time: 'DAY',
    characters: '',
    summary: '',
    dialogue: '',
    pages: null,
    stunt: false,
    crowd: false,
    vfx: false,
  }
}

export const sceneHeading = (s: Scene) =>
  `${s.intExt} ${s.location.trim().toUpperCase() || '…'}${s.time ? ` - ${s.time}` : ''}`

export const sceneFilled = (s: Scene) => filled(s.location) && filled(s.summary)

// ---- Completion rules (these drive the quotas) ----

export const loglineParts = (p: Project) => [p.hero, p.want, p.obstacle, p.logline]

export const isLoglineDone = (p: Project) => filled(p.genre) && loglineParts(p).every(filled)

export const beatsFilled = (p: Project) => BEAT_KEYS.filter((k) => filled(p.beats[k])).length

export const actsWithScenes = (p: Project) =>
  ([1, 2, 3] as Act[]).filter((a) => p.scenes.some((s) => s.act === a && sceneFilled(s)))

export const isOutlineDone = (p: Project) =>
  beatsFilled(p) === 9 && actsWithScenes(p).length === 3 && (p.kind === 'film' || filled(p.engine))

export const canFinishScript = (p: Project) => totalPages(p) >= lengthTarget(p.kind, p.tvFormat).min

export type Stage = 'logline' | 'outline' | 'script' | 'done'

export function stage(p: Project): Stage {
  if (p.scriptDoneAt) return 'done'
  if (!isLoglineDone(p)) return 'logline'
  if (!isOutlineDone(p)) return 'outline'
  return 'script'
}

export const STAGE_LABEL: Record<Stage, string> = {
  logline: 'Needs logline',
  outline: 'Needs outline',
  script: 'Needs script',
  done: 'Complete',
}

export interface NextStep {
  label: string
  tab: 'pitch' | 'outline' | 'script' | 'tv'
  focus?: string
}

export function nextStep(p: Project): NextStep | null {
  if (!filled(p.genre)) return { label: 'Pick a genre', tab: 'pitch', focus: 'genre' }
  for (const k of ['hero', 'want', 'obstacle', 'logline'] as const)
    if (!filled(p[k])) return { label: `Write the ${k === 'logline' ? 'logline sentence' : k}`, tab: 'pitch', focus: k }
  if (!filled(p.theme)) return { label: 'Name the theme question', tab: 'pitch', focus: 'theme' }
  if (p.kind === 'tv' && !filled(p.engine)) return { label: 'Define the series engine', tab: 'tv', focus: 'engine' }
  const missing = BEAT_KEYS.find((k) => !filled(p.beats[k]))
  if (missing) return { label: `Fill beat ${BEAT_KEYS.indexOf(missing) + 1} of 9`, tab: 'outline', focus: missing }
  const acts = actsWithScenes(p)
  const noAct = ([1, 2, 3] as Act[]).find((a) => !acts.includes(a))
  if (noAct) return { label: `Add a scene to Act ${noAct}`, tab: 'outline', focus: `act${noAct}` }
  if (!p.scriptDoneAt) return { label: 'Write script pages', tab: 'script' }
  return null
}

// ---- Gamification inputs ----

export function projectWords(p: Project) {
  let n = 0
  const add = (s: string) => (n += countWords(s))
  ;[p.title, p.seed, p.hero, p.want, p.obstacle, p.logline, p.theme, p.engine, p.notes].forEach(add)
  BEAT_KEYS.forEach((k) => {
    add(p.beats[k])
    add(p.seasonBeats[k])
  })
  p.scenes.forEach((s) => [s.location, s.summary, s.dialogue, s.characters].forEach(add))
  p.script.forEach((e) => add(e.text))
  p.cast.forEach((c) => [c.name, c.description].forEach(add))
  p.episodes.forEach((e) => {
    add(e.title)
    add(e.logline)
    BEAT_KEYS.forEach((k) => add(e.beats[k]))
  })
  // Remix: only the writer's right column counts — never the source breakdown.
  if (p.remix) {
    Object.values(p.remix.notes).forEach(add)
    p.remix.extras.forEach((x) => [x.label, x.text].forEach(add))
  }
  return n
}

export const scriptPages = (p: Project) => estimatePages(p.script)

// Every distinct "step" that can earn credit once.
export function filledSteps(p: Project): string[] {
  const keys: string[] = []
  ;(['genre', 'title', 'hero', 'want', 'obstacle', 'logline', 'theme', 'engine'] as const).forEach((k) => {
    if (filled(p[k])) keys.push(k)
  })
  BEAT_KEYS.forEach((k) => {
    if (filled(p.beats[k])) keys.push(`beat:${k}`)
    if (p.kind === 'tv' && filled(p.seasonBeats[k])) keys.push(`season:${k}`)
  })
  p.scenes.forEach((s) => sceneFilled(s) && keys.push(`scene:${s.id}`))
  p.cast.forEach((c) => filled(c.name) && filled(c.description) && keys.push(`cast:${c.id}`))
  p.episodes.forEach((e) => {
    if (filled(e.logline)) keys.push(`ep:${e.id}:logline`)
    BEAT_KEYS.forEach((k) => filled(e.beats[k]) && keys.push(`ep:${e.id}:${k}`))
  })
  if (p.remix) {
    Object.entries(p.remix.notes).forEach(([k, v]) => filled(v) && keys.push(`remix:${k}`))
    p.remix.extras.forEach((x) => filled(x.label) && filled(x.text) && keys.push(`remix:extra:${x.id}`))
  }
  return keys
}

export const displayTitle = (p: Project) => p.title.trim() || 'Untitled'

export const MAX_GENRES = 3

// Keep the primary `genre` in step with the ordered `genres` list.
export const withGenres = (p: Project, genres: string[]): Project => {
  const g = genres.filter(Boolean).slice(0, MAX_GENRES)
  return { ...p, genres: g, genre: g[0] ?? '' }
}

export const genreLabel = (p: Project) => (p.genres.length ? p.genres : p.genre ? [p.genre] : []).join(' / ')
