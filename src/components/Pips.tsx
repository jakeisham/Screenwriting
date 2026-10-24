import { totalPages } from '../lib/screenplay'
import { actsWithScenes, beatsFilled, isLoglineDone } from '../lib/project'
import type { Project } from '../lib/types'
import { filled } from '../lib/util'
import { lengthTarget } from '../lib/framework'

// The "running list" of essential elements for one idea.
export function Pips({ p }: { p: Project }) {
  const beats = beatsFilled(p)
  const acts = actsWithScenes(p).length
  const pages = totalPages(p)
  const { min } = lengthTarget(p.kind, p.tvFormat)
  const items = [
    { k: 'Logline', on: isLoglineDone(p), part: !isLoglineDone(p) && [p.hero, p.want, p.obstacle, p.logline].some(filled) },
    { k: 'Theme', on: filled(p.theme) },
    ...(p.kind === 'tv' ? [{ k: 'Engine', on: filled(p.engine) }] : []),
    { k: `Beats ${beats}/9`, on: beats === 9, part: beats > 0 && beats < 9 },
    { k: `Acts ${acts}/3`, on: acts === 3, part: acts > 0 && acts < 3 },
    { k: `${Math.floor(pages)}/${min}pp`, on: !!p.scriptDoneAt, part: pages > 0 && !p.scriptDoneAt },
  ]
  return (
    <div className="pipline">
      {items.map((i) => (
        <span key={i.k} className={`ptag ${i.on ? 'on' : i.part ? 'part' : ''}`}>
          {i.on ? '✓ ' : ''}
          {i.k}
        </span>
      ))}
    </div>
  )
}
