import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { ResourceThumbnail } from '../../components/marketing/ResourceThumbnail'
import { getYouTubeEmbedUrl, isLocalVideoUrl } from '../../utils/videoUtils'
import { BlogCard } from '../../components/marketing/BlogCard'
import { MButton, MBadge } from '../../components/marketing/ui'
import { getResourceBySlug, getRelatedResources } from '../../content/resources'

export default function BlogDetailPage() {
  const { slug } = useParams()
  const resource = getResourceBySlug(slug)

  if (!resource) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <MarketingSeo path={`/blog/${slug || ''}`} title="Resource Not Found — Petroleu" />
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-4 py-24">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-foreground">Resource not found</h1>
            <p className="mt-3 text-muted-foreground">
              This guide may have moved or is not available yet.
            </p>
            <Link to="/blog" className="mt-8 inline-block">
              <MButton>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Resources
              </MButton>
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const related = getRelatedResources(resource)
  const videoEmbedUrl = getYouTubeEmbedUrl(resource.videoUrl)
  const showLocalVideo = !videoEmbedUrl && isLocalVideoUrl(resource.videoUrl)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo
        path={`/blog/${resource.slug}`}
        title={`${resource.title} — Petroleu Resources`}
        description={resource.description}
      />
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-orange-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Resources
            </Link>
            <MBadge variant="secondary" className="mt-6">
              {resource.category}
            </MBadge>
            <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {resource.title}
            </h1>
            {resource.date && (
              <time className="mt-3 block text-sm text-muted-foreground">{resource.date}</time>
            )}
            <p className="mt-4 text-pretty text-lg text-muted-foreground">{resource.description}</p>
          </div>
        </section>

        <section className="py-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {videoEmbedUrl ? (
              <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-black">
                <iframe
                  src={videoEmbedUrl}
                  title={resource.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : showLocalVideo ? (
              <video
                controls
                preload="metadata"
                poster={resource.thumbnailUrl || undefined}
                className="w-full rounded-2xl border border-border"
              >
                <source src={resource.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border">
                <ResourceThumbnail post={resource} className="rounded-t-2xl" />
              </div>
            )}
          </div>
        </section>

        <section className="pb-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
              {(resource.content?.trim()
                ? resource.content.split('\n\n')
                : [resource.description]
              ).map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-12">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-foreground">
              Ready to manage your petrol pump with Petroleu?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Explore nozzle readings, tank monitoring, credit billing, daily closing, and smart
              reports in one platform.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/get-started">
                <MButton>Get Started</MButton>
              </Link>
              <Link to="/contact">
                <MButton variant="outline">Contact Sales</MButton>
              </Link>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
                Related Resources
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {related.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
