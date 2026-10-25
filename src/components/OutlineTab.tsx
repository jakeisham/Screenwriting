import { useState } from 'react'
import { BEATS, BEAT_KEYS, beatPages } from '../lib/framework'
import { actsWithScenes, beatsFilled, isOutlineDone } from '../lib/project'
import { href } from '../lib/router'
import { updateProject } from '../lib/store'
import type { BeatKey, Project } from '../lib/types'
import { filled, fmtDate } from '../lib/util'
import { SceneBoard } from './SceneBoard'
import { StoryCircle } from './StoryCircle'
import { QuestionField } from './ui'

export function OutlineTab({ p, initialBeat }: { p: Project; initialBeat?: BeatKey }) {
  const firstEmpty = BEATS.find((b) => !filled(p.beats[b.key]))?.key ?? 'you'
  const [sel, setSel] = useState<BeatKey>(initialBeat && BEAT_KEYS.includes(initialBeat) ? initialBeat : firstEmpty)
  const beat = BEATS.find((b) => b.key === sel)!
  const set = (fn: (x: Project) => Project) => updateProject(p.id, fn)
  const acts = actsWithScenes(p)

  return (
    <div className="stack">
      <div className={`card banner ${isOutlineDone(p) ? 'won' : ''}`}>
        <div className="eyebrow">Step 2 of 3 · The Outline</div>
        <div className="big">{isOutlineDone(p) ? 'Outline complete ✓' : `${beatsFilled(p)} / 9 beats · ${acts.length} / 3 acts with scenes`}</div>
        <div className="muted small">
          {p.outlineDoneAt
            ? `Counted toward your weekly outline on ${fmtDate(p.outlineDoneAt)}`
            : `All 9 beats + at least one scene in each act${p.kind === 'tv' ? ' + the series engine (TV tab)' : ''} = this week’s outline.`}
        </div>
      </div>

      <IdeaSummary p={p} />

      <div className="outline-grid">
        <div className="card center">
          <StoryCircle beats={p.beats} selected={sel} onSelect={setSel} label={p.kind === 'tv' ? 'PILOT' : undefined} />
          <div className="muted small">Tap a step to work on it.</div>
        </div>

        <div className="card" id={`f-${sel}`}>
          <div className="eyebrow">
            Step {beat.n} of 9 · Act {beat.act} · lands ≈ {beatPages(beat, p.kind, p.tvFormat)}
          </div>
          <h3 className="beat-title">{beat.title}</h3>
          <div className="muted small">
            Harmon: <b>{beat.harmon}</b>
            {beat.campbell && (
              <>
                {' '}
                · Campbell: <b>{beat.campbell}</b>
              </>
            )}
          </div>
          <p className="brief">{beat.brief}</p>
          {beat.simens && (
            <div className="simens">
              <b>{beat.simens.label}</b> {beat.simens.note}
            </div>
          )}
          <FromIdea p={p} beat={sel} />
          <QuestionField
            key={sel}
            label="Your beat"
            questions={[...(beat.simens?.questions ?? []), ...beat.questions]}
            value={p.beats[sel]}
            onChange={(v) => set((x) => ({ ...x, beats: { ...x.beats, [sel]: v } }))}
            minRows={3}
          />
          <div className="checks">
            <div className="eyebrow">Self-check</div>
            {beat.checks.map((c, i) => {
              const k = `beat:${sel}:${i}`
              return (
                <label key={k} className="checkline">
                  <input
                    type="checkbox"
                    checked={!!p.checks[k]}
                    onChange={(e) => set((x) => ({ ...x, checks: { ...x.checks, [k]: e.target.checked } }))}
                  />
                  {c}
                </label>
              )
            })}
          </div>
          <div className="row between">
            <button className="btn ghost" disabled={beat.n === 1} onClick={() => setSel(BEATS[beat.n - 2].key)}>
              ← Prev
            </button>
            <button className="btn ghost" disabled={beat.n === 9} onClick={() => setSel(BEATS[beat.n].key)}>
              Next →
            </button>
          </div>
        </div>
      </div>


      <SceneBoard p={p} />

      <div className={`card flow-next ${isOutlineDone(p) ? 'banner won' : ''}`}>
        <div>
          <div className="eyebrow">Next · Step 3 of 3</div>
          <div className="big">Write the script</div>
          <div className="muted small">Your outline stays beside the script page, and your scene headings can drop straight in.</div>
        </div>
        <a className="btn" href={href(`p/${p.id}/script`)}>
          Continue to Script →
        </a>
      </div>
    </div>
  )
}

// Which idea piece feeds which Story Circle step.
export const IDEA_FOR_BEAT: Partial<Record<BeatKey, { label: string; field: 'hero' | 'want' | 'obstacle' | 'theme' }>> = {
  you: { label: 'Your hero', field: 'hero' },
  want: { label: 'Their want', field: 'want' },
  search: { label: 'What stands in the way', field: 'obstacle' },
  take: { label: 'What stands in the way', field: 'obstacle' },
  change: { label: 'Your theme question', field: 'theme' },
}

function FromIdea({ p, beat }: { p: Project; beat: BeatKey }) {
  const link = IDEA_FOR_BEAT[beat]
  if (!link) return null
  const text = p[link.field].trim()
  if (!text) return null
  const empty = !filled(p.beats[beat])
  return (
    <div className="from-idea">
      <div>
        <span className="eyebrow">From your idea · {link.label}</span>
        <div>{text}</div>
      </div>
      {empty && (
        <button
          className="btn ghost sm"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => updateProject(p.id, (x) => ({ ...x, beats: { ...x.beats, [beat]: text } }))}
        >
          Start this beat from it
        </button>
      )}
    </div>
  )
}

function IdeaSummary({ p }: { p: Project }) {
  const rows = [
    ['Logline', p.logline],
    ['Hero', p.hero],
    ['Want', p.want],
    ['In the way', p.obstacle],
    ['Theme', p.theme],
  ].filter(([, v]) => v.trim())
  if (!rows.length)
    return (
      <div className="card slim row between wrap gap">
        <span className="muted small">Start with the idea. Your hero, want and obstacle will show up here and on the circle.</span>
        <a className="btn ghost sm" href={href(`p/${p.id}/pitch`)}>
          ← Step 1 · Idea
        </a>
      </div>
    )
  return (
    <div className="card">
      <div className="row between wrap gap">
        <div className="eyebrow">Your idea{p.genres.length ? ` · ${p.genres.join(' / ')}` : ''}</div>
        <a className="link small" href={href(`p/${p.id}/pitch`)}>
          edit idea
        </a>
      </div>
      <div className="idea-summary">
        {rows.map(([k, v]) => (
          <div key={k}>
            <b>{k}</b>
            {v}
          </div>
        ))}
      </div>
    </div>
  )
}
