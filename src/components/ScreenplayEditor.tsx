import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { EL_LABEL, EL_TYPES, HEADING_RE, NEXT_TYPE, newEl } from '../lib/screenplay'
import type { ElType, ScriptEl } from '../lib/types'

interface Props {
  elements: ScriptEl[]
  onChange: (els: ScriptEl[]) => void
}

const cycle = (t: ElType, dir: 1 | -1) => EL_TYPES[(EL_TYPES.indexOf(t) + dir + EL_TYPES.length) % EL_TYPES.length]

export function ScreenplayEditor({ elements, onChange }: Props) {
  const [focusId, setFocusId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const elsRef = useRef(elements)
  elsRef.current = elements
  const refs = useRef(new Map<string, HTMLTextAreaElement>())
  const caretRef = useRef<number | null>(null)

  useEffect(() => {
    if (!focusId) return
    const el = refs.current.get(focusId)
    if (el) {
      el.focus()
      const pos = caretRef.current ?? el.value.length
      el.setSelectionRange(pos, pos)
      caretRef.current = null
    }
    setFocusId(null)
  }, [focusId, elements])

  const update = useCallback(
    (id: string, patch: Partial<ScriptEl>) => {
      onChange(elsRef.current.map((e) => (e.id === id ? { ...e, ...patch } : e)))
    },
    [onChange]
  )

  const onKey = useCallback(
    (ev: KeyboardEvent<HTMLTextAreaElement>, el: ScriptEl) => {
      const els = elsRef.current
      const i = els.findIndex((e) => e.id === el.id)
      const ta = ev.currentTarget
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault()
        // Empty element + Enter: change type instead (quick way to get a scene heading or action).
        if (!el.text) {
          update(el.id, { type: el.type === 'action' ? 'scene' : 'action' })
          return
        }
        const before = ta.value.slice(0, ta.selectionStart)
        const after = ta.value.slice(ta.selectionEnd)
        const next = newEl(NEXT_TYPE[el.type], after)
        const copy = [...els]
        copy[i] = { ...el, text: before }
        copy.splice(i + 1, 0, next)
        onChange(copy)
        caretRef.current = 0
        setFocusId(next.id)
      } else if (ev.key === 'Tab') {
        ev.preventDefault()
        update(el.id, { type: cycle(el.type, ev.shiftKey ? -1 : 1) })
      } else if (ev.key === 'Backspace' && ta.selectionStart === 0 && ta.selectionEnd === 0 && i > 0) {
        ev.preventDefault()
        const prev = els[i - 1]
        const copy = [...els]
        copy[i - 1] = { ...prev, text: prev.text + el.text }
        copy.splice(i, 1)
        onChange(copy)
        caretRef.current = prev.text.length
        setFocusId(prev.id)
      } else if (ev.key === 'ArrowUp' && ta.selectionStart === 0 && i > 0) {
        ev.preventDefault()
        caretRef.current = null
        setFocusId(els[i - 1].id)
      } else if (ev.key === 'ArrowDown' && ta.selectionEnd === ta.value.length && i < els.length - 1) {
        ev.preventDefault()
        caretRef.current = 0
        setFocusId(els[i + 1].id)
      }
    },
    [onChange, update]
  )

  const onText = useCallback(
    (el: ScriptEl, text: string) => {
      // Typing INT. / EXT. at the start of an action line turns it into a scene heading.
      if (el.type === 'action' && el.text.length < 6 && HEADING_RE.test(text)) update(el.id, { text, type: 'scene' })
      else update(el.id, { text })
    },
    [update]
  )

  const register = useCallback((id: string, node: HTMLTextAreaElement | null) => {
    if (node) refs.current.set(id, node)
    else refs.current.delete(id)
  }, [])

  const active = elements.find((e) => e.id === activeId)

  const addFirst = () => {
    const el = newEl('scene')
    onChange([el])
    setFocusId(el.id)
  }

  return (
    <div className="sp-wrap">
      <div className="sp-toolbar">
        {EL_TYPES.map((t) => (
          <button
            key={t}
            className={`chip ${active?.type === t ? 'on' : ''}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (active) {
                update(active.id, { type: t })
                caretRef.current = null
                setFocusId(active.id)
              } else {
                const el = newEl(t)
                onChange([...elements, el])
                setFocusId(el.id)
              }
            }}
          >
            {EL_LABEL[t]}
          </button>
        ))}
      </div>
      <div className="sp-page">
        {elements.length === 0 && (
          <button className="btn ghost" onClick={addFirst}>
            + Start with a scene heading
          </button>
        )}
        {elements.map((el) => (
          <Line
            key={el.id}
            el={el}
            register={register}
            onKey={onKey}
            onText={onText}
            onFocus={setActiveId}
          />
        ))}
        {elements.length > 0 && (
          <button
            className="sp-add"
            onClick={() => {
              const last = elements[elements.length - 1]
              const el = newEl(last ? NEXT_TYPE[last.type] : 'scene')
              onChange([...elements, el])
              setFocusId(el.id)
            }}
          >
            + line
          </button>
        )}
      </div>
      <div className="hint">
        <b>Enter</b> new line (smart type) · <b>Tab</b> change type · <b>Shift+Enter</b> line break · type <b>INT.</b> or{' '}
        <b>EXT.</b> to start a scene. On phone/iPad, tap a type above.
      </div>
    </div>
  )
}

const Line = memo(function Line({
  el,
  register,
  onKey,
  onText,
  onFocus,
}: {
  el: ScriptEl
  register: (id: string, n: HTMLTextAreaElement | null) => void
  onKey: (e: KeyboardEvent<HTMLTextAreaElement>, el: ScriptEl) => void
  onText: (el: ScriptEl, text: string) => void
  onFocus: (id: string) => void
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null)
  useLayoutEffect(() => {
    const n = ref.current
    if (!n) return
    n.style.height = 'auto'
    n.style.height = `${n.scrollHeight}px`
  }, [el.text, el.type])
  return (
    <div className={`sp-line sp-${el.type}`}>
      <span className="sp-type">{EL_LABEL[el.type]}</span>
      <textarea
        ref={(n) => {
          ref.current = n
          register(el.id, n)
        }}
        rows={1}
        value={el.text}
        spellCheck
        onChange={(e) => onText(el, e.target.value)}
        onKeyDown={(e) => onKey(e, el)}
        onFocus={() => onFocus(el.id)}
      />
    </div>
  )
})

export function PrintScript({ title, elements }: { title: string; elements: ScriptEl[] }) {
  return (
    <div className="print-only print-script">
      {title.trim() && (
        <div className="print-title">
          <div>{title.toUpperCase()}</div>
        </div>
      )}
      {elements.map((el) => (
        <div key={el.id} className={`pr pr-${el.type}`}>
          {el.type === 'parenthetical' && !el.text.startsWith('(') ? `(${el.text})` : el.text}
        </div>
      ))}
    </div>
  )
}
