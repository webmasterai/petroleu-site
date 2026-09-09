/** Base URL for the PMS application (login / app handoff). */
export const PMS_APP_URL = String(import.meta.env.VITE_PMS_APP_URL || '').replace(/\/+$/, '')

/** Link into the PMS app, or `/contact` when VITE_PMS_APP_URL is unset. */
export function pmsAppHref(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (PMS_APP_URL) return `${PMS_APP_URL}${normalized}`
  return '/contact'
}
