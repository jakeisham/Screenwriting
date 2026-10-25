import { PITCH_FIELDS } from '../lib/framework'
import { href } from '../lib/router'
import { beatsFilled, isLoglineDone, loglineParts, withGenres } from '../lib/project'
import { updateProject } from '../lib/store'
import type { Project } from '../lib/types'
import { filled, fmtDate } from '../lib/util'
import { GenreSection } from './GenreSection'
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
            <div className="eyebrow">Step 1 of 3 · The Idea</div>
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
          <span className="qlabel">Genres</span>
        </div>
        <div className="question">What genre is it? Pick up to three, most important first. Tap a genre for its playbook.</div>
        <GenreSection value={p.genres} onChange={(g) => updateProject(p.id, (x) => withGenres(x, g))} />
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

      <div className={`card flow-next ${isLoglineDone(p) ? 'banner won' : ''}`}>
        <div>
          <div className="eyebrow">Next · Step 2 of 3</div>
          <div className="big">Build the outline</div>
          <div className="muted small">
            Your hero, want, obstacle and theme carry over onto the matching Story Circle steps.
            {beatsFilled(p) > 0 && ` ${beatsFilled(p)}/9 beats done so far.`}
          </div>
        </div>
        <a className="btn" href={href(`p/${p.id}/outline`)}>
          Continue to Outline →
        </a>
      </div>
    </div>
  )
}
