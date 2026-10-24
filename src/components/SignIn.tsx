import { useState } from 'react'
import { rememberedEmail, signIn } from '../lib/store'

// One-time sign-in per device. The session is kept, so this never shows again on that device.
export function SignIn() {
  const [email, setEmail] = useState(rememberedEmail)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await signIn(email.trim(), password)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setErr(/invalid login/i.test(msg) ? 'That email and password don’t match. Check both and try again.' : msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="stack signin" onSubmit={submit}>
      <div className="field">
        <label htmlFor="signin-email">Email</label>
        <input id="signin-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="signin-password">Password</label>
        <input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button className="btn" type="submit" disabled={busy || !email.includes('@') || !password}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      {err && <p className="error small">{err}</p>}
      <p className="muted small">You only do this once on each device. It stays signed in after that.</p>
    </form>
  )
}
