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
    stakes: '',
    whyNow: '',
    whyYou: '',
    comp1: '',
    comp2: '',
    budget: '',
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

// Pitch parts 1–5 make the idea (title + genre, hero, want, obstacle, stakes); part 6 makes it pitch-ready.
export const loglineParts = (p: Project) => [p.title, p.hero, p.want, p.obstacle, p.stakes]

export const isLoglineDone = (p: Project) => filled(p.genre) && loglineParts(p).every(filled)

export const isPitchReady = (p: Project) => isLoglineDone(p) && filled(p.whyNow) && filled(p.whyYou)

const article = (w: string) => (/^[aeiou]/i.test(w.trim()) ? 'an' : 'a')
const bare = (s: string) => s.trim().replace(/[.!?]+$/, '')
// Lower-case a leading everyday word so the writer's sentence fits mid-line ("A caller" → "a caller"); names stay as typed.
const OPENERS = /^(a|an|the|if|he|she|they|it|his|her|their|its|everyone|everything|nobody|no one|someone|people)\b/i
const fit = (s: string) => (OPENERS.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s)

export const formatLabel = (p: Project) =>
  p.kind === 'film' ? 'feature' : p.tvFormat === 'half' ? 'half-hour series' : 'hour-long series'

// The fill-in pitch line, built only from the writer's own answers. Missing pieces stay as [blanks].
export function pitchLine(p: Project) {
  const g = p.genres.length ? p.genres.join('-').toLowerCase() : ''
  const parts: { text: string; blank?: boolean }[] = []
  const put = (v: string, blank: string) => parts.push(v.trim() ? { text: bare(v) } : { text: `[${blank}]`, blank: true })
  put(p.title, 'Title')
  parts.push({ text: g ? ` is ${article(g)} ${g} ${formatLabel(p)} about ` : ' is a ' })
  if (!g) parts.push({ text: '[genre]', blank: true }, { text: ` ${formatLabel(p)} about ` })
  const hero = bare(p.hero).replace(/^(a|an|the)\s+/i, '')
  parts.push(hero ? { text: `${article(hero)} ${hero}` } : { text: 'a ' }, ...(hero ? [] : [{ text: '[hero]', blank: true }]))
  parts.push({ text: ' who wants ' })
  put(bare(p.want).replace(/^(he|she|they|it|i)\s+wants?\s+/i, ''), 'goal')
  parts.push({ text: ', but ' })
  put(fit(bare(p.obstacle)), 'problem')
  const stakes = bare(p.stakes)
  if (/^if\b/i.test(stakes)) {
    // The writer already phrased it as a condition: use their sentence as written.
    parts.push({ text: '. ' }, { text: stakes.charAt(0).toUpperCase() + stakes.slice(1) })
  } else {
    parts.push({ text: '. If they fail, ' })
    put(fit(stakes), 'stakes')
  }
  parts.push({ text: '.' })
  if (p.comp1.trim() || p.comp2.trim()) {
    parts.push({ text: ' It’s ' })
    put(p.comp1, 'comp')
    parts.push({ text: ' meets ' })
    put(p.comp2, 'comp')
    parts.push({ text: '.' })
  }
  return parts
}

export const pitchText = (p: Project) => pitchLine(p).map((x) => x.text).join('')

// Spoken pitch: the line plus why now / why you / engine / budget, at ~150 words a minute.
export function pitchSeconds(p: Project) {
  const spoken = [pitchText(p), p.whyNow, p.whyYou, p.kind === 'tv' ? p.engine : '', p.budget].join(' ')
  const words = spoken.replace(/\[[^\]]*\]/g, '').split(/\s+/).filter(Boolean).length
  return Math.round((words / 150) * 60)
}

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
  if (!filled(p.title)) return { label: 'Name it', tab: 'pitch', focus: 'title' }
  if (!filled(p.genre)) return { label: 'Pick a genre', tab: 'pitch', focus: 'genre' }
  const labels = { hero: 'the hero', want: 'what they want', obstacle: 'what stands in the way', stakes: 'what’s at stake' }
  for (const k of ['hero', 'want', 'obstacle', 'stakes'] as const)
    if (!filled(p[k])) return { label: `Write ${labels[k]}`, tab: 'pitch', focus: k }
  if (!filled(p.whyNow) || !filled(p.whyYou)) return { label: 'Why now and why you', tab: 'pitch', focus: 'why' }
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
  ;[p.title, p.seed, p.hero, p.want, p.obstacle, p.stakes, p.whyNow, p.whyYou, p.comp1, p.comp2, p.budget, p.logline, p.theme, p.engine, p.notes].forEach(add)
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
  ;(['genre', 'title', 'hero', 'want', 'obstacle', 'stakes', 'whyNow', 'whyYou', 'comp1', 'comp2', 'budget', 'logline', 'theme', 'engine'] as const).forEach((k) => {
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
