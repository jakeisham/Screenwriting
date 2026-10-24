import { useCallback, useState } from 'react'
import { lengthTarget } from '../lib/framework'
import { canFinishScript, sceneHeading } from '../lib/project'
import { estimatePages, fromFountain, loggedPages, newEl, toFountain } from '../lib/screenplay'
import { finishScript, logPages, updateProject } from '../lib/store'
import type { Project, ScriptEl } from '../lib/types'
import { countWords, fmtDate } from '../lib/util'
import { PrintScript, ScreenplayEditor } from './ScreenplayEditor'
import { Bar, download, pickFile } from './ui'

export function ScriptTab({ p }: { p: Project }) {
  const target = lengthTarget(p.kind, p.tvFormat)
  const sp = estimatePages(p.script)
  const lp = loggedPages(p)
  const total = sp + lp
  const [logN, setLogN] = useState('')
  const [logNote, setLogNote] = useState('')

  const onChange = useCallback((els: ScriptEl[]) => updateProject(p.id, (x) => ({ ...x, script: els })), [p.id])

  const fileBase = (p.title.trim() || 'untitled').replace(/[^\w-]+/g, '_')

  const importFountain = async () => {
    const text = await pickFile('.fountain,.txt,text/plain')
    if (!text) return
    const els = fromFountain(text)
    if (!els.length) return alert('No screenplay elements found in that file.')
    const replace = p.script.length === 0 || confirm('Replace the current script? (Cancel to add to the end.)')
    updateProject(p.id, (x) => ({ ...x, script: replace ? els : [...x.script, ...els] }), { noCredit: true })
    alert(
      `Imported ${els.length} lines (~${estimatePages(els).toFixed(1)} pages).\n\nImported pages don’t earn XP automatically — use “Log pages written elsewhere” if this is new work.`
    )
  }

  const insertSkeleton = () => {
    const scenes = [1, 2, 3].flatMap((a) => p.scenes.filter((s) => s.act === a && s.location.trim()))
    if (!scenes.length) return alert('Add scenes with locations in the Outline tab first.')
    if (!confirm(`Add ${scenes.length} scene headings from your outline to the end of the script?`)) return
    updateProject(p.id, (x) => ({ ...x, script: [...x.script, ...scenes.map((s) => newEl('scene', sceneHeading(s)))] }), {
      noCredit: true,
    })
  }

  return (
    <div className="stack">
      <div className={`card banner ${p.scriptDoneAt ? 'won' : ''}`}>
        <div className="eyebrow">Game 3 · The Screenplay</div>
        <div className="row between wrap">
          <div>
            <div className="big">
              {total.toFixed(1)} <span className="muted">/ {target.min}+ pages</span>
            </div>
            <div className="muted small">
              {target.label} · {countWords(p.script.map((e) => e.text).join(' '))} words in editor
              {lp > 0 && ` · ${lp} logged from elsewhere`}
            </div>
          </div>
          <div>
            {p.scriptDoneAt ? (
              <div className="row gap">
                <span className="tag gold">FADE OUT · {fmtDate(p.scriptDoneAt)}</span>
                <button className="link small" onClick={() => confirm('Mark as not finished?') && finishScript(p.id, false)}>
                  undo
                </button>
              </div>
            ) : (
              <button
                className="btn gold"
                disabled={!canFinishScript(p)}
                onClick={() => confirm('Mark this screenplay as finished? It counts toward this month’s goal.') && finishScript(p.id, true)}
                title={canFinishScript(p) ? '' : `Needs at least ${target.min} pages`}
              >
                FADE OUT ✓
              </button>
            )}
          </div>
        </div>
        <Bar value={total / target.min} className="gold" />
        {!p.scriptDoneAt && !canFinishScript(p) && (
          <div className="muted small">{Math.ceil(target.min - total)} more pages to reach Simens’ minimum for this format.</div>
        )}
      </div>

      <div className="row wrap gap">
        <button className="btn ghost sm" onClick={insertSkeleton}>
          ⇣ Outline scene headings
        </button>
        <button className="btn ghost sm" onClick={importFountain}>
          Import .fountain
        </button>
        <button className="btn ghost sm" onClick={() => download(`${fileBase}.fountain`, toFountain(p))} disabled={!p.script.length}>
          Export .fountain
        </button>
        <button className="btn ghost sm" onClick={() => window.print()} disabled={!p.script.length}>
          Print / PDF
        </button>
      </div>

      <ScreenplayEditor elements={p.script} onChange={onChange} />
      <div className="muted small">Editor estimate: {sp.toFixed(1)} pages (55 lines per page, standard margins).</div>

      <div className="card">
        <div className="eyebrow">Log pages written elsewhere</div>
        <div className="muted small">Writing in Final Draft, WriterDuet, or on paper? Log the pages here to keep your streak and XP.</div>
        <div className="row wrap gap" style={{ marginTop: 8 }}>
          <input type="number" min={0} step={0.5} value={logN} onChange={(e) => setLogN(e.target.value)} placeholder="Pages" style={{ width: 90 }} />
          <input value={logNote} onChange={(e) => setLogNote(e.target.value)} placeholder="Note (optional)" className="grow" />
          <button
            className="btn"
            disabled={!(Number(logN) > 0)}
            onClick={() => {
              logPages(p.id, Number(logN), logNote)
              setLogN('')
              setLogNote('')
            }}
          >
            Log
          </button>
        </div>
        {p.pageLogs.length > 0 && (
          <ul className="logs">
            {[...p.pageLogs].reverse().map((l) => (
              <li key={l.id}>
                <span>{l.date}</span> <b>{l.pages} pp</b> <span className="muted">{l.note}</span>
                <button
                  className="link small"
                  onClick={() =>
                    confirm('Remove this log entry? (XP already earned stays.)') &&
                    updateProject(p.id, (x) => ({ ...x, pageLogs: x.pageLogs.filter((y) => y.id !== l.id) }))
                  }
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <PrintScript title={p.title} elements={p.script} />
    </div>
  )
}
