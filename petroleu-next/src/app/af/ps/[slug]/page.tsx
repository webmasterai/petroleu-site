'use client'

import { use, type ComponentType } from 'react'
import CmsMarketingPage from '@/legacy-pages/marketing/CmsMarketingPage'

type CmsPageProps = { slug?: string }

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const CmsPage = CmsMarketingPage as unknown as ComponentType<CmsPageProps>
  return <CmsPage slug={slug} />
}
