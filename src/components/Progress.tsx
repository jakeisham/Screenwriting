import { useMemo } from 'react'
import { LEVELS, XP, computeStats } from '../lib/stats'
import { useStore } from '../lib/store'
import { addDays, dateKey, monthKey, weekStart } from '../lib/util'
import { Bar } from './ui'

export function Progress() {
  const s = useStore()
  const st = useMemo(() => computeStats(s.projects, s.activity, s.settings), [s.projects, s.activity, s.settings])

  // 16-week heatmap, Monday-first columns.
  const weeks = 16
  const start = addDays(weekStart(), -7 * (weeks - 1))
  const today = dateKey()
  const loglineDays = new Set(s.projects.filter((p) => p.loglineDoneAt).map((p) => dateKey(p.loglineDoneAt!)))
  const cols = Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const k = dateKey(addDays(start, w * 7 + d))
      const t = st.byDay.get(k)
      const words = t?.words ?? 0
      const lvl = !t ? 0 : words >= 1000 ? 4 : words >= 500 ? 3 : words >= 150 ? 2 : t.words + t.steps + t.pages > 0 ? 1 : 0
      return { k, lvl, future: k > today, idea: loglineDays.has(k), t }
    })
  )

  // Last 8 weeks of outlines, last 6 months of scripts.
  const weekBars = Array.from({ length: 8 }, (_, i) => {
    const ws = addDays(weekStart(), -7 * (7 - i)).getTime()
    const we = ws + 7 * 86400000
    return {
      label: new Date(ws).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
      n: s.projects.filter((p) => p.outlineDoneAt && p.outlineDoneAt >= ws && p.outlineDoneAt < we).length,
    }
  })
  const monthBars = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (5 - i))
    const mk = monthKey(d)
    return {
      label: d.toLocaleDateString(undefined, { month: 'short' }),
      n: s.projects.filter((p) => p.scriptDoneAt && monthKey(p.scriptDoneAt) === mk).length,
    }
  })
  const earned = st.badges.filter((b) => b.earned).length

  return (
    <div className="stack">
      <h1>Progress</h1>

      <div className="hero-card">
        <div className="eyebrow">Level {st.level.index + 1}</div>
        <div className="level-name">{st.level.name}</div>
        <Bar value={st.level.progress} className="gold" />
        <div className="muted small">
          {st.xp.toLocaleString()} XP{st.level.next ? ` · next: ${st.level.next.name} at ${st.level.next.xp.toLocaleString()}` : ' · max level'}
        </div>
        <div className="ladder">
          {LEVELS.map((l, i) => (
            <span key={l.name} className={`rung ${i <= st.level.index ? 'on' : ''}`} title={`${l.name} · ${l.xp} XP`} />
          ))}
        </div>
      </div>

      <div className="stat-grid">
        <Stat n={st.ideaStreak} l="Idea streak" sub={`best ${st.ideaBest}`} />
        <Stat n={st.writeStreak} l="Writing streak" sub={`best ${st.writeBest}`} />
        <Stat n={`${Math.round(st.consistency30 * 100)}%`} l="Days written" sub="last 30 days" />
        <Stat n={st.ideaDays30} l="Idea days" sub="last 30 days" />
        <Stat n={st.totals.words.toLocaleString()} l="Words" />
        <Stat n={st.totals.pages.toFixed(1)} l="Script pages" />
        <Stat n={st.totals.steps} l="Steps completed" />
        <Stat n={`${st.loglines} · ${st.outlines} · ${st.scripts}`} l="Loglines · Outlines · Scripts" />
      </div>

      <div className="card">
        <div className="eyebrow">Consistency · last 16 weeks</div>
        <div className="heat">
          <div className="heat-days">
            {['M', '', 'W', '', 'F', '', 'S'].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          {cols.map((col, i) => (
            <div key={i} className="heat-col">
              {col.map((c) => (
                <span
                  key={c.k}
                  className={`hc l${c.lvl} ${c.future ? 'future' : ''} ${c.idea ? 'idea' : ''} ${c.k === today ? 'today' : ''}`}
                  title={`${c.k}${c.t ? ` · ${c.t.words} words · ${c.t.steps} steps · ${c.t.pages.toFixed(1)} pp` : ''}${c.idea ? ' · logline ✓' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="muted small">Darker = more words. A gold dot = a finished logline that day.</div>
      </div>

      <div className="two">
        <div className="card">
          <div className="eyebrow">Outlines per week (goal {s.settings.weeklyOutlines})</div>
          <Bars data={weekBars} goal={s.settings.weeklyOutlines} />
        </div>
        <div className="card">
          <div className="eyebrow">Scripts per month (goal {s.settings.monthlyScripts})</div>
          <Bars data={monthBars} goal={s.settings.monthlyScripts} />
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">
          Badges · {earned}/{st.badges.length}
        </div>
        <div className="badges">
          {st.badges.map((b) => (
            <div key={b.id} className={`badge ${b.earned ? 'on' : ''}`} title={b.desc}>
              <div className="badge-icon">{b.icon}</div>
              <div className="badge-name">{b.name}</div>
              <div className="badge-desc">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">How XP works</div>
        <ul className="plain small">
          <li>+1 XP per {XP.perWords} new words you write (deleting and retyping doesn’t count twice)</li>
          <li>+{XP.step} XP per step filled in (each beat, logline piece, scene, character…)</li>
          <li>+{XP.page} XP per script page</li>
          <li>
            +{XP.logline} finished logline · +{XP.outline} finished outline · +{XP.script} finished screenplay
          </li>
        </ul>
      </div>
    </div>
  )
}

function Stat({ n, l, sub }: { n: string | number; l: string; sub?: string }) {
  return (
    <div className="stat">
      <div className="stat-n">{n}</div>
      <div className="stat-l">{l}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

function Bars({ data, goal }: { data: { label: string; n: number }[]; goal: number }) {
  const max = Math.max(goal, ...data.map((d) => d.n), 1)
  return (
    <div className="bars">
      {data.map((d, i) => (
        <div key={i} className="bars-col">
          <div className="bars-track">
            <div className="bars-goal" style={{ bottom: `${(goal / max) * 100}%` }} />
            <div className={`bars-fill ${d.n >= goal ? 'hit' : ''}`} style={{ height: `${(d.n / max) * 100}%` }} />
          </div>
          <div className="bars-n">{d.n}</div>
          <div className="bars-l">{d.label}</div>
        </div>
      ))}
    </div>
  )
}
