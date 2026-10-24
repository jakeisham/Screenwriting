import { memo, useState } from 'react'
import { GENRES } from '../lib/framework'
import { href } from '../lib/router'
import { isLoglineDone } from '../lib/project'
import { fetchBreakdown, getRight, remixProgress, rowDone, rows, SECTIONS, setLeft, setRight, type Row, type SectionKey } from '../lib/remix'
import { accessToken, updateProject } from '../lib/store'
import type { Kind, Project, RemixExtra, TvFormat } from '../lib/types'
import { filled, fmtDate, uid } from '../lib/util'
import { AutoTextarea, Bar, GenrePicker } from './ui'

export function RemixTab({ p }: { p: Project }) {
  const r = p.remix!
  const src = r.source
  const all = rows(p)
  const prog = remixProgress(p)
  const [rerun, setRerun] = useState(false)
  const set = (fn: (x: Project) => Project) => updateProject(p.id, fn)

  const sections = SECTIONS.filter((s) => all.some((x) => x.section === s.key) || s.addLabel)

  const refetch = async () => {
    if (!confirm('Replace the left column with a fresh breakdown? Your right column stays, but rows matched by position may shift.')) return
    setRerun(true)
    try {
      const fresh = await fetchBreakdown(src.title, src.kind, await accessToken())
      if (!fresh.found) alert(fresh.message || 'Claude couldn’t identify that title.')
      else set((x) => ({ ...x, remix: { ...x.remix!, source: fresh, fetchedAt: Date.now(), fromClaude: true } }))
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e))
    } finally {
      setRerun(false)
    }
  }

  return (
    <div className="stack">
      <div className={`card banner ${prog.done === prog.total ? 'won' : ''}`}>
        <div className="eyebrow">Remix · genre turn</div>
        <div className="remix-title">
          <span className="muted">{src.title || 'Untitled source'}</span>
          {src.year && <span className="muted small"> ({src.year})</span>}
          <span className="arrow">→</span>
          <b>{p.title.trim() || 'Your version'}</b>
        </div>
        <Bar value={prog.done / Math.max(1, prog.total)} className="gold" />
        <div className="muted small">
          {prog.done} / {prog.total} elements translated
          {isLoglineDone(p) ? ' · logline done — counts as your idea ✓' : ' · finish the core pitch + genre to log today’s idea'}
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">1 · Pick your genre</div>
        <div className="small muted" style={{ marginBottom: 8 }}>
          Original: <b>{src.genre || '—'}</b>
          {src.tone && <> · tone: {src.tone}</>}
        </div>
        <GenrePicker value={p.genre} genres={GENRES} onChange={(g) => set((x) => ({ ...x, genre: g }))} />
        <div className="eyebrow" style={{ marginTop: 14 }}>
          Format of your version
        </div>
        <div className="chips">
          {([
            ['film', 'half', 'Film'],
            ['tv', 'half', 'TV · half-hour'],
            ['tv', 'hour', 'TV · hour'],
          ] as [Kind, TvFormat, string][]).map(([k, f, label]) => (
            <button
              key={label}
              className={`chip ${p.kind === k && (k === 'film' || p.tvFormat === f) ? 'on' : ''}`}
              onClick={() => set((x) => ({ ...x, kind: k, tvFormat: f }))}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <nav className="chips section-nav">
        {sections.map((s) => {
          const rs = all.filter((x) => x.section === s.key)
          const d = rs.filter((x) => rowDone(p, x)).length
          return (
            <a key={s.key} className="chip" href={`#/p/${p.id}/remix/sec-${s.key}`}>
              {s.title} {rs.length > 0 && `${d}/${rs.length}`}
            </a>
          )
        })}
      </nav>

      <div className="remix-head-row">
        <div>Original · {src.title}</div>
        <div>Your {p.genre || 'version'}</div>
      </div>

      {sections.map((s) => (
        <Section key={s.key} p={p} sectionKey={s.key} title={s.title} blurb={s.blurb} addLabel={s.addLabel} rows={all.filter((x) => x.section === s.key)} />
      ))}

      <div className="card slim row between wrap gap">
        <span className="muted small">
          {r.fromClaude ? `Left column by Claude · ${fmtDate(r.fetchedAt)} · facts about the original only. Tap any left box to correct it.` : 'Left column filled in by you.'}
        </span>
        {src.title && (
          <button className="btn ghost sm" disabled={rerun} onClick={() => void refetch()}>
            {rerun ? 'Working…' : r.fromClaude ? 'Re-run breakdown' : 'Fill left column with Claude'}
          </button>
        )}
      </div>

      <div className="row gap wrap">
        <a className="btn ghost" href={href(`p/${p.id}/pitch`)}>
          See it as a Logline →
        </a>
        <a className="btn ghost" href={href(`p/${p.id}/outline`)}>
          Build the Outline →
        </a>
      </div>
    </div>
  )
}

function Section({
  p,
  sectionKey,
  title,
  blurb,
  addLabel,
  rows: rs,
}: {
  p: Project
  sectionKey: SectionKey
  title: string
  blurb: string
  addLabel?: string
  rows: Row[]
}) {
  const extras = p.remix!.extras.filter((x) => x.section === sectionKey)
  const d = rs.filter((x) => rowDone(p, x)).length
  const setExtra = (id: string, patch: Partial<RemixExtra>) =>
    updateProject(p.id, (x) => ({ ...x, remix: { ...x.remix!, extras: x.remix!.extras.map((e) => (e.id === id ? { ...e, ...patch } : e)) } }))
  const addExtra = () =>
    updateProject(p.id, (x) => ({ ...x, remix: { ...x.remix!, extras: [...x.remix!.extras, { id: uid(), section: sectionKey, label: '', text: '' }] } }))
  const removeExtra = (id: string) =>
    updateProject(p.id, (x) => ({ ...x, remix: { ...x.remix!, extras: x.remix!.extras.filter((e) => e.id !== id) } }))

  return (
    <div className="card" id={`f-sec-${sectionKey}`}>
      <div className="row between">
        <div>
          <h3 className="beat-title">{title}</h3>
          <div className="muted small">{blurb}</div>
        </div>
        {rs.length > 0 && (
          <span className={`tag ${d === rs.length ? 'gold' : ''}`}>
            {d}/{rs.length}
          </span>
        )}
      </div>
      <div className="remix-rows">
        {rs.map((row) => (
          <RemixRow
            key={row.key}
            p={p}
            row={row}
            right={getRight(p, row)}
            left={row.left}
            skipped={!!p.remix!.skipped[row.key]}
          />
        ))}
        {extras.map((x) => (
          <div key={x.id} className="remix-row">
            <div className="remix-left new">
              <span className="muted small">New in your version — not in the original</span>
            </div>
            <div className="remix-right">
              <input value={x.label} onChange={(e) => setExtra(x.id, { label: e.target.value })} placeholder="Name" />
              <AutoTextarea value={x.text} onChange={(e) => setExtra(x.id, { text: e.target.value })} placeholder="Your words…" />
              <button className="link small" onClick={() => confirm('Remove this?') && removeExtra(x.id)}>
                remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {addLabel && (
        <button className="btn ghost sm" onClick={addExtra}>
          {addLabel}
        </button>
      )}
    </div>
  )
}

const RemixRow = memo(function RemixRow({ p, row, right, left, skipped }: { p: Project; row: Row; right: string; left: string; skipped: boolean }) {
  const [qi, setQi] = useState(0)
  const [editLeft, setEditLeft] = useState(false)
  const done = filled(right) || skipped
  return (
    <div className={`remix-row ${done ? 'done' : ''} ${skipped ? 'skipped' : ''}`} id={`f-${row.key}`}>
      <div className="remix-left">
        <div className="remix-label">
          {row.label || <span className="muted">—</span>}
          {row.sub && <span className="tag">{row.sub}</span>}
        </div>
        {editLeft ? (
          <AutoTextarea
            autoFocus
            value={left}
            onChange={(e) => updateProject(p.id, (x) => setLeft(x, row, e.target.value), { noCredit: true })}
            onBlur={() => setEditLeft(false)}
          />
        ) : (
          <div className="remix-src" onClick={() => setEditLeft(true)} title="Tap to correct">
            {left.trim() || <span className="muted">(empty — tap to fill in)</span>}
          </div>
        )}
      </div>
      <div className="remix-right">
        <div className="question">
          <span className={`check ${done ? 'on' : ''}`}>{done ? (skipped ? '–' : '✓') : ''}</span>
          <span>{row.questions[qi % row.questions.length]}</span>
          {row.questions.length > 1 && (
            <button className="link small" onClick={() => setQi((i) => i + 1)}>
              ↻
            </button>
          )}
        </div>
        {skipped ? (
          <div className="muted small">Dropped from your version.</div>
        ) : (
          <AutoTextarea value={right} onChange={(e) => updateProject(p.id, (x) => setRight(x, row, e.target.value))} placeholder="Your words…" />
        )}
        <label className="checkline small muted">
          <input
            type="checkbox"
            checked={skipped}
            onChange={(e) =>
              updateProject(p.id, (x) => ({ ...x, remix: { ...x.remix!, skipped: { ...x.remix!.skipped, [row.key]: e.target.checked } } }))
            }
          />
          Not in my version
        </label>
      </div>
    </div>
  )
})
