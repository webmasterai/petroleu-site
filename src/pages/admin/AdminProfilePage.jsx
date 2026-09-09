import { useState } from 'react'
import { adminPost } from '../../services/cmsAdminApi'

const fieldCls =
  'w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
const btnPrimary =
  'rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'

export default function AdminProfilePage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await adminPost('/change-password', {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      })
      setMessage('Password updated. Other sessions were signed out.')
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirmation('')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Password change failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-lg font-semibold tracking-tight">Change Password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Min 10 characters with mixed case and a number. Other sessions are invalidated after success.
      </p>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}

      <form onSubmit={submit} className="mt-4 space-y-3">
        <label className="block text-xs">
          Current password
          <input
            className={fieldCls}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <label className="block text-xs">
          New password
          <input
            className={fieldCls}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>
        <label className="block text-xs">
          Confirm new password
          <input
            className={fieldCls}
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>
        <button type="submit" className={btnPrimary} disabled={busy}>
          Update password
        </button>
      </form>
    </div>
  )
}
