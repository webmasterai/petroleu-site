import axios from 'axios'

/**
 * Resolve CMS API base for both Vite (import.meta.env) and Next.js (no Vite env).
 * Next production bundles leave `import.meta.env` undefined — reading
 * `.VITE_CMS_API_BASE_URL` directly throws and crashes the whole app.
 */
function resolveCmsApiBase() {
  let fromVite
  try {
    const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined
    if (viteEnv && typeof viteEnv === 'object') {
      fromVite = viteEnv.VITE_CMS_API_BASE_URL
    }
  } catch {
    fromVite = undefined
  }

  let fromNext
  try {
    if (typeof process !== 'undefined' && process.env) {
      fromNext = process.env.NEXT_PUBLIC_CMS_API_BASE_URL || process.env.VITE_CMS_API_BASE_URL
    }
  } catch {
    fromNext = undefined
  }

  const raw = fromVite || fromNext || '/api/cms'
  return String(raw).replace(/\/+$/, '')
}

const normalizedBase = resolveCmsApiBase()

export const cmsApi = axios.create({
  baseURL: normalizedBase,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

function withMarketParams(config = {}, marketLocale) {
  if (!marketLocale) return config
  return {
    ...config,
    params: {
      market: marketLocale.market,
      locale: marketLocale.locale,
      ...(config.params || {}),
    },
  }
}

/** Public CMS GET (no admin token). Pass marketLocale to scope content. */
export async function cmsGet(path, config = {}, marketLocale) {
  const res = await cmsApi.get(
    path,
    withMarketParams(
      {
        ...config,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          ...(config.headers || {}),
        },
      },
      marketLocale,
    ),
  )
  const body = res.data
  if (body?.data !== undefined) return body.data
  return body
}

/** Public CMS POST (contact, demo request). */
export async function cmsPost(path, body, config = {}) {
  const res = await cmsApi.post(path, body, config)
  return res.data
}

/** POST without throwing on 4xx — readable status + JSON body. */
export async function cmsPostWithHttpStatus(path, body, config = {}) {
  const res = await cmsApi.post(path, body, {
    ...config,
    validateStatus: () => true,
  })
  return { status: res.status, data: res.data }
}
