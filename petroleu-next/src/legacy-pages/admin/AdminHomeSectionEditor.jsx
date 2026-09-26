import { useCallback, useEffect, useState } from 'react'
import MediaImageField from './MediaImageField'
import { adminDelete, adminGet, adminPost, adminPut } from '../../services/cmsAdminApi'

const fieldCls = 'admin-input'
const btnPrimary = 'admin-btn-primary text-xs'
const btnOutline = 'admin-btn-secondary text-xs'

function Field({ label, children }) {
  return (
    <label className="block text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function featuresToText(features = []) {
  return (features || [])
    .map((f) => {
      const text = typeof f === 'string' ? f : f.feature_text || f.text || ''
      const included = typeof f === 'string' ? true : f.is_included !== false
      return included ? text : `- ${text}`
    })
    .filter(Boolean)
    .join('\n')
}

function parseFeatures(txt) {
  return String(txt || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      const disabled = line.startsWith('- ')
      return {
        feature_text: disabled ? line.slice(2).trim() : line,
        is_included: !disabled,
      }
    })
}

function emptyPlanForm() {
  return {
    name: '',
    price: '',
    price_yearly: '',
    price_suffix: '/month',
    description: '',
    is_popular: false,
    badge: '',
    featuresText: '',
    cta_text: 'Contact Sales',
    cta_link: '/contact',
    is_enabled: true,
  }
}

function emptyReview() {
  return { name: '', role: '', city: '', rating: 5, date: '', content: '' }
}

function itemImageLabel(itemKey) {
  if (itemKey === 'logo') return 'Trusted logos strip image'
  if (itemKey === 'feature:card') return 'Feature card image'
  if (itemKey === 'industry') return 'Industry image'
  if (itemKey === 'mobile-feature') return 'Mobile feature image'
  return 'Image'
}

/**
 * Section-type-aware Home editor.
 * Every frontend image for the section must appear here with Media picker replace.
 */
export default function AdminHomeSectionEditor({
  editor,
  setEditor,
  market,
  locale,
  saving,
  onClose,
  onSave,
  showAdvancedJson,
}) {
  const [homepagePosts, setHomepagePosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [postsError, setPostsError] = useState('')
  const [postsSaving, setPostsSaving] = useState(false)

  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [plansError, setPlansError] = useState('')
  const [planFormOpen, setPlanFormOpen] = useState(false)
  const [planEditingId, setPlanEditingId] = useState(null)
  const [planForm, setPlanForm] = useState(emptyPlanForm)
  const [planSaving, setPlanSaving] = useState(false)

  const loadHomepagePosts = useCallback(async () => {
    if (!editor || editor.type !== 'blog') return
    setPostsLoading(true)
    setPostsError('')
    try {
      const params = { market: market || 'pk' }
      if (locale) params.locale = locale
      const res = await adminGet('/blog/posts', { params })
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
      setHomepagePosts(
        list
          .filter((p) => p && p.show_on_homepage)
          .map((p) => ({
            id: p.id,
            title: p.title || '',
            slug: p.slug || '',
            image_url: p.image_url || p.og_image || '',
            image_alt: p.image_alt || '',
          })),
      )
    } catch (err) {
      setPostsError(err?.response?.data?.message || err?.message || 'Failed to load homepage posts')
    } finally {
      setPostsLoading(false)
    }
  }, [editor, market, locale])

  useEffect(() => {
    loadHomepagePosts()
  }, [loadHomepagePosts])

  const loadPlans = useCallback(async () => {
    if (!editor || editor.type !== 'pricing') return
    setPlansLoading(true)
    setPlansError('')
    try {
      const params = { page: 'pricing', market: market || 'pk' }
      if (locale) params.locale = locale
      const res = await adminGet('/sections', { params })
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
      setPlans(list.filter((r) => r.section_key === 'plan'))
    } catch (err) {
      setPlansError(err?.response?.data?.message || err?.message || 'Failed to load plans')
      setPlans([])
    } finally {
      setPlansLoading(false)
    }
  }, [editor, market, locale])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  if (!editor) return null

  const type = editor.type

  function setPrimary(patch) {
    setEditor((p) => ({ ...p, primary: { ...p.primary, ...patch } }))
  }

  function setHeading(patch) {
    setEditor((p) => ({ ...p, heading: { ...p.heading, ...patch } }))
  }

  function setPrimaryData(patch) {
    setEditor((p) => ({
      ...p,
      primary: {
        ...p.primary,
        data: { ...(p.primary.data || {}), ...patch },
      },
    }))
  }

  function updateItem(itemKey, index, patch) {
    setEditor((prev) => {
      const list = [...(prev.itemsByKey[itemKey] || [])]
      list[index] = { ...list[index], ...patch }
      return { ...prev, itemsByKey: { ...prev.itemsByKey, [itemKey]: list } }
    })
  }

  function updateItemData(itemKey, index, patch) {
    setEditor((prev) => {
      const list = [...(prev.itemsByKey[itemKey] || [])]
      const cur = list[index]
      list[index] = { ...cur, data: { ...(cur.data || {}), ...patch } }
      return { ...prev, itemsByKey: { ...prev.itemsByKey, [itemKey]: list } }
    })
  }

  function addItem(itemKey, blank) {
    setEditor((prev) => {
      const list = [...(prev.itemsByKey[itemKey] || [])]
      list.push({
        id: null,
        section_key: itemKey,
        page_slug: prev.pageSlug || 'home',
        title: '',
        description: '',
        content: '',
        image_url: '',
        image_alt: '',
        link_label: '',
        link_url: '',
        sort_order: list.length,
        is_enabled: true,
        status: 'draft',
        data: {},
        ...blank,
      })
      return { ...prev, itemsByKey: { ...prev.itemsByKey, [itemKey]: list } }
    })
  }

  function removeItem(itemKey, index) {
    setEditor((prev) => {
      const list = [...(prev.itemsByKey[itemKey] || [])]
      const [removed] = list.splice(index, 1)
      if (removed?.id) {
        adminDelete(`/sections/${removed.id}`).catch(() => {})
      }
      return { ...prev, itemsByKey: { ...prev.itemsByKey, [itemKey]: list } }
    })
  }

  function updateReview(index, patch) {
    setEditor((prev) => {
      const reviews = [...(prev.reviews || [])]
      reviews[index] = { ...reviews[index], ...patch }
      return { ...prev, reviews }
    })
  }

  function addReview() {
    setEditor((prev) => ({
      ...prev,
      reviews: [...(prev.reviews || []), emptyReview()],
    }))
  }

  function removeReview(index) {
    setEditor((prev) => {
      const reviews = [...(prev.reviews || [])]
      reviews.splice(index, 1)
      return { ...prev, reviews }
    })
  }

  function openPlanCreate() {
    setPlanEditingId(null)
    setPlanForm(emptyPlanForm())
    setPlanFormOpen(true)
  }

  function openPlanEdit(row) {
    const data = row.data || {}
    setPlanEditingId(row.id)
    setPlanForm({
      name: data.name || row.title || '',
      price: data.price || '',
      price_yearly: data.price_yearly || '',
      price_suffix: data.price_suffix || '/month',
      description: row.description || data.description || '',
      is_popular: Boolean(data.is_popular ?? data.popular),
      badge: data.badge || '',
      featuresText: featuresToText(data.features || []),
      cta_text: row.link_label || data.cta_text || 'Contact Sales',
      cta_link: row.link_url || data.cta_link || '/contact',
      is_enabled: row.is_enabled !== false,
    })
    setPlanFormOpen(true)
  }

  async function savePlan(e) {
    e.preventDefault()
    setPlanSaving(true)
    setPlansError('')
    try {
      const features = parseFeatures(planForm.featuresText)
      const payload = {
        market_code: market,
        locale_code: locale,
        page_slug: 'pricing',
        section_key: 'plan',
        title: planForm.name,
        description: planForm.description,
        link_label: planForm.cta_text,
        link_url: planForm.cta_link,
        status: 'published',
        is_enabled: planForm.is_enabled !== false,
        sort_order: planEditingId
          ? plans.find((i) => i.id === planEditingId)?.sort_order || 0
          : plans.length + 1,
        data: {
          name: planForm.name,
          price: planForm.price,
          price_yearly: planForm.price_yearly || planForm.price,
          price_suffix: planForm.price_suffix || '/month',
          period: 'month',
          is_popular: planForm.is_popular,
          popular: planForm.is_popular,
          badge: planForm.badge || (planForm.is_popular ? 'Most Popular' : ''),
          currency: 'PKR',
          features,
          cta_text: planForm.cta_text,
          cta_link: planForm.cta_link,
        },
      }
      if (planEditingId) await adminPut(`/sections/${planEditingId}`, payload)
      else await adminPost('/sections', payload)
      setPlanFormOpen(false)
      await loadPlans()
    } catch (err) {
      setPlansError(err?.response?.data?.message || err?.message || 'Plan save failed')
    } finally {
      setPlanSaving(false)
    }
  }

  async function deletePlan(id) {
    if (!window.confirm('Delete this pricing plan?')) return
    try {
      await adminDelete(`/sections/${id}`)
      await loadPlans()
    } catch (err) {
      setPlansError(err?.response?.data?.message || err?.message || 'Delete failed')
    }
  }

  function updateHomepagePost(index, patch) {
    setHomepagePosts((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...patch }
      return next
    })
  }

  async function saveHomepagePostImages() {
    setPostsSaving(true)
    setPostsError('')
    try {
      await Promise.all(
        homepagePosts.map((p) =>
          adminPut(`/blog/posts/${p.id}`, {
            image_url: p.image_url || null,
            image_alt: p.image_alt || null,
          }),
        ),
      )
    } catch (err) {
      setPostsError(err?.response?.data?.message || err?.message || 'Failed to save post images')
      setPostsSaving(false)
      throw err
    }
    setPostsSaving(false)
  }

  async function handleSave(andPublish) {
    if (type === 'blog' && homepagePosts.length) {
      await saveHomepagePostImages()
    }
    onSave(andPublish)
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">
          Edit: {editor.label}{' '}
          <span className="font-normal text-muted-foreground">
            ({type}) · {market} / {locale}
          </span>
        </h2>
        <button type="button" className={btnOutline} onClick={onClose}>
          Close
        </button>
      </div>

      {/* Heading chrome (most sections) — always include image picker */}
      {editor.heading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-md border border-border/60 p-3">
          <p className="sm:col-span-2 text-xs font-medium text-muted-foreground">Section heading</p>
          <Field label="Eyebrow / badge">
            <input
              className={fieldCls}
              value={editor.heading.badge || ''}
              onChange={(e) => setHeading({ badge: e.target.value })}
            />
          </Field>
          <Field label="Heading">
            <input
              className={fieldCls}
              value={editor.heading.title || ''}
              onChange={(e) => setHeading({ title: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea
                className={fieldCls + ' min-h-[60px]'}
                value={editor.heading.description || ''}
                onChange={(e) => setHeading({ description: e.target.value })}
              />
            </Field>
          </div>
          <MediaImageField
            label={
              type === 'mobile'
                ? 'Mobile dashboard image (shown on Home)'
                : type === 'blog'
                  ? 'Section image (optional)'
                  : 'Section image'
            }
            url={editor.heading.image_url || ''}
            alt={editor.heading.image_alt || ''}
            onChangeUrl={(v) => setHeading({ image_url: v })}
            onChangeAlt={(v) => setHeading({ image_alt: v })}
          />
          {type === 'testimonials' ? (
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 rounded border border-dashed border-border p-2">
              <p className="sm:col-span-2 text-[10px] text-muted-foreground">
                Live Google reviews load via server API (<code>/api/google-reviews</code>). Non-secret
                IDs can be set here; OAuth client secret / refresh token / Places API key stay in
                environment variables only. CMS cards below are fallback testimonials, never labeled
                as Google when mixed.
              </p>
              <Field label="Google reviews enabled">
                <select
                  className={fieldCls}
                  value={editor.heading.data?.google_reviews_enabled || ''}
                  onChange={(e) =>
                    setEditor((p) => ({
                      ...p,
                      heading: {
                        ...p.heading,
                        data: {
                          ...(p.heading.data || {}),
                          google_reviews_enabled: e.target.value,
                        },
                      },
                    }))
                  }
                >
                  <option value="">Use env (GOOGLE_REVIEWS_ENABLED)</option>
                  <option value="true">Enabled</option>
                  <option value="false">Disabled (CMS fallback)</option>
                </select>
              </Field>
              <Field label="Fallback to CMS if Google fails">
                <select
                  className={fieldCls}
                  value={editor.heading.data?.google_fallback_cms || 'true'}
                  onChange={(e) =>
                    setEditor((p) => ({
                      ...p,
                      heading: {
                        ...p.heading,
                        data: {
                          ...(p.heading.data || {}),
                          google_fallback_cms: e.target.value,
                        },
                      },
                    }))
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No (hide section if Google unavailable)</option>
                </select>
              </Field>
              <Field label="Google Place ID">
                <input
                  className={fieldCls}
                  value={editor.heading.data?.google_place_id || ''}
                  onChange={(e) =>
                    setEditor((p) => ({
                      ...p,
                      heading: {
                        ...p.heading,
                        data: { ...(p.heading.data || {}), google_place_id: e.target.value },
                      },
                    }))
                  }
                  placeholder="ChIJ..."
                />
              </Field>
              <Field label="Google Business Account ID">
                <input
                  className={fieldCls}
                  value={editor.heading.data?.google_business_account_id || ''}
                  onChange={(e) =>
                    setEditor((p) => ({
                      ...p,
                      heading: {
                        ...p.heading,
                        data: {
                          ...(p.heading.data || {}),
                          google_business_account_id: e.target.value,
                        },
                      },
                    }))
                  }
                  placeholder="accounts/…"
                />
              </Field>
              <Field label="Google Business Location ID">
                <input
                  className={fieldCls}
                  value={editor.heading.data?.google_business_location_id || ''}
                  onChange={(e) =>
                    setEditor((p) => ({
                      ...p,
                      heading: {
                        ...p.heading,
                        data: {
                          ...(p.heading.data || {}),
                          google_business_location_id: e.target.value,
                        },
                      },
                    }))
                  }
                  placeholder="locations/…"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Google listing / review URL">
                  <input
                    className={fieldCls}
                    value={editor.heading.data?.google_listing_url || ''}
                    onChange={(e) =>
                      setEditor((p) => ({
                        ...p,
                        heading: {
                          ...p.heading,
                          data: { ...(p.heading.data || {}), google_listing_url: e.target.value },
                        },
                      }))
                    }
                    placeholder="https://g.page/..."
                  />
                </Field>
              </div>
              <p className="sm:col-span-2 text-[10px] text-muted-foreground">
                Manual rating/count fields below are unused when the live API returns data. Do not
                invent values.
              </p>
              <Field label="Manual Google rating (optional override)">
                <input
                  className={fieldCls}
                  value={editor.heading.data?.google_rating || ''}
                  onChange={(e) =>
                    setEditor((p) => ({
                      ...p,
                      heading: {
                        ...p.heading,
                        data: { ...(p.heading.data || {}), google_rating: e.target.value },
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Manual Google total review count">
                <input
                  className={fieldCls}
                  value={editor.heading.data?.google_review_count || ''}
                  onChange={(e) =>
                    setEditor((p) => ({
                      ...p,
                      heading: {
                        ...p.heading,
                        data: { ...(p.heading.data || {}), google_review_count: e.target.value },
                      },
                    }))
                  }
                />
              </Field>
            </div>
          ) : null}
          {(type === 'steps' || type === 'pricing' || type === 'demo') && (
            <>
              <Field label="CTA label">
                <input
                  className={fieldCls}
                  value={editor.heading.link_label || ''}
                  onChange={(e) => setHeading({ link_label: e.target.value })}
                />
              </Field>
              <Field label="CTA URL">
                <input
                  className={fieldCls}
                  value={editor.heading.link_url || ''}
                  onChange={(e) => setHeading({ link_url: e.target.value })}
                />
              </Field>
            </>
          )}
        </div>
      ) : null}

      {/* Hero / CTA / Demo / Header / Footer primary */}
      {editor.primary &&
      (type === 'hero' || type === 'cta' || type === 'demo' || type === 'header' || type === 'footer') ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-md border border-border/60 p-3">
          <p className="sm:col-span-2 text-xs font-medium text-muted-foreground">
            {type === 'header'
              ? 'Header (logo & brand)'
              : type === 'footer'
                ? 'Footer (logo & content)'
                : 'Main content'}
          </p>
          {(type === 'header' || type === 'footer') && (
            <p className="sm:col-span-2 text-[11px] text-muted-foreground">
              Menu links are edited under Website → Navigation. Here you change logo and chrome
              text.
            </p>
          )}
          {type === 'hero' ? (
            <Field label="Eyebrow / badge">
              <input
                className={fieldCls}
                value={editor.primary.data?.badge || ''}
                onChange={(e) => setPrimaryData({ badge: e.target.value })}
              />
            </Field>
          ) : null}
          <Field
            label={
              type === 'header' || type === 'footer' ? 'Brand / site name' : 'Heading / title'
            }
          >
            <input
              className={fieldCls}
              value={editor.primary.title || ''}
              onChange={(e) => {
                setPrimary({ title: e.target.value })
                if (type === 'header' || type === 'footer') {
                  setPrimaryData({ brand_name: e.target.value })
                }
              }}
            />
          </Field>
          {type === 'hero' ? (
            <Field label="Title highlight">
              <input
                className={fieldCls}
                value={
                  editor.primary.data?.title_highlight ||
                  editor.primary.data?.titleHighlight ||
                  ''
                }
                onChange={(e) =>
                  setPrimaryData({
                    title_highlight: e.target.value,
                    titleHighlight: e.target.value,
                  })
                }
              />
            </Field>
          ) : null}
          {(type === 'footer' || type === 'hero' || type === 'cta' || type === 'demo') && (
            <div className="sm:col-span-2">
              <Field label={type === 'footer' ? 'Footer description' : 'Description'}>
                <textarea
                  className={fieldCls + ' min-h-[60px]'}
                  value={editor.primary.description || ''}
                  onChange={(e) => setPrimary({ description: e.target.value })}
                />
              </Field>
            </div>
          )}
          <MediaImageField
            label={
              type === 'header'
                ? 'Header logo'
                : type === 'footer'
                  ? 'Footer logo'
                  : type === 'hero'
                    ? 'Hero dashboard image'
                    : 'Section image'
            }
            url={editor.primary.image_url || ''}
            alt={editor.primary.image_alt || ''}
            onChangeUrl={(v) => setPrimary({ image_url: v })}
            onChangeAlt={(v) => setPrimary({ image_alt: v })}
          />
          {type === 'footer' ? (
            <>
              <Field label="Footer credit (under copyright)">
                <input
                  className={fieldCls}
                  value={editor.primary.data?.footer_credit || ''}
                  onChange={(e) => setPrimaryData({ footer_credit: e.target.value })}
                />
              </Field>
              <Field label="Phone (display)">
                <input
                  className={fieldCls}
                  value={editor.primary.data?.phone || ''}
                  onChange={(e) => setPrimaryData({ phone: e.target.value })}
                />
              </Field>
              <Field label="Phone tel link">
                <input
                  className={fieldCls}
                  value={editor.primary.data?.phone_tel || ''}
                  onChange={(e) => setPrimaryData({ phone_tel: e.target.value })}
                  placeholder="+923001234567"
                />
              </Field>
              <Field label="Email">
                <input
                  className={fieldCls}
                  value={editor.primary.data?.email || ''}
                  onChange={(e) => setPrimaryData({ email: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address">
                  <textarea
                    className={fieldCls + ' min-h-[48px]'}
                    value={editor.primary.data?.address || ''}
                    onChange={(e) => setPrimaryData({ address: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Facebook URL">
                <input
                  className={fieldCls}
                  value={editor.primary.data?.facebook_url || ''}
                  onChange={(e) => setPrimaryData({ facebook_url: e.target.value })}
                />
              </Field>
              <Field label="Instagram URL">
                <input
                  className={fieldCls}
                  value={editor.primary.data?.instagram_url || ''}
                  onChange={(e) => setPrimaryData({ instagram_url: e.target.value })}
                />
              </Field>
              <Field label="LinkedIn URL">
                <input
                  className={fieldCls}
                  value={editor.primary.data?.linkedin_url || ''}
                  onChange={(e) => setPrimaryData({ linkedin_url: e.target.value })}
                />
              </Field>
              <Field label="YouTube URL">
                <input
                  className={fieldCls}
                  value={editor.primary.data?.youtube_url || ''}
                  onChange={(e) => setPrimaryData({ youtube_url: e.target.value })}
                />
              </Field>
            </>
          ) : null}
          {type !== 'header' && type !== 'footer' ? (
            <>
          <Field label="Primary button label">
            <input
              className={fieldCls}
              value={
                editor.primary.link_label ||
                editor.primary.data?.primaryButton ||
                editor.primary.data?.cta_text ||
                ''
              }
              onChange={(e) => {
                setPrimary({ link_label: e.target.value })
                setPrimaryData({ primaryButton: e.target.value, cta_text: e.target.value })
              }}
            />
          </Field>
          <Field label="Primary button URL">
            <input
              className={fieldCls}
              value={editor.primary.link_url || editor.primary.data?.dashboard_url || ''}
              onChange={(e) => {
                setPrimary({ link_url: e.target.value })
                if (type === 'hero') setPrimaryData({ dashboard_url: e.target.value })
              }}
            />
          </Field>
          {(type === 'hero' || type === 'cta') && (
            <>
              <Field label="Secondary button label">
                <input
                  className={fieldCls}
                  value={
                    editor.primary.data?.secondaryButton ||
                    editor.primary.data?.cta2_text ||
                    ''
                  }
                  onChange={(e) =>
                    setPrimaryData({
                      secondaryButton: e.target.value,
                      cta2_text: e.target.value,
                    })
                  }
                />
              </Field>
              <Field label="Secondary button URL">
                <input
                  className={fieldCls}
                  value={editor.primary.data?.secondary_url || editor.primary.data?.btn2_link || ''}
                  onChange={(e) =>
                    setPrimaryData({ secondary_url: e.target.value, btn2_link: e.target.value })
                  }
                />
              </Field>
            </>
          )}
          {type === 'hero' ? (
            <div className="sm:col-span-2">
              <Field label="Feature bullets (one per line)">
                <textarea
                  className={fieldCls + ' min-h-[100px] font-mono text-xs'}
                  value={(editor.primary.data?.features || []).join('\n')}
                  onChange={(e) =>
                    setPrimaryData({
                      features: e.target.value
                        .split('\n')
                        .map((l) => l.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </Field>
            </div>
          ) : null}
            </>
          ) : null}
          <label className="flex items-center gap-2 text-xs mt-2">
            <input
              type="checkbox"
              checked={editor.primary.is_enabled !== false}
              onChange={(e) => setPrimary({ is_enabled: e.target.checked })}
            />
            Enabled
          </label>
        </div>
      ) : null}

      {/* Testimonials reviews from data[] */}
      {type === 'testimonials' ? (
        <div className="rounded-md border border-border/60 p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Testimonials ({(editor.reviews || []).length}) — appear on Home after Save & Publish
            </p>
            <button type="button" className={btnPrimary} onClick={addReview}>
              + Add testimonial
            </button>
          </div>
          {(editor.reviews || []).map((rev, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded border border-border/40 p-2"
            >
              <Field label="Name">
                <input
                  className={fieldCls}
                  value={rev.name || ''}
                  onChange={(e) => updateReview(index, { name: e.target.value })}
                />
              </Field>
              <Field label="Role / company">
                <input
                  className={fieldCls}
                  value={rev.role || ''}
                  onChange={(e) => updateReview(index, { role: e.target.value })}
                />
              </Field>
              <Field label="City">
                <input
                  className={fieldCls}
                  value={rev.city || ''}
                  onChange={(e) => updateReview(index, { city: e.target.value })}
                />
              </Field>
              <Field label="Rating (1–5)">
                <input
                  className={fieldCls}
                  type="number"
                  min={1}
                  max={5}
                  value={rev.rating ?? 5}
                  onChange={(e) => updateReview(index, { rating: Number(e.target.value) || 5 })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Quote">
                  <textarea
                    className={fieldCls + ' min-h-[60px]'}
                    value={rev.content || ''}
                    onChange={(e) => updateReview(index, { content: e.target.value })}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  className="text-xs text-destructive hover:underline"
                  onClick={() => removeReview(index)}
                >
                  Remove card
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Repeatable child items — image picker on every item */}
      {(editor.itemKeys || []).map((itemKey) => {
        const items = editor.itemsByKey[itemKey] || []
        if (type === 'testimonials' && itemKey === 'testimonial' && editor.reviews?.length) {
          return null
        }
        return (
          <div key={itemKey} className="rounded-md border border-border/60 p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {itemKey === 'logo'
                ? 'Trusted logos image'
                : itemKey === 'feature:card'
                  ? 'Feature cards'
                  : itemKey === 'stat'
                    ? 'Stats'
                    : itemKey === 'faq'
                      ? 'FAQ items'
                      : `Items (${itemKey})`}{' '}
              — {items.length}
            </p>
            {itemKey === 'faq' ? (
              <button
                type="button"
                className={btnPrimary}
                onClick={() =>
                  addItem('faq', {
                    title: '',
                    description: '',
                    sort_order: items.length,
                  })
                }
              >
                + Add FAQ
              </button>
            ) : null}
          </div>
            {items.map((item, index) => (
              <div
                key={item.id || index}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded border border-border/40 p-2"
              >
                {itemKey !== 'logo' ? (
                  <Field
                    label={
                      itemKey === 'faq' ? 'Question' : itemKey === 'stat' ? 'Value' : 'Title'
                    }
                  >
                    <input
                      className={fieldCls}
                      value={item.title || ''}
                      onChange={(e) => updateItem(itemKey, index, { title: e.target.value })}
                    />
                  </Field>
                ) : (
                  <Field label="Label (optional)">
                    <input
                      className={fieldCls}
                      value={item.title || ''}
                      onChange={(e) => updateItem(itemKey, index, { title: e.target.value })}
                    />
                  </Field>
                )}

                {/* Image near top so it matches Hero UX */}
                <MediaImageField
                  label={itemImageLabel(itemKey)}
                  url={item.image_url || ''}
                  alt={item.image_alt || ''}
                  onChangeUrl={(v) => updateItem(itemKey, index, { image_url: v })}
                  onChangeAlt={(v) => updateItem(itemKey, index, { image_alt: v })}
                />

                {itemKey === 'feature:card' || itemKey === 'analytics-card' ? (
                  <Field label="Badge">
                    <input
                      className={fieldCls}
                      value={item.data?.badge || ''}
                      onChange={(e) => updateItemData(itemKey, index, { badge: e.target.value })}
                    />
                  </Field>
                ) : null}
                {itemKey === 'analytics-card' ? (
                  <>
                    <Field label="Value">
                      <input
                        className={fieldCls}
                        value={item.data?.value || ''}
                        onChange={(e) => updateItemData(itemKey, index, { value: e.target.value })}
                      />
                    </Field>
                    <Field label="Subtitle">
                      <input
                        className={fieldCls}
                        value={item.data?.subtitle || ''}
                        onChange={(e) =>
                          updateItemData(itemKey, index, { subtitle: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Icon">
                      <input
                        className={fieldCls}
                        value={item.data?.icon || ''}
                        onChange={(e) => updateItemData(itemKey, index, { icon: e.target.value })}
                      />
                    </Field>
                  </>
                ) : null}
                {(itemKey === 'why-choose' ||
                  itemKey === 'mobile-feature' ||
                  itemKey === 'industry' ||
                  itemKey === 'how-it-works') && (
                  <Field label="Icon">
                    <input
                      className={fieldCls}
                      value={item.data?.icon || item.icon || ''}
                      onChange={(e) => updateItemData(itemKey, index, { icon: e.target.value })}
                    />
                  </Field>
                )}
                {itemKey !== 'logo' ? (
                  <div className="sm:col-span-2">
                    <Field
                      label={
                        itemKey === 'faq'
                          ? 'Answer'
                          : itemKey === 'stat'
                            ? 'Label'
                            : 'Description'
                      }
                    >
                      <textarea
                        className={fieldCls + ' min-h-[48px]'}
                        value={item.description || ''}
                        onChange={(e) =>
                          updateItem(itemKey, index, { description: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                ) : null}
                <Field label="Order">
                  <input
                    className={fieldCls}
                    type="number"
                    value={item.sort_order ?? 0}
                    onChange={(e) =>
                      updateItem(itemKey, index, { sort_order: Number(e.target.value) || 0 })
                    }
                  />
                </Field>
                <label className="flex items-center gap-2 text-xs mt-5">
                  <input
                    type="checkbox"
                    checked={item.is_enabled !== false}
                    onChange={(e) =>
                      updateItem(itemKey, index, { is_enabled: e.target.checked })
                    }
                  />
                  Enabled
                </label>
                {itemKey === 'faq' ? (
                  <Field label="Category">
                    <select
                      className={fieldCls}
                      value={item.data?.category || 'general'}
                      onChange={(e) => {
                        const id = e.target.value
                        const labels = {
                          general: 'General',
                          'nozzle-reading': 'Nozzle Reading',
                          'tank-dipping': 'Tank Dipping',
                          'credit-customers': 'Credit Customers',
                          'daily-closing': 'Daily Closing',
                          'accounts-reports': 'Accounts & Reports',
                          'mobile-app': 'Mobile App',
                          'cloud-offline': 'Cloud & Offline',
                          'pricing-demo': 'Pricing & Demo',
                          'fbr-compliance': 'FBR / Compliance',
                          'support-training': 'Support & Training',
                          'pakistan-cities': 'Pakistan Cities',
                        }
                        updateItemData(itemKey, index, {
                          category: id,
                          category_label: labels[id] || id,
                        })
                      }}
                    >
                      <option value="general">General</option>
                      <option value="nozzle-reading">Nozzle Reading</option>
                      <option value="tank-dipping">Tank Dipping</option>
                      <option value="credit-customers">Credit Customers</option>
                      <option value="daily-closing">Daily Closing</option>
                      <option value="accounts-reports">Accounts & Reports</option>
                      <option value="mobile-app">Mobile App</option>
                      <option value="cloud-offline">Cloud & Offline</option>
                      <option value="pricing-demo">Pricing & Demo</option>
                      <option value="fbr-compliance">FBR / Compliance</option>
                      <option value="support-training">Support & Training</option>
                      <option value="pakistan-cities">Pakistan Cities</option>
                    </select>
                  </Field>
                ) : null}
                {itemKey === 'faq' ? (
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      className="text-xs text-destructive hover:underline"
                      onClick={() => removeItem(itemKey, index)}
                    >
                      Remove FAQ
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )
      })}

      {type === 'pricing' ? (
        <div className="rounded-md border border-border/60 p-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Pricing cards ({plans.length}) — same cards shown on Home / Pricing page
            </p>
            <button type="button" className={btnPrimary} onClick={openPlanCreate}>
              + Add plan
            </button>
          </div>
          {plansError ? <p className="text-xs text-destructive">{plansError}</p> : null}
          {plansLoading ? <p className="text-xs text-muted-foreground">Loading plans…</p> : null}

          {planFormOpen ? (
            <form
              onSubmit={savePlan}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded border border-primary/30 bg-orange-50/30 p-3"
            >
              <p className="sm:col-span-2 text-xs font-semibold">
                {planEditingId ? 'Edit plan' : 'New plan'}
              </p>
              <Field label="Plan name">
                <input
                  required
                  className={fieldCls}
                  value={planForm.name}
                  onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))}
                />
              </Field>
              <Field label="Monthly price">
                <input
                  required
                  className={fieldCls}
                  value={planForm.price}
                  onChange={(e) => setPlanForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="1999"
                />
              </Field>
              <Field label="Yearly price">
                <input
                  className={fieldCls}
                  value={planForm.price_yearly}
                  onChange={(e) => setPlanForm((f) => ({ ...f, price_yearly: e.target.value }))}
                />
              </Field>
              <Field label="Price suffix">
                <input
                  className={fieldCls}
                  value={planForm.price_suffix}
                  onChange={(e) => setPlanForm((f) => ({ ...f, price_suffix: e.target.value }))}
                />
              </Field>
              <Field label="Badge">
                <input
                  className={fieldCls}
                  value={planForm.badge}
                  onChange={(e) => setPlanForm((f) => ({ ...f, badge: e.target.value }))}
                  placeholder="Most Popular"
                />
              </Field>
              <Field label="CTA label">
                <input
                  className={fieldCls}
                  value={planForm.cta_text}
                  onChange={(e) => setPlanForm((f) => ({ ...f, cta_text: e.target.value }))}
                />
              </Field>
              <Field label="CTA URL">
                <input
                  className={fieldCls}
                  value={planForm.cta_link}
                  onChange={(e) => setPlanForm((f) => ({ ...f, cta_link: e.target.value }))}
                />
              </Field>
              <label className="flex items-center gap-2 text-xs mt-5">
                <input
                  type="checkbox"
                  checked={planForm.is_popular}
                  onChange={(e) => setPlanForm((f) => ({ ...f, is_popular: e.target.checked }))}
                />
                Most popular
              </label>
              <label className="flex items-center gap-2 text-xs mt-5">
                <input
                  type="checkbox"
                  checked={planForm.is_enabled !== false}
                  onChange={(e) => setPlanForm((f) => ({ ...f, is_enabled: e.target.checked }))}
                />
                Enabled on website
              </label>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea
                    className={fieldCls + ' min-h-[48px]'}
                    value={planForm.description}
                    onChange={(e) => setPlanForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Features (one per line)">
                  <textarea
                    className={fieldCls + ' min-h-[100px] font-mono text-xs'}
                    value={planForm.featuresText}
                    onChange={(e) => setPlanForm((f) => ({ ...f, featuresText: e.target.value }))}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-2">
                <button type="submit" className={btnPrimary} disabled={planSaving}>
                  {planSaving ? 'Saving…' : 'Save plan'}
                </button>
                <button
                  type="button"
                  className={btnOutline}
                  onClick={() => setPlanFormOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          {!plansLoading &&
            plans.map((row) => {
              const data = row.data || {}
              return (
                <div
                  key={row.id}
                  className="flex flex-wrap items-start justify-between gap-2 rounded border border-border/40 p-2 text-xs"
                >
                  <div>
                    <p className="font-medium">
                      {data.name || row.title}
                      {data.is_popular || data.popular ? (
                        <span className="ms-2 text-primary">· Popular</span>
                      ) : null}
                    </p>
                    <p className="text-muted-foreground">
                      {data.price}
                      {data.price_suffix || '/month'}
                      {data.price_yearly ? ` · yearly ${data.price_yearly}` : ''}
                    </p>
                    <p className="mt-1 text-muted-foreground line-clamp-2">{row.description}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {(data.features || []).length} features
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={btnOutline}
                      onClick={() => openPlanEdit(row)}
                    >
                      Edit card
                    </button>
                    <button
                      type="button"
                      className="text-xs text-destructive hover:underline"
                      onClick={() => deletePlan(row.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
        </div>
      ) : null}

      {type === 'blog' ? (
        <div className="rounded-md border border-border/60 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Homepage resource cards (from Blog → Show on homepage)
          </p>
          {postsLoading ? (
            <p className="text-xs text-muted-foreground">Loading posts…</p>
          ) : null}
          {postsError ? <p className="text-xs text-destructive">{postsError}</p> : null}
          {!postsLoading && homepagePosts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No homepage posts. Mark posts under Website → Blog with “Show on homepage”.
            </p>
          ) : null}
          {homepagePosts.map((post, index) => (
            <div
              key={post.id}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded border border-border/40 p-2"
            >
              <div className="sm:col-span-2 text-xs font-medium">
                {post.title || post.slug || `Post #${post.id}`}
              </div>
              <MediaImageField
                label="Featured / card image"
                url={post.image_url || ''}
                alt={post.image_alt || ''}
                onChangeUrl={(v) => updateHomepagePost(index, { image_url: v })}
                onChangeAlt={(v) => updateHomepagePost(index, { image_alt: v })}
              />
            </div>
          ))}
        </div>
      ) : null}

      {type === 'demo' ? (
        <p className="text-xs text-muted-foreground">
          Invoice / Reports mock UI is built from CMS text fields (not a single photo). Use Section
          image above if you want an optional photo alongside the heading.
        </p>
      ) : null}

      {showAdvancedJson && editor.advancedJson ? (
        <details className="rounded-md border border-border p-2">
          <summary className="cursor-pointer text-xs text-muted-foreground">
            Advanced — read-only snapshot
          </summary>
          <pre className="mt-2 max-h-48 overflow-auto text-[10px] font-mono whitespace-pre-wrap">
            {editor.advancedJson}
          </pre>
        </details>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btnOutline}
          disabled={saving || postsSaving}
          onClick={() => handleSave(false)}
        >
          {saving || postsSaving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          className={btnPrimary}
          disabled={saving || postsSaving}
          onClick={() => handleSave(true)}
        >
          {saving || postsSaving ? 'Publishing…' : 'Save & Publish'}
        </button>
      </div>
    </div>
  )
}
