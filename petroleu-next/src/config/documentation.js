const DEFAULT_DOCS_PATH = '/documentation'

function readEnv(name) {
  try {
    const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined
    if (viteEnv && typeof viteEnv === 'object' && viteEnv[name]) {
      return String(viteEnv[name])
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return String(process.env[name])
    }
  } catch {
    /* ignore */
  }
  return ''
}

export function getDocumentationUrl() {
  return (
    readEnv('VITE_DOCUMENTATION_URL') ||
    readEnv('VITE_DOCS_URL') ||
    readEnv('NEXT_PUBLIC_DOCUMENTATION_URL') ||
    readEnv('NEXT_PUBLIC_DOCS_URL') ||
    DEFAULT_DOCS_PATH
  )
}
