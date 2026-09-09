import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { MInput, MLabel, MTextarea, MButton } from './ui'
import { cmsPost } from '../../services/cmsApi'

export function DemoRequestModal({ open, onClose }) {
  const FUEL_BRANDS = [
    'PSO',
    'Shell',
    'Caltex',
    'GO',
    'Attock Petroleum (APL)',
    'Hascol',
    'Byco / Cnergyico',
    'Aramco',
  ]

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    company: '',
    fuel_brand: '',
    phone: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setForm({ full_name: '', email: '', company: '', fuel_brand: '', phone: '', message: '' })
      setErrors({})
      setSubmitting(false)
      setSuccess(false)
      setServerError('')
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  function validate() {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Full name is required'
    if (!form.email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address'
    }
    if (!form.company.trim()) errs.company = 'Company / Station Name is required'
    if (!form.fuel_brand) errs.fuel_brand = 'Please select a fuel brand'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSubmitting(true)
    setServerError('')
    try {
      await cmsPost('/demo-request', {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        fuel_brand: form.fuel_brand,
        phone: form.phone.trim(),
        message: form.message.trim() || undefined,
      })
      setSuccess(true)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Something went wrong. Please try again.'
      setServerError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Request a Prospectus Demo"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Orange top accent */}
        <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Request a Prospectus Demo</h2>
            <p className="mt-1 text-sm text-gray-500">
              Fill in your details and we'll send you access to a demo account
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-6">
          {success ? (
            <div className="py-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
                  <CheckCircle2 className="h-8 w-8 text-orange-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Request Submitted!</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Your information has been received. A demo account will be emailed to you shortly.
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 border border-orange-100 px-4 py-3 text-sm text-orange-700">
                Please check your inbox at <strong>{form.email}</strong> — we usually respond within 1 business day.
              </div>
              <MButton
                type="button"
                onClick={onClose}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                Close
              </MButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {serverError && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <MLabel htmlFor="dr-full-name" className="block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </MLabel>
                <MInput
                  id="dr-full-name"
                  type="text"
                  placeholder="e.g. Muhammad Ali"
                  value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  className={errors.full_name ? 'border-red-400 focus:ring-red-400' : ''}
                  autoComplete="name"
                />
                {errors.full_name && (
                  <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <MLabel htmlFor="dr-email" className="block mb-1">
                  Email Address <span className="text-red-500">*</span>
                </MLabel>
                <MInput
                  id="dr-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className={errors.email ? 'border-red-400 focus:ring-red-400' : ''}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Company (required) */}
              <div>
                <MLabel htmlFor="dr-company" className="block mb-1">
                  Company / Station Name <span className="text-red-500">*</span>
                </MLabel>
                <MInput
                  id="dr-company"
                  type="text"
                  placeholder="e.g. Al Noor Petrol Station"
                  value={form.company}
                  onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                  className={errors.company ? 'border-red-400 focus:ring-red-400' : ''}
                  autoComplete="organization"
                />
                {errors.company && (
                  <p className="mt-1 text-xs text-red-600">{errors.company}</p>
                )}
              </div>

              {/* Fuel Brand (optional) */}
              <div>
                <MLabel htmlFor="dr-fuel-brand" className="block mb-1">
                  Fuel Brand <span className="text-red-500">*</span>
                </MLabel>
                <select
                  id="dr-fuel-brand"
                  value={form.fuel_brand}
                  onChange={(e) => setForm((p) => ({ ...p, fuel_brand: e.target.value }))}
                  className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.fuel_brand ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-gray-200 focus:border-orange-400 focus:ring-orange-400/20'}`}
                >
                  <option value="">— Select your fuel brand —</option>
                  {FUEL_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                {errors.fuel_brand && (
                  <p className="mt-1 text-xs text-red-600">{errors.fuel_brand}</p>
                )}
              </div>

              {/* Phone (required) */}
              <div>
                <MLabel htmlFor="dr-phone" className="block mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </MLabel>
                <MInput
                  id="dr-phone"
                  type="tel"
                  placeholder="+92 300 0000000"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className={errors.phone ? 'border-red-400 focus:ring-red-400' : ''}
                  autoComplete="tel"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Message (optional) */}
              <div>
                <MLabel htmlFor="dr-message" className="block mb-1">
                  Message
                  <span className="ml-1 text-xs text-gray-400">(optional)</span>
                </MLabel>
                <MTextarea
                  id="dr-message"
                  placeholder="Tell us about your business or any specific requirements…"
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  rows={3}
                />
              </div>

              <MButton
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? 'Submitting…' : 'Request Demo Account'}
              </MButton>

              <p className="text-center text-xs text-gray-400">
                We respect your privacy. Your information will only be used to set up your demo.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
