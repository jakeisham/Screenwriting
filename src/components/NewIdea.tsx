import { go, href } from '../lib/router'
import { displayTitle, stage, STAGE_LABEL } from '../lib/project'
import { createProject, useStore } from '../lib/store'
import type { Kind, TvFormat } from '../lib/types'
import { Pips } from './Pips'

export function NewIdea({ kind }: { kind?: Kind }) {
  const s = useStore()
  const start = (k: Kind, f: TvFormat = 'half') => {
    const id = createProject(k, f)
    go(`p/${id}/pitch/genre`)
  }

  if (!kind) {
    return (
      <div className="stack">
        <h1>What are you writing?</h1>
        <div className="two">
          <a className="card pick" href={href('new/film')}>
            <div className="pick-icon">🎬</div>
            <div className="big">Film</div>
            <div className="muted small">Feature · 90–110 pages · one big circle</div>
          </a>
          <a className="card pick" href={href('new/tv')}>
            <div className="pick-icon">📺</div>
            <div className="big">TV show</div>
            <div className="muted small">Pilot + engine + season circle</div>
          </a>
        </div>
        <a className="card pick remix-pick" href={href('remix')}>
          <div className="pick-icon">🔁</div>
          <div className="big">Remix an existing movie or show</div>
          <div className="muted small">Break down something you know, then turn it into a new genre. Film or TV.</div>
        </a>
      </div>
    )
  }

  const existing = s.projects.filter((p) => p.kind === kind && stage(p) !== 'done')

  return (
    <div className="stack">
      <a className="link small" href={href('new')}>
        ← Film or TV
      </a>
      <h1>{kind === 'film' ? '🎬 Film' : '📺 TV show'}</h1>

      <div className="card">
        <div className="eyebrow">Start fresh</div>
        {kind === 'film' ? (
          <button className="btn big-btn" onClick={() => start('film')}>
            + New film idea
          </button>
        ) : (
          <div className="row gap wrap">
            <button className="btn big-btn grow" onClick={() => start('tv', 'half')}>
              + Half-hour (~30 pp)
            </button>
            <button className="btn big-btn grow" onClick={() => start('tv', 'hour')}>
              + Hour-long (55–60 pp)
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="eyebrow">…or expand an existing idea ({existing.length})</div>
        {existing.length === 0 && <div className="muted">No unfinished {kind === 'film' ? 'film' : 'TV'} ideas yet.</div>}
        {existing.map((p) => (
          <a key={p.id} className="idea-row" href={href(`p/${p.id}/pitch`)}>
            <div className="row between">
              <b>{displayTitle(p)}</b>
              <span className={`stage s-${stage(p)} small`}>{STAGE_LABEL[stage(p)]}</span>
            </div>
            {p.logline.trim() && <div className="muted small clamp">{p.logline}</div>}
            <Pips p={p} />
          </a>
        ))}
      </div>
    </div>
  )
}
