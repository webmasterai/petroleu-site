/** Map CMS blog API records to the BlogCard / resources shape. */
export function mapCmsBlogPost(post) {
  if (!post) return null
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.excerpt || '',
    content: post.content || '',
    date: post.published_at
      ? new Date(post.published_at).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : '',
    thumbnailUrl: post.image_url || post.og_image || null,
    thumbnailLabel: post.title,
    image_alt: post.image_alt || post.title,
    videoUrl: post.video_url || null,
    duration: post.duration || null,
    mediaType: post.media_type || 'article',
    type: post.media_type || 'article',
    category: Array.isArray(post.tags) && post.tags[0] ? post.tags[0] : 'Guide',
    author: post.author || 'Petroleu',
    showOnHomepage: !!post.show_on_homepage,
    published: post.status === 'published',
    seoTitle: post.seo_title,
    seoDescription: post.seo_description,
    canonicalUrl: post.canonical_url,
    relatedSlugs: post.related_slugs || [],
    coverType: post.media_type === 'video' ? 'video' : 'image',
  }
}

export function sanitizeCmsText(value) {
  if (value == null) return ''
  return String(value)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Resolve a CMS list for rendering.
 *
 * - isSuccess + array (including []) → use CMS (empty means render nothing)
 * - isError → optional resilience fallback
 * - still loading → empty (never invent defaults while loading)
 */
export function resolveCmsArray(
  data,
  { isSuccess = false, isError = false, isFetched = false, fallback = [] } = {},
) {
  if (isSuccess && Array.isArray(data)) return data
  if (isError) return fallback
  // Legacy callers that only pass isFetched
  if (isFetched && Array.isArray(data)) return data
  if (isFetched && !Array.isArray(data)) return fallback
  return []
}
