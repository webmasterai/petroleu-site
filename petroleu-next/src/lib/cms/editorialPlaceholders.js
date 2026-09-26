/**
 * Editorial translation markers must never appear on public pages.
 * They may still exist in CMS draft/admin records for untranslated locales.
 */

const PLACEHOLDER_RE =
  /\[Translation required\]|Translation required\s*[—\-–]|unpublished\s+(Pakistan|Afghanistan|افغانستان)\s+draft|Iranian Persian as approved Dari|Do not use Iranian Persian/i

export function isEditorialPlaceholderText(value) {
  if (value == null) return false
  return PLACEHOLDER_RE.test(String(value))
}

export function sectionHasEditorialPlaceholder(section) {
  if (!section || typeof section !== 'object') return false
  const data = section.data && typeof section.data === 'object' ? section.data : {}
  if (data.translation_required === true) return true
  if (isEditorialPlaceholderText(section.title)) return true
  if (isEditorialPlaceholderText(section.description)) return true
  if (isEditorialPlaceholderText(section.content)) return true
  if (isEditorialPlaceholderText(section.heading)) return true
  if (isEditorialPlaceholderText(section.subheading)) return true
  return false
}

/** Strip placeholder fields for public API payloads (returns shallow copy). */
export function scrubEditorialPlaceholders(payload) {
  if (!payload || typeof payload !== 'object') return payload
  const out = { ...payload }
  for (const key of ['title', 'heading', 'description', 'subheading', 'content', 'badge', 'eyebrow']) {
    if (isEditorialPlaceholderText(out[key])) out[key] = ''
  }
  if (out.translation_required) out.translation_required = false
  return out
}
