import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { homeContent } from '../../content/homeContent'
import { MInput, MTextarea, MLabel, MButton } from './ui'
import { cmsPost } from '../../services/cmsApi'
import { useMarketLocale } from '../../context/MarketLocaleContext'

const countryCodes = [
  { code: '+1', country: 'US/CA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
]

const WEBMCP_TOOL = {
  name: 'petroleu_request_demo',
  description:
    'Submit a demo or sales inquiry for Petroleu petrol pump management. Collects full name, email, phone with country code, business name, city, address, and optional message. POSTs to the public CMS contact endpoint.',
}

export function ContactForm() {
  const formRef = useRef(null)
  const { market, locale } = useMarketLocale()

  const [formState, setFormState] = useState({
    success: false,
    message: '',
    isSubmitting: false,
    errors: {},
  })

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+92',
    business_name: '',
    city: '',
    address: '',
    message: '',
  })

  useEffect(() => {
    if (formState.success) return
    const el = formRef.current
    if (el) {
      el.setAttribute('toolname', WEBMCP_TOOL.name)
      el.setAttribute('tooldescription', WEBMCP_TOOL.description)
    }
  }, [formState.success])

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const countryMap = {
        'Asia/Karachi': '+92',
        'America/New_York': '+1',
        'Europe/London': '+44',
        'Asia/Kolkata': '+91',
      }
      const code = countryMap[tz] || '+92'
      setFormData((prev) => ({ ...prev, countryCode: code }))
    } catch {
      /* ignore */
    }
  }, [])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formState.errors[field]) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [field]: '' },
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormState((prev) => ({ ...prev, isSubmitting: true, errors: {} }))
    try {
      const res = await cmsPost('/contact', {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone ? `${formData.countryCode} ${formData.phone}` : null,
        company: formData.business_name || null,
        stations: null,
        city: formData.city || null,
        address: formData.address || null,
        message: formData.message || null,
        market,
        locale,
        source: market === 'af' ? 'website-af' : 'website-pk',
      })
      const ok = res?.success !== false
      setFormState({
        success: ok,
        message: ok ? (res?.message || 'Thank you!') : (res?.message || 'Something went wrong.'),
        isSubmitting: false,
        errors: res?.errors || {},
      })
      if (ok) {
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          countryCode: '+92',
          business_name: '',
          city: '',
          address: '',
          message: '',
        })
      }
    } catch (err) {
      setFormState({
        success: false,
        message: err.response?.data?.message || 'An unexpected error occurred.',
        isSubmitting: false,
        errors: err.response?.data?.errors || {},
      })
    }
  }

  const resetForm = () => {
    setFormState({ success: false, message: '', isSubmitting: false, errors: {} })
  }

  const { form, formFields } = homeContent

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl bg-white shadow-md">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground">{form.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
      </div>
      <div className="p-6">
        {formState.success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Thank You!</h3>
            <p className="text-muted-foreground max-w-md mb-6">{formState.message}</p>
            <MButton type="button" onClick={resetForm}>
              Submit Another Request
            </MButton>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {formState.message && !formState.success && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{formState.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formFields.slice(0, 4).map((field) => {
                if (field.type === 'textarea') return null
                return (
                  <div className="space-y-2" key={field.name}>
                    <MLabel htmlFor={field.name}>
                      {field.label}
                      {field.required ? ' *' : ''}
                    </MLabel>
                    <MInput
                      id={field.name}
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      disabled={formState.isSubmitting}
                      className={formState.errors[field.name] ? 'border-red-500' : ''}
                    />
                    {formState.errors[field.name] && (
                      <p className="text-sm text-red-600">{String(formState.errors[field.name])}</p>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <MLabel>Country code</MLabel>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
                  value={formData.countryCode}
                  onChange={(e) => handleInputChange('countryCode', e.target.value)}
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formFields.slice(4).map((field) => {
              if (field.type === 'textarea') {
                return (
                  <div className="space-y-2" key={field.name}>
                    <MLabel htmlFor={field.name}>
                      {field.label}
                      {field.required ? ' *' : ''}
                    </MLabel>
                    <MTextarea
                      id={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      required={field.required}
                      disabled={formState.isSubmitting}
                    />
                  </div>
                )
              }
              return (
                <div className="space-y-2" key={field.name}>
                  <MLabel htmlFor={field.name}>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </MLabel>
                  <MInput
                    id={field.name}
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={formState.isSubmitting}
                  />
                </div>
              )
            })}

            <MButton type="submit" className="w-full" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {form.submit}
                </>
              ) : (
                form.submit
              )}
            </MButton>
          </form>
        )}
      </div>
      <div className="px-6 pb-6 pt-0">
        <p className="text-sm text-muted-foreground">{form.privacy}</p>
      </div>
    </div>
  )
}
