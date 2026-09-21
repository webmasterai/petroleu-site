import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Lock } from 'lucide-react'
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F5F3F0] via-white to-primary/10 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <img src="/petroleu-logo.png" alt="Petroleu" className="h-10 w-auto object-contain" />
          <span className="text-sm font-medium tracking-wide text-muted-foreground">Website CMS</span>
        </div>
        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_16px_40px_rgb(15_23_42/0.08)] sm:p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Sign in</h1>
              <p className="mt-1 text-sm text-muted-foreground">Manage pricing, pages, and site content.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="admin-email">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input"
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={loading} className="admin-btn-primary w-full">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
