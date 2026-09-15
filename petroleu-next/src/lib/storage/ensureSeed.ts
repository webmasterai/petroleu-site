import { promises as fs } from 'fs'
import path from 'path'
import { getDataRoot } from '../storage/jsonStore'

/** Copy storage-seed → storage/data only when data dir is empty (no overwrite). */
export async function ensureSeedData(): Promise<{ seeded: boolean; reason: string }> {
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
  if (hasJson) {
    return { seeded: false, reason: 'existing data present' }
  }

  try {
    await fs.access(seedRoot)
  } catch {
    return { seeded: false, reason: 'no storage-seed folder' }
  }

  const seedFiles = await fs.readdir(seedRoot)
  for (const file of seedFiles) {
    if (!file.endsWith('.json')) continue
    await fs.copyFile(path.join(seedRoot, file), path.join(dataRoot, file))
  }
  return { seeded: true, reason: 'copied from storage-seed' }
}
