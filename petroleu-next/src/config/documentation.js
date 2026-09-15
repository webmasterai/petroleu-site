const DEFAULT_DOCS_PATH = "/documentation"

export function getDocumentationUrl() {
  return (
    process.env.NEXT_PUBLIC_DOCUMENTATION_URL ||
    process.env.NEXT_PUBLIC_DOCS_URL ||
    DEFAULT_DOCS_PATH
  )
}
