import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '@/components/AppProviders'
import { ensureSeedData } from '@/lib/storage/ensureSeed'

export const metadata: Metadata = {
  title: 'Petroleu — Petrol Pump Software',
  description: 'Petrol pump management software for Pakistan and Afghanistan.',
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
