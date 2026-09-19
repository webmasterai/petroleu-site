import { promises as fs } from 'fs'
import path from 'path'

const DEFAULT_ROOT = path.join(process.cwd(), 'storage', 'data')

/** Per-file write queue to avoid concurrent corrupt JSON. */
const writeLocks = new Map<string, Promise<void>>()

export function getDataRoot(): string {
  return process.env.CMS_DATA_DIR || DEFAULT_ROOT
}

function filePath(name: string): string {
  const base = name.endsWith('.json') ? name : `${name}.json`
  const full = path.join(getDataRoot(), base)
  const root = path.resolve(getDataRoot())
  if (!full.startsWith(root)) {
    throw new Error('Invalid storage path')
  }
  return full
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(getDataRoot(), { recursive: true })
}

async function withWriteLock(target: string, fn: () => Promise<void>): Promise<void> {
  const prev = writeLocks.get(target) || Promise.resolve()
  let release!: () => void
  const next = new Promise<void>((r) => {
    release = r
  })
  writeLocks.set(
    target,
    prev.then(() => next),
  )
  await prev
  try {
    await fn()
  } finally {
    release()
    if (writeLocks.get(target) === next) writeLocks.delete(target)
  }
}

/** Atomic JSON write: temp file then rename. */
export async function writeJson<T>(name: string, data: T): Promise<void> {
  await ensureDir()
  const target = filePath(name)
  await withWriteLock(target, async () => {
    const tmp = `${target}.${process.pid}.${Date.now()}.tmp`
    const payload = JSON.stringify(data, null, 2)
    await fs.writeFile(tmp, payload, 'utf8')
    await fs.rename(tmp, target)
  })
}

export async function readJson<T>(name: string, fallback: T): Promise<T> {
  await ensureDir()
  const target = filePath(name)
  try {
    const raw = await fs.readFile(target, 'utf8')
    const trimmed = raw.trim()
    if (!trimmed) return fallback
    return JSON.parse(trimmed) as T
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException)?.code
    if (code === 'ENOENT') return fallback
    if (err instanceof SyntaxError) return fallback
    throw err
  }
}

export async function findAll<T>(name: string): Promise<T[]> {
  return readJson<T[]>(name, [])
}

export async function findById<T extends { id: number | string }>(
  name: string,
  id: number | string,
): Promise<T | null> {
  const rows = await findAll<T>(name)
  return rows.find((r) => String(r.id) === String(id)) || null
}

export async function findWhere<T>(
  name: string,
  pred: (row: T) => boolean,
): Promise<T[]> {
  const rows = await findAll<T>(name)
  return rows.filter(pred)
}

export async function createRow<T extends Record<string, unknown> & { id?: number }>(
  name: string,
  row: Omit<T, 'id'> & { id?: number },
): Promise<T> {
  const rows = await findAll<T>(name)
  const nextId =
    row.id ??
    (rows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1)
  const created = { ...row, id: nextId } as T
  rows.push(created)
  await writeJson(name, rows)
  return created
}

export async function updateRow<T extends Record<string, unknown> & { id: number | string }>(
  name: string,
  id: number | string,
  patch: Partial<T>,
): Promise<T | null> {
  const rows = await findAll<T>(name)
  const idx = rows.findIndex((r) => String(r.id) === String(id))
  if (idx < 0) return null
  rows[idx] = { ...rows[idx], ...patch, id: rows[idx].id }
  await writeJson(name, rows)
  return rows[idx]
}

export async function deleteRow(name: string, id: number | string): Promise<boolean> {
  const rows = await findAll<{ id: number | string }>(name)
  const next = rows.filter((r) => String(r.id) !== String(id))
  if (next.length === rows.length) return false
  await writeJson(name, next)
  return true
}

export async function replaceAll<T>(name: string, rows: T[]): Promise<void> {
  await writeJson(name, rows)
}
