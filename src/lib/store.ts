// Local-first store. Everything is saved to this device (IndexedDB) instantly,
// then synced to Supabase when signed in. Conflicts: last edit wins, per item.
import { useSyncExternalStore } from 'react'
import { createStore, entries, setMany } from 'idb-keyval'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { filledSteps, isLoglineDone, isOutlineDone, newProject, normalize, projectWords, scriptPages } from './project'
import type { Activity, Item, Kind, Project, Settings, TvFormat } from './types'
import { dateKey, uid } from './util'

const idb = createStore('writers-room', 'items')

const DEFAULT_SETTINGS: Settings = { dailyIdeas: 1, weeklyOutlines: 1, monthlyScripts: 1 }

function deviceId() {
  try {
    let id = localStorage.getItem('wr-device')
    if (!id) {
      id = uid()
      localStorage.setItem('wr-device', id)
    }
    return id
  } catch {
    return 'device'
  }
}
const DEVICE = deviceId()

export type SyncStatus = 'local' | 'signed-out' | 'syncing' | 'synced' | 'offline' | 'error'

export interface State {
  ready: boolean
  projects: Project[]
  trash: Project[]
  activity: Activity[]
  settings: Settings
  user: User | null
  sync: SyncStatus
  syncError: string
  lastSync: number
}

const items = new Map<string, Item>()
let state: State = {
  ready: false,
  projects: [],
  trash: [],
  activity: [],
  settings: DEFAULT_SETTINGS,
  user: null,
  sync: supabase ? 'signed-out' : 'local',
  syncError: '',
  lastSync: 0,
}
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function rebuild() {
  const projects: Project[] = []
  const trash: Project[] = []
  const activity: Activity[] = []
  let settings = DEFAULT_SETTINGS
  items.forEach((it) => {
    if (it.type === 'project') {
      if ((it.data as { purged?: boolean }).purged) return
      ;(it.deleted ? trash : projects).push(it.data as Project)
    }
    else if (it.type === 'activity' && !it.deleted) activity.push(it.data as Activity)
    else if (it.type === 'settings') settings = { ...DEFAULT_SETTINGS, ...(it.data as Settings) }
  })
  const updated = (p: Project) => items.get(p.id)?.updatedAt ?? 0
  projects.sort((a, b) => updated(b) - updated(a))
  trash.sort((a, b) => updated(b) - updated(a))
  state = { ...state, projects, trash, activity, settings }
  emit()
}

// ---- persistence ----
const pendingWrites = new Map<string, Item>()
let writeTimer: ReturnType<typeof setTimeout> | undefined

function persist(it: Item) {
  pendingWrites.set(it.id, it)
  clearTimeout(writeTimer)
  writeTimer = setTimeout(flushWrites, 300)
}

async function flushWrites() {
  const batch = [...pendingWrites.values()]
  pendingWrites.clear()
  if (batch.length) await setMany(batch.map((it) => [it.id, it] as [string, Item]), idb)
}

window.addEventListener('pagehide', () => void flushWrites())
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') void flushWrites()
})

function put(it: Item) {
  items.set(it.id, it)
  persist(it)
  schedulePush()
}

function save<T>(id: string, type: Item['type'], data: T, deleted = false) {
  put({ id, type, data, updatedAt: Date.now(), deleted, dirty: true })
}

// ---- toasts (XP pops) ----
export interface Toast {
  id: string
  text: string
  xp?: number
  big?: boolean
}
const toastListeners = new Set<(t: Toast) => void>()
export const onToast = (fn: (t: Toast) => void) => {
  toastListeners.add(fn)
  return () => {
    toastListeners.delete(fn)
  }
}
export const toast = (text: string, xp?: number, big = false) =>
  toastListeners.forEach((l) => l({ id: uid(), text, xp, big }))

// ---- activity ----
function addActivity(words: number, pages: number, steps: number) {
  if (words <= 0 && pages <= 0 && steps <= 0) return
  const date = dateKey()
  const id = `act:${date}:${DEVICE}`
  const cur = (items.get(id)?.data as Activity) ?? { date, deviceId: DEVICE, words: 0, pages: 0, steps: 0 }
  save(id, 'activity', {
    ...cur,
    words: cur.words + Math.max(0, words),
    pages: Math.round((cur.pages + Math.max(0, pages)) * 1000) / 1000,
    steps: cur.steps + Math.max(0, steps),
  })
}

// ---- public actions ----
export function createProject(kind: Kind, tvFormat: TvFormat = 'half') {
  const p = newProject(kind, tvFormat)
  save(p.id, 'project', p)
  rebuild()
  return p.id
}

export function getProject(id: string) {
  const it = items.get(id)
  if (!it || it.type !== 'project' || (it.data as { purged?: boolean }).purged) return undefined
  return normalize(it.data as Project)
}

export function updateProject(id: string, fn: (p: Project) => Project, opts: { noCredit?: boolean } = {}) {
  const before = getProject(id)
  if (!before) return
  const after = { ...fn(before) }

  // Words and pages: credit only new high-water marks, so deleting and retyping doesn't farm XP.
  const words = projectWords(after)
  const pages = scriptPages(after)
  const gainedWords = opts.noCredit ? 0 : Math.max(0, words - before.maxWords)
  const gainedPages = opts.noCredit ? 0 : Math.max(0, pages - before.maxScriptPages)
  after.maxWords = Math.max(before.maxWords, words)
  after.maxScriptPages = Math.max(before.maxScriptPages, pages)

  // Steps: each distinct step is credited once, ever.
  const credited = new Set(before.credited)
  const newSteps = filledSteps(after).filter((k) => !credited.has(k))
  newSteps.forEach((k) => credited.add(k))
  after.credited = [...credited]

  if (!after.loglineDoneAt && isLoglineDone(after)) {
    after.loglineDoneAt = Date.now()
    toast('Logline complete — idea logged!', 50, true)
  }
  if (!after.outlineDoneAt && isOutlineDone(after)) {
    after.outlineDoneAt = Date.now()
    toast('Outline complete — full circle!', 250, true)
  }

  save(id, 'project', after)
  if (!opts.noCredit) {
    addActivity(gainedWords, gainedPages, newSteps.length)
    if (newSteps.length) toast(newSteps.length === 1 ? 'Step complete' : `${newSteps.length} steps complete`, newSteps.length * 10)
  }
  rebuild()
}

export function finishScript(id: string, done: boolean) {
  updateProject(id, (p) => ({ ...p, scriptDoneAt: done ? Date.now() : undefined }))
  if (done) toast('FADE OUT. Screenplay complete!', 1500, true)
}

export function logPages(id: string, pages: number, note: string) {
  if (!(pages > 0)) return
  updateProject(id, (p) => ({ ...p, pageLogs: [...p.pageLogs, { id: uid(), date: dateKey(), pages, note }] }))
  addActivity(0, pages, 0)
  toast(`${pages} page${pages === 1 ? '' : 's'} logged`, Math.floor(pages * 15))
  rebuild()
}

export function trashProject(id: string, deleted = true) {
  const it = items.get(id)
  if (!it) return
  put({ ...it, deleted, updatedAt: Date.now(), dirty: true })
  rebuild()
}

export function purgeProject(id: string) {
  // Keep a tombstone so other devices learn about the delete.
  const it = items.get(id)
  if (!it) return
  put({ ...it, data: { id, purged: true }, deleted: true, updatedAt: Date.now(), dirty: true })
  rebuild()
}

export function updateSettings(s: Partial<Settings>) {
  save('settings', 'settings', { ...state.settings, ...s })
  rebuild()
}

// ---- backup ----
export function exportBackup() {
  const data = [...items.values()].map(({ dirty: _d, ...rest }) => rest)
  return JSON.stringify({ app: 'writers-room', version: 1, exportedAt: Date.now(), items: data }, null, 2)
}

export function importBackup(json: string) {
  const parsed = JSON.parse(json)
  const list: Item[] = parsed.items ?? []
  let n = 0
  for (const it of list) {
    if (!it.id || !it.type) continue
    const cur = items.get(it.id)
    if (!cur || cur.updatedAt < it.updatedAt) {
      put({ ...it, dirty: true })
      n++
    }
  }
  rebuild()
  return n
}

// ---- sync ----
let pushTimer: ReturnType<typeof setTimeout> | undefined
let syncing = false
let again = false

function schedulePush() {
  if (!supabase || !state.user) return
  clearTimeout(pushTimer)
  pushTimer = setTimeout(() => void syncNow(), 1500)
}

function setSync(sync: SyncStatus, syncError = '') {
  state = { ...state, sync, syncError }
  emit()
}

const pullKey = () => `wr-lastpull:${state.user?.id}`

export async function syncNow() {
  if (!supabase || !state.user) return
  if (syncing) {
    again = true
    return
  }
  if (!navigator.onLine) return setSync('offline')
  syncing = true
  setSync('syncing')
  try {
    // Push local changes.
    const dirty = [...items.values()].filter((it) => it.dirty)
    if (dirty.length) {
      const payload = dirty.map((it) => ({
        id: it.id,
        type: it.type,
        data: it.data,
        updated_at: it.updatedAt,
        deleted: it.deleted,
      }))
      for (let i = 0; i < payload.length; i += 200) {
        const { error } = await supabase.rpc('push_items', { payload: payload.slice(i, i + 200) })
        if (error) throw error
      }
      dirty.forEach((it) => {
        const cur = items.get(it.id)
        if (cur && cur.updatedAt === it.updatedAt) {
          const clean = { ...cur, dirty: false }
          items.set(it.id, clean)
          persist(clean)
        }
      })
    }

    // Pull remote changes (with a small overlap window; merging is idempotent).
    const since = localStorage.getItem(pullKey()) ?? '1970-01-01T00:00:00Z'
    const overlap = new Date(new Date(since).getTime() - 60_000).toISOString()
    let maxTs = since
    let from = 0
    for (;;) {
      const { data, error } = await supabase
        .from('items')
        .select('id,type,data,updated_at,deleted,server_ts')
        .gt('server_ts', overlap)
        .order('server_ts', { ascending: true })
        .range(from, from + 499)
      if (error) throw error
      for (const r of data ?? []) {
        if (Date.parse(r.server_ts) > Date.parse(maxTs)) maxTs = r.server_ts
        const cur = items.get(r.id)
        const remoteTs = Number(r.updated_at)
        if (cur && cur.updatedAt >= remoteTs) continue
        const purged = (r.data as { purged?: boolean })?.purged
        const data = r.type === 'project' && !purged ? normalize(r.data as Project) : r.data
        const it: Item = { id: r.id, type: r.type, data, updatedAt: remoteTs, deleted: r.deleted, dirty: false }
        items.set(it.id, it)
        persist(it)
      }
      if (!data || data.length < 500) break
      from += 500
    }
    localStorage.setItem(pullKey(), maxTs)
    state = { ...state, lastSync: Date.now() }
    rebuild()
    setSync('synced')
  } catch (e) {
    setSync(navigator.onLine ? 'error' : 'offline', e instanceof Error ? e.message : String(e))
  } finally {
    syncing = false
    if (again) {
      again = false
      schedulePush()
    }
  }
}

export async function signIn(email: string) {
  if (!supabase) throw new Error('Sync is not configured')
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
  if (error) throw error
}

export async function signOut() {
  await supabase?.auth.signOut()
}

// ---- boot ----
export async function init() {
  const all = await entries<string, Item>(idb)
  all.forEach(([id, it]) => {
    if (it.type === 'project' && !(it.data as { purged?: boolean }).purged) it.data = normalize(it.data as Project)
    items.set(id, it)
  })
  state = { ...state, ready: true }
  rebuild()

  if (supabase) {
    const onUser = (user: User | null) => {
      const prev = state.user?.id
      state = { ...state, user, sync: user ? state.sync : 'signed-out' }
      emit()
      if (user && user.id !== prev) {
        // First sync for this account on this device: upload everything local.
        const flag = `wr-uploaded:${user.id}`
        if (!localStorage.getItem(flag)) {
          items.forEach((it) => items.set(it.id, { ...it, dirty: true }))
          localStorage.setItem(flag, '1')
        }
        void syncNow()
      }
    }
    const { data } = await supabase.auth.getSession()
    onUser(data.session?.user ?? null)
    supabase.auth.onAuthStateChange((_e, session) => onUser(session?.user ?? null))
    window.addEventListener('online', () => void syncNow())
    window.addEventListener('focus', () => void syncNow())
    setInterval(() => document.visibilityState === 'visible' && void syncNow(), 60_000)
  }
}

export function useStore() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state
  )
}

export function useProject(id: string) {
  const s = useStore()
  return s.projects.find((p) => p.id === id) ?? s.trash.find((p) => p.id === id)
}
