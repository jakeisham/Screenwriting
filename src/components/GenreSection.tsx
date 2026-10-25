import { useState } from 'react'
import { GENRES, LOW_BUDGET_GENRES } from '../lib/framework'
import { playbook, type Playbook } from '../lib/genres'
import { MAX_GENRES } from '../lib/project'

// Pick up to 3 genres in order (Genre 1 is the primary), with the playbook for each.
export function GenreSection({ value, onChange }: { value: string[]; onChange: (g: string[]) => void }) {
  const [browsing, setBrowsing] = useState(value.length === 0)
  const [open, setOpen] = useState<string | null>(value[0] ?? null)
  const full = value.length >= MAX_GENRES

  const add = (g: string) => {
    if (value.includes(g)) return
    const next = [...value, g].slice(0, MAX_GENRES)
    onChange(next)
    setOpen(g)
    setBrowsing(false)
  }
  const remove = (g: string) => onChange(value.filter((x) => x !== g))
  const promote = (g: string) => onChange([g, ...value.filter((x) => x !== g)])

  return (
    <div className="stack genre-section">
      {value.length > 0 && (
        <div className="genre-slots">
          {value.map((g, i) => (
            <div key={g} className={`genre-slot ${i === 0 ? 'primary' : ''}`}>
              <span className="slot-n">Genre {i + 1}</span>
              <button className="slot-name" onClick={() => setOpen(open === g ? null : g)} aria-expanded={open === g}>
                {g}
              </button>
              {i > 0 && (
                <button className="link small" onClick={() => promote(g)} title="Make this Genre 1">
                  make #1
                </button>
              )}
              <button className="link small" onClick={() => remove(g)} aria-label={`Remove ${g}`}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {open && value.includes(open) && playbook(open) && <PlaybookCard genre={open} pb={playbook(open)!} />}

      {value[0] && (
        <div className="hint">
          {LOW_BUDGET_GENRES.some((g) => value.includes(g))
            ? `Simens: ${value.filter((g) => LOW_BUDGET_GENRES.includes(g)).join(' and ').toLowerCase()} ${
                value.filter((g) => LOW_BUDGET_GENRES.includes(g)).length > 1 ? 'are genres that sell' : 'is one of the genres that sells'
              } best at low budgets.`
            : 'Simens: horror, thriller and comedy sell best at low budgets. (Just a fact — your call.)'}
        </div>
      )}

      {browsing && !full ? (
        <div className="chips">
          {GENRES.filter((g) => !value.includes(g)).map((g) => (
            <button key={g} className="chip" onClick={() => add(g)}>
              {g}
            </button>
          ))}
          {value.length > 0 && (
            <button className="link small" onClick={() => setBrowsing(false)}>
              done
            </button>
          )}
        </div>
      ) : (
        !full && (
          <button className="btn ghost sm" onClick={() => setBrowsing(true)}>
            + Add genre {value.length + 1}
          </button>
        )
      )}
    </div>
  )
}

const COST: Record<string, string> = { $: 'Low budget', $$: 'Medium budget', $$$: 'High budget' }

export function PlaybookCard({ genre, pb }: { genre: string; pb: Playbook }) {
  return (
    <div className="playbook">
      <div className="row between wrap gap">
        <div className="eyebrow">Genre playbook · {genre}</div>
        <span className={`tag cost-${pb.cost.length}`}>
          {pb.cost} {COST[pb.cost]}
        </span>
      </div>
      <p className="pb-promise">{pb.promise}</p>
      <div className="pb-grid">
        <div>
          <div className="pb-h">Conventions</div>
          <ul>
            {pb.conventions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="pb-h">Typical set pieces</div>
          <ul>
            {pb.setPieces.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="pb-h">Usual hero</div>
          <p>{pb.hero}</p>
          <div className="pb-h">Usual opposition</div>
          <p>{pb.opposition}</p>
        </div>
      </div>
      <div className="muted small">{pb.budget}</div>
    </div>
  )
}
