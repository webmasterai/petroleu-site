const DEFAULT_DOCS_PATH = "/documentation"

export function getDocumentationUrl() {
  return (
    import.meta.env.VITE_DOCUMENTATION_URL ||
    import.meta.env.VITE_DOCS_URL ||
    DEFAULT_DOCS_PATH
  )
}
