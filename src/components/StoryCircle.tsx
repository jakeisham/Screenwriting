import { BEATS } from '../lib/framework'
import type { BeatKey, Beats } from '../lib/types'
import { filled } from '../lib/util'

// The Story Circle as a game board: 9 nodes that light up as the writer fills them in.
export function StoryCircle({
  beats,
  selected,
  onSelect,
  size = 320,
  label,
  counts,
}: {
  beats: Beats
  selected?: BeatKey
  onSelect?: (k: BeatKey) => void
  size?: number
  label?: string
  counts?: Partial<Record<BeatKey, number>>
}) {
  const c = size / 2
  const R = size * 0.37
  const nodeR = size * 0.058
  const pts = BEATS.map((b, i) => {
    const a = (-90 + i * 40) * (Math.PI / 180)
    return { b, x: c + R * Math.cos(a), y: c + R * Math.sin(a), on: filled(beats[b.key]) }
  })
  const count = pts.filter((p) => p.on).length
  const nextKey = pts.find((p) => !p.on)?.b.key
  const small = size < 160

  return (
    <svg
      className="circle-board"
      viewBox={small ? `0 0 ${size} ${size}` : `${-size * 0.1} ${-size * 0.05} ${size * 1.2} ${size * 1.1}`}
      width="100%"
      style={{ maxWidth: small ? size : size * 1.2 }}
      role="img"
      aria-label={`Story circle: ${count} of 9 steps filled`}
    >
      <circle cx={c} cy={c} r={R} className="cb-track" />
      {pts.map((p, i) => {
        const q = pts[(i + 1) % 9]
        if (i === 8 || !p.on || !q.on) return null
        return <line key={`l${i}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className="cb-link" />
      })}
      <line x1={c - R - nodeR * 1.6} y1={c} x2={c + R + nodeR * 1.6} y2={c} className="cb-threshold" />
      {!small && (
        <>
          <text x={c} y={c - R * 0.42} textAnchor="middle" className="cb-world">
            ORDINARY WORLD
          </text>
          <text x={c} y={c + R * 0.5} textAnchor="middle" className="cb-world">
            NEW WORLD
          </text>
          <text x={c} y={c + 4} textAnchor="middle" dominantBaseline="central" className="cb-count">
            {count}/9
          </text>
          {label && (
            <text x={c} y={c + size * 0.075} textAnchor="middle" className="cb-world">
              {label}
            </text>
          )}
        </>
      )}
      {pts.map((p) => {
        const isSel = selected === p.b.key
        const isNext = p.b.key === nextKey
        const lx = c + (R + nodeR * 2.3) * Math.cos((-90 + (p.b.n - 1) * 40) * (Math.PI / 180))
        const ly = c + (R + nodeR * 2.3) * Math.sin((-90 + (p.b.n - 1) * 40) * (Math.PI / 180))
        return (
          <g
            key={p.b.key}
            className={`cb-node ${p.on ? 'on' : ''} ${isSel ? 'sel' : ''} ${isNext && !small ? 'next' : ''}`}
            onClick={() => onSelect?.(p.b.key)}
            style={{ cursor: onSelect ? 'pointer' : 'default' }}
          >
            <circle cx={p.x} cy={p.y} r={nodeR * (isSel ? 1.25 : 1)} />
            {!small && (
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" className="cb-num">
                {p.b.n}
              </text>
            )}
            {!small && (
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" className="cb-label">
                {p.b.short}
              </text>
            )}
            {!small && counts && (counts[p.b.key] ?? 0) > 0 && (
              <g className="cb-count-badge">
                <circle cx={p.x + nodeR * 0.85} cy={p.y - nodeR * 0.85} r={nodeR * 0.55} />
                <text x={p.x + nodeR * 0.85} y={p.y - nodeR * 0.85} textAnchor="middle" dominantBaseline="central">
                  {counts[p.b.key]}
                </text>
              </g>
            )}
            {!small && p.b.simens && (
              <text x={lx} y={ly + 13} textAnchor="middle" dominantBaseline="central" className="cb-simens">
                {p.b.simens.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
