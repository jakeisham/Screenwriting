import { useEffect } from 'react'
import { focusField, go, href } from '../lib/router'
import { displayTitle, nextStep, stage, STAGE_LABEL } from '../lib/project'
import { trashProject, useProject, useStore } from '../lib/store'
import type { BeatKey } from '../lib/types'
import { ago } from '../lib/util'
import { BudgetTab } from './BudgetTab'
import { OutlineTab } from './OutlineTab'
import { PitchTab } from './PitchTab'
import { ScriptTab } from './ScriptTab'
import { TvTab } from './TvTab'

const TABS = [
  { key: 'pitch', label: 'Logline' },
  { key: 'outline', label: 'Outline' },
  { key: 'tv', label: 'Series', tvOnly: true },
  { key: 'script', label: 'Script' },
  { key: 'budget', label: 'Budget' },
]

export function ProjectPage({ id, tab = 'pitch', focus }: { id: string; tab?: string; focus?: string }) {
  const p = useProject(id)
  const isTrashed = useStore().trash.some((x) => x.id === id)

  useEffect(() => {
    if (focus) focusField(focus)
  }, [focus, tab])

  if (!p) {
    return (
      <div className="empty">
        <p>This idea doesn’t exist (or it’s still syncing).</p>
        <a className="btn" href={href('ideas')}>
          Back to ideas
        </a>
      </div>
    )
  }

  const tabs = TABS.filter((t) => !t.tvOnly || p.kind === 'tv')
  const ns = nextStep(p)
  const st = stage(p)

  return (
    <div className="project">
      <div className="project-head">
        <div className="row between wrap gap">
          <div>
            <div className="eyebrow">
              {p.kind === 'film' ? 'Film' : `TV · ${p.tvFormat === 'half' ? 'half-hour' : 'hour'}`}
              {p.genre && ` · ${p.genre}`} · <span className={`stage s-${st}`}>{STAGE_LABEL[st]}</span>
            </div>
            <h1>{displayTitle(p)}</h1>
          </div>
          {ns && !isTrashed && (
            <button className="btn next" onClick={() => go(`p/${p.id}/${ns.tab}${ns.focus ? `/${ns.focus}` : ''}`)}>
              Next: {ns.label} →
            </button>
          )}
        </div>
        <nav className="tabs">
          {tabs.map((t) => (
            <a key={t.key} href={href(`p/${p.id}/${t.key}`)} className={tab === t.key ? 'on' : ''}>
              {t.label}
            </a>
          ))}
        </nav>
      </div>

      {isTrashed && (
        <div className="card slim row between">
          <span>This idea is in the trash.</span>
          <button className="btn sm" onClick={() => trashProject(p.id, false)}>
            Restore
          </button>
        </div>
      )}

      {tab === 'pitch' && <PitchTab p={p} />}
      {tab === 'outline' && <OutlineTab key={focus} p={p} initialBeat={focus as BeatKey | undefined} />}
      {tab === 'tv' && p.kind === 'tv' && <TvTab p={p} />}
      {tab === 'script' && <ScriptTab p={p} />}
      {tab === 'budget' && <BudgetTab p={p} />}

      <div className="project-foot muted small">
        Started {ago(p.createdAt)} ·{' '}
        <button
          className="link small"
          onClick={() => {
            if (confirm('Move this idea to the trash? You can restore it from Account → Trash.')) {
              trashProject(p.id)
              go('ideas')
            }
          }}
        >
          Move to trash
        </button>
      </div>
    </div>
  )
}
