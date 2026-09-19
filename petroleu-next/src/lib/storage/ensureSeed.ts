import { promises as fs } from 'fs'
import path from 'path'
import { ensureDefaultAdmin } from '../auth/ensureAdmin'
import { getDataRoot } from '../storage/jsonStore'

/** Copy storage-seed → storage/data only when data dir is empty (never overwrite). */
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
  let seeded = false
  let reason = 'existing data present'

  if (!hasJson) {
    try {
      await fs.access(seedRoot)
      const seedFiles = await fs.readdir(seedRoot)
      for (const file of seedFiles) {
        if (!file.endsWith('.json')) continue
        await fs.copyFile(path.join(seedRoot, file), path.join(dataRoot, file))
      }
      seeded = true
      reason = 'copied from storage-seed'
    } catch {
      reason = 'no storage-seed folder'
    }
  }

  // Always ensure at least one CMS admin exists (safe if users already present).
  const admin = await ensureDefaultAdmin()
  return { seeded, reason, admin }
}
