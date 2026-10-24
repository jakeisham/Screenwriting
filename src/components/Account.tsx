import { href } from '../lib/router'
import { displayTitle } from '../lib/project'
import { exportBackup, importBackup, purgeProject, syncNow, trashProject, updateSettings, useStore } from '../lib/store'
import { syncConfigured } from '../lib/supabase'
import { ago, dateKey } from '../lib/util'
import { LookPicker } from './LookPicker'
import { download, pickFile } from './ui'

export function Account() {
  const s = useStore()
  return (
    <div className="stack">
      <h1>Account</h1>

      <div className="card">
        <div className="eyebrow">Sync across devices</div>
        {!syncConfigured ? (
          <>
            <p>
              <b>Saving on this device only.</b> Everything you write is stored in this browser and works offline.
            </p>
            <p className="muted small">
              To sync between phone, iPad and computer, connect a free Supabase project — see <code>README.md</code> → “Turn on sync”.
              Until then, use Backup below to move your work between devices.
            </p>
          </>
        ) : (
          <>
            <p>
              Signed in as <b>{s.owner}</b> on every device. Your writing syncs automatically.
            </p>
            <p className="muted small">
              Status: <span className={`sync-dot ${s.sync}`} /> {s.sync}
              {s.lastSync ? ` · last synced ${ago(s.lastSync)}` : ''}
              {s.syncError && <span className="error"> · {s.syncError}</span>}
            </p>
            <button className="btn" onClick={() => void syncNow()}>
              Sync now
            </button>
          </>
        )}
      </div>

      <div className="card">
        <div className="eyebrow">Look</div>
        <LookPicker />
      </div>

      <div className="card">
        <div className="eyebrow">Your goals</div>
        <div className="goal-grid">
          <Goal label="Finished loglines per day" value={s.settings.dailyIdeas} onChange={(v) => updateSettings({ dailyIdeas: v })} />
          <Goal label="Finished outlines per week" value={s.settings.weeklyOutlines} onChange={(v) => updateSettings({ weeklyOutlines: v })} />
          <Goal label="Finished scripts per month" value={s.settings.monthlyScripts} onChange={(v) => updateSettings({ monthlyScripts: v })} />
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">Backup</div>
        <p className="muted small">Download everything as one file, or restore from one. Newer edits always win when restoring.</p>
        <div className="row gap wrap">
          <button className="btn ghost" onClick={() => download(`writers-room-backup-${dateKey()}.json`, exportBackup(), 'application/json')}>
            Download backup
          </button>
          <button
            className="btn ghost"
            onClick={async () => {
              const text = await pickFile('.json,application/json')
              if (!text) return
              try {
                const n = importBackup(text)
                alert(`Restored ${n} item${n === 1 ? '' : 's'}.`)
              } catch {
                alert('That file isn’t a Writers’ Room backup.')
              }
            }}
          >
            Restore from backup
          </button>
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">Trash ({s.trash.length})</div>
        {s.trash.length === 0 && <div className="muted small">Empty.</div>}
        {s.trash.map((p) => (
          <div key={p.id} className="row between trash-row">
            <a href={href(`p/${p.id}/pitch`)}>{displayTitle(p)}</a>
            <div className="row gap">
              <button className="btn sm" onClick={() => trashProject(p.id, false)}>
                Restore
              </button>
              <button
                className="btn danger sm"
                onClick={() => confirm(`Permanently delete “${displayTitle(p)}”? This can’t be undone.`) && void purgeProject(p.id)}
              >
                Delete forever
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="eyebrow">The house rule</div>
        <p className="small">
          This app never writes for you. Every idea, line and beat is yours. It only organizes your words, asks questions, counts, and keeps score. The one exception is Remix: Claude fills in the left column with facts about the original movie or show, and never anything for your version.
        </p>
        <a className="link small" href={href('rules')}>
          The framework: Harmon · Campbell · Simens →
        </a>
      </div>
    </div>
  )
}

function Goal({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="goal">
      <span>{label}</span>
      <div className="stepper">
        <button onClick={() => onChange(Math.max(1, value - 1))}>−</button>
        <b>{value}</b>
        <button onClick={() => onChange(Math.min(20, value + 1))}>+</button>
      </div>
    </div>
  )
}
