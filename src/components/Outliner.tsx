import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { ACT_SHARE, BEATS, beatPages, lengthTarget, type BeatDef } from '../lib/framework'
import { newScene } from '../lib/project'
import { HEADING_RE, parseHeading } from '../lib/screenplay'
import { updateProject } from '../lib/store'
import type { Act, BeatKey, Project, Scene } from '../lib/types'
import { filled } from '../lib/util'
import { ACT_NAME, NoteCard, SceneEditor, SceneTracker, sceneTarget } from './SceneBoard'
import { StoryCircle } from './StoryCircle'
import { AutoTextarea } from './ui'

const ACTS: Act[] = [1, 2, 3]
type LaneKey = BeatKey | 'none'
const BEAT_INDEX = Object.fromEntries(BEATS.map((b, i) => [b.key, i])) as Record<BeatKey, number>

// Outline order: by beat (1→9), unplaced scenes last; order within a beat is kept.
export function inOutlineOrder(scenes: Scene[]) {
  const rank = (s: Scene) => (s.beat ? BEAT_INDEX[s.beat] : 99)
  return scenes.map((s, i) => [s, i] as const).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(([s]) => s)
}

// "INT. KITCHEN - NIGHT: she finds the letter" → a scene. Text without a heading becomes the summary.
export function quickScene(text: string, beat: BeatDef): Scene {
  const s = { ...newScene(beat.act), beat: beat.key }
  const m = text.match(/^(.*?)(?::|\s—\s|\s--\s)\s*(.*)$/)
  const head = (m ? m[1] : text).trim()
  const rest = m ? m[2].trim() : ''
  if (HEADING_RE.test(head)) {
    const h = parseHeading(head)
    const pre = h.prefix.toUpperCase()
    s.intExt = /INT.*EXT|EXT.*INT|I\/E/.test(pre) ? 'INT./EXT.' : pre.startsWith('EXT') ? 'EXT.' : 'INT.'
    s.location = h.location
    s.time = h.time || 'DAY'
    s.summary = rest
  } else {
    s.summary = text.trim()
  }
  return s
}

export function Outliner({ p, focus }: { p: Project; focus?: BeatKey }) {
  const firstOpen = BEATS.find((b) => !filled(p.beats[b.key]) || !p.scenes.some((s) => s.beat === b.key))?.key ?? 'you'
  const [open, setOpen] = useState<BeatKey>(focus ?? firstOpen)
  const [all, setAll] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [drag, setDrag] = useState<{ id: string; order: Scene[] } | null>(null)
  const dragRef = useRef<{ id: string; order: Scene[] } | null>(null)

  const scenes = inOutlineOrder(drag?.order ?? p.scenes)
  const inBeat = (k: LaneKey) => scenes.filter((s) => (k === 'none' ? !s.beat : s.beat === k))
  const number = (id: string) => scenes.findIndex((s) => s.id === id) + 1
  const counts = Object.fromEntries(BEATS.map((b) => [b.key, inBeat(b.key).length])) as Record<BeatKey, number>

  const jump = (k: BeatKey) => {
    setOpen(k)
    setTimeout(() => document.getElementById(`f-${k}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  // ---- drag between beats (window-level pointer tracking; works with touch and mouse) ----
  const setDragBoth = (d: { id: string; order: Scene[] } | null) => {
    dragRef.current = d
    setDrag(d)
  }
  const startDrag = (e: RPointerEvent, id: string) => {
    e.preventDefault()
    setDragBoth({ id, order: inOutlineOrder(p.scenes) })
  }
  useEffect(() => {
    if (!drag) return
    const move = (e: PointerEvent) => {
      const d = dragRef.current
      if (!d) return
      e.preventDefault()
      if (e.clientY < 90) window.scrollBy(0, -14)
      else if (e.clientY > window.innerHeight - 90) window.scrollBy(0, 14)
      const under = document.elementsFromPoint(e.clientX, e.clientY) as HTMLElement[]
      if (under.some((el) => el.dataset?.card === d.id)) return
      const laneEl = under.find((el) => el.dataset?.lane)
      if (!laneEl) return
      const lane = laneEl.dataset.lane as LaneKey
      const def = BEATS.find((b) => b.key === lane)
      const dragged = d.order.find((s) => s.id === d.id)!
      const moved: Scene = { ...dragged, beat: def ? def.key : '', act: def ? def.act : dragged.act }
      const rest = d.order.filter((s) => s.id !== d.id)
      const card = under.find((el) => el.dataset?.card && el.dataset.card !== d.id)
      let at: number
      const target = card && rest.find((s) => s.id === card.dataset.card)
      if (card && target && (target.beat || 'none') === lane) {
        const r = card.getBoundingClientRect()
        const idx = rest.indexOf(target)
        at = e.clientY > r.top + r.height / 2 ? idx + 1 : idx
      } else {
        const same = rest.filter((s) => (s.beat || 'none') === lane)
        at = same.length ? rest.indexOf(same[same.length - 1]) + 1 : rest.length
      }
      const next = [...rest]
      next.splice(at, 0, moved)
      const ordered = inOutlineOrder(next)
      if (ordered.some((s, i) => s.id !== d.order[i]?.id || s.beat !== d.order[i]?.beat)) setDragBoth({ ...d, order: ordered })
    }
    const up = () => {
      const d = dragRef.current
      setDragBoth(null)
      if (d) updateProject(p.id, (x) => ({ ...x, scenes: d.order }))
    }
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [drag !== null, p.id])

  const editingScene = p.scenes.find((s) => s.id === editing)
  const unplaced = inBeat('none')

  return (
    <div className="outliner">
      <aside className="outliner-map">
        <div className="card center">
          <StoryCircle beats={p.beats} selected={open} onSelect={jump} counts={counts} label={p.kind === 'tv' ? 'PILOT' : undefined} />
          <div className="muted small">Tap a beat to jump to it. Numbers show scenes per beat.</div>
        </div>
        <SceneTracker p={p} />
      </aside>

      <div className={`spine ${drag ? 'dragging' : ''}`}>
        <div className="row between wrap gap spine-tools">
          <div className="muted small">
            Work down the spine: write the beat in one line, then break it into scenes.
          </div>
          <button className="link small" onClick={() => setAll(!all)}>
            {all ? 'Fold to one beat at a time' : 'Open all beats'}
          </button>
        </div>

        {ACTS.map((act) => {
          const { target } = lengthTarget(p.kind, p.tvFormat)
          const start = act === 1 ? 1 : act === 2 ? Math.round(target * 0.25) + 1 : Math.round(target * 0.75) + 1
          const end = act === 1 ? Math.round(target * 0.25) : act === 2 ? Math.round(target * 0.75) : target
          const actScenes = scenes.filter((s) => s.beat && BEATS[BEAT_INDEX[s.beat]].act === act).length
          const actTarget = Math.max(1, Math.round(sceneTarget(p) * ACT_SHARE[act]))
          return (
            <section key={act} className={`act-block act-${act}`}>
              <header className="act-head" id={`f-act${act}`}>
                <div>
                  <div className="eyebrow">
                    Act {act} · p. {start}–{end} · ~{ACT_SHARE[act] * 100}%
                  </div>
                  <h3 className="beat-title">{ACT_NAME[act]}</h3>
                </div>
                <span className={`tag ${actScenes >= actTarget ? 'gold' : ''}`}>
                  {actScenes} / ~{actTarget} scenes
                </span>
              </header>
              {BEATS.filter((b) => b.act === act).map((b) => (
                <BeatBlock
                  key={b.key}
                  p={p}
                  b={b}
                  open={all || open === b.key}
                  onOpen={() => setOpen(b.key)}
                  scenes={inBeat(b.key)}
                  number={number}
                  dragId={drag?.id}
                  onGrab={startDrag}
                  onEdit={setEditing}
                  onNext={b.n < 9 ? () => jump(BEATS[b.n].key) : undefined}
                />
              ))}
            </section>
          )
        })}

        {unplaced.length > 0 && (
          <section className="beat-block open unplaced" data-lane="none">
            <div className="eyebrow">Not on a beat yet · drag onto a beat</div>
            <div className="beat-cards">
              {unplaced.map((s) => (
                <NoteCard
                  key={s.id}
                  s={s}
                  n={number(s.id)}
                  lifted={drag?.id === s.id}
                  onOpen={() => setEditing(s.id)}
                  onGrab={(e) => startDrag(e, s.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {editingScene && <SceneEditor p={p} s={editingScene} n={number(editingScene.id)} onClose={() => setEditing(null)} />}
    </div>
  )
}

// Which idea piece feeds which beat.
const IDEA_FOR_BEAT: Partial<Record<BeatKey, { label: string; field: 'hero' | 'want' | 'obstacle' | 'theme' }>> = {
  you: { label: 'Your hero', field: 'hero' },
  want: { label: 'Their want', field: 'want' },
  search: { label: 'What stands in the way', field: 'obstacle' },
  take: { label: 'What stands in the way', field: 'obstacle' },
  change: { label: 'Your theme question', field: 'theme' },
}

function BeatBlock({
  p,
  b,
  open,
  onOpen,
  scenes,
  number,
  dragId,
  onGrab,
  onEdit,
  onNext,
}: {
  p: Project
  b: BeatDef
  open: boolean
  onOpen: () => void
  scenes: Scene[]
  number: (id: string) => number
  dragId?: string
  onGrab: (e: RPointerEvent, id: string) => void
  onEdit: (id: string) => void
  onNext?: () => void
}) {
  const [qi, setQi] = useState(0)
  const [quick, setQuick] = useState('')
  const quickRef = useRef<HTMLInputElement>(null)
  const text = p.beats[b.key]
  const done = filled(text)
  const questions = [...(b.simens?.questions ?? []), ...b.questions]
  const idea = IDEA_FOR_BEAT[b.key]
  const ideaText = idea ? p[idea.field].trim() : ''

  const addQuick = () => {
    const t = quick.trim()
    if (!t) return
    const s = quickScene(t, b)
    updateProject(p.id, (x) => ({ ...x, scenes: inOutlineOrder([...x.scenes, s]) }))
    setQuick('')
    quickRef.current?.focus()
  }

  return (
    <article className={`beat-block ${open ? 'open' : ''} ${done ? 'done' : ''}`} id={`f-${b.key}`} data-lane={b.key}>
      <button className="beat-head" onClick={onOpen} aria-expanded={open}>
        <span className={`beat-num ${done ? 'on' : ''}`}>{done ? '✓' : b.n}</span>
        <span className="beat-head-text">
          <span className="beat-name">
            {b.title}
            {b.simens && <span className="simens-flag">{b.simens.label}</span>}
          </span>
          {!open && (
            <span className="beat-line">{done ? text : <span className="muted">{b.brief}</span>}</span>
          )}
        </span>
        <span className="beat-meta">
          <span className="tag">{beatPages(b, p.kind, p.tvFormat)}</span>
          <span className={`tag ${scenes.length ? 'gold' : ''}`}>
            {scenes.length} scene{scenes.length === 1 ? '' : 's'}
          </span>
        </span>
      </button>

      {open && (
        <div className="beat-body">
          <div className="muted small">
            Harmon: <b>{b.harmon}</b>
            {b.campbell && (
              <>
                {' '}
                · Campbell: <b>{b.campbell}</b>
              </>
            )}{' '}
            · {b.brief}
          </div>
          {b.simens && (
            <div className="simens">
              <b>{b.simens.label}</b> {b.simens.note}
            </div>
          )}
          {ideaText && (
            <div className="from-idea">
              <span className="eyebrow">From your idea · {idea!.label}</span>
              <div>{ideaText}</div>
              {!done && (
                <button
                  className="btn ghost sm"
                  style={{ alignSelf: 'flex-start' }}
                  onClick={() => updateProject(p.id, (x) => ({ ...x, beats: { ...x.beats, [b.key]: ideaText } }))}
                >
                  Start this beat from it
                </button>
              )}
            </div>
          )}
          <div className="question">
            <span>{questions[qi % questions.length]}</span>
            <button className="link small" onClick={() => setQi(qi + 1)}>
              ↻ another question
            </button>
          </div>
          <AutoTextarea
            minRows={2}
            value={text}
            placeholder="This beat in a line or two…"
            onChange={(e) => updateProject(p.id, (x) => ({ ...x, beats: { ...x.beats, [b.key]: e.target.value } }))}
          />
          <details className="checks">
            <summary className="eyebrow">Self-check</summary>
            {b.checks.map((c, i) => {
              const k = `beat:${b.key}:${i}`
              return (
                <label key={k} className="checkline">
                  <input
                    type="checkbox"
                    checked={!!p.checks[k]}
                    onChange={(e) => updateProject(p.id, (x) => ({ ...x, checks: { ...x.checks, [k]: e.target.checked } }))}
                  />
                  {c}
                </label>
              )
            })}
          </details>
        </div>
      )}

      <div className="beat-cards">
        {scenes.map((s) => (
          <NoteCard
            key={s.id}
            s={s}
            n={number(s.id)}
            lifted={dragId === s.id}
            onOpen={() => onEdit(s.id)}
            onGrab={(e) => onGrab(e, s.id)}
          />
        ))}
      </div>

      {open && (
        <div className="quick-add">
          <input
            ref={quickRef}
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addQuick()}
            placeholder="Add a scene: INT. KITCHEN - NIGHT: what happens"
            aria-label={`Add a scene to ${b.title}`}
          />
          <button className="btn sm" onClick={addQuick} disabled={!quick.trim()}>
            Add
          </button>
        </div>
      )}
      {open && onNext && (
        <div className="beat-next">
          <button className="btn ghost sm" onClick={onNext}>
            Next beat →
          </button>
        </div>
      )}
    </article>
  )
}
