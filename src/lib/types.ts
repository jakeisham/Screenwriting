export type Kind = 'film' | 'tv'
export type TvFormat = 'half' | 'hour'
export type BeatKey = 'you' | 'want' | 'push' | 'go' | 'search' | 'find' | 'take' | 'return' | 'change'
export type Beats = Record<BeatKey, string>
export type Act = 1 | 2 | 3

export interface Scene {
  id: string
  act: Act
  beat: BeatKey | ''
  intExt: 'INT.' | 'EXT.' | 'INT./EXT.'
  location: string
  time: string
  characters: string
  summary: string
  dialogue: string
  pages: number | null
  stunt: boolean
  crowd: boolean
  vfx: boolean
}

export type ElType = 'scene' | 'action' | 'character' | 'parenthetical' | 'dialogue' | 'transition'

export interface ScriptEl {
  id: string
  type: ElType
  text: string
}

export interface Episode {
  id: string
  number: number
  title: string
  logline: string
  beats: Beats
}

export interface CastMember {
  id: string
  name: string
  description: string
}

export interface PageLog {
  id: string
  date: string
  pages: number
  note: string
}

export interface Project {
  id: string
  kind: Kind
  tvFormat: TvFormat
  title: string
  genre: string
  seed: string
  hero: string
  want: string
  obstacle: string
  logline: string
  theme: string
  beats: Beats
  checks: Record<string, boolean>
  scenes: Scene[]
  script: ScriptEl[]
  pageLogs: PageLog[]
  engine: string
  cast: CastMember[]
  seasonBeats: Beats
  episodes: Episode[]
  notes: string
  // Gamification bookkeeping: credit is only ever given once.
  credited: string[]
  maxWords: number
  maxScriptPages: number
  loglineDoneAt?: number
  outlineDoneAt?: number
  scriptDoneAt?: number
  createdAt: number
}

export interface Activity {
  date: string
  deviceId: string
  words: number
  pages: number
  steps: number
}

export interface Settings {
  dailyIdeas: number
  weeklyOutlines: number
  monthlyScripts: number
}

export type ItemType = 'project' | 'activity' | 'settings'

export interface Item<T = unknown> {
  id: string
  type: ItemType
  data: T
  updatedAt: number
  deleted: boolean
  dirty?: boolean
}
