import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { ACT_SHARE, BEATS, TIMES, lengthTarget } from '../lib/framework'
import { newScene, sceneFilled } from '../lib/project'
import { updateProject } from '../lib/store'
import type { Act, BeatKey, Project, Scene } from '../lib/types'
import { filled } from '../lib/util'
import { AutoTextarea, Bar, QuestionField } from './ui'

const ACTS: Act[] = [1, 2, 3]
const ACT_NAME: Record<Act, string> = { 1: 'Setup', 2: 'Confrontation', 3: 'Resolution' }

// Simens: one page ≈ one minute, and a typical scene runs about two pages.
export const sceneTarget = (p: Project) => Math.round(lengthTarget(p.kind, p.tvFormat).target / 2)

// Note-card board: scenes grouped by act, dragged into order by the ⠿ handle.
export function SceneBoard({ p }: { p: Project }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [drag, setDrag] = useState<{ id: string; order: Scene[] } | null>(null)

  const scenes = drag?.order ?? p.scenes
  const byAct = (a: Act) => scenes.filter((s) => s.act === a)
  const numbered = ACTS.flatMap(byAct)
  const number = (id: string) => numbered.findIndex((s) => s.id === id) + 1

  const add = (act: Act, beat: BeatKey | '' = '') => {
    const s = { ...newScene(act), beat }
    updateProject(p.id, (x) => ({ ...x, scenes: [...x.scenes, s] }))
    setEditing(s.id)
  }

  // ---- drag to reorder (pointer events on the window, so it works with touch and mouse
  // and survives a card moving into another lane mid-drag) ----
  const dragRef = useRef<{ id: string; order: Scene[] } | null>(null)
  const setDragBoth = (d: { id: string; order: Scene[] } | null) => {
    dragRef.current = d
    setDrag(d)
  }

  const startDrag = (e: RPointerEvent, id: string) => {
    e.preventDefault()
    setDragBoth({ id, order: p.scenes })
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
      // Hovering the lifted card itself: it is already where the pointer is.
      if (under.some((el) => el.dataset?.card === d.id)) return
      const lane = under.find((el) => el.dataset?.lane)
      if (!lane) return
      const act = Number(lane.dataset.lane) as Act
      const card = under.find((el) => el.dataset?.card && el.dataset.card !== d.id)
      const dragged = d.order.find((s) => s.id === d.id)!
      const rest = d.order.filter((s) => s.id !== d.id)
      let at: number
      if (card && rest.find((s) => s.id === card.dataset.card)?.act === act) {
        const r = card.getBoundingClientRect()
        const idx = rest.findIndex((s) => s.id === card.dataset.card)
        at = e.clientY > r.top + r.height / 2 ? idx + 1 : idx
      } else {
        // Over the lane but not a card: drop at the end of that act.
        const last = [...rest].reverse().find((s) => s.act === act)
        at = last ? rest.indexOf(last) + 1 : rest.findIndex((s) => s.act > act)
        if (at < 0) at = rest.length
      }
      const next = [...rest]
      next.splice(at, 0, { ...dragged, act })
      if (next.some((s, i) => s.id !== d.order[i].id || s.act !== d.order[i].act)) setDragBoth({ ...d, order: next })
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

  return (
    <div className="stack">
      <SceneTracker p={p} />

      <div className={`board ${drag ? 'dragging' : ''}`}>
        {ACTS.map((act) => {
          const list = byAct(act)
          const { target } = lengthTarget(p.kind, p.tvFormat)
          const start = act === 1 ? 1 : act === 2 ? Math.round(target * 0.25) + 1 : Math.round(target * 0.75) + 1
          const end = act === 1 ? Math.round(target * 0.25) : act === 2 ? Math.round(target * 0.75) : target
          const actTarget = Math.max(1, Math.round(sceneTarget(p) * ACT_SHARE[act]))
          return (
            <section key={act} className={`lane lane-a${act}`} data-lane={act} id={`f-act${act}`}>
              <header className="lane-head">
                <div className="eyebrow">
                  Act {act} · p. {start}–{end}
                </div>
                <div className="row between">
                  <h3 className="beat-title">{ACT_NAME[act]}</h3>
                  <span className={`tag ${list.length >= actTarget ? 'gold' : ''}`}>
                    {list.length} / ~{actTarget}
                  </span>
                </div>
                <div className="lane-beats">
                  {BEATS.filter((b) => b.act === act).map((b) => {
                    const has = scenes.some((s) => s.beat === b.key)
                    return (
                      <button
                        key={b.key}
                        className={`beat-chip ${has ? 'on' : ''} ${b.simens ? 'simens-chip' : ''}`}
                        onClick={() => add(act, b.key)}
                        title={`Add a scene for step ${b.n}: ${b.title}`}
                      >
                        {b.n}. {b.simens ? b.simens.label : b.short}
                      </button>
                    )
                  })}
                </div>
              </header>

              <div className="lane-cards">
                {list.map((s) => (
                  <NoteCard
                    key={s.id}
                    s={s}
                    n={number(s.id)}
                    lifted={drag?.id === s.id}
                    onOpen={() => setEditing(s.id)}
                    onGrab={(e) => startDrag(e, s.id)}
                  />
                ))}
                {list.length === 0 && <div className="lane-empty">Drop a card here, or add one.</div>}
              </div>
              <button className="btn ghost sm lane-add" onClick={() => add(act)}>
                + Scene
              </button>
            </section>
          )
        })}
      </div>

      {editingScene && <SceneEditor p={p} s={editingScene} n={number(editingScene.id)} onClose={() => setEditing(null)} />}
    </div>
  )
}

function NoteCard({
  s,
  n,
  lifted,
  onOpen,
  onGrab,
}: {
  s: Scene
  n: number
  lifted: boolean
  onOpen: () => void
  onGrab: (e: RPointerEvent) => void
}) {
  const beat = BEATS.find((b) => b.key === s.beat)
  const costly = s.stunt || s.crowd || s.vfx || /NIGHT/.test(s.time)
  return (
    <article className={`note ${lifted ? 'lifted' : ''} ${sceneFilled(s) ? 'done' : ''}`} data-card={s.id}>
      <button
        className="note-grip"
        aria-label={`Drag scene ${n}`}
        onPointerDown={onGrab}
      >
        ⠿
      </button>
      <button className="note-body" onClick={onOpen}>
        <div className="note-top">
          <span className="note-n">{n}</span>
          <span className="note-h">
            {s.intExt} {s.location.trim().toUpperCase() || '…'}
            {s.time ? ` - ${s.time}` : ''}
          </span>
        </div>
        {s.summary.trim() ? <div className="note-sum">{s.summary}</div> : <div className="note-sum muted">Tap to write what happens</div>}
        <div className="note-tags">
          {beat && <span className={`tag ${beat.simens ? 'simens-tag' : ''}`}>{beat.simens ? beat.simens.label : beat.short}</span>}
          {s.pages ? <span className="tag">{s.pages} pp</span> : null}
          {costly && <span className="tag warn">$</span>}
        </div>
      </button>
    </article>
  )
}

function SceneTracker({ p }: { p: Project }) {
  const target = sceneTarget(p)
  const total = p.scenes.length
  const written = p.scenes.filter(sceneFilled).length
  const beatsCovered = BEATS.filter((b) => p.scenes.some((s) => s.beat === b.key))
  const pages = p.scenes.reduce((n, s) => n + (s.pages ?? 0), 0)
  const perAct = ACTS.map((a) => p.scenes.filter((s) => s.act === a).length)
  return (
    <div className="card tracker">
      <div className="row between wrap gap">
        <div>
          <div className="eyebrow">Scene count</div>
          <div className="big">
            {total} <span className="muted">/ ~{target} scenes</span>
          </div>
        </div>
        <div className="tracker-acts">
          {ACTS.map((a, i) => (
            <div key={a} className={`ta ta-a${a}`}>
              <b>{perAct[i]}</b>
              <span>Act {a}</span>
            </div>
          ))}
        </div>
      </div>
      <Bar value={total / Math.max(1, target)} className="gold" />
      <div className="tracker-meta small muted">
        <span>{written} written</span>
        <span>
          Beats with a scene: {beatsCovered.length}/9
          <span className="beat-dots" aria-hidden>
            {BEATS.map((b) => (
              <i key={b.key} className={beatsCovered.includes(b) ? 'on' : ''} />
            ))}
          </span>
        </span>
        {pages > 0 && <span>{pages} est. pages</span>}
        <span>Simens split: 25 / 50 / 25</span>
      </div>
      {total > 0 && (
        <div className="actbar">
          {perAct.map((t, i) => (
            <div key={i} className={`act a${i + 1}`} style={{ flex: t || 0.0001 }}>
              {t ? `${Math.round((t / total) * 100)}%` : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SceneEditor({ p, s, n, onClose }: { p: Project; s: Scene; n: number; onClose: () => void }) {
  const set = (patch: Partial<Scene>) =>
    updateProject(p.id, (x) => ({ ...x, scenes: x.scenes.map((y) => (y.id === s.id ? { ...y, ...patch } : y)) }))
  const move = (dir: -1 | 1) =>
    updateProject(p.id, (x) => {
      const list = [...x.scenes]
      const same = list.filter((y) => y.act === s.act)
      const j = same.findIndex((y) => y.id === s.id) + dir
      if (j < 0 || j >= same.length) return x
      const a = list.findIndex((y) => y.id === s.id)
      const b = list.findIndex((y) => y.id === same[j].id)
      ;[list[a], list[b]] = [list[b], list[a]]
      return { ...x, scenes: list }
    })
  const remove = () => {
    if (!confirm('Delete this scene?')) return
    updateProject(p.id, (x) => ({ ...x, scenes: x.scenes.filter((y) => y.id !== s.id) }))
    onClose()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={`Scene ${n}`} onClick={(e) => e.stopPropagation()}>
        <div className="row between">
          <div className="eyebrow">
            Scene {n} · Act {s.act}
          </div>
          <button className="btn sm" onClick={onClose}>
            Done
          </button>
        </div>
        <div className="heading-row">
          <select value={s.intExt} onChange={(e) => set({ intExt: e.target.value as Scene['intExt'] })}>
            <option>INT.</option>
            <option>EXT.</option>
            <option>INT./EXT.</option>
          </select>
          <input value={s.location} onChange={(e) => set({ location: e.target.value })} placeholder="LOCATION" className="caps" />
          <select value={s.time} onChange={(e) => set({ time: e.target.value })}>
            {TIMES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <QuestionField
          label="What happens"
          questions={[
            'What happens in this scene?',
            'What does the hero want in this scene — and do they get it?',
            'How does the scene end differently from how it starts?',
            'Why can’t this scene be cut?',
          ]}
          value={s.summary}
          onChange={(v) => set({ summary: v })}
        />
        <div className="field">
          <label>Which beat does this serve?</label>
          <select value={s.beat} onChange={(e) => set({ beat: e.target.value as BeatKey | '' })}>
            <option value="">—</option>
            {BEATS.map((b) => (
              <option key={b.key} value={b.key}>
                {b.n}. {b.title}
                {b.simens ? ` (${b.simens.label})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Characters in the scene (comma separated)</label>
          <input value={s.characters} onChange={(e) => set({ characters: e.target.value })} placeholder="Your characters…" />
        </div>
        <div className="field">
          <label>Dialogue you already hear (optional)</label>
          <AutoTextarea value={s.dialogue} onChange={(e) => set({ dialogue: e.target.value })} placeholder="Your words…" />
        </div>
        <div className="row wrap gap">
          <div className="field">
            <label>Est. pages</label>
            <input
              type="number"
              min={0}
              step={0.125}
              value={s.pages ?? ''}
              onChange={(e) => set({ pages: e.target.value === '' ? null : Number(e.target.value) })}
              style={{ width: 90 }}
            />
          </div>
          {(['stunt', 'crowd', 'vfx'] as const).map((k) => (
            <label key={k} className="checkline">
              <input type="checkbox" checked={s[k]} onChange={(e) => set({ [k]: e.target.checked })} />
              {k === 'vfx' ? 'VFX' : k[0].toUpperCase() + k.slice(1)}
            </label>
          ))}
        </div>
        <div className="row wrap gap">
          <button className="btn ghost sm" onClick={() => move(-1)} aria-label="Move up">
            ↑
          </button>
          <button className="btn ghost sm" onClick={() => move(1)} aria-label="Move down">
            ↓
          </button>
          <select value={s.act} onChange={(e) => set({ act: Number(e.target.value) as Act })}>
            <option value={1}>Act 1</option>
            <option value={2}>Act 2</option>
            <option value={3}>Act 3</option>
          </select>
          <span className="grow" />
          <button className="btn danger sm" onClick={remove}>
            Delete
          </button>
        </div>
        {!filled(s.location) && <div className="hint">Add a location and what happens to count this scene as written.</div>}
      </div>
    </div>
  )
}
