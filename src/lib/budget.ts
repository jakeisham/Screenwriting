// Dov Simens' budget rules, as a meter. It only counts what the writer wrote — it never suggests changes.
import { cleanCharacter, parseHeading } from './screenplay'
import type { Project } from './types'

export interface BudgetReport {
  source: 'script' | 'outline' | 'none'
  scenes: number
  locations: { name: string; count: number }[]
  nightScenes: number
  exteriorScenes: number
  roles: string[]
  stunts: number
  crowds: number
  vfx: number
  score: number
  level: 'Low' | 'Medium' | 'High' | '—'
  parts: { label: string; value: string; pts: number; max: number }[]
}

export function budgetReport(p: Project): BudgetReport {
  const headings = p.script.filter((e) => e.type === 'scene' && e.text.trim())
  const useScript = headings.length > 0
  const scenes = useScript
    ? headings.map((h) => {
        const x = parseHeading(h.text)
        return { location: x.location, time: x.time, ext: /EXT/.test(x.prefix) }
      })
    : p.scenes
        .filter((s) => s.location.trim())
        .map((s) => ({ location: s.location.trim().toUpperCase(), time: s.time, ext: s.intExt !== 'INT.' }))

  const locMap = new Map<string, number>()
  scenes.forEach((s) => locMap.set(s.location || '(UNNAMED)', (locMap.get(s.location || '(UNNAMED)') ?? 0) + 1))
  const locations = [...locMap.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)

  const roleSet = new Set<string>()
  if (useScript) {
    p.script.filter((e) => e.type === 'character' && e.text.trim()).forEach((e) => roleSet.add(cleanCharacter(e.text)))
  } else {
    p.scenes.forEach((s) =>
      s.characters
        .split(',')
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean)
        .forEach((c) => roleSet.add(c))
    )
  }
  if (roleSet.size === 0) p.cast.forEach((c) => c.name.trim() && roleSet.add(c.name.trim().toUpperCase()))
  const roles = [...roleSet].sort()

  const nightScenes = scenes.filter((s) => /NIGHT|DUSK|DAWN/.test(s.time.toUpperCase())).length
  const exteriorScenes = scenes.filter((s) => s.ext).length
  const stunts = p.scenes.filter((s) => s.stunt).length
  const crowds = p.scenes.filter((s) => s.crowd).length
  const vfx = p.scenes.filter((s) => s.vfx).length

  const tier = (n: number, cuts: number[]) => cuts.filter((c) => n > c).length
  const nightShare = scenes.length ? nightScenes / scenes.length : 0
  const parts = [
    { label: 'Locations', value: String(locations.length), pts: tier(locations.length, [5, 10, 15]), max: 3 },
    { label: 'Speaking roles', value: String(roles.length), pts: tier(roles.length, [6, 10, 15]), max: 3 },
    {
      label: 'Night scenes',
      value: `${nightScenes} (${Math.round(nightShare * 100)}%)`,
      pts: tier(nightShare, [0.15, 0.3]),
      max: 2,
    },
    {
      label: 'Stunts / crowds / VFX',
      value: String(stunts + crowds + vfx),
      pts: tier(stunts + crowds + vfx, [0, 2, 5]),
      max: 3,
    },
  ]
  const score = parts.reduce((s, x) => s + x.pts, 0)
  const level = scenes.length === 0 && roles.length === 0 ? '—' : score <= 3 ? 'Low' : score <= 6 ? 'Medium' : 'High'

  return {
    source: useScript ? 'script' : scenes.length ? 'outline' : 'none',
    scenes: scenes.length,
    locations,
    nightScenes,
    exteriorScenes,
    roles,
    stunts,
    crowds,
    vfx,
    score,
    level,
    parts,
  }
}
