import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminGet, adminPost, adminPut } from '../../services/cmsAdminApi'
import { LOCALE_SHORT, useAdminWorkspace } from '../../context/AdminWorkspaceContext'
import MediaImageField from './MediaImageField'

function englishLocaleFor(market) {
  if (market === 'af') return 'en-AF'
  if (market === 'shared') return 'en'
  return 'en-PK'
}

function asList(res) {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.data)) return res.data
  return []
}

const fieldCls =
  'w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
const btnPrimary =
  'rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
const btnOutline =
  'rounded-md border border-border bg-card px-2.5 py-1.5 text-xs hover:bg-muted disabled:opacity-50'

const STATUS_BADGE = {
  published: 'bg-emerald-100 text-emerald-800',
  draft: 'bg-amber-100 text-amber-900',
  missing: 'bg-muted text-muted-foreground',
  needs_review: 'bg-orange-100 text-orange-900',
}

function badge(label, tone = 'missing') {
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_BADGE[tone] || STATUS_BADGE.missing}`}>
      {label}
    </span>
  )
}

const SECTION_FRIENDLY = {
  hero: 'Hero / Intro',
  content: 'Content block',
  intro: 'City intro',
  cta: 'Call to action',
  faq: 'FAQ item',
  'feature:card': 'Feature card',
  benefit: 'City benefit',
  visual: 'Product visual',
  'module-card': 'Core module',
  'why-choose': 'Why choose list',
  'heading:features': 'Features heading',
  'heading:benefits': 'Benefits heading',
  'heading:modules': 'Modules heading',
  'heading:why': 'Why-choose heading',
  stat: 'Business Stat',
  logo: 'Trusted logo strip',
  'heading:logos': 'Trusted networks heading',
  'heading:industries': 'Industries heading',
  industry: 'Industry card',
  'industry-card': 'Industry page card',
  'how-it-works': 'Getting started step',
  'heading:getting-started': 'Getting started heading',
  'heading:mobile': 'Mobile dashboard heading',
  'mobile-feature': 'Mobile feature card',
  testimonial: 'Testimonial',
  'page-card': 'Page card',
  mission: 'Mission value',
  story: 'Company story',
  team: 'Team member',
}

function sectionLabel(section) {
  const key = section.section_key || 'section'
  const friendly = SECTION_FRIENDLY[key] || key.replace(/:/g, ' · ')
  const title = section.title ? ` — ${section.title}` : ''
  return `${friendly}${title}`
}

const SECTION_PRESETS = [
  { key: 'hero', label: 'Hero / Intro' },
  { key: 'intro', label: 'City intro' },
  { key: 'stat', label: 'Business Stat' },
  { key: 'heading:logos', label: 'Trusted networks heading' },
  { key: 'logo', label: 'Trusted logo strip' },
  { key: 'heading:industries', label: 'Industries heading' },
  { key: 'industry', label: 'Industry card' },
  { key: 'heading:getting-started', label: 'Getting started heading' },
  { key: 'how-it-works', label: 'Getting started step' },
  { key: 'heading:mobile', label: 'Mobile dashboard heading' },
  { key: 'mobile-feature', label: 'Mobile feature card' },
  { key: 'heading:features', label: 'Features heading' },
  { key: 'feature:card', label: 'Feature card' },
  { key: 'heading:benefits', label: 'Benefits heading' },
  { key: 'benefit', label: 'City benefit' },
  { key: 'visual', label: 'Product visual' },
  { key: 'heading:modules', label: 'Modules heading' },
  { key: 'module-card', label: 'Core module' },
  { key: 'heading:why', label: 'Why-choose heading' },
  { key: 'why-choose', label: 'Why choose list' },
  { key: 'content', label: 'Content block' },
  { key: 'cta', label: 'Call to action' },
  { key: 'faq', label: 'FAQ item' },
  { key: 'testimonial', label: 'Testimonial' },
  { key: 'page-card', label: 'Page card' },
  { key: 'mission', label: 'Mission value' },
  { key: 'story', label: 'Company story' },
]

/** Split section.data into friendly editors (no raw JSON shown). */
function parseDataForEditor(data) {
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {}
  const simple = {}
  const listStrings = {}
  let testimonialItems = null

  if (Array.isArray(data)) {
    testimonialItems = data.map((item) => ({
      name: item?.name || '',
      role: item?.role || '',
      city: item?.city || '',
      rating: item?.rating ?? 5,
      date: item?.date || '',
      content: item?.content || '',
    }))
    return { simple, listStrings, testimonialItems, rest: null }
  }

  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      simple[key] = value
    } else if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
      listStrings[key] = value
    } else if (
      Array.isArray(value) &&
      value.length &&
      value.every((v) => v && typeof v === 'object' && ('name' in v || 'content' in v))
    ) {
      testimonialItems = value.map((item) => ({
        name: item?.name || '',
        role: item?.role || '',
        city: item?.city || '',
        rating: item?.rating ?? 5,
        date: item?.date || '',
        content: item?.content || '',
      }))
    }
    // Complex nested objects are preserved via originalData on the block
  }

  return { simple, listStrings, testimonialItems, rest: null }
}

function buildDataPayload(block, originalData) {
  if (block.testimonialItems) {
    return block.testimonialItems.map((item) => ({
      name: item.name || '',
      role: item.role || '',
      city: item.city || '',
      rating: Number(item.rating) || 5,
      date: item.date || '',
      content: item.content || '',
    }))
  }

  const base =
    originalData && typeof originalData === 'object' && !Array.isArray(originalData)
      ? { ...originalData }
      : {}

  for (const [key, value] of Object.entries(block.simple || {})) {
    base[key] = value
  }
  for (const [key, value] of Object.entries(block.listStrings || {})) {
    base[key] = value
  }
  return Object.keys(base).length ? base : null
}

function sectionToBlock(section) {
  const parsed = parseDataForEditor(section.data)
  return {
    id: section.id,
    section_key: section.section_key || '',
    page_slug: section.page_slug || '',
    market_code: section.market_code,
    locale_code: section.locale_code,
    sort_order: section.sort_order ?? 0,
    title: section.title || '',
    description: section.description || '',
    content: section.content || '',
    image_url: section.image_url || '',
    image_alt: section.image_alt || '',
    link_label: section.link_label || '',
    link_url: section.link_url || '',
    is_enabled: section.is_enabled !== false,
    status: section.status || 'draft',
    simple: parsed.simple,
    listStrings: parsed.listStrings,
    testimonialItems: parsed.testimonialItems,
    originalData: section.data ?? null,
  }
}

function relatedPageSlugs(slug) {
  if (slug === 'home') return ['home', 'home-mid', 'home-bottom']
  return [slug]
}

function emptyBlock(overrides = {}) {
  return {
    id: null,
    section_key: 'content',
    page_slug: '',
    market_code: '',
    locale_code: '',
    sort_order: 0,
    title: '',
    description: '',
    content: '',
    image_url: '',
    image_alt: '',
    link_label: '',
    link_url: '',
    is_enabled: true,
    status: 'draft',
    simple: {},
    listStrings: {},
    testimonialItems: null,
    originalData: null,
    ...overrides,
  }
}

export default function AdminPagesPage() {
  const { market, locale, showAll, localeOptions } = useAdminWorkspace()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [createForm, setCreateForm] = useState(null)

  /** Full page editor state */
  const [editor, setEditor] = useState(null)
  /** { pageMeta, blocks[], translationId } */
  const [editorLoading, setEditorLoading] = useState(false)
  const [pendingPage, setPendingPage] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { group: 1 }
      if (!showAll) params.market = market
      if (q) params.q = q
      if (status) params.status = status
      const res = await adminGet('/pages', { params })
      const all = asList(res)
      // Pages inventory: Home + Pakistan city landings only (other routes stay live; edit via Sections)
      const inventory = all.filter((row) => {
        const slug = String(row.slug || '')
        return slug === 'home' || slug.startsWith('petrol-pump-software-')
      })
      inventory.sort((a, b) => {
        if (a.slug === 'home') return -1
        if (b.slug === 'home') return 1
        return String(a.title || a.slug).localeCompare(String(b.title || b.slug))
      })
      setItems(inventory)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load pages')
    } finally {
      setLoading(false)
    }
  }, [market, showAll, q, status])

  useEffect(() => {
    load()
  }, [load])

  function openCreatePage() {
    setError('')
    setMessage('')
    setCreateForm({
      market_code: market,
      locale_code: locale,
      slug: '',
      title: '',
      description: '',
      frontend_path: '',
      template: 'default',
      status: 'draft',
      is_enabled: true,
      seed_hero: true,
    })
  }

  async function createPage(e) {
    e.preventDefault()
    if (!createForm) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const slug = String(createForm.slug || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-|-$/g, '')
      if (!slug) throw new Error('Slug is required')
      const path =
        String(createForm.frontend_path || '').trim() ||
        `/${slug}`
      const formSnapshot = { ...createForm, slug, path }
      const pageRow = await adminPost('/pages', {
        market_code: formSnapshot.market_code,
        locale_code: formSnapshot.locale_code,
        slug,
        title: formSnapshot.title || slug,
        description: formSnapshot.description || null,
        frontend_path: path,
        template: formSnapshot.template || 'default',
        status: formSnapshot.status || 'draft',
        is_enabled: Boolean(formSnapshot.is_enabled),
        is_shared: false,
        translation_status: 'ready',
      })
      if (formSnapshot.seed_hero) {
        await adminPost('/sections', {
          market_code: formSnapshot.market_code,
          locale_code: formSnapshot.locale_code,
          page_slug: slug,
          section_key: 'hero',
          title: formSnapshot.title || slug,
          description: formSnapshot.description || '',
          content: null,
          data: { badge: 'Petroleu' },
          sort_order: 0,
          is_enabled: true,
          status: 'draft',
        })
      }
      setCreateForm(null)
      setMessage('Page created — open Edit page to add content, then Save & Publish.')
      await load()
      if (pageRow?.id) {
        await openPageEditor(
          {
            slug,
            market_code: formSnapshot.market_code,
            title: formSnapshot.title || slug,
            translations: [
              {
                id: pageRow.id,
                market_code: formSnapshot.market_code,
                locale_code: formSnapshot.locale_code,
                slug,
                title: formSnapshot.title || slug,
                description: formSnapshot.description || '',
                status: formSnapshot.status || 'draft',
                is_enabled: true,
              },
            ],
          },
          {
            id: pageRow.id,
            market_code: formSnapshot.market_code,
            locale_code: formSnapshot.locale_code,
            slug,
            title: formSnapshot.title || slug,
            description: formSnapshot.description || '',
            status: formSnapshot.status || 'draft',
            is_enabled: true,
          },
        )
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Create page failed')
    } finally {
      setSaving(false)
    }
  }

  const expectedLocales = showAll
    ? ['en-PK', 'fa-AF', 'ps-AF', 'en-AF']
    : localeOptions.map((o) => o.value)

  async function openPageEditor(row, translation) {
    setError('')
    setMessage('')
    setPendingPage(null)
    setEditor(null)
    setEditorLoading(true)
    try {
      const m = translation.market_code || row.market_code || market
      const loc = translation.locale_code || locale
      const slug = row.slug
      const slugs = relatedPageSlugs(slug)

      const sectionLists = await Promise.all(
        slugs.map((pageSlug) =>
          adminGet('/sections', { params: { market: m, locale: loc, page: pageSlug } }),
        ),
      )
      let sections = sectionLists.flatMap((res) => asList(res))

      // Keep only this page's sections (never mix FAQ into Features, etc.)
      sections = sections.filter((s) => s.page_slug === slug || slugs.includes(s.page_slug))

      // About page renders Home stats + trusted logos — surface those in About editor too
      if (slug === 'about') {
        const homeRes = await adminGet('/sections', {
          params: { market: m, locale: loc, page: 'home' },
        })
        const homeShared = asList(homeRes).filter((s) =>
          ['stat', 'heading:logos', 'logo'].includes(s.section_key),
        )
        const seen = new Set(sections.map((s) => s.id).filter(Boolean))
        for (const homeRow of homeShared) {
          if (homeRow.id && seen.has(homeRow.id)) continue
          sections.push(homeRow)
        }
      }

      const editorRank = (key) => {
        const order = {
          hero: 0,
          intro: 1,
          content: 2,
          stat: 3,
          'heading:features': 10,
          'feature:card': 11,
          'feature:detailed': 12,
          'feature:benefit_bar': 13,
          'heading:benefits': 14,
          benefit: 15,
          visual: 16,
          'heading:modules': 17,
          'module-card': 18,
          'heading:why': 19,
          'why-choose': 20,
          'heading:logos': 21,
          logo: 22,
          'heading:industries': 23,
          industry: 24,
          'industry-card': 25,
          'heading:getting-started': 26,
          'how-it-works': 27,
          'heading:mobile': 28,
          'mobile-feature': 29,
          'heading:faq': 40,
          faq: 41,
          plan: 42,
          mission: 43,
          story: 44,
          team: 45,
          cta: 90,
        }
        return order[key] ?? 50
      }
      sections.sort((a, b) => {
        const ra = editorRank(a.section_key)
        const rb = editorRank(b.section_key)
        if (ra !== rb) return ra - rb
        return (a.sort_order ?? 0) - (b.sort_order ?? 0)
      })

      const frontendPath =
        translation.frontend_path ||
        row.frontend_path ||
        (slug === 'home' ? '/' : `/${slug}`)

      setEditor({
        translationId: translation.id,
        market_code: m,
        locale_code: loc,
        slug,
        frontend_path: frontendPath,
        title: translation.title || row.title || slug,
        description: translation.description || '',
        status: translation.status || 'draft',
        is_enabled: translation.is_enabled !== false,
        blocks: sections.map(sectionToBlock),
        emptyLocale: sections.length === 0,
      })
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to open page editor')
      setEditor(null)
    } finally {
      setEditorLoading(false)
    }
  }

  function openMissingTranslation(row) {
    setError('')
    setMessage('')
    setEditor(null)
    setPendingPage({
      row,
      market_code: row.market_code || market,
      locale_code: locale,
      slug: row.slug,
      title: row.title || row.slug,
    })
  }

  async function createEmptyTranslation() {
    if (!pendingPage) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const pageRow = await adminPost('/pages', {
        market_code: pendingPage.market_code,
        locale_code: pendingPage.locale_code,
        slug: pendingPage.slug,
        title: pendingPage.title,
        description: null,
        frontend_path: pendingPage.row.frontend_path || `/${pendingPage.slug}`,
        template: pendingPage.row.template || 'default',
        status: 'draft',
        is_enabled: true,
        is_shared: false,
        translation_status: 'draft',
      })
      const translation = {
        id: pageRow?.id || pageRow?.data?.id,
        market_code: pendingPage.market_code,
        locale_code: pendingPage.locale_code,
        title: pendingPage.title,
        description: '',
        status: 'draft',
        is_enabled: true,
      }
      setPendingPage(null)
      await openPageEditor(pendingPage.row, translation)
      await load()
      setMessage(`Created ${pendingPage.locale_code} translation. Add sections below.`)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create translation')
    } finally {
      setSaving(false)
    }
  }

  async function copyTranslationFromEnglish() {
    if (!pendingPage && !editor) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const m = pendingPage?.market_code || editor.market_code
      const targetLocale = pendingPage?.locale_code || editor.locale_code
      const slug = pendingPage?.slug || editor.slug
      const row = pendingPage?.row || { slug, market_code: m, title: editor?.title }
      const sourceLocale = englishLocaleFor(m)
      if (sourceLocale === targetLocale) {
        throw new Error('Already editing the English locale for this market.')
      }

      let translationId = editor?.translationId
      if (!translationId) {
        const pageRow = await adminPost('/pages', {
          market_code: m,
          locale_code: targetLocale,
          slug,
          title: row.title || slug,
          description: null,
          frontend_path: row.frontend_path || `/${slug}`,
          template: row.template || 'default',
          status: 'draft',
          is_enabled: true,
          is_shared: false,
          translation_status: 'draft',
        })
        translationId = pageRow?.id || pageRow?.data?.id
      }

      const slugs = relatedPageSlugs(slug)
      const sectionLists = await Promise.all(
        slugs.map((pageSlug) =>
          adminGet('/sections', { params: { market: m, locale: sourceLocale, page: pageSlug } }),
        ),
      )
      const sourceSections = sectionLists.flatMap((res) => asList(res))
      sourceSections.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

      if (!sourceSections.length) {
        throw new Error(`No ${sourceLocale} sections found to copy for “${slug}”.`)
      }

      setPendingPage(null)
      setEditor({
        translationId,
        market_code: m,
        locale_code: targetLocale,
        slug,
        title: row.title || slug,
        description: '',
        status: 'draft',
        is_enabled: true,
        emptyLocale: false,
        blocks: sourceSections.map((section) => ({
          ...sectionToBlock(section),
          id: null,
          market_code: m,
          locale_code: targetLocale,
          status: 'draft',
        })),
      })
      setMessage(
        `Copied ${sourceSections.length} section(s) from ${sourceLocale}. Review, then Save Draft or Publish.`,
      )
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Copy from English failed')
    } finally {
      setSaving(false)
    }
  }

  function updateBlock(index, patch) {
    setEditor((prev) => {
      if (!prev) return prev
      const blocks = prev.blocks.map((b, i) => (i === index ? { ...b, ...patch } : b))
      return { ...prev, blocks }
    })
  }

  function updateSimpleField(index, key, value) {
    setEditor((prev) => {
      if (!prev) return prev
      const blocks = prev.blocks.map((b, i) =>
        i === index ? { ...b, simple: { ...b.simple, [key]: value } } : b,
      )
      return { ...prev, blocks }
    })
  }

  function updateListStringField(index, key, text) {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    setEditor((prev) => {
      if (!prev) return prev
      const blocks = prev.blocks.map((b, i) =>
        i === index ? { ...b, listStrings: { ...b.listStrings, [key]: lines } } : b,
      )
      return { ...prev, blocks }
    })
  }

  function updateTestimonial(index, tIndex, patch) {
    setEditor((prev) => {
      if (!prev) return prev
      const blocks = prev.blocks.map((b, i) => {
        if (i !== index || !b.testimonialItems) return b
        const testimonialItems = b.testimonialItems.map((t, j) =>
          j === tIndex ? { ...t, ...patch } : t,
        )
        return { ...b, testimonialItems }
      })
      return { ...prev, blocks }
    })
  }

  function addSectionBlock(sectionKey) {
    if (!editor) return
    const maxSort = editor.blocks.reduce((m, b) => Math.max(m, Number(b.sort_order) || 0), 0)
    const preset = SECTION_PRESETS.find((p) => p.key === sectionKey)
    setEditor((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        blocks: [
          ...prev.blocks,
          emptyBlock({
            section_key: sectionKey,
            page_slug: prev.slug === 'home' && sectionKey === 'cta' ? 'home-bottom' : prev.slug,
            market_code: prev.market_code,
            locale_code: prev.locale_code,
            sort_order: maxSort + 10,
            title: preset ? `New ${preset.label}` : 'New section',
            status: 'draft',
            testimonialItems:
              sectionKey === 'testimonial'
                ? [{ name: '', role: '', city: '', rating: 5, date: '', content: '' }]
                : null,
          }),
        ],
      }
    })
    setMessage('Section added below — fill fields, then Save & Publish.')
  }

  function removeBlock(index) {
    setEditor((prev) => {
      if (!prev) return prev
      return { ...prev, blocks: prev.blocks.filter((_, i) => i !== index) }
    })
  }

  async function savePageBlocks(publish) {
    if (!editor) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await adminPut(`/pages/${editor.translationId}`, {
        title: editor.title,
        description: editor.description || null,
        is_enabled: Boolean(editor.is_enabled),
        status: publish ? 'published' : 'draft',
      })

      const nextBlocks = []
      for (const block of editor.blocks) {
        if (!block.id && !publish && !block.title && !block.description && !block.content) {
          // Skip empty brand-new blocks on draft save
        }
        const payload = {
          market_code: block.market_code || editor.market_code,
          locale_code: block.locale_code || editor.locale_code,
          page_slug: block.page_slug || editor.slug,
          section_key: block.section_key,
          title: block.title || null,
          description: block.description || null,
          content: block.content || null,
          data: buildDataPayload(block, block.originalData),
          image_url: block.image_url || null,
          image_alt: block.image_alt || null,
          link_label: block.link_label || null,
          link_url: block.link_url || null,
          sort_order: Number(block.sort_order) || 0,
          is_enabled: Boolean(block.is_enabled),
          status: publish ? 'published' : 'draft',
        }
        let id = block.id
        if (!id) {
          const row = await adminPost('/sections', { ...payload, status: 'draft' })
          id = row?.id
          if (!id) throw new Error('Failed to create section')
        } else {
          // Always update by stable section id — never by index alone
          await adminPut(`/sections/${id}`, payload)
        }
        if (publish) {
          await adminPost(`/sections/${id}/publish`)
        }
        nextBlocks.push({ ...block, id, status: publish ? 'published' : 'draft' })
      }

      setEditor((prev) =>
        prev ? { ...prev, status: publish ? 'published' : 'draft', blocks: nextBlocks } : prev,
      )
      setMessage(
        publish
          ? 'Published successfully. Changes are now live.'
          : 'Draft saved. Live website has not changed.',
      )
      await load()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Save failed'
      setError(/axios|status code/i.test(String(msg)) ? 'Unable to save. Please try again.' : msg)
    } finally {
      setSaving(false)
    }
  }

  async function saveAndPublish() {
    await savePageBlocks(true)
  }

  async function saveDraft() {
    await savePageBlocks(false)
  }

  const editorSummary = useMemo(() => {
    if (!editor) return ''
    return `${editor.title || editor.slug} · slug:${editor.slug} · ${editor.market_code} · ${editor.locale_code}`
  }, [editor])

  if (editorLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Loading page editor…
      </div>
    )
  }

  if (pendingPage) {
    const label = LOCALE_SHORT[pendingPage.locale_code] || pendingPage.locale_code
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
        <h1 className="text-lg font-semibold tracking-tight">
          No {label} content exists for this page yet.
        </h1>
        <p className="mt-1 text-amber-900/80">
          Page <span className="font-mono">{pendingPage.slug}</span> has no{' '}
          <span className="font-mono">{pendingPage.locale_code}</span> translation in market{' '}
          <span className="font-mono">{pendingPage.market_code}</span>.
        </p>
        {error ? <p className="mt-3 text-sm text-destructive whitespace-pre-wrap">{error}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={btnPrimary} disabled={saving} onClick={createEmptyTranslation}>
            {saving ? 'Working…' : 'Create translation'}
          </button>
          <button
            type="button"
            className={btnOutline}
            disabled={saving}
            onClick={copyTranslationFromEnglish}
          >
            Copy from English
          </button>
          <button type="button" className={btnOutline} onClick={() => setPendingPage(null)}>
            Back to Pages
          </button>
        </div>
      </div>
    )
  }

  if (editor) {
    return (
      <div>
        <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-slate-200 bg-[#f7f6f3]/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <button type="button" className={btnOutline} onClick={() => setEditor(null)}>
                ← Back to pages
              </button>
              <h1 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                Edit page: {editor.title || editor.slug}
              </h1>
              <p className="text-sm text-slate-500">
                {editorSummary} — edit all content and images here. No JSON.
              </p>
              <p className="mt-1 font-mono text-xs text-slate-400">
                page_slug={editor.slug} · path={editor.frontend_path || `/${editor.slug}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btnOutline} disabled={saving} onClick={saveDraft}>
                {saving ? 'Saving…' : 'Save Draft'}
              </button>
              <a
                className={btnOutline}
                href={
                  editor.frontend_path ||
                  (editor.slug === 'home' ? '/' : `/${editor.slug}`)
                }
                target="_blank"
                rel="noreferrer"
              >
                Preview
              </a>
              <button type="button" className={btnPrimary} disabled={saving} onClick={saveAndPublish}>
                {saving ? 'Publishing…' : 'Save & Publish'}
              </button>
            </div>
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-destructive whitespace-pre-wrap">{error}</p> : null}
        {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}

        <div className="mt-4 space-y-3 rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Page details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs sm:col-span-2">
              <span className="text-muted-foreground">Page title</span>
              <input
                className={fieldCls + ' mt-1'}
                value={editor.title}
                onChange={(e) => setEditor((p) => ({ ...p, title: e.target.value }))}
              />
            </label>
            <label className="block text-xs sm:col-span-2">
              <span className="text-muted-foreground">Page description</span>
              <textarea
                className={fieldCls + ' mt-1 min-h-[60px]'}
                value={editor.description}
                onChange={(e) => setEditor((p) => ({ ...p, description: e.target.value }))}
              />
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
          <span className="text-xs font-medium text-muted-foreground">Add section:</span>
          {SECTION_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              className={btnOutline}
              onClick={() => addSectionBlock(preset.key)}
            >
              + {preset.label}
            </button>
          ))}
        </div>

        {editor.blocks.length === 0 ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">
              No {LOCALE_SHORT[editor.locale_code] || editor.locale_code} content exists for this page
              yet.
            </p>
            <p className="mt-1 text-amber-900/80">
              Locale <span className="font-mono">{editor.locale_code}</span> · market{' '}
              <span className="font-mono">{editor.market_code}</span> · page{' '}
              <span className="font-mono">{editor.slug}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className={btnPrimary} onClick={() => addSectionBlock('hero')}>
                Create translation
              </button>
              <button
                type="button"
                className={btnOutline}
                disabled={saving}
                onClick={copyTranslationFromEnglish}
              >
                Copy from English
              </button>
              <button type="button" className={btnOutline} onClick={() => setEditor(null)}>
                Back to Pages
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {editor.blocks.map((block, index) => (
              <div key={block.id || `new-${index}`} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold capitalize">
                    {sectionLabel(block).replace(/:/g, ' · ')}
                    {!block.id ? (
                      <span className="ms-2 text-[10px] font-normal text-muted-foreground">(new)</span>
                    ) : null}
                  </h3>
                  <div className="flex items-center gap-2">
                    {badge(block.status === 'published' ? 'Published' : 'Draft', block.status)}
                    <button type="button" className={btnOutline} onClick={() => removeBlock(index)}>
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mb-3 grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs">
                    <span className="text-muted-foreground">Section type</span>
                    <select
                      className={fieldCls + ' mt-1'}
                      value={block.section_key}
                      onChange={(e) => updateBlock(index, { section_key: e.target.value })}
                    >
                      {SECTION_PRESETS.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.label}
                        </option>
                      ))}
                      {!SECTION_PRESETS.some((p) => p.key === block.section_key) ? (
                        <option value={block.section_key}>
                          {SECTION_FRIENDLY[block.section_key] || block.section_key}
                        </option>
                      ) : null}
                    </select>
                  </label>
                  <label className="block text-xs">
                    <span className="text-muted-foreground">Display order</span>
                    <input
                      type="number"
                      className={fieldCls + ' mt-1'}
                      value={block.sort_order}
                      onChange={(e) => updateBlock(index, { sort_order: Number(e.target.value) || 0 })}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs sm:col-span-2">
                    <span className="text-muted-foreground">
                      {block.section_key === 'stat'
                        ? 'Value (e.g. 500+)'
                        : block.section_key === 'logo'
                          ? 'Logo name'
                          : 'Title / heading'}
                    </span>
                    <input
                      className={fieldCls + ' mt-1'}
                      value={block.title}
                      onChange={(e) => updateBlock(index, { title: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs sm:col-span-2">
                    <span className="text-muted-foreground">
                      {block.section_key === 'stat'
                        ? 'Label (e.g. Stations Active)'
                        : block.section_key === 'logo'
                          ? 'Caption (optional)'
                          : 'Description'}
                    </span>
                    <textarea
                      className={fieldCls + ' mt-1 min-h-[60px]'}
                      value={block.description}
                      onChange={(e) => updateBlock(index, { description: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs sm:col-span-2">
                    <span className="text-muted-foreground">Content</span>
                    <textarea
                      className={fieldCls + ' mt-1 min-h-[80px]'}
                      value={block.content}
                      onChange={(e) => updateBlock(index, { content: e.target.value })}
                    />
                  </label>
                  <MediaImageField
                    label={block.section_key === 'logo' ? 'Logo image' : 'Image'}
                    url={block.image_url}
                    alt={block.image_alt}
                    onChangeUrl={(v) => updateBlock(index, { image_url: v })}
                    onChangeAlt={(v) => updateBlock(index, { image_alt: v })}
                  />
                  <label className="flex items-center gap-2 text-xs sm:col-span-2 pt-1">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={block.is_enabled !== false}
                      onChange={(e) => updateBlock(index, { is_enabled: e.target.checked })}
                    />
                    <span className="text-muted-foreground">Enabled on website</span>
                  </label>
                  <label className="block text-xs">
                    <span className="text-muted-foreground">Button / link label</span>
                    <input
                      className={fieldCls + ' mt-1'}
                      value={block.link_label}
                      onChange={(e) => updateBlock(index, { link_label: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="text-muted-foreground">Button / link URL</span>
                    <input
                      className={fieldCls + ' mt-1'}
                      value={block.link_url}
                      onChange={(e) => updateBlock(index, { link_url: e.target.value })}
                    />
                  </label>

                  {Object.entries(block.simple || {}).map(([key, value]) => (
                    <label key={key} className="block text-xs">
                      <span className="text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                      <input
                        className={fieldCls + ' mt-1'}
                        value={String(value ?? '')}
                        onChange={(e) => updateSimpleField(index, key, e.target.value)}
                      />
                    </label>
                  ))}

                  {Object.entries(block.listStrings || {}).map(([key, lines]) => (
                    <label key={key} className="block text-xs sm:col-span-2">
                      <span className="text-muted-foreground">
                        {key.replace(/_/g, ' ')} (one item per line)
                      </span>
                      <textarea
                        className={fieldCls + ' mt-1 min-h-[90px]'}
                        value={(lines || []).join('\n')}
                        onChange={(e) => updateListStringField(index, key, e.target.value)}
                      />
                    </label>
                  ))}
                </div>

                {block.testimonialItems ? (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground">Testimonials</h4>
                    {block.testimonialItems.map((t, tIndex) => (
                      <div key={tIndex} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
                        <input
                          className={fieldCls}
                          placeholder="Name"
                          value={t.name}
                          onChange={(e) => updateTestimonial(index, tIndex, { name: e.target.value })}
                        />
                        <input
                          className={fieldCls}
                          placeholder="Role"
                          value={t.role}
                          onChange={(e) => updateTestimonial(index, tIndex, { role: e.target.value })}
                        />
                        <input
                          className={fieldCls}
                          placeholder="City"
                          value={t.city}
                          onChange={(e) => updateTestimonial(index, tIndex, { city: e.target.value })}
                        />
                        <input
                          className={fieldCls}
                          placeholder="Date"
                          value={t.date}
                          onChange={(e) => updateTestimonial(index, tIndex, { date: e.target.value })}
                        />
                        <textarea
                          className={fieldCls + ' sm:col-span-2 min-h-[70px]'}
                          placeholder="Quote"
                          value={t.content}
                          onChange={(e) =>
                            updateTestimonial(index, tIndex, { content: e.target.value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <div className="sticky bottom-3 mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" className={btnOutline} disabled={saving} onClick={saveDraft}>
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button type="button" className={btnPrimary} disabled={saving} onClick={saveAndPublish}>
            {saving ? 'Publishing…' : 'Save & Publish'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Pages</h1>
          <p className="text-sm text-muted-foreground">
            Home and Pakistan city landing pages. Features, FAQ, About, and other marketing sections
            are edited under Website → Sections.
          </p>
        </div>
        <button type="button" className={btnPrimary} onClick={openCreatePage}>
          New page
        </button>
      </div>

      {createForm ? (
        <form
          onSubmit={createPage}
          className="mt-4 space-y-3 rounded-lg border border-border bg-card p-4"
        >
          <h2 className="text-sm font-semibold">Create page</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs">
              <span className="text-muted-foreground">Slug (URL key)</span>
              <input
                className={fieldCls + ' mt-1'}
                required
                placeholder="e.g. services"
                value={createForm.slug}
                onChange={(e) =>
                  setCreateForm((p) => ({
                    ...p,
                    slug: e.target.value,
                    frontend_path: p.frontend_path || `/${e.target.value.trim().toLowerCase()}`,
                  }))
                }
              />
            </label>
            <label className="block text-xs">
              <span className="text-muted-foreground">Frontend path</span>
              <input
                className={fieldCls + ' mt-1'}
                placeholder="/services"
                value={createForm.frontend_path}
                onChange={(e) => setCreateForm((p) => ({ ...p, frontend_path: e.target.value }))}
              />
            </label>
            <label className="block text-xs sm:col-span-2">
              <span className="text-muted-foreground">Title</span>
              <input
                className={fieldCls + ' mt-1'}
                required
                value={createForm.title}
                onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
              />
            </label>
            <label className="block text-xs sm:col-span-2">
              <span className="text-muted-foreground">Description</span>
              <textarea
                className={fieldCls + ' mt-1 min-h-[60px]'}
                value={createForm.description}
                onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
              />
            </label>
            <label className="flex items-center gap-2 text-xs sm:col-span-2">
              <input
                type="checkbox"
                checked={createForm.seed_hero}
                onChange={(e) => setCreateForm((p) => ({ ...p, seed_hero: e.target.checked }))}
              />
              <span className="text-muted-foreground">Start with a Hero section</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving ? 'Creating…' : 'Create & open editor'}
            </button>
            <button type="button" className={btnOutline} onClick={() => setCreateForm(null)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className={fieldCls + ' w-48'}
          placeholder="Search slug/title"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={fieldCls + ' w-auto'} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option value="published">published</option>
          <option value="draft">draft</option>
        </select>
        <button type="button" className={btnOutline} onClick={load}>
          Refresh
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm">{message}</p> : null}

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-2 py-2 font-medium">Page</th>
              <th className="px-2 py-2 font-medium">Market</th>
              <th className="px-2 py-2 font-medium">Languages</th>
              <th className="px-2 py-2 font-medium">Open editor</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-2 py-4 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-2 py-4 text-muted-foreground">
                  No pages for this workspace
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const byLocale = Object.fromEntries((row.translations || []).map((t) => [t.locale_code, t]))
                return (
                  <tr key={row.logical_key || row.id} className="border-t border-border align-top">
                    <td className="px-2 py-2">
                      <div className="font-medium">{row.title || row.slug}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{row.slug}</div>
                    </td>
                    <td className="px-2 py-2">{row.market_code}</td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-1.5">
                        {expectedLocales.map((loc) => {
                          const t = byLocale[loc]
                          if (!t) return <span key={loc}>{badge(`${loc}: Missing`, 'missing')}</span>
                          const tone =
                            t.translation_status === 'needs_review'
                              ? 'needs_review'
                              : t.status === 'published'
                                ? 'published'
                                : 'draft'
                          return (
                            <button
                              key={loc}
                              type="button"
                              className="text-left"
                              onClick={() => openPageEditor(row, t)}
                              title="Open full page editor"
                            >
                              {badge(
                                `${loc}: ${t.status}${t.translation_status === 'needs_review' ? ' · review' : ''}`,
                                tone,
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      {byLocale[locale] ? (
                        <button
                          type="button"
                          className={btnPrimary}
                          onClick={() => openPageEditor(row, byLocale[locale])}
                        >
                          Edit page
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={btnOutline}
                          onClick={() => openMissingTranslation(row)}
                        >
                          Add {locale} translation
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
