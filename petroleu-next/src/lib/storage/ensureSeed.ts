import { promises as fs } from 'fs'
import path from 'path'
import { ensureDefaultAdmin } from '../auth/ensureAdmin'
import { getDataRoot } from '../storage/jsonStore'

async function copySeedFiles(seedRoot: string, dataRoot: string, overwrite: boolean) {
  const seedFiles = await fs.readdir(seedRoot)
  for (const file of seedFiles) {
    if (!file.endsWith('.json')) continue
    if (overwrite && file === 'users.json') continue
    const dest = path.join(dataRoot, file)
    if (!overwrite) {
      await fs.copyFile(path.join(seedRoot, file), dest)
      continue
    }
    await fs.copyFile(path.join(seedRoot, file), dest)
  }
}

/** Copy storage-seed → storage/data when empty, or when CMS_FORCE_RESEED=true (keeps users.json). */
export async function ensureSeedData(): Promise<{
  seeded: boolean
  reason: string
  admin?: { created: boolean; email?: string; reason: string }
}> {
  const dataRoot = getDataRoot()
  const seedRoot = path.join(process.cwd(), 'storage-seed')
  await fs.mkdir(dataRoot, { recursive: true })
  await fs.mkdir(path.join(process.cwd(), 'storage', 'uploads'), { recursive: true })

  let entries: string[] = []
  try {
    entries = await fs.readdir(dataRoot)
  } catch {
    entries = []
  }
  const hasJson = entries.some((e) => e.endsWith('.json'))
  const force = String(process.env.CMS_FORCE_RESEED || '').toLowerCase() === 'true'
  let seeded = false
  let reason = 'existing data present'

  try {
    await fs.access(seedRoot)
    if (!hasJson) {
      await copySeedFiles(seedRoot, dataRoot, false)
      seeded = true
      reason = 'copied from storage-seed'
    } else if (force) {
      await copySeedFiles(seedRoot, dataRoot, true)
      seeded = true
      reason = 'force reseed (users preserved)'
    }
  } catch {
    if (!hasJson) reason = 'no storage-seed folder'
  }

  const admin = await ensureDefaultAdmin()
  return { seeded, reason, admin }
}
