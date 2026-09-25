import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '@/components/AppProviders'
import { ensureSeedData } from '@/lib/storage/ensureSeed'
import { SITE_ORIGIN } from '@/config/siteSeo'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: 'Petroleu — Petrol Pump Software Pakistan | Fuel Station Management',
    template: '%s | Petroleu',
  },
  description:
    'Petroleu: cloud petrol pump management for Pakistan — real-time stock, nozzle sales, dipping, customer credit, payroll & financial reports.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Petroleu',
    url: SITE_ORIGIN,
    locale: 'en_PK',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await ensureSeedData()
  return (
    <html lang="en-PK" suppressHydrationWarning>
      <body className="min-w-0 overflow-x-hidden bg-background text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
