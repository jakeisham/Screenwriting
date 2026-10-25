import { BEAT_KEYS } from '../lib/framework'
import { actsWithScenes, beatsFilled, isLoglineDone, isOutlineDone, pitchText } from '../lib/project'
import { href } from '../lib/router'
import type { BeatKey, Project } from '../lib/types'
import { fmtDate } from '../lib/util'
import { Outliner } from './Outliner'

export function OutlineTab({ p, initialBeat }: { p: Project; initialBeat?: BeatKey }) {
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

      <Outliner p={p} focus={initialBeat && BEAT_KEYS.includes(initialBeat) ? initialBeat : undefined} />

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

function IdeaSummary({ p }: { p: Project }) {
  const rows = [
    ['Pitch', p.logline.trim() || (isLoglineDone(p) ? pitchText(p) : '')],
    ['Hero', p.hero],
    ['Want', p.want],
    ['In the way', p.obstacle],
    ['At stake', p.stakes],
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
