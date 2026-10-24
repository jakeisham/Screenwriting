import { LOOKS, setLook, useLook } from '../lib/look'

export function LookPicker() {
  const look = useLook()
  return (
    <div className="look-grid">
      {LOOKS.map((l) => (
        <button key={l.key} className={`look ${look === l.key ? 'on' : ''}`} onClick={() => setLook(l.key)}>
          <div className="look-swatch">
            {l.swatch.map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </div>
          <div className="look-name">{l.name}</div>
          <div className="look-desc">{l.desc}</div>
        </button>
      ))}
    </div>
  )
}

// Floating switcher for the preview build, so looks can be compared on any screen.
export function LookBar() {
  const look = useLook()
  return (
    <div className="look-bar" role="group" aria-label="Look">
      {LOOKS.map((l) => (
        <button key={l.key} className={look === l.key ? 'on' : ''} onClick={() => setLook(l.key)}>
          {l.name}
        </button>
      ))}
    </div>
  )
}
