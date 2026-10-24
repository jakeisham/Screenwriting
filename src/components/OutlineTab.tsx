import { useState } from 'react'
import { ACT_SHARE, BEATS, BEAT_KEYS, TIMES, beatPages, lengthTarget } from '../lib/framework'
import { actsWithScenes, beatsFilled, isOutlineDone, newScene, sceneFilled, sceneHeading } from '../lib/project'
import { updateProject } from '../lib/store'
import type { Act, BeatKey, Project, Scene } from '../lib/types'
import { filled, fmtDate } from '../lib/util'
import { StoryCircle } from './StoryCircle'
import { AutoTextarea, QuestionField } from './ui'

export function OutlineTab({ p, initialBeat }: { p: Project; initialBeat?: BeatKey }) {
  const firstEmpty = BEATS.find((b) => !filled(p.beats[b.key]))?.key ?? 'you'
  const [sel, setSel] = useState<BeatKey>(initialBeat && BEAT_KEYS.includes(initialBeat) ? initialBeat : firstEmpty)
  const beat = BEATS.find((b) => b.key === sel)!
  const set = (fn: (x: Project) => Project) => updateProject(p.id, fn)
  const acts = actsWithScenes(p)

  return (
    <div className="stack">
      <div className={`card banner ${isOutlineDone(p) ? 'won' : ''}`}>
        <div className="eyebrow">Game 2 · The Outline</div>
        <div className="big">{isOutlineDone(p) ? 'Outline complete ✓' : `${beatsFilled(p)} / 9 beats · ${acts.length} / 3 acts with scenes`}</div>
        <div className="muted small">
          {p.outlineDoneAt
            ? `Counted toward your weekly outline on ${fmtDate(p.outlineDoneAt)}`
            : `All 9 beats + at least one scene in each act${p.kind === 'tv' ? ' + the series engine (TV tab)' : ''} = this week’s outline.`}
        </div>
      </div>

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
          <QuestionField
            key={sel}
            label="Your beat"
            questions={beat.questions}
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

      {p.theme.trim() && (
        <div className="card slim">
          <span className="eyebrow">Your theme question</span> <span>{p.theme}</span>
        </div>
      )}

      <ActBalance p={p} />

      {([1, 2, 3] as Act[]).map((a) => (
        <ActSection key={a} p={p} act={a} />
      ))}
    </div>
  )
}

function ActBalance({ p }: { p: Project }) {
  const withPages = p.scenes.some((s) => s.pages)
  const weight = (s: Scene) => (withPages ? s.pages ?? 0 : 1)
  const totals = ([1, 2, 3] as Act[]).map((a) => p.scenes.filter((s) => s.act === a).reduce((n, s) => n + weight(s), 0))
  const sum = totals.reduce((a, b) => a + b, 0)
  if (!sum) return null
  return (
    <div className="card">
      <div className="eyebrow">Act balance ({withPages ? 'by estimated pages' : 'by scene count'}) · Simens: 25 / 50 / 25</div>
      <div className="actbar">
        {totals.map((t, i) => (
          <div key={i} className={`act a${i + 1}`} style={{ flex: t || 0.0001 }}>
            {t ? `${Math.round((t / sum) * 100)}%` : ''}
          </div>
        ))}
      </div>
      <div className="actbar target">
        <div className="act a1" style={{ flex: 1 }}>
          25%
        </div>
        <div className="act a2" style={{ flex: 2 }}>
          50%
        </div>
        <div className="act a3" style={{ flex: 1 }}>
          25%
        </div>
      </div>
      {withPages && (
        <div className="muted small">
          {sum} estimated pages · target {lengthTarget(p.kind, p.tvFormat).label}
        </div>
      )}
    </div>
  )
}

function ActSection({ p, act }: { p: Project; act: Act }) {
  const scenes = p.scenes.filter((s) => s.act === act)
  const { target } = lengthTarget(p.kind, p.tvFormat)
  const start = act === 1 ? 1 : act === 2 ? Math.round(target * 0.25) + 1 : Math.round(target * 0.75) + 1
  const end = act === 1 ? Math.round(target * 0.25) : act === 2 ? Math.round(target * 0.75) : target
  const [open, setOpen] = useState<string | null>(null)

  const add = () => {
    const s = newScene(act)
    updateProject(p.id, (x) => ({ ...x, scenes: [...x.scenes, s] }))
    setOpen(s.id)
  }

  return (
    <div className="card" id={`f-act${act}`}>
      <div className="row between">
        <div>
          <div className="eyebrow">
            Act {act} · ~{ACT_SHARE[act] * 100}% · p. {start}–{end}
          </div>
          <h3 className="beat-title">
            {act === 1 ? 'Setup' : act === 2 ? 'Confrontation' : 'Resolution'}{' '}
            <span className="muted small">
              {scenes.length} scene{scenes.length === 1 ? '' : 's'}
            </span>
          </h3>
        </div>
        <span className={`check ${scenes.some(sceneFilled) ? 'on' : ''}`}>{scenes.some(sceneFilled) ? '✓' : ''}</span>
      </div>
      <div className="scene-list">
        {scenes.map((s, i) => (
          <SceneCard key={s.id} p={p} s={s} n={i + 1} open={open === s.id} onToggle={() => setOpen(open === s.id ? null : s.id)} />
        ))}
      </div>
      <button className="btn ghost" onClick={add}>
        + Add scene to Act {act}
      </button>
    </div>
  )
}

function SceneCard({ p, s, n, open, onToggle }: { p: Project; s: Scene; n: number; open: boolean; onToggle: () => void }) {
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
  }
  const beat = BEATS.find((b) => b.key === s.beat)

  return (
    <div className={`scene ${open ? 'open' : ''} ${sceneFilled(s) ? 'done' : ''}`}>
      <button className="scene-head" onClick={onToggle}>
        <span className="scene-n">{n}</span>
        <span className="scene-h">{sceneHeading(s)}</span>
        {beat && <span className="tag">{beat.short}</span>}
        {(s.stunt || s.crowd || s.vfx || /NIGHT/.test(s.time)) && <span className="tag warn">$</span>}
        <span className="chev">{open ? '▾' : '▸'}</span>
      </button>
      {!open && s.summary.trim() && <div className="scene-sum">{s.summary}</div>}
      {open && (
        <div className="scene-body">
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
            <label>Characters in the scene (comma separated)</label>
            <input value={s.characters} onChange={(e) => set({ characters: e.target.value })} placeholder="Your characters…" />
          </div>
          <div className="field">
            <label>Dialogue you already hear (optional)</label>
            <AutoTextarea value={s.dialogue} onChange={(e) => set({ dialogue: e.target.value })} placeholder="Your words…" />
          </div>
          <div className="row wrap gap">
            <div className="field grow">
              <label>Which beat does this serve?</label>
              <select value={s.beat} onChange={(e) => set({ beat: e.target.value as BeatKey | '' })}>
                <option value="">—</option>
                {BEATS.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.n}. {b.title}
                  </option>
                ))}
              </select>
            </div>
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
          </div>
          <div className="row wrap gap">
            {(['stunt', 'crowd', 'vfx'] as const).map((k) => (
              <label key={k} className="checkline">
                <input type="checkbox" checked={s[k]} onChange={(e) => set({ [k]: e.target.checked })} />
                {k === 'vfx' ? 'VFX' : k[0].toUpperCase() + k.slice(1)}
              </label>
            ))}
          </div>
          <div className="row wrap gap">
            <button className="btn ghost sm" onClick={() => move(-1)}>
              ↑
            </button>
            <button className="btn ghost sm" onClick={() => move(1)}>
              ↓
            </button>
            <select value={s.act} onChange={(e) => set({ act: Number(e.target.value) as Act })}>
              <option value={1}>Move to Act 1</option>
              <option value={2}>Move to Act 2</option>
              <option value={3}>Move to Act 3</option>
            </select>
            <span className="grow" />
            <button className="btn danger sm" onClick={remove}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
