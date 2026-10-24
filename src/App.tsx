import { useEffect, useMemo, useRef, useState } from 'react'
import { Account } from './components/Account'
import { Home } from './components/Home'
import { Library } from './components/Library'
import { NewIdea } from './components/NewIdea'
import { Progress } from './components/Progress'
import { ProjectPage } from './components/ProjectPage'
import { RemixStart } from './components/RemixStart'
import { Rules } from './components/Rules'
import { href, useRoute } from './lib/router'
import { computeStats } from './lib/stats'
import { onToast, toast, useStore, type Toast } from './lib/store'
import type { Kind } from './lib/types'

const NAV = [
  { key: '', icon: '⌂', label: 'Home' },
  { key: 'ideas', icon: '☰', label: 'Ideas' },
  { key: 'new', icon: '+', label: 'New', primary: true },
  { key: 'progress', icon: '★', label: 'Progress' },
  { key: 'account', icon: '⚙', label: 'Account' },
]

export default function App() {
  const s = useStore()
  const route = useRoute()
  const [head, a, b, c] = route

  useBadgeToasts()

  if (!s.ready) return <div className="boot">Loading…</div>

  let page
  if (head === 'p' && a) page = <ProjectPage key={a} id={a} tab={b} focus={c} />
  else if (head === 'new') page = <NewIdea kind={a as Kind | undefined} />
  else if (head === 'ideas') page = <Library />
  else if (head === 'progress') page = <Progress />
  else if (head === 'account') page = <Account />
  else if (head === 'rules') page = <Rules />
  else if (head === 'remix') page = <RemixStart />
  else page = <Home />

  const navKey = head === 'p' ? 'ideas' : head === 'remix' ? 'new' : head ?? ''

  return (
    <div className="app">
      <header className="topbar">
        <a href={href('')} className="brand">
          <span className="brand-mark">◯</span> Writers’ Room
        </a>
        <SyncPill />
        <nav className="topnav">
          {NAV.map((n) => (
            <a key={n.key} href={href(n.key)} className={`${navKey === n.key ? 'on' : ''} ${n.primary ? 'primary' : ''}`}>
              {n.label}
            </a>
          ))}
        </nav>
      </header>
      <main className="main">{page}</main>
      <nav className="bottomnav">
        {NAV.map((n) => (
          <a key={n.key} href={href(n.key)} className={`${navKey === n.key ? 'on' : ''} ${n.primary ? 'primary' : ''}`}>
            <span className="bn-icon">{n.icon}</span>
            <span className="bn-label">{n.label}</span>
          </a>
        ))}
      </nav>
      <Toasts />
    </div>
  )
}

function SyncPill() {
  const s = useStore()
  const label =
    s.sync === 'local'
      ? 'This device'
      : s.sync === 'signed-out'
        ? 'Not synced'
        : s.sync === 'syncing'
          ? 'Syncing…'
          : s.sync === 'synced'
            ? 'Synced'
            : s.sync === 'offline'
              ? 'Offline'
              : 'Sync error'
  return (
    <a href={href('account')} className={`sync-pill ${s.sync}`} title={s.syncError || label}>
      <span className={`sync-dot ${s.sync}`} /> {label}
    </a>
  )
}

function Toasts() {
  const [list, setList] = useState<Toast[]>([])
  useEffect(
    () =>
      onToast((t) => {
        setList((l) => [...l.slice(-3), t])
        setTimeout(() => setList((l) => l.filter((x) => x.id !== t.id)), t.big ? 3500 : 1800)
      }),
    []
  )
  return (
    <div className="toasts">
      {list.map((t) => (
        <div key={t.id} className={`toast ${t.big ? 'big' : ''}`}>
          {t.xp ? <span className="xp">+{t.xp} XP</span> : null}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  )
}

// Celebrate badges the moment they're earned.
function useBadgeToasts() {
  const s = useStore()
  const st = useMemo(() => (s.ready ? computeStats(s.projects, s.activity, s.settings) : null), [s.ready, s.projects, s.activity, s.settings])
  const seen = useRef<Set<string> | null>(null)
  useEffect(() => {
    if (!st) return
    const earned = st.badges.filter((b) => b.earned)
    let stored: string[] = []
    try {
      stored = JSON.parse(localStorage.getItem('wr-badges') ?? '[]')
    } catch {
      /* ignore */
    }
    if (!seen.current) seen.current = new Set(stored.length ? stored : earned.map((b) => b.id))
    for (const b of earned) {
      if (!seen.current.has(b.id)) {
        seen.current.add(b.id)
        toast(`Badge unlocked: ${b.icon} ${b.name}`, undefined, true)
      }
    }
    try {
      localStorage.setItem('wr-badges', JSON.stringify([...seen.current]))
    } catch {
      /* ignore */
    }
  }, [st])
}
