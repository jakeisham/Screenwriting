import { useEffect, useLayoutEffect, useRef, useState, type TextareaHTMLAttributes } from 'react'
import { countWords, filled } from '../lib/util'

export function AutoTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { minRows?: number }) {
  const { minRows = 2, style, ...rest } = props
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
  }, [props.value])
  return <textarea ref={ref} rows={minRows} style={{ ...style, overflow: 'hidden' }} {...rest} />
}

export function QuestionField({
  id,
  label,
  questions,
  value,
  onChange,
  hint,
  minRows = 2,
  wordGoal,
  badge,
}: {
  id?: string
  label: string
  questions: string[]
  value: string
  onChange: (v: string) => void
  hint?: string
  minRows?: number
  wordGoal?: number
  badge?: string
}) {
  const [qi, setQi] = useState(0)
  const done = filled(value)
  const words = countWords(value)
  return (
    <div className={`qfield ${done ? 'done' : ''}`} id={id ? `f-${id}` : undefined}>
      <div className="qfield-head">
        <span className={`check ${done ? 'on' : ''}`}>{done ? '✓' : ''}</span>
        <span className="qlabel">{label}</span>
        {badge && <span className="tag">{badge}</span>}
      </div>
      <div className="question">
        <span>{questions[qi % questions.length]}</span>
        {questions.length > 1 && (
          <button className="link small" onClick={() => setQi((i) => i + 1)} title="Ask me another question">
            ↻ another question
          </button>
        )}
      </div>
      {hint && <div className="hint">{hint}</div>}
      <AutoTextarea minRows={minRows} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Your words…" />
      {wordGoal ? (
        <div className={`wc ${words > wordGoal ? 'over' : ''}`}>
          {words} / {wordGoal} words
        </div>
      ) : null}
    </div>
  )
}

export function Ring({ value, max, label, sub, size = 84 }: { value: number; max: number; label: string; sub?: string; size?: number }) {
  const pct = Math.min(1, max ? value / max : 0)
  const r = size / 2 - 7
  const c = 2 * Math.PI * r
  const done = value >= max
  return (
    <div className={`ring ${done ? 'complete' : ''}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-bg" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="ring-fg"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="ring-text">
          {done ? '✓' : `${Math.min(value, max)}/${max}`}
        </text>
      </svg>
      <div className="ring-label">{label}</div>
      {sub && <div className="ring-sub">{sub}</div>}
    </div>
  )
}

export function Bar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`bar ${className}`}>
      <div style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  )
}

export function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export function download(name: string, text: string, type = 'text/plain') {
  const blob = new Blob([text], { type })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export function pickFile(accept: string): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = () => {
      const f = input.files?.[0]
      if (!f) return resolve(null)
      f.text().then(resolve)
    }
    input.click()
  })
}
