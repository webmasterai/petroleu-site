/**
 * Renders legal page body text with simple ## / ### headings and paragraphs.
 */
export function LegalContent({ content = '' }) {
  if (!content.trim()) {
    return <p className="text-muted-foreground">Content coming soon.</p>
  }

  const blocks = content.split(/\n\n+/).filter(Boolean)

  return (
    <div className="max-w-none">
      {blocks.map((block, index) => {
        const trimmed = block.trim()
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={index} className="mt-10 text-xl font-semibold text-foreground first:mt-0">
              {trimmed.slice(3).trim()}
            </h2>
          )
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={index} className="mt-6 text-lg font-semibold text-foreground">
              {trimmed.slice(4).trim()}
            </h3>
          )
        }
        if (trimmed.startsWith('- ')) {
          const items = trimmed.split('\n').map((line) => line.replace(/^-+\s*/, '').trim()).filter(Boolean)
          return (
            <ul key={index} className="my-4 list-disc space-y-2 pl-6 text-muted-foreground">
              {items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={index} className="my-4 leading-relaxed text-muted-foreground">
            {trimmed}
          </p>
        )
      })}
    </div>
  )
}

export default LegalContent
