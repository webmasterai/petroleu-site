import { findAll, writeJson } from '../storage/jsonStore'
import { hashPassword, type CmsUser } from './session'

/**
 * If users.json is empty, create one bootstrap CMS admin.
 * Prefer CMS_ADMIN_EMAIL / CMS_ADMIN_PASSWORD env; otherwise documented defaults.
 * Never overwrites existing users.
 */
export async function ensureDefaultAdmin(): Promise<{
  created: boolean
  email?: string
  reason: string
}> {
  const users = await findAll<CmsUser>('users')
  if (users.length > 0) {
    return { created: false, reason: 'users already present' }
  }

  const email = (process.env.CMS_ADMIN_EMAIL || 'admin@petroleu.local').trim().toLowerCase()
  const password = process.env.CMS_ADMIN_PASSWORD || 'PetroleuAdmin123!'
  const name = process.env.CMS_ADMIN_NAME || 'CMS Admin'

  if (password.length < 8) {
    return { created: false, reason: 'CMS_ADMIN_PASSWORD too short' }
  }

  const row: CmsUser = {
    id: 1,
    name,
    email,
    passwordHash: await hashPassword(password),
    role: 'super_admin',
    isActive: true,
    assignedMarkets: null,
    assignedLocales: null,
  }

  await writeJson('users', [row])
  console.info(`[cms] Bootstrap admin created: ${email}`)
  return { created: true, email, reason: 'created bootstrap admin' }
}
