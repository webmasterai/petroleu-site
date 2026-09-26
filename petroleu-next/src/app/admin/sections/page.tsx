'use client'

import { Suspense } from 'react'
import Page from '@/legacy-pages/admin/AdminSectionsPage'
import AdminLayout from '@/legacy-pages/admin/AdminLayout'

export default function RoutePage() {
  return (
    <AdminLayout>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <Page />
      </Suspense>
    </AdminLayout>
  )
}
