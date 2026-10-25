import { BEATS, SIMENS_RULES } from '../lib/framework'

export function Rules() {
  return (
    <div className="stack">
      <h1>The framework</h1>
      <p className="muted">
        Harmon’s Story Circle and Campbell’s Hero’s Journey tell the same story in different words. Dov Simens adds the rules for getting it
        made.
      </p>

      <div className="card">
        <div className="eyebrow">The story · 9 steps</div>
        {BEATS.map((b) => (
          <div key={b.key} className="rule">
            <b>
              {b.n}. {b.title}.
            </b>{' '}
            {b.brief}{' '}
            {b.simens && (
              <>
                <b className="simens-inline">{b.simens.label}</b>{' '}
              </>
            )}
            <span className="muted small">
              (Harmon: {b.harmon}
              {b.campbell ? ` · Campbell: ${b.campbell}` : ''})
            </span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="eyebrow">The rules · Dov Simens</div>
        <div className="rule">
          <b>Uh-oh! and Oh no!</b> Around page 10 something goes wrong (uh-oh, step 3). Around pages 75–90 everything seems lost (oh no!, step 7).
          The story lives between those two moments.
        </div>
        {SIMENS_RULES.map((x, i) => (
          <div key={x.title} className="rule">
            <b>
              {i + 1}. {x.title}.
            </b>{' '}
            {x.body}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="eyebrow">Before you write a page</div>
        <div className="rule">
          <b>1. A logline:</b> one sentence that says who the hero is, what they want, and what stands in the way.
        </div>
        <div className="rule">
          <b>2. The theme:</b> one question the story answers through the ending.
        </div>
        <div className="rule">
          <b>3. A beat sheet:</b> one line for each of the nine steps.
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">For TV</div>
        <div className="rule">
          Each episode runs its own small circle, and the season runs one big circle. Your pilot needs an <b>engine</b>: a conflict that can make
          a new story every week. Harmon built Community this way.
        </div>
      </div>
    </div>
  )
}
