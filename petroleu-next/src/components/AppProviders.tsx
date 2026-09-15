'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Suspense, useState, type ReactNode } from 'react'
import { MarketLocaleProvider } from '@/context/MarketLocaleContext'
import { DocumentLocaleEffect } from '@/components/DocumentLocaleEffect'
import { MarketLanguageSwitcher } from '@/components/marketing/MarketLanguageSwitcher'

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
      }),
  )

  return (
    <QueryClientProvider client={client}>
      <Suspense fallback={null}>
        <MarketLocaleProvider>
          <DocumentLocaleEffect />
          {children}
          <MarketLanguageSwitcher />
          <Toaster position="top-center" />
        </MarketLocaleProvider>
      </Suspense>
    </QueryClientProvider>
  )
}
