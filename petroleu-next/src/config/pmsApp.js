/** Safe env read for Vite + Next (import.meta.env may be undefined in Next prod). */
function readEnv(name) {
  try {
    const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined
    if (viteEnv && typeof viteEnv === 'object' && viteEnv[name] != null && viteEnv[name] !== '') {
      return String(viteEnv[name])
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name] != null) {
      return String(process.env[name])
    }
  } catch {
    /* ignore */
  }
  return ''
}

/** Base URL for the PMS application (login / app handoff). */
export const PMS_APP_URL = String(
  readEnv('VITE_PMS_APP_URL') || readEnv('NEXT_PUBLIC_PMS_APP_URL') || '',
).replace(/\/+$/, '')

/** Link into the PMS app, or `/contact` when PMS app URL is unset. */
export function pmsAppHref(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (PMS_APP_URL) return `${PMS_APP_URL}${normalized}`
  return '/contact'
}
