import { useState } from 'react'
import { BEATS, BEAT_KEYS, ENGINE_FIELD, SEASON_QUESTION, emptyBeats, lengthTarget } from '../lib/framework'
import { updateProject } from '../lib/store'
import type { BeatKey, Episode, Project, TvFormat } from '../lib/types'
import { filled, uid } from '../lib/util'
import { StoryCircle } from './StoryCircle'
import { QuestionField } from './ui'

export function TvTab({ p }: { p: Project }) {
  const set = (fn: (x: Project) => Project) => updateProject(p.id, fn)
  const [seasonSel, setSeasonSel] = useState<BeatKey>(BEATS.find((b) => !filled(p.seasonBeats[b.key]))?.key ?? 'you')
  const sb = BEATS.find((b) => b.key === seasonSel)!
  const [openEp, setOpenEp] = useState<string | null>(null)

  const addEp = () => {
    const number = Math.max(1, ...p.episodes.map((e) => e.number)) + 1
    const ep: Episode = { id: uid(), number, title: '', logline: '', beats: emptyBeats() }
    set((x) => ({ ...x, episodes: [...x.episodes, ep] }))
    setOpenEp(ep.id)
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="eyebrow">Format</div>
        <div className="chips">
          {(['half', 'hour'] as TvFormat[]).map((f) => (
            <button key={f} className={`chip ${p.tvFormat === f ? 'on' : ''}`} onClick={() => set((x) => ({ ...x, tvFormat: f }))}>
              {lengthTarget('tv', f).label}
            </button>
          ))}
        </div>
      </div>

      <QuestionField
        id="engine"
        label={ENGINE_FIELD.label}
        hint={ENGINE_FIELD.hint + ' Harmon built Community this way.'}
        questions={ENGINE_FIELD.questions}
        value={p.engine}
        onChange={(v) => set((x) => ({ ...x, engine: v }))}
        minRows={3}
      />

      <div className="card">
        <div className="eyebrow">Main cast</div>
        <div className="muted small">Who keeps coming back every week? (Fewer regulars = smaller budget.)</div>
        {p.cast.map((c) => (
          <div key={c.id} className="cast-row">
            <input
              className="caps"
              value={c.name}
              onChange={(e) => set((x) => ({ ...x, cast: x.cast.map((y) => (y.id === c.id ? { ...y, name: e.target.value } : y)) }))}
              placeholder="NAME"
            />
            <input
              className="grow"
              value={c.description}
              onChange={(e) =>
                set((x) => ({ ...x, cast: x.cast.map((y) => (y.id === c.id ? { ...y, description: e.target.value } : y)) }))
              }
              placeholder="Who are they? What do they want?"
            />
            <button
              className="link small"
              onClick={() => confirm('Remove this character?') && set((x) => ({ ...x, cast: x.cast.filter((y) => y.id !== c.id) }))}
            >
              ✕
            </button>
          </div>
        ))}
        <button className="btn ghost sm" onClick={() => set((x) => ({ ...x, cast: [...x.cast, { id: uid(), name: '', description: '' }] }))}>
          + Character
        </button>
      </div>

      <div className="outline-grid">
        <div className="card center">
          <div className="eyebrow">The big circle · Season 1</div>
          <StoryCircle beats={p.seasonBeats} selected={seasonSel} onSelect={setSeasonSel} label="SEASON" />
        </div>
        <div className="card">
          <div className="eyebrow">
            Season step {sb.n} of 9 · Harmon: {sb.harmon}
          </div>
          <h3 className="beat-title">{sb.title}</h3>
          <QuestionField
            key={seasonSel}
            label="Across the season"
            questions={[SEASON_QUESTION(sb), ...sb.questions]}
            value={p.seasonBeats[seasonSel]}
            onChange={(v) => set((x) => ({ ...x, seasonBeats: { ...x.seasonBeats, [seasonSel]: v } }))}
            minRows={3}
          />
          <div className="row between">
            <button className="btn ghost" disabled={sb.n === 1} onClick={() => setSeasonSel(BEATS[sb.n - 2].key)}>
              ← Prev
            </button>
            <button className="btn ghost" disabled={sb.n === 9} onClick={() => setSeasonSel(BEATS[sb.n].key)}>
              Next →
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">Episodes · each runs its own small circle</div>
        <div className="ep-row pilot">
          <StoryCircle beats={p.beats} size={56} />
          <div className="grow">
            <b>Episode 1 · Pilot</b>
            <div className="muted small">Built in the Outline + Script tabs.</div>
          </div>
        </div>
        {p.episodes
          .slice()
          .sort((a, b) => a.number - b.number)
          .map((ep) => (
            <EpisodeRow key={ep.id} p={p} ep={ep} open={openEp === ep.id} onToggle={() => setOpenEp(openEp === ep.id ? null : ep.id)} />
          ))}
        <button className="btn ghost sm" onClick={addEp}>
          + Episode
        </button>
      </div>
    </div>
  )
}

function EpisodeRow({ p, ep, open, onToggle }: { p: Project; ep: Episode; open: boolean; onToggle: () => void }) {
  const set = (patch: Partial<Episode>) =>
    updateProject(p.id, (x) => ({ ...x, episodes: x.episodes.map((e) => (e.id === ep.id ? { ...e, ...patch } : e)) }))
  const n = BEAT_KEYS.filter((k) => filled(ep.beats[k])).length
  return (
    <div className="ep">
      <button className="ep-row" onClick={onToggle}>
        <StoryCircle beats={ep.beats} size={56} />
        <div className="grow left">
          <b>
            Episode {ep.number}
            {ep.title.trim() ? ` · ${ep.title}` : ''}
          </b>
          <div className="muted small">{ep.logline.trim() || `${n}/9 beats`}</div>
        </div>
        <span className="chev">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="ep-body">
          <div className="row gap">
            <div className="field">
              <label>#</label>
              <input type="number" min={2} value={ep.number} onChange={(e) => set({ number: Number(e.target.value) || ep.number })} style={{ width: 70 }} />
            </div>
            <div className="field grow">
              <label>Episode title</label>
              <input value={ep.title} onChange={(e) => set({ title: e.target.value })} placeholder="Your title…" />
            </div>
          </div>
          <QuestionField
            label="Episode logline"
            questions={['What is this week’s problem, in one sentence?', 'How does the engine create this episode’s story?']}
            value={ep.logline}
            onChange={(v) => set({ logline: v })}
          />
          {BEATS.map((b) => (
            <QuestionField
              key={b.key}
              label={`${b.n}. ${b.title}`}
              questions={b.questions}
              value={ep.beats[b.key]}
              onChange={(v) => set({ beats: { ...ep.beats, [b.key]: v } })}
              minRows={1}
            />
          ))}
          <button
            className="btn danger sm"
            onClick={() =>
              confirm('Delete this episode?') && updateProject(p.id, (x) => ({ ...x, episodes: x.episodes.filter((e) => e.id !== ep.id) }))
            }
          >
            Delete episode
          </button>
        </div>
      )}
    </div>
  )
}
