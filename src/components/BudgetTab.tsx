import { budgetReport } from '../lib/budget'
import { LOW_BUDGET_GENRES, SIMENS_RULES } from '../lib/framework'
import type { Project } from '../lib/types'

export function BudgetTab({ p }: { p: Project }) {
  const r = budgetReport(p)
  const pct = Math.min(1, r.score / 11)
  return (
    <div className="stack">
      <div className="card">
        <div className="eyebrow">Budget meter · Dov Simens</div>
        <div className={`big budget-${r.level.toLowerCase()}`}>{r.level === '—' ? 'No scenes yet' : `${r.level} budget`}</div>
        <div className="meter">
          <div className="meter-fill" style={{ left: `calc(${pct * 100}% - 7px)` }} />
        </div>
        <div className="row between muted small">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
        <div className="muted small" style={{ marginTop: 8 }}>
          {r.source === 'script'
            ? `Counted from ${r.scenes} scene headings and character names in your script.`
            : r.source === 'outline'
              ? `Counted from ${r.scenes} scenes in your outline. (Once your script has scene headings, the meter uses those.)`
              : 'Add scenes in the Outline or headings in the Script and this meter will count them.'}{' '}
          This meter only reports what you wrote.
        </div>
      </div>

      <div className="card">
        <table className="tbl">
          <tbody>
            {r.parts.map((x) => (
              <tr key={x.label}>
                <td>{x.label}</td>
                <td className="num">{x.value}</td>
                <td className="dots">
                  {Array.from({ length: x.max }).map((_, i) => (
                    <span key={i} className={`dot ${i < x.pts ? 'on' : ''}`} />
                  ))}
                </td>
              </tr>
            ))}
            <tr>
              <td>Exterior scenes</td>
              <td className="num">{r.exteriorScenes}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      <div className="two">
        <div className="card">
          <div className="eyebrow">Locations ({r.locations.length})</div>
          {r.locations.length ? (
            <ul className="plain">
              {r.locations.map((l) => (
                <li key={l.name}>
                  <span className="caps">{l.name}</span> <span className="muted">×{l.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="muted small">None yet.</div>
          )}
        </div>
        <div className="card">
          <div className="eyebrow">Speaking roles ({r.roles.length})</div>
          {r.roles.length ? (
            <ul className="plain">
              {r.roles.map((c) => (
                <li key={c} className="caps">
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <div className="muted small">None yet.</div>
          )}
        </div>
      </div>

      {p.genre && (
        <div className="card slim">
          <span className="eyebrow">Genre</span> {p.genre}
          {LOW_BUDGET_GENRES.includes(p.genre) ? ' — a low-budget seller, per Simens.' : ' — Simens: horror, thriller and comedy sell best at low budgets.'}
        </div>
      )}

      <div className="card">
        <div className="eyebrow">The rules</div>
        {SIMENS_RULES.map((x, i) => (
          <div key={x.title} className="rule">
            <b>
              {i + 1}. {x.title}.
            </b>{' '}
            {x.body}
          </div>
        ))}
      </div>
    </div>
  )
}
