import { GENRES, LOW_BUDGET_GENRES, PITCH_FIELDS } from '../lib/framework'
import { isLoglineDone, loglineParts } from '../lib/project'
import { updateProject } from '../lib/store'
import type { Project } from '../lib/types'
import { filled, fmtDate } from '../lib/util'
import { AutoTextarea, QuestionField } from './ui'

export function PitchTab({ p }: { p: Project }) {
  const set = (patch: Partial<Project>) => updateProject(p.id, (x) => ({ ...x, ...patch }))
  const parts = [filled(p.genre), ...loglineParts(p).map(filled)]
  const done = parts.filter(Boolean).length

  return (
    <div className="stack">
      <div className={`card banner ${isLoglineDone(p) ? 'won' : ''}`}>
        <div className="row between">
          <div>
            <div className="eyebrow">Game 1 · The Logline</div>
            <div className="big">
              {isLoglineDone(p) ? 'Idea logged ✓' : `${done} / 5 pieces`}
            </div>
            <div className="muted small">
              {p.loglineDoneAt
                ? `Counted toward your daily idea on ${fmtDate(p.loglineDoneAt)}`
                : 'Genre + hero + want + obstacle + your one-sentence logline = today’s idea.'}
            </div>
          </div>
          <div className="pips">
            {parts.map((on, i) => (
              <span key={i} className={`pip ${on ? 'on' : ''}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="qfield" id="f-title">
        <div className="qfield-head">
          <span className={`check ${filled(p.title) ? 'on' : ''}`}>{filled(p.title) ? '✓' : ''}</span>
          <span className="qlabel">Working title</span>
          <span className="tag">optional</span>
        </div>
        <input value={p.title} onChange={(e) => set({ title: e.target.value })} placeholder="Your title…" />
      </div>

      <div className="qfield" id="f-genre">
        <div className="qfield-head">
          <span className={`check ${filled(p.genre) ? 'on' : ''}`}>{filled(p.genre) ? '✓' : ''}</span>
          <span className="qlabel">Genre</span>
        </div>
        <div className="question">Pick one genre and stick to it. Which one is this?</div>
        <div className="chips">
          {GENRES.map((g) => (
            <button key={g} className={`chip ${p.genre === g ? 'on' : ''}`} onClick={() => set({ genre: p.genre === g ? '' : g })}>
              {g}
            </button>
          ))}
        </div>
        {p.genre && (
          <div className="hint">
            {LOW_BUDGET_GENRES.includes(p.genre)
              ? `Simens: ${p.genre.toLowerCase()} is one of the genres that sells best at low budgets.`
              : 'Simens: horror, thriller and comedy sell best at low budgets. (Just a fact — your call.)'}
          </div>
        )}
      </div>

      <div className="qfield" id="f-seed">
        <div className="qfield-head">
          <span className={`check ${filled(p.seed) ? 'on' : ''}`}>{filled(p.seed) ? '✓' : ''}</span>
          <span className="qlabel">The spark</span>
          <span className="tag">optional</span>
        </div>
        <div className="question">Where did this idea come from? Jot down the raw thought.</div>
        <AutoTextarea value={p.seed} onChange={(e) => set({ seed: e.target.value })} placeholder="Your words…" />
      </div>

      {PITCH_FIELDS.map((f) => (
        <div key={f.key}>
          {f.key === 'logline' && (
            <div className="pieces">
              <div className="eyebrow">Your pieces</div>
              <div>
                <b>Hero:</b> {p.hero.trim() || <span className="muted">—</span>}
              </div>
              <div>
                <b>Wants:</b> {p.want.trim() || <span className="muted">—</span>}
              </div>
              <div>
                <b>In the way:</b> {p.obstacle.trim() || <span className="muted">—</span>}
              </div>
            </div>
          )}
          <QuestionField
            id={f.key}
            label={f.label}
            questions={f.questions}
            hint={f.hint}
            value={p[f.key]}
            onChange={(v) => set({ [f.key]: v } as Partial<Project>)}
            wordGoal={f.key === 'logline' ? 35 : undefined}
            badge={f.key === 'theme' ? 'for the outline' : undefined}
          />
        </div>
      ))}
    </div>
  )
}
