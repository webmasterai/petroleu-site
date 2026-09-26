import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ResourceThumbnail } from './ResourceThumbnail'

const actionClassName =
  'mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-orange-600'

/** Article card: featured image, date, title, excerpt, Read More — no video UI. */
export function BlogCard({ post }) {
  return (
    <article className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-lg">
      <Link to={`/blog/${post.slug}`} className="block shrink-0" aria-label={post.title}>
        <ResourceThumbnail post={post} />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        {post.date && (
          <time className="text-xs text-muted-foreground">{post.date}</time>
        )}
        <h2
          className={`text-lg font-semibold leading-snug text-foreground ${post.date ? 'mt-2' : ''}`}
        >
          {post.title}
        </h2>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {post.description}
        </p>
        <Link to={`/blog/${post.slug}`} className={actionClassName}>
          Read More
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
