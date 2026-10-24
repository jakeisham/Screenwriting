import { useState } from 'react'
import { go, href } from '../lib/router'
import { displayTitle } from '../lib/project'
import { emptySource, fetchBreakdown, remixProgress } from '../lib/remix'
import { accessToken, createRemixProject, useStore } from '../lib/store'
import type { Kind, Source } from '../lib/types'
import { Bar } from './ui'

export function RemixStart() {
  const s = useStore()
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<Kind | ''>('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [notFound, setNotFound] = useState<Source | null>(null)

  const remixes = s.projects.filter((p) => p.remix)

  const run = async () => {
    setErr('')
    setNotFound(null)
    setBusy(true)
    try {
      const src = await fetchBreakdown(title.trim(), kind, await accessToken())
      if (!src.found) setNotFound(src)
      else {
        const id = createRemixProject(src, true, src.kind)
        go(`p/${id}/remix`)
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const manual = () => {
    const k = kind || 'film'
    const id = createRemixProject(emptySource(title.trim(), k), false, k)
    go(`p/${id}/remix`)
  }

  return (
    <div className="stack">
      <a className="link small" href={href('new')}>
        ← New
      </a>
      <h1>🔁 Remix</h1>
      <p className="muted">
        Take a movie or show you know, break it down, then rebuild it in a new genre — piece by piece, in your own words.
      </p>

      <div className="card stack">
        <div className="field">
          <label>Movie or TV show</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && title.trim() && !busy && void run()}
            placeholder="Title (add the year if there are several)"
            disabled={busy}
          />
        </div>
        <div className="chips">
          {(['', 'film', 'tv'] as const).map((k) => (
            <button key={k} className={`chip ${kind === k ? 'on' : ''}`} onClick={() => setKind(k)} disabled={busy}>
              {k === '' ? 'Not sure' : k === 'film' ? 'Film' : 'TV show'}
            </button>
          ))}
        </div>
        <button className="btn big-btn" disabled={!title.trim() || busy} onClick={() => void run()}>
          {busy ? 'Claude is breaking it down…' : 'Break it down'}
        </button>
        {busy && (
          <div className="muted small">
            This usually takes 20–60 seconds. Claude is mapping the characters, the 9 beats, the set pieces, the places and the objects.
          </div>
        )}
        {err && (
          <div className="error small">
            {err}
            <div>
              <button className="link small" onClick={manual}>
                Fill in the left column myself instead →
              </button>
            </div>
          </div>
        )}
        {notFound && (
          <div className="card slim">
            <b>Claude isn’t sure which work that is.</b>
            <div className="small muted">{notFound.message}</div>
            <div className="row gap wrap" style={{ marginTop: 8 }}>
              <button className="btn ghost sm" onClick={() => setNotFound(null)}>
                Try another title
              </button>
              <button className="btn ghost sm" onClick={manual}>
                Fill it in myself
              </button>
            </div>
          </div>
        )}
        <div className="hint">
          Claude only fills the <b>left column</b>: facts about the original. Your version, the right column, is all yours. Prefer no AI?{' '}
          <button className="link small" disabled={!title.trim()} onClick={manual}>
            Fill in both columns yourself
          </button>
        </div>
      </div>

      {remixes.length > 0 && (
        <div className="card">
          <div className="eyebrow">Your remixes ({remixes.length})</div>
          {remixes.map((p) => {
            const pr = remixProgress(p)
            return (
              <a key={p.id} className="idea-row" href={href(`p/${p.id}/remix`)}>
                <div className="row between">
                  <b>{displayTitle(p)}</b>
                  <span className="muted small">
                    {p.remix!.source.title} → {p.genre || '?'}
                  </span>
                </div>
                <Bar value={pr.done / Math.max(1, pr.total)} />
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
