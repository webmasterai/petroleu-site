/**
 * Server-only Google reviews fetcher.
 * Prefer Google Business Profile API (full review list + pagination).
 * Fallback: Places API (aggregate rating/count; limited individual reviews).
 *
 * Secrets must come from environment variables — never expose to the client.
 */
import fs from 'node:fs'
import path from 'node:path'

export type NormalizedGoogleReview = {
  reviewId: string
  reviewerName: string
  reviewerPhotoUrl: string | null
  starRating: number
  comment: string
  createTime: string | null
  updateTime: string | null
  reviewReplyUrl: string | null
  source: 'google'
}

export type GoogleReviewsPayload = {
  source: 'google_business_profile' | 'google_places' | 'unavailable'
  enabled: boolean
  rating: number | null
  totalReviewCount: number | null
  listingUrl: string | null
  reviews: NormalizedGoogleReview[]
  pagesFetched: number
  fetchedAt: string | null
  error: string | null
  limitation: string | null
}

const STAR_MAP: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
}

function env(name: string) {
  return String(process.env[name] || '').trim()
}

type CmsGoogleConfig = {
  google_reviews_enabled?: string
  google_fallback_cms?: string
  google_place_id?: string
  google_business_account_id?: string
  google_business_location_id?: string
  google_listing_url?: string
}

/** Non-secret Google IDs / flags from CMS heading:testimonials (env wins for secrets). */
function readCmsGoogleConfig(): CmsGoogleConfig {
  try {
    const dataDir = process.env.CMS_DATA_DIR || path.join(process.cwd(), 'storage', 'data')
    const file = path.join(dataDir, 'sections.json')
    if (!fs.existsSync(file)) return {}
    const rows = JSON.parse(fs.readFileSync(file, 'utf8')) as Array<{
      section_key?: string
      status?: string
      is_enabled?: boolean
      data?: CmsGoogleConfig
      market_code?: string
      locale_code?: string
    }>
    const preferred = rows.find(
      (s) =>
        s.section_key === 'heading:testimonials' &&
        s.status === 'published' &&
        s.is_enabled !== false &&
        s.data &&
        (s.data.google_place_id ||
          s.data.google_business_account_id ||
          s.data.google_business_location_id ||
          s.data.google_reviews_enabled),
    )
    const anyHeading = rows.find(
      (s) =>
        s.section_key === 'heading:testimonials' &&
        s.status === 'published' &&
        s.is_enabled !== false &&
        s.data,
    )
    return (preferred || anyHeading)?.data || {}
  } catch {
    return {}
  }
}

function cfg(name: keyof CmsGoogleConfig, cms: CmsGoogleConfig) {
  const fromEnv =
    name === 'google_place_id'
      ? env('GOOGLE_PLACE_ID')
      : name === 'google_business_account_id'
        ? env('GOOGLE_BUSINESS_ACCOUNT_ID')
        : name === 'google_business_location_id'
          ? env('GOOGLE_BUSINESS_LOCATION_ID')
          : name === 'google_listing_url'
            ? env('GOOGLE_REVIEWS_LISTING_URL')
            : ''
  if (fromEnv) return fromEnv
  return String(cms[name] || '').trim()
}

function reviewsEnabled(cms: CmsGoogleConfig) {
  const cmsFlag = String(cms.google_reviews_enabled || '').toLowerCase()
  const envFlag = env('GOOGLE_REVIEWS_ENABLED').toLowerCase()
  const flag = cmsFlag || envFlag
  if (flag === '0' || flag === 'false' || flag === 'off') return false
  // Enabled when any Google credential/config is present (or explicitly true)
  if (flag === '1' || flag === 'true' || flag === 'on') {
    return Boolean(
      env('GOOGLE_OAUTH_REFRESH_TOKEN') ||
        env('GOOGLE_PLACES_API_KEY') ||
        cfg('google_business_account_id', cms) ||
        cfg('google_place_id', cms),
    )
  }
  return Boolean(
    env('GOOGLE_OAUTH_REFRESH_TOKEN') ||
      env('GOOGLE_PLACES_API_KEY') ||
      cfg('google_business_account_id', cms) ||
      cfg('google_place_id', cms),
  )
}

function cacheTtlMs() {
  const sec = Number(env('GOOGLE_REVIEWS_CACHE_TTL_SECONDS') || 10800)
  return Math.max(60, Number.isFinite(sec) ? sec : 10800) * 1000
}

function cachePath() {
  const dataDir = process.env.CMS_DATA_DIR || path.join(process.cwd(), 'storage', 'data')
  return path.join(dataDir, 'google-reviews-cache.json')
}

function readCache(): GoogleReviewsPayload | null {
  try {
    const p = cachePath()
    if (!fs.existsSync(p)) return null
    const raw = JSON.parse(fs.readFileSync(p, 'utf8')) as GoogleReviewsPayload & {
      _cachedAt?: number
    }
    const cachedAt = Number(raw._cachedAt || 0)
    if (!cachedAt || Date.now() - cachedAt > cacheTtlMs()) return null
    const { _cachedAt: _omit, ...payload } = raw as GoogleReviewsPayload & { _cachedAt?: number }
    void _omit
    return payload
  } catch {
    return null
  }
}

function writeCache(payload: GoogleReviewsPayload) {
  try {
    const p = cachePath()
    fs.mkdirSync(path.dirname(p), { recursive: true })
    fs.writeFileSync(p, JSON.stringify({ ...payload, _cachedAt: Date.now() }, null, 2) + '\n')
  } catch {
    // cache write is best-effort
  }
}

function emptyPayload(
  cms: CmsGoogleConfig,
  partial: Partial<GoogleReviewsPayload> = {},
): GoogleReviewsPayload {
  return {
    source: 'unavailable',
    enabled: reviewsEnabled(cms),
    rating: null,
    totalReviewCount: null,
    listingUrl: cfg('google_listing_url', cms) || null,
    reviews: [],
    pagesFetched: 0,
    fetchedAt: null,
    error: null,
    limitation: null,
    ...partial,
  }
}

async function getOAuthAccessToken(): Promise<string | null> {
  const clientId = env('GOOGLE_OAUTH_CLIENT_ID')
  const clientSecret = env('GOOGLE_OAUTH_CLIENT_SECRET')
  const refreshToken = env('GOOGLE_OAUTH_REFRESH_TOKEN')
  if (!clientId || !clientSecret || !refreshToken) return null

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OAuth token refresh failed (${res.status}): ${text.slice(0, 200)}`)
  }
  const json = (await res.json()) as { access_token?: string }
  return json.access_token || null
}

function normalizeGbpReview(raw: Record<string, unknown>): NormalizedGoogleReview | null {
  const reviewer = (raw.reviewer && typeof raw.reviewer === 'object'
    ? (raw.reviewer as Record<string, unknown>)
    : {}) as Record<string, unknown>
  const name = String(reviewer.displayName || 'Google user').trim()
  const comment = String(raw.comment || '').trim()
  const star =
    typeof raw.starRating === 'string'
      ? STAR_MAP[raw.starRating] || 0
      : Number(raw.starRating) || 0
  const reviewName = String(raw.name || raw.reviewId || '')
  const reviewId = reviewName.includes('/')
    ? reviewName.split('/').pop() || reviewName
    : reviewName || `${name}-${raw.createTime || ''}`
  if (!comment && !star) return null
  return {
    reviewId,
    reviewerName: name || 'Google user',
    reviewerPhotoUrl: typeof reviewer.profilePhotoUrl === 'string' ? reviewer.profilePhotoUrl : null,
    starRating: star,
    comment,
    createTime: typeof raw.createTime === 'string' ? raw.createTime : null,
    updateTime: typeof raw.updateTime === 'string' ? raw.updateTime : null,
    reviewReplyUrl: typeof raw.reviewReply === 'object' && raw.reviewReply ? null : null,
    source: 'google',
  }
}

/** Fetch ALL reviews via Business Profile API with pageToken pagination. */
async function fetchBusinessProfileReviews(
  cms: CmsGoogleConfig,
): Promise<GoogleReviewsPayload | null> {
  const accountId = cfg('google_business_account_id', cms).replace(/^accounts\//, '')
  const locationId = cfg('google_business_location_id', cms).replace(/^locations\//, '')
  if (!accountId || !locationId) return null

  const accessToken = await getOAuthAccessToken()
  if (!accessToken) {
    return emptyPayload(cms, {
      error: 'Google Business Profile configured but OAuth refresh credentials are missing',
      limitation:
        'Set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REFRESH_TOKEN',
    })
  }

  const reviews: NormalizedGoogleReview[] = []
  const seen = new Set<string>()
  let pageToken: string | null = null
  let pagesFetched = 0
  let averageRating: number | null = null
  let totalReviewCount: number | null = null
  const maxPages = 40 // safety cap

  do {
    const url = new URL(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`,
    )
    url.searchParams.set('pageSize', '50')
    url.searchParams.set('orderBy', 'updateTime desc')
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    })
    pagesFetched += 1
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`GBP reviews.list failed (${res.status}): ${text.slice(0, 300)}`)
    }
    const data = (await res.json()) as {
      reviews?: Record<string, unknown>[]
      averageRating?: number
      totalReviewCount?: number
      nextPageToken?: string
    }
    if (typeof data.averageRating === 'number') averageRating = data.averageRating
    if (typeof data.totalReviewCount === 'number') totalReviewCount = data.totalReviewCount
    for (const raw of data.reviews || []) {
      const n = normalizeGbpReview(raw)
      if (!n || seen.has(n.reviewId)) continue
      seen.add(n.reviewId)
      reviews.push(n)
    }
    pageToken = data.nextPageToken || null
  } while (pageToken && pagesFetched < maxPages)

  return {
    source: 'google_business_profile',
    enabled: true,
    rating: averageRating,
    totalReviewCount: totalReviewCount ?? reviews.length,
    listingUrl: cfg('google_listing_url', cms) || null,
    reviews,
    pagesFetched,
    fetchedAt: new Date().toISOString(),
    error: null,
    limitation: null,
  }
}

function normalizePlacesReview(raw: Record<string, unknown>, index: number): NormalizedGoogleReview | null {
  let author = 'Google user'
  let photo: string | null = null
  if (raw.authorAttribution && typeof raw.authorAttribution === 'object') {
    const attr = raw.authorAttribution as Record<string, unknown>
    author = String(attr.displayName || 'Google user').trim() || 'Google user'
    photo = typeof attr.photoUri === 'string' ? attr.photoUri : null
  } else if (typeof raw.author_name === 'string') {
    author = raw.author_name.trim() || 'Google user'
    photo = typeof raw.profile_photo_url === 'string' ? raw.profile_photo_url : null
  }

  let comment = ''
  if (raw.text && typeof raw.text === 'object' && typeof (raw.text as { text?: string }).text === 'string') {
    comment = String((raw.text as { text?: string }).text || '').trim()
  } else {
    comment = String(raw.text || raw.comment || '').trim()
  }

  const star = Number(raw.rating) || 0
  if (!comment && !star) return null
  return {
    reviewId: String(raw.name || `places-${index}-${author}`),
    reviewerName: author,
    reviewerPhotoUrl: photo,
    starRating: star,
    comment,
    createTime:
      typeof raw.publishTime === 'string'
        ? raw.publishTime
        : typeof raw.time === 'number'
          ? new Date(raw.time * 1000).toISOString()
          : null,
    updateTime: null,
    reviewReplyUrl: null,
    source: 'google',
  }
}

/** Places API: aggregate rating/count + limited review sample (not full history). */
async function fetchPlacesFallback(cms: CmsGoogleConfig): Promise<GoogleReviewsPayload | null> {
  const apiKey = env('GOOGLE_PLACES_API_KEY')
  const placeId = cfg('google_place_id', cms)
  if (!apiKey || !placeId) return null

  // Places API (New)
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'id,displayName,rating,userRatingCount,reviews,googleMapsUri,websiteUri',
      Accept: 'application/json',
    },
  })
  if (!res.ok) {
    // Legacy Place Details fallback
    const legacy = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    legacy.searchParams.set('place_id', placeId)
    legacy.searchParams.set('fields', 'name,rating,user_ratings_total,reviews,url')
    legacy.searchParams.set('key', apiKey)
    const legacyRes = await fetch(legacy.toString())
    if (!legacyRes.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Places API failed (${res.status}): ${text.slice(0, 200)}`)
    }
    const legacyJson = (await legacyRes.json()) as {
      result?: {
        rating?: number
        user_ratings_total?: number
        reviews?: Record<string, unknown>[]
        url?: string
      }
      status?: string
    }
    if (legacyJson.status && legacyJson.status !== 'OK') {
      throw new Error(`Places Details status: ${legacyJson.status}`)
    }
    const result = legacyJson.result || {}
    const reviews = (result.reviews || [])
      .map((r, i) => normalizePlacesReview(r, i))
      .filter(Boolean) as NormalizedGoogleReview[]
    return {
      source: 'google_places',
      enabled: true,
      rating: typeof result.rating === 'number' ? result.rating : null,
      totalReviewCount:
        typeof result.user_ratings_total === 'number' ? result.user_ratings_total : null,
      listingUrl: result.url || cfg('google_listing_url', cms) || null,
      reviews,
      pagesFetched: 1,
      fetchedAt: new Date().toISOString(),
      error: null,
      limitation:
        'Places API returns only a small sample of individual reviews (typically up to 5), not the full Google review history. Aggregate rating and total count are authoritative.',
    }
  }

  const data = (await res.json()) as {
    rating?: number
    userRatingCount?: number
    reviews?: Record<string, unknown>[]
    googleMapsUri?: string
  }
  const reviews = (data.reviews || [])
    .map((r, i) => normalizePlacesReview(r, i))
    .filter(Boolean) as NormalizedGoogleReview[]

  return {
    source: 'google_places',
    enabled: true,
    rating: typeof data.rating === 'number' ? data.rating : null,
    totalReviewCount: typeof data.userRatingCount === 'number' ? data.userRatingCount : null,
    listingUrl: data.googleMapsUri || cfg('google_listing_url', cms) || null,
    reviews,
    pagesFetched: 1,
    fetchedAt: new Date().toISOString(),
    error: null,
    limitation:
      'Places API returns only a small sample of individual reviews (typically up to 5), not the full Google review history. Aggregate rating and total count are authoritative. Prefer Business Profile API for full review lists.',
  }
}

export async function getGoogleReviews(options?: {
  forceRefresh?: boolean
}): Promise<GoogleReviewsPayload> {
  const cms = readCmsGoogleConfig()

  if (!reviewsEnabled(cms)) {
    return emptyPayload(cms, {
      enabled: false,
      limitation:
        'Google reviews disabled or not configured. Set GOOGLE_REVIEWS_ENABLED and Business Profile / Places credentials.',
    })
  }

  if (!options?.forceRefresh) {
    const cached = readCache()
    if (cached && cached.reviews) return cached
  }

  try {
    const gbp = await fetchBusinessProfileReviews(cms)
    if (gbp && gbp.source === 'google_business_profile' && !gbp.error) {
      writeCache(gbp)
      return gbp
    }
    if (gbp?.error && !env('GOOGLE_PLACES_API_KEY')) {
      writeCache(gbp)
      return gbp
    }

    const places = await fetchPlacesFallback(cms)
    if (places) {
      // Prefer GBP error note + places data if GBP failed mid-way
      if (gbp?.error) {
        places.error = gbp.error
        places.limitation = [gbp.limitation, places.limitation].filter(Boolean).join(' | ')
      }
      writeCache(places)
      return places
    }

    const unavailable = emptyPayload(cms, {
      error: gbp?.error || 'No Google Business Profile or Places credentials resolved a location',
      limitation:
        gbp?.limitation ||
        'Configure GOOGLE_BUSINESS_ACCOUNT_ID + GOOGLE_BUSINESS_LOCATION_ID + OAuth, or GOOGLE_PLACE_ID + GOOGLE_PLACES_API_KEY',
    })
    return unavailable
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const failed = emptyPayload(cms, { error: message })
    // Keep stale cache if present on hard failure
    const stale = (() => {
      try {
        const p = cachePath()
        if (!fs.existsSync(p)) return null
        const raw = JSON.parse(fs.readFileSync(p, 'utf8')) as GoogleReviewsPayload
        return raw.reviews?.length ? { ...raw, error: message } : null
      } catch {
        return null
      }
    })()
    return stale || failed
  }
}
