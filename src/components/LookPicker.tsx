import { LOOKS, PALETTES, setLook, setPalette, useLook, usePalette } from '../lib/look'

export function LookPicker() {
  const look = useLook()
  const palette = usePalette()
  return (
    <div className="stack">
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
      {look === 'game' && (
        <>
          <div className="eyebrow">Colours</div>
          <div className="look-grid">
            {PALETTES.map((p) => (
              <button key={p.key} className={`look ${palette === p.key ? 'on' : ''}`} onClick={() => setPalette(p.key)}>
                <div className="look-swatch">
                  {p.swatch.map((c, i) => (
                    <span key={i} style={{ background: c }} />
                  ))}
                </div>
                <div className="look-name">{p.name}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Floating switcher for the preview build, so palettes can be compared on any screen.
export function LookBar() {
  const look = useLook()
  const palette = usePalette()
  return (
    <div className="look-bar" role="group" aria-label="Colours">
      {PALETTES.filter((p) => ['auto', 'neonday', 'neon'].includes(p.key)).map((p) => (
        <button
          key={p.key}
          className={look === 'game' && palette === p.key ? 'on' : ''}
          onClick={() => {
            if (look !== 'game') setLook('game')
            setPalette(p.key)
          }}
        >
          <span className="dot-swatch" style={{ background: p.swatch[1] }} />
          {p.name}
        </button>
      ))}
    </div>
  )
}
