import { useState } from 'react'
import { href } from '../lib/router'
import { displayTitle, genreLabel, isLoglineDone, nextStep, pitchText, stage, STAGE_LABEL, type Stage } from '../lib/project'
import { useStore } from '../lib/store'
import { ago } from '../lib/util'
import { Pips } from './Pips'

function ss(key: string, value?: string) {
  try {
    if (value === undefined) return sessionStorage.getItem(key)
    sessionStorage.setItem(key, value)
  } catch {
    /* storage unavailable */
  }
  return null
}

type KindFilter = 'all' | 'film' | 'tv' | 'remix'

export function Library() {
  const s = useStore()
  const [kind, setKind] = useState<KindFilter>(() => (ss('wr-lib-kind') as KindFilter) || 'all')
  const [st, setSt] = useState<Stage | 'all'>(() => (ss('wr-lib-stage') as Stage) || 'all')
  const [q, setQ] = useState('')

  const setK = (k: KindFilter) => {
    setKind(k)
    ss('wr-lib-kind', k)
  }
  const setS = (x: Stage | 'all') => {
    setSt(x)
    ss('wr-lib-stage', x)
  }

  const needle = q.trim().toLowerCase()
  const list = s.projects.filter(
    (p) =>
      (kind === 'all' || (kind === 'remix' ? !!p.remix : p.kind === kind)) &&
      (st === 'all' || stage(p) === st) &&
      (!needle || [p.title, p.logline, p.hero, p.want, p.obstacle, p.stakes, p.comp1, p.comp2, ...p.genres, p.seed, p.theme].join(' ').toLowerCase().includes(needle))
  )
  const count = (x: Stage) =>
    s.projects.filter((p) => (kind === 'all' || (kind === 'remix' ? !!p.remix : p.kind === kind)) && stage(p) === x).length

  return (
    <div className="stack">
      <div className="row between">
        <h1>Your ideas</h1>
        <a className="btn" href={href('new')}>
          + New
        </a>
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your ideas…" />
      <div className="chips">
        {(['all', 'film', 'tv', 'remix'] as KindFilter[]).map((k) => (
          <button key={k} className={`chip ${kind === k ? 'on' : ''}`} onClick={() => setK(k)}>
            {k === 'all' ? 'All' : k === 'film' ? 'Film' : k === 'tv' ? 'TV' : '🔁 Remixes'}
          </button>
        ))}
        <span className="sep" />
        <button className={`chip ${st === 'all' ? 'on' : ''}`} onClick={() => setS('all')}>
          Any stage
        </button>
        {(['logline', 'outline', 'script', 'done'] as Stage[]).map((x) => (
          <button key={x} className={`chip ${st === x ? 'on' : ''}`} onClick={() => setS(x)}>
            {STAGE_LABEL[x]} · {count(x)}
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <div className="empty muted">{s.projects.length ? 'No ideas match.' : 'No ideas yet — your first one is a tap away.'}</div>
      )}
      {list.map((p) => {
        const n = nextStep(p)
        return (
          <a key={p.id} className="card idea-card" href={href(`p/${p.id}/${p.remix ? 'remix' : 'pitch'}`)}>
            <div className="row between">
              <div className="eyebrow">
                {p.kind === 'film' ? 'Film' : `TV · ${p.tvFormat === 'half' ? '½ hr' : '1 hr'}`}
                {genreLabel(p) && ` · ${genreLabel(p)}`}
                {p.remix && ` · remix of ${p.remix.source.title || '?'}`}
              </div>
              <span className={`stage s-${stage(p)} small`}>{STAGE_LABEL[stage(p)]}</span>
            </div>
            <div className="big">{displayTitle(p)}</div>
            {p.logline.trim() || isLoglineDone(p) ? (
              <div className="clamp">{p.logline.trim() || pitchText(p)}</div>
            ) : p.seed.trim() ? (
              <div className="clamp muted">{p.seed}</div>
            ) : null}
            <Pips p={p} />
            <div className="muted small">
              Started {ago(p.createdAt)}
              {n && ` · Next: ${n.label}`}
            </div>
          </a>
        )
      })}
    </div>
  )
}
