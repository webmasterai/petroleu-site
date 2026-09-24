'use client'

import { use, type ComponentType } from 'react'
import CmsMarketingPage from '@/legacy-pages/marketing/CmsMarketingPage'
import CityLandingPage from '@/legacy-pages/marketing/CityLandingPage'
import { isCityLandingSlug } from '@/content/cityLandingContent'

type CmsPageProps = { slug?: string }

/**
 * Catch-all for CMS pages and Pakistan city landings.
 * City URLs use a single segment (e.g. /petrol-pump-software-rawalpindi).
 * Known city slugs render CityLandingPage; other slugs use CmsMarketingPage.
 */
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  if (isCityLandingSlug(slug)) {
    const CityPage = CityLandingPage as unknown as ComponentType<CmsPageProps>
    return <CityPage slug={slug} />
  }
  const CmsPage = CmsMarketingPage as unknown as ComponentType<CmsPageProps>
  return <CmsPage slug={slug} />
}
