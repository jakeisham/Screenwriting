import { budgetReport } from './budget'
import type { Activity, Project, Settings } from './types'
import { addDays, dateKey, monthKey, weekStart } from './util'

export const XP = {
  perWords: 10, // 1 XP per 10 new words
  step: 10,
  page: 15,
  logline: 50,
  outline: 250,
  script: 1500,
}

export const LEVELS = [
  { xp: 0, name: 'Production Assistant' },
  { xp: 200, name: "Writers' PA" },
  { xp: 600, name: 'Script Coordinator' },
  { xp: 1500, name: 'Staff Writer' },
  { xp: 3000, name: 'Story Editor' },
  { xp: 6000, name: 'Executive Story Editor' },
  { xp: 10000, name: 'Co-Producer' },
  { xp: 16000, name: 'Producer' },
  { xp: 25000, name: 'Co-Executive Producer' },
  { xp: 40000, name: 'Showrunner' },
  { xp: 65000, name: 'Auteur' },
]

export interface DayTotals {
  words: number
  pages: number
  steps: number
}

export function dailyTotals(activity: Activity[]) {
  const map = new Map<string, DayTotals>()
  for (const a of activity) {
    const t = map.get(a.date) ?? { words: 0, pages: 0, steps: 0 }
    t.words += a.words
    t.pages += a.pages
    t.steps += a.steps
    map.set(a.date, t)
  }
  return map
}

function streakFrom(days: Set<string>) {
  const today = new Date()
  let d = days.has(dateKey(today)) ? today : addDays(today, -1)
  let n = 0
  while (days.has(dateKey(d))) {
    n++
    d = addDays(d, -1)
  }
  return n
}

function bestStreak(days: Set<string>) {
  const sorted = [...days].sort()
  let best = 0
  let run = 0
  let prev: string | null = null
  for (const k of sorted) {
    if (prev && dateKey(addDays(new Date(prev + 'T00:00'), 1)) === k) run++
    else run = 1
    best = Math.max(best, run)
    prev = k
  }
  return best
}

export interface Stats {
  totals: DayTotals
  loglines: number
  outlines: number
  scripts: number
  xp: number
  level: { index: number; name: string; xp: number; next?: { name: string; xp: number }; progress: number }
  ideaStreak: number
  ideaBest: number
  writeStreak: number
  writeBest: number
  ideaToday: number
  outlinesWeek: number
  scriptsMonth: number
  ideaDoneToday: boolean
  wroteToday: boolean
  consistency30: number
  ideaDays30: number
  byDay: Map<string, DayTotals>
  badges: Badge[]
}

export interface Badge {
  id: string
  name: string
  desc: string
  icon: string
  earned: boolean
}

export function computeStats(projects: Project[], activity: Activity[], settings: Settings): Stats {
  const byDay = dailyTotals(activity)
  const totals: DayTotals = { words: 0, pages: 0, steps: 0 }
  byDay.forEach((t) => {
    totals.words += t.words
    totals.pages += t.pages
    totals.steps += t.steps
  })

  const loglineDays = new Set(projects.filter((p) => p.loglineDoneAt).map((p) => dateKey(p.loglineDoneAt!)))
  const writeDays = new Set([...byDay.entries()].filter(([, t]) => t.words + t.steps + t.pages > 0).map(([k]) => k))

  const loglines = projects.filter((p) => p.loglineDoneAt).length
  const outlines = projects.filter((p) => p.outlineDoneAt).length
  const scripts = projects.filter((p) => p.scriptDoneAt).length

  const xp =
    Math.floor(totals.words / XP.perWords) +
    totals.steps * XP.step +
    Math.floor(totals.pages * XP.page) +
    loglines * XP.logline +
    outlines * XP.outline +
    scripts * XP.script

  let li = 0
  LEVELS.forEach((l, i) => xp >= l.xp && (li = i))
  const next = LEVELS[li + 1]
  const level = {
    index: li,
    name: LEVELS[li].name,
    xp: LEVELS[li].xp,
    next,
    progress: next ? (xp - LEVELS[li].xp) / (next.xp - LEVELS[li].xp) : 1,
  }

  const today = dateKey()
  const ws = weekStart().getTime()
  const mk = monthKey()
  const ideaToday = projects.filter((p) => p.loglineDoneAt && dateKey(p.loglineDoneAt) === today).length
  const outlinesWeek = projects.filter((p) => p.outlineDoneAt && p.outlineDoneAt >= ws).length
  const scriptsMonth = projects.filter((p) => p.scriptDoneAt && monthKey(p.scriptDoneAt) === mk).length

  let write30 = 0
  let idea30 = 0
  for (let i = 0; i < 30; i++) {
    const k = dateKey(addDays(new Date(), -i))
    if (writeDays.has(k)) write30++
    if (loglineDays.has(k)) idea30++
  }

  const ideaStreak = streakFrom(loglineDays)
  const ideaBest = bestStreak(loglineDays)
  const writeStreak = streakFrom(writeDays)
  const writeBest = bestStreak(writeDays)

  const kinds = new Set(projects.filter((p) => p.loglineDoneAt).map((p) => p.kind))
  const tripleThreat =
    ideaToday >= settings.dailyIdeas && outlinesWeek >= settings.weeklyOutlines && scriptsMonth >= settings.monthlyScripts
  const lowBudgetOutline = projects.some((p) => p.outlineDoneAt && budgetReport(p).level === 'Low')

  const b = (id: string, icon: string, name: string, desc: string, earned: boolean): Badge => ({
    id,
    icon,
    name,
    desc,
    earned,
  })
  const badges: Badge[] = [
    b('first-spark', '✦', 'First Spark', 'Finish your first logline', loglines >= 1),
    b('ten-ideas', '❖', 'Idea Machine', 'Finish 10 loglines', loglines >= 10),
    b('fifty-ideas', '✺', 'The Vault', 'Finish 50 loglines', loglines >= 50),
    b('streak-3', '🔥', 'Hat Trick', '3-day idea streak', ideaBest >= 3),
    b('streak-7', '🔥', 'Week Warrior', '7-day idea streak', ideaBest >= 7),
    b('streak-30', '🔥', 'Month of Ideas', '30-day idea streak', ideaBest >= 30),
    b('streak-100', '☄', 'Century', '100-day idea streak', ideaBest >= 100),
    b('full-circle', '◯', 'Full Circle', 'Complete your first outline', outlines >= 1),
    b('four-circles', '◎', 'Four Circles', 'Complete 4 outlines', outlines >= 4),
    b('engine', '⚙', 'Engine Room', 'Define a TV series engine', projects.some((p) => p.kind === 'tv' && p.engine.trim())),
    b('both-worlds', '⇄', 'Both Worlds', 'A finished logline for film AND TV', kinds.size === 2),
    b('fade-out', '🎬', 'Fade Out', 'Finish your first screenplay', scripts >= 1),
    b('words-1k', 'Ⅰ', '1,000 Words', 'Write 1,000 words', totals.words >= 1000),
    b('words-10k', 'Ⅹ', '10,000 Words', 'Write 10,000 words', totals.words >= 10000),
    b('words-50k', 'Ⅼ', '50,000 Words', 'Write 50,000 words', totals.words >= 50000),
    b('pages-10', '📄', 'Ten Pages', 'Write 10 script pages', totals.pages >= 10),
    b('pages-100', '📚', 'Feature Length', 'Write 100 script pages', totals.pages >= 100),
    b('budget-hawk', '$', 'Budget Hawk', 'Complete an outline with a Low budget meter', lowBudgetOutline),
    b('triple', '★', 'Triple Threat', 'Hit daily, weekly and monthly quotas at once', tripleThreat),
  ]

  return {
    totals,
    loglines,
    outlines,
    scripts,
    xp,
    level,
    ideaStreak,
    ideaBest,
    writeStreak,
    writeBest,
    ideaToday,
    outlinesWeek,
    scriptsMonth,
    ideaDoneToday: ideaToday >= settings.dailyIdeas,
    wroteToday: writeDays.has(today),
    consistency30: write30 / 30,
    ideaDays30: idea30,
    byDay,
    badges,
  }
}
