import { useMemo } from 'react'
import { href } from '../lib/router'
import { displayTitle, nextStep, stage } from '../lib/project'
import { computeStats } from '../lib/stats'
import { useStore } from '../lib/store'
import { ago, weekStart } from '../lib/util'
import { Pips } from './Pips'
import { Bar, Ring } from './ui'

export function Home() {
  const s = useStore()
  const st = useMemo(() => computeStats(s.projects, s.activity, s.settings), [s.projects, s.activity, s.settings])
  const unfinished = s.projects.filter((p) => stage(p) !== 'done')
  const cont = unfinished[0]
  const contStep = cont && nextStep(cont)
  const now = new Date()
  const daysLeftWeek = 7 - Math.round((now.getTime() - weekStart().getTime()) / 86400000)
  const daysLeftMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1

  return (
    <div className="stack">
      <div className="hero-card">
        <div className="row between wrap gap">
          <div>
            <div className="eyebrow">Level {st.level.index + 1}</div>
            <div className="level-name">{st.level.name}</div>
            <div className="muted small">
              {st.xp.toLocaleString()} XP
              {st.level.next && ` · ${(st.level.next.xp - st.xp).toLocaleString()} to ${st.level.next.name}`}
            </div>
          </div>
          <div className={`flame ${st.ideaDoneToday ? 'lit' : st.ideaStreak ? 'risk' : ''}`}>
            <span className="flame-icon">🔥</span>
            <span className="flame-n">{st.ideaStreak}</span>
            <span className="flame-l">day idea streak</span>
          </div>
        </div>
        <Bar value={st.level.progress} className="gold" />
        {!st.ideaDoneToday && st.ideaStreak > 0 && (
          <div className="risk-note">Your streak is on the line. Finish a logline today to keep it.</div>
        )}
      </div>

      <div className="card">
        <div className="eyebrow">Your quotas</div>
        <div className="rings">
          <Ring value={st.ideaToday} max={s.settings.dailyIdeas} label="Idea today" sub="finished logline" />
          <Ring value={st.outlinesWeek} max={s.settings.weeklyOutlines} label="Outline this week" sub={`${daysLeftWeek}d left`} />
          <Ring value={st.scriptsMonth} max={s.settings.monthlyScripts} label="Script this month" sub={`${daysLeftMonth}d left`} />
        </div>
      </div>

      <div className="row gap">
        <a className="btn big-btn grow" href={href('new/film')}>
          🎬 New film idea
        </a>
        <a className="btn big-btn grow" href={href('new/tv')}>
          📺 New TV idea
        </a>
      </div>

      {cont && (
        <a className="card continue" href={href(`p/${cont.id}/${contStep?.tab ?? 'pitch'}${contStep?.focus ? `/${contStep.focus}` : ''}`)}>
          <div className="eyebrow">Pick up where you left off</div>
          <div className="row between">
            <div>
              <div className="big">{displayTitle(cont)}</div>
              <div className="muted small">{contStep ? `Next: ${contStep.label}` : 'Keep going'}</div>
            </div>
            <span className="chev big">→</span>
          </div>
        </a>
      )}

      <div className="card">
        <div className="row between">
          <div className="eyebrow">Unfinished ideas ({unfinished.length})</div>
          <a className="link small" href={href('ideas')}>
            See all →
          </a>
        </div>
        {unfinished.length === 0 && <div className="muted">Nothing in progress. Start a new idea above.</div>}
        {unfinished.slice(0, 6).map((p) => {
          const n = nextStep(p)
          return (
            <a key={p.id} className="idea-row" href={href(`p/${p.id}/${n?.tab ?? 'pitch'}${n?.focus ? `/${n.focus}` : ''}`)}>
              <div className="row between">
                <b>{displayTitle(p)}</b>
                <span className="muted small">
                  {p.kind === 'film' ? 'Film' : 'TV'} · {ago(p.createdAt)}
                </span>
              </div>
              <Pips p={p} />
            </a>
          )
        })}
      </div>

      <div className="card slim row between">
        <span>
          ✍️ {st.writeStreak}-day writing streak · {Math.round(st.consistency30 * 100)}% of the last 30 days
        </span>
        <a className="link small" href={href('progress')}>
          Progress →
        </a>
      </div>
    </div>
  )
}
