import { Link } from 'react-router-dom'
import { getHomepageResources } from '../../content/resources'
import { BlogCard } from './BlogCard'
import { MButton } from './ui'

export function BlogPreviewSection() {
  const homepageResources = getHomepageResources()

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Latest From Petroleu
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            Watch product videos and read practical guides about petrol pump software, automation,
            reporting, and fuel station management.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {homepageResources.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/blog">
            <MButton>View All Resources</MButton>
          </Link>
        </div>
      </div>
    </section>
  )
}
