import { ENGINE_FIELD } from '../lib/framework'
import {
  beatsFilled,
  formatLabel,
  isLoglineDone,
  isPitchReady,
  loglineParts,
  pitchLine,
  pitchSeconds,
  pitchText,
  withGenres,
} from '../lib/project'
import { href } from '../lib/router'
import { updateProject } from '../lib/store'
import type { Kind, Project, TvFormat } from '../lib/types'
import { filled, fmtDate } from '../lib/util'
import { GenreSection } from './GenreSection'
import { AutoTextarea, QuestionField } from './ui'

type Field = 'hero' | 'want' | 'obstacle' | 'stakes'

const STEPS: { n: number; key: Field; label: string; hint: string; questions: string[] }[] = [
  {
    n: 2,
    key: 'hero',
    label: 'The hero',
    hint: 'One or two words that make them easy to picture.',
    questions: ['Who is your hero, in a few words?', 'What would make them easy to picture in one breath?', 'What is their flaw?'],
  },
  {
    n: 3,
    key: 'want',
    label: 'What they want',
    hint: 'One clear goal.',
    questions: ['What do they want? One clear goal.', 'How would we know, just by watching, that they got it?', 'Why does it matter right now?'],
  },
  {
    n: 4,
    key: 'obstacle',
    label: 'What stands in the way',
    hint: 'The bigger and odder the problem, the better.',
    questions: ['What stands in the way?', 'How could the problem be bigger, or stranger?', 'Why is this the worst possible problem for THIS hero?'],
  },
  {
    n: 5,
    key: 'stakes',
    label: 'What’s at stake',
    hint: 'What the hero loses if they fail.',
    questions: ['What does the hero lose if they fail?', 'What happens if they do nothing?', 'Is there a cost to winning, too?'],
  },
]

export function PitchTab({ p }: { p: Project }) {
  const set = (patch: Partial<Project>) => updateProject(p.id, (x) => ({ ...x, ...patch }))
  const parts = [filled(p.genre), ...loglineParts(p).map(filled), filled(p.whyNow) && filled(p.whyYou)]
  const done = parts.filter(Boolean).length
  const secs = pitchSeconds(p)
  const line = pitchLine(p)

  return (
    <div className="stack">
      <div className={`card banner ${isLoglineDone(p) ? 'won' : ''}`}>
        <div className="row between">
          <div>
            <div className="eyebrow">Step 1 of 3 · The Idea</div>
            <div className="big">{isPitchReady(p) ? 'Pitch ready ✓' : isLoglineDone(p) ? 'Idea logged ✓' : `${done} / 7 pieces`}</div>
            <div className="muted small">
              {p.loglineDoneAt
                ? `Counted toward your daily idea on ${fmtDate(p.loglineDoneAt)}${isPitchReady(p) ? '' : ' · add why now / why you to make it pitch-ready'}`
                : 'A good pitch runs 30–60 seconds and answers six things, in order. Parts 1–5 log today’s idea.'}
            </div>
          </div>
          <div className="pips">
            {parts.map((on, i) => (
              <span key={i} className={`pip ${on ? 'on' : ''}`} />
            ))}
          </div>
        </div>
      </div>

      <PitchLineCard p={p} line={line} secs={secs} />

      <div className="qfield" id="f-seed">
        <div className="qfield-head">
          <span className={`check ${filled(p.seed) ? 'on' : ''}`}>{filled(p.seed) ? '✓' : ''}</span>
          <span className="qlabel">The spark</span>
          <span className="tag">optional</span>
        </div>
        <div className="question">Where did this idea come from? Jot down the raw thought.</div>
        <AutoTextarea value={p.seed} onChange={(e) => set({ seed: e.target.value })} placeholder="Your words…" />
      </div>

      <div className="pitch-section-h">
        <span className="eyebrow">The pitch · six things, in order</span>
      </div>

      <div className="qfield pitch-step" id="f-title">
        <div className="qfield-head">
          <span className={`step-n ${filled(p.title) && filled(p.genre) ? 'on' : ''}`}>1</span>
          <span className="qlabel">Title and genre</span>
        </div>
        <div className="hint">Say both up front so the listener knows what box to put it in.</div>
        <input value={p.title} onChange={(e) => set({ title: e.target.value })} placeholder="Title" aria-label="Title" />
        <div id="f-genre">
          <div className="question">What genre is it? Up to three, most important first. Tap one for its playbook.</div>
          <GenreSection value={p.genres} onChange={(g) => updateProject(p.id, (x) => withGenres(x, g))} />
        </div>
      </div>

      {STEPS.map((s) => (
        <div key={s.key} className="pitch-step-wrap">
          <QuestionField
            id={s.key}
            label={`${s.n} · ${s.label}`}
            questions={s.questions}
            hint={s.hint}
            value={p[s.key]}
            onChange={(v) => set({ [s.key]: v } as Partial<Project>)}
          />
        </div>
      ))}

      <div className="qfield pitch-step" id="f-why">
        <div className="qfield-head">
          <span className={`check ${filled(p.whyNow) && filled(p.whyYou) ? 'on' : ''}`}>{filled(p.whyNow) && filled(p.whyYou) ? '✓' : ''}</span>
          <span className="qlabel">6 · Why now, and why you</span>
        </div>
        <div className="question">What makes this fresh right now?</div>
        <AutoTextarea value={p.whyNow} onChange={(e) => set({ whyNow: e.target.value })} placeholder="One line on why now…" minRows={1} />
        <div className="question">Why are you the one to make it?</div>
        <AutoTextarea value={p.whyYou} onChange={(e) => set({ whyYou: e.target.value })} placeholder="One line on why you…" minRows={1} />
      </div>

      <div className="pitch-section-h">
        <span className="eyebrow">Add these if you have them</span>
      </div>

      <div className="qfield" id="f-comps">
        <div className="qfield-head">
          <span className={`check ${filled(p.comp1) && filled(p.comp2) ? 'on' : ''}`}>{filled(p.comp1) && filled(p.comp2) ? '✓' : ''}</span>
          <span className="qlabel">Comps</span>
          <span className="tag">optional</span>
        </div>
        <div className="question">Which two known hits does it mash together?</div>
        <div className="hint">Pick hits from the last 15 years if you can.</div>
        <div className="comp-row">
          <input value={p.comp1} onChange={(e) => set({ comp1: e.target.value })} placeholder="Known hit" aria-label="First comp" />
          <span className="comp-meets">meets</span>
          <input value={p.comp2} onChange={(e) => set({ comp2: e.target.value })} placeholder="Known hit" aria-label="Second comp" />
        </div>
      </div>

      <div className="qfield" id="f-budget">
        <div className="qfield-head">
          <span className={`check ${filled(p.budget) ? 'on' : ''}`}>{filled(p.budget) ? '✓' : ''}</span>
          <span className="qlabel">Budget and format</span>
          <span className="tag">optional</span>
        </div>
        <div className="hint">Buyers want to know fast.</div>
        <div className="chips">
          {([
            ['film', 'half', 'Feature'],
            ['tv', 'half', 'Half-hour series'],
            ['tv', 'hour', 'Hour-long series'],
          ] as [Kind, TvFormat, string][]).map(([k, f, label]) => (
            <button
              key={label}
              className={`chip ${p.kind === k && (k === 'film' || p.tvFormat === f) ? 'on' : ''}`}
              onClick={() => set({ kind: k, tvFormat: f })}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          value={p.budget}
          onChange={(e) => set({ budget: e.target.value })}
          placeholder={p.kind === 'film' ? 'Budget for this feature' : 'Budget and number of episodes'}
          aria-label="Budget"
        />
      </div>

      {p.kind === 'tv' && (
        <QuestionField
          id="engine"
          label="The engine (TV)"
          hint="What makes a new story each week?"
          questions={ENGINE_FIELD.questions}
          value={p.engine}
          onChange={(v) => set({ engine: v })}
        />
      )}

      <QuestionField
        id="logline"
        label="Your logline"
        badge="optional"
        hint="Your own one-sentence version. Start from the pitch line above and make it sing."
        questions={['Say it in one sentence, in your own words.', 'Could someone repeat it back after hearing it once?']}
        value={p.logline}
        onChange={(v) => set({ logline: v })}
      />

      <QuestionField
        id="theme"
        label="Theme question"
        badge="for the outline"
        hint="One question the story answers through its ending."
        questions={[
          'What one question does your story answer through its ending?',
          'What does your hero believe at the start — and does the ending prove or disprove it?',
        ]}
        value={p.theme}
        onChange={(v) => set({ theme: v })}
      />

      <div className={`card flow-next ${isLoglineDone(p) ? 'banner won' : ''}`}>
        <div>
          <div className="eyebrow">Next · Step 2 of 3</div>
          <div className="big">Build the outline</div>
          <div className="muted small">
            Your hero, want, obstacle, stakes and theme carry over onto the matching Story Circle steps.
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

function PitchLineCard({ p, line, secs }: { p: Project; line: ReturnType<typeof pitchLine>; secs: number }) {
  const blanks = line.filter((x) => x.blank).length
  const inRange = secs >= 30 && secs <= 60
  return (
    <div className="card pitch-line-card">
      <div className="row between wrap gap">
        <div className="eyebrow">Your pitch line · {formatLabel(p)}</div>
        <span className={`tag ${inRange ? 'gold' : ''}`} title="Spoken length of the full pitch at about 150 words a minute">
          ⏱ {secs}s {secs < 30 ? '· aim for 30–60s' : secs > 60 ? '· over 60s' : '· right length'}
        </span>
      </div>
      <p className="pitch-line">
        {line.map((x, i) =>
          x.blank ? (
            <span key={i} className="blank">
              {x.text}
            </span>
          ) : (
            <span key={i}>{x.text}</span>
          )
        )}
      </p>
      <div className="row between wrap gap">
        <span className="muted small">
          {blanks ? `${blanks} blank${blanks === 1 ? '' : 's'} left. Built only from your answers below.` : 'Built only from your answers below.'}
        </span>
        {!blanks && !p.logline.trim() && (
          <button className="btn ghost sm" onClick={() => updateProject(p.id, (x) => ({ ...x, logline: pitchText(x) }))}>
            Use as my logline
          </button>
        )}
      </div>
    </div>
  )
}
