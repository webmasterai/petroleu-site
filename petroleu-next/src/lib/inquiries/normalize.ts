/**
 * Canonical inquiry shape + alias normalization for write/read.
 * Public forms historically send full_name; CMS UI expected name.
 */

export type InquiryRecord = {
  id?: number | string
  name: string
  full_name?: string
  email: string
  phone: string | null
  company: string | null
  message: string | null
  type: string
  market_code: string
  market?: string
  locale_code: string
  locale?: string
  source: string | null
  page?: string | null
  status: string
  admin_notes: string | null
  city?: string | null
  address?: string | null
  fuel_brand?: string | null
  stations?: string | number | null
  created_at: string
  updated_at: string
  [key: string]: unknown
}

function pickStr(...vals: unknown[]): string {
  for (const v of vals) {
    if (v == null) continue
    const s = String(v).trim()
    if (s) return s
  }
  return ''
}

function pickStrOrNull(...vals: unknown[]): string | null {
  const s = pickStr(...vals)
  return s || null
}

/** Normalize a public form / API body into a storeable inquiry row (no id). */
export function normalizeInquiryInput(
  body: Record<string, unknown>,
  opts: { type: string },
): Omit<InquiryRecord, 'id'> {
  const now = new Date().toISOString()
  const name = pickStr(body.name, body.full_name, body.fullName, body.contact_name, body.contactName)
  const phone = pickStrOrNull(
    body.phone,
    body.phoneNumber,
    body.phone_number,
    body.mobile,
    body.contactNumber,
    body.contact_number,
  )
  // Public message aliases only — never body.admin_notes / notes from admin.
  const message = pickStrOrNull(
    body.message,
    body.messageText,
    body.message_text,
    body.body,
    body.comments,
    body.comment,
  )
  const market = pickStr(body.market_code, body.market) || 'pk'
  const locale =
    pickStr(body.locale_code, body.locale) || (market === 'af' ? 'fa-AF' : 'en-PK')
  const company = pickStrOrNull(body.company, body.companyName, body.company_name, body.business_name)
  const source = pickStrOrNull(body.source, body.page, body.page_path) || 'website'

  return {
    name: name || 'Unknown',
    full_name: name || 'Unknown',
    email: pickStr(body.email),
    phone,
    company,
    message,
    type: opts.type,
    market_code: market,
    market,
    locale_code: locale,
    locale,
    source,
    page: pickStrOrNull(body.page, body.page_path, body.source_page),
    status: 'new',
    admin_notes: null,
    city: pickStrOrNull(body.city),
    address: pickStrOrNull(body.address),
    fuel_brand: pickStrOrNull(body.fuel_brand, body.fuelBrand),
    stations: body.stations != null && body.stations !== '' ? body.stations : null,
    created_at: now,
    updated_at: now,
  }
}

/** Read-time normalization: map legacy aliases onto canonical fields without rewriting storage. */
export function normalizeInquiryRead(row: Record<string, unknown> | null | undefined): InquiryRecord | null {
  if (!row || typeof row !== 'object') return null
  const name = pickStr(row.name, row.full_name, row.fullName, row.contact_name, row.contactName)
  const phone = pickStrOrNull(
    row.phone,
    row.phoneNumber,
    row.phone_number,
    row.mobile,
    row.contactNumber,
    row.contact_number,
  )
  const message = pickStrOrNull(
    row.message,
    row.messageText,
    row.message_text,
    row.body,
    row.comments,
    row.comment,
  )
  const market = pickStr(row.market_code, row.market) || 'pk'
  const locale = pickStr(row.locale_code, row.locale) || ''
  const created = pickStr(row.created_at, row.createdAt) || ''
  const updated = pickStr(row.updated_at, row.updatedAt) || created

  return {
    ...row,
    id: row.id as number | string | undefined,
    name: name || '',
    full_name: pickStr(row.full_name, row.fullName, name) || name || '',
    email: pickStr(row.email),
    phone,
    company: pickStrOrNull(row.company, row.companyName, row.company_name, row.business_name),
    message,
    type: pickStr(row.type) || 'contact',
    market_code: market,
    market,
    locale_code: locale,
    locale,
    source: pickStrOrNull(row.source, row.page),
    page: pickStrOrNull(row.page, row.page_path, row.source_page),
    status: pickStr(row.status) || 'new',
    admin_notes: pickStrOrNull(row.admin_notes, row.adminNotes),
    city: pickStrOrNull(row.city),
    address: pickStrOrNull(row.address),
    fuel_brand: pickStrOrNull(row.fuel_brand, row.fuelBrand),
    created_at: created,
    updated_at: updated,
  }
}

export function inquiryDisplayName(row: Record<string, unknown> | null | undefined): string {
  return normalizeInquiryRead(row)?.name || ''
}

export function inquiryDisplayPhone(row: Record<string, unknown> | null | undefined): string {
  return normalizeInquiryRead(row)?.phone || ''
}

export function inquiryDisplayMessage(row: Record<string, unknown> | null | undefined): string {
  return normalizeInquiryRead(row)?.message || ''
}
