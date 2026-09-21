import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../services/cmsAdminApi'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await adminLogin(email.trim(), password)
      navigate('/admin', { replace: true })
    } catch (err) {
      const status = err?.response?.status
      const data = err?.response?.data
      const fieldErrors = data?.errors
      const firstField =
        fieldErrors &&
        (fieldErrors.email?.[0] || fieldErrors.password?.[0] || Object.values(fieldErrors).flat()?.[0])
      let msg = firstField || data?.message
      if (!msg || /axios|status code|request failed/i.test(String(msg))) {
        if (status === 401 || status === 422) msg = 'Unable to sign in. Please check your credentials.'
        else if (status === 400) msg = 'Please enter your email and password.'
        else msg = 'Unable to sign in. Please try again.'
      }
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm border border-border bg-card p-6 shadow-sm rounded-lg">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Petroleu CMS</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to manage site content</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1" htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive whitespace-pre-wrap">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
