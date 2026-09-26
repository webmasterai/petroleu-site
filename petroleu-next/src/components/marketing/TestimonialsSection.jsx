import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { Quote, Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { websiteContent } from '../../content/websiteContent'
import { useSectionHeading } from '../../hooks/useSectionHeading'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { useCmsList } from '../../hooks/useCmsList'

/**
 * Reviews section:
 * 1) Prefer live Google reviews from /api/google-reviews (Business Profile / Places)
 * 2) Fall back to CMS testimonials (never labeled as Google)
 */

function StarRating({ rating }) {
  const n = Math.round(Number(rating) || 0)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= n ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

function formatReviewDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  try {
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return d.toISOString().slice(0, 10)
  }
}

const GoogleGlyph = (props) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

export function TestimonialsSection() {
  const { isAfghanistan, locale } = useMarketLocale()
  const { items: cmsData, fromCms } = useCmsList(['testimonials'], '/testimonials', {
    fallback: [],
  })
  const heading = useSectionHeading('testimonials', {
    title: websiteContent.testimonials.title || 'Trusted by Fuel Station Owners Across Pakistan',
    subtitle:
      websiteContent.testimonials.subtitle ||
      'Join thousands of satisfied customers from Karachi to Peshawar, Lahore to Quetta',
  })

  const [google, setGoogle] = useState(null)
  const [googleLoading, setGoogleLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setGoogleLoading(true)
      try {
        const res = await fetch('/api/google-reviews', { headers: { Accept: 'application/json' } })
        const json = await res.json()
        if (!cancelled) setGoogle(json?.data || null)
      } catch {
        if (!cancelled) setGoogle(null)
      } finally {
        if (!cancelled) setGoogleLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const cmsReviews = fromCms
    ? cmsData
        .map((t) => ({
          id: t.id || `${t.name}-${t.content}`,
          name: String(t.name || t.author_name || t.title || '').trim(),
          role: String(t.role || t.author_role || t.link_label || '').trim(),
          city: String(t.city || '').trim(),
          rating: Number(t.rating) || 5,
          date: t.review_date || t.date || '',
          content: String(t.content || t.quote || t.body || t.description || '').trim(),
          photo: null,
          source: 'cms',
        }))
        .filter((t) => t.name && t.content && t.content !== '""' && t.content !== '?')
    : []

  const googleReviews = Array.isArray(google?.reviews)
    ? google.reviews
        .map((r) => ({
          id: r.reviewId,
          name: r.reviewerName,
          role: '',
          city: '',
          rating: r.starRating,
          date: formatReviewDate(r.createTime || r.updateTime),
          content: r.comment || '',
          photo: r.reviewerPhotoUrl || null,
          source: 'google',
        }))
        .filter((r) => r.name && (r.content || r.rating))
    : []

  const usingGoogle = googleReviews.length > 0 && google?.source !== 'unavailable'
  const fallbackCms =
    String(heading.raw?.data?.google_fallback_cms || 'true').toLowerCase() !== 'false'
  const reviews = usingGoogle ? googleReviews : fallbackCms ? cmsReviews : []
  const reviewSource = usingGoogle ? 'google' : 'cms'

  const rating = usingGoogle
    ? google?.rating != null
      ? Number(google.rating)
      : null
    : null
  const totalCount = usingGoogle
    ? google?.totalReviewCount != null
      ? Number(google.totalReviewCount)
      : googleReviews.length
    : null

  const listingUrl =
    (usingGoogle && google?.listingUrl) ||
    heading.raw?.data?.google_listing_url ||
    websiteContent.brand.googleReviewUrl ||
    ''

  const sectionTitle =
    heading.title ||
    (isAfghanistan
      ? 'Trusted by Fuel Station Owners Across Afghanistan'
      : 'Trusted by Fuel Station Owners Across Pakistan')
  const sectionSubtitle =
    heading.subtitle ||
    (isAfghanistan
      ? 'Stations across Kabul, Herat, Mazar-e-Sharif, and beyond rely on Petroleu'
      : 'Join thousands of satisfied customers from Karachi to Peshawar, Lahore to Quetta')

  const badgeLabel =
    reviewSource === 'google'
      ? locale === 'fa-AF'
        ? 'نظرات گوگل'
        : locale === 'ps-AF'
          ? 'Google نظرات'
          : 'Google Reviews'
      : locale === 'fa-AF'
        ? 'نظرات مشتریان'
        : locale === 'ps-AF'
          ? 'د پیرودونکو نظرونه'
          : 'Customer Testimonials'

  const [activeIndex, setActiveIndex] = useState(0)
  const [slidesPerView, setSlidesPerView] = useState(3)
  const [slideWidth, setSlideWidth] = useState(0)
  const touchStartX = useRef(null)
  const viewportRef = useRef(null)
  const gap = 32

  useEffect(() => {
    const updateSlidesPerView = () => {
      if (window.innerWidth >= 1024) setSlidesPerView(3)
      else if (window.innerWidth >= 768) setSlidesPerView(2)
      else setSlidesPerView(1)
    }
    updateSlidesPerView()
    window.addEventListener('resize', updateSlidesPerView)
    return () => window.removeEventListener('resize', updateSlidesPerView)
  }, [])

  useLayoutEffect(() => {
    const measure = () => {
      if (!viewportRef.current) return
      const width = viewportRef.current.clientWidth
      setSlideWidth((width - gap * (slidesPerView - 1)) / slidesPerView)
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (viewportRef.current) observer.observe(viewportRef.current)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [slidesPerView, reviews.length])

  const maxIndex = Math.max(0, reviews.length - slidesPerView)

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, maxIndex))
  }, [maxIndex])

  const goPrev = () => setActiveIndex((index) => Math.max(0, index - 1))
  const goNext = () => setActiveIndex((index) => Math.min(maxIndex, index + 1))

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 50) goNext()
    else if (diff < -50) goPrev()
    touchStartX.current = null
  }

  if (googleLoading && !reviews.length) {
    return (
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          Loading reviews…
        </div>
      </section>
    )
  }

  if (!reviews.length) return null

  const cardWidth =
    slideWidth > 0 ? slideWidth : `calc((100% - ${(slidesPerView - 1) * gap}px) / ${slidesPerView})`

  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-border bg-card px-6 py-3 shadow-sm">
            {reviewSource === 'google' ? <GoogleGlyph className="h-7 w-7" /> : null}
            <span className="text-lg font-semibold text-foreground">{badgeLabel}</span>
          </div>

          {reviewSource === 'google' && rating != null ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-5xl font-bold text-foreground">
                  {Number(rating).toFixed(1)}
                </span>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 ${
                          star <= Math.round(Number(rating) || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  {totalCount != null ? (
                    <span className="text-sm text-muted-foreground">
                      Based on {totalCount} Google reviews
                    </span>
                  ) : null}
                </div>
              </div>
              {google?.limitation ? (
                <p className="max-w-xl text-[10px] text-muted-foreground">{google.limitation}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Showing CMS customer testimonials
              {google?.error ? ' (Google reviews unavailable)' : ''}
            </p>
          )}

          <h2 className="mt-6 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            {sectionTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            {sectionSubtitle}
          </p>
        </div>

        <div className="relative flex items-center gap-3 sm:gap-6" dir="ltr">
          {reviews.length > slidesPerView ? (
            <button
              type="button"
              onClick={goPrev}
              disabled={activeIndex === 0}
              aria-label="Previous review"
              className="z-20 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : null}

          <div
            ref={viewportRef}
            className="min-w-0 flex-1 overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="flex gap-8 transition-transform duration-300 ease-in-out will-change-transform"
              style={{
                transform:
                  slideWidth > 0
                    ? `translateX(-${activeIndex * (slideWidth + gap)}px)`
                    : undefined,
              }}
            >
              {reviews.map((review, index) => (
                <div
                  key={`${review.id || review.name}-${index}`}
                  className="w-full max-w-full shrink-0"
                  style={{ width: cardWidth, minWidth: 0 }}
                >
                  <div
                    className="relative flex h-[270px] flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-shadow duration-300 hover:shadow-lg"
                    dir={locale === 'fa-AF' || locale === 'ps-AF' ? 'rtl' : 'ltr'}
                  >
                    <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
                      <StarRating rating={review.rating} />
                      {review.date ? (
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      ) : null}
                    </div>

                    <Quote className="pointer-events-none absolute end-4 top-4 h-6 w-6 text-primary/10" />

                    <p className="line-clamp-4 shrink-0 pe-6 text-start text-sm leading-relaxed text-foreground">
                      {review.content ? <>&ldquo;{review.content}&rdquo;</> : null}
                    </p>

                    <div className="mt-auto flex shrink-0 items-center gap-3 border-t border-border pt-3">
                      {review.photo ? (
                        <img
                          src={review.photo}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <span className="text-sm font-semibold">
                            {(review.name || '?').charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1 text-start">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {review.name}
                        </p>
                        {review.role ? (
                          <p className="truncate text-xs text-muted-foreground">{review.role}</p>
                        ) : null}
                      </div>
                      {review.city ? (
                        <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{review.city}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {reviews.length > slidesPerView ? (
            <button
              type="button"
              onClick={goNext}
              disabled={activeIndex >= maxIndex}
              aria-label="Next review"
              className="z-20 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        {listingUrl ? (
          <div className="mt-12 text-center">
            <a
              href={listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {reviewSource === 'google' ? <GoogleGlyph className="h-5 w-5" /> : null}
              {reviewSource === 'google' ? 'View all on Google' : 'Leave a Google Review'}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default TestimonialsSection
