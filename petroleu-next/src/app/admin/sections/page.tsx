'use client'

import Page from '@/legacy-pages/admin/AdminSectionsPage'
import AdminLayout from '@/legacy-pages/admin/AdminLayout'

export default function RoutePage() {
  return (
    <AdminLayout>
      <Page />
    </AdminLayout>
  )
}
