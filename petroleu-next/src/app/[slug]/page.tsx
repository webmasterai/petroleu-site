'use client'

import { use, type ComponentType } from 'react'
import CmsMarketingPage from '@/legacy-pages/marketing/CmsMarketingPage'

type CmsPageProps = { slug?: string }

/** Catch-all for CMS pages created in admin (e.g. /services). Known routes take precedence. */
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const CmsPage = CmsMarketingPage as unknown as ComponentType<CmsPageProps>
  return <CmsPage slug={slug} />
}
