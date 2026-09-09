/** Prefix internal paths for the active market (e.g. /features → /af/features). */
export function marketPath(path, routePrefix = '') {
  if (!path) return routePrefix || '/'
  if (
    path.startsWith('http') ||
    path.startsWith('mailto:') ||
    path.startsWith('tel:') ||
    path.startsWith('https://wa.me')
  ) {
    return path
  }
  if (!routePrefix) {
    return path.startsWith('/') ? path : `/${path}`
  }
  if (path === '/') return routePrefix
  if (path.startsWith('/#')) return `${routePrefix}${path}`
  if (path.startsWith('#')) return `${routePrefix}/${path}`
  if (path.startsWith(routePrefix)) return path
  if (path.startsWith('/af')) return path
  return `${routePrefix}${path.startsWith('/') ? path : `/${path}`}`
}
