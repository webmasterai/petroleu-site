/**
 * Inventory + safe Media Library import for frontend images.
 *
 * Default: dry-run inventory + report (no CMS URL rewrites).
 *   node scripts/import-frontend-images-to-media.mjs
 *
 * Copy local public assets into storage/uploads + media.json (keeps original public paths serving):
 *   node scripts/import-frontend-images-to-media.mjs --import-local
 *
 * Optionally rewrite CMS image_url fields to /uploads/... ONLY after import verified:
 *   node scripts/import-frontend-images-to-media.mjs --import-local --rewrite-cms
 *
 * Does NOT delete original public files. Does NOT touch production automatically.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dataDir = path.join(root, 'storage', 'data')
const uploadDir = path.join(root, 'storage', 'uploads')
const publicDir = path.join(root, 'public')

const args = new Set(process.argv.slice(2))
const doImport = args.has('--import-local')
const doRewrite = args.has('--rewrite-cms')

function readJson(name) {
  const p = path.join(dataDir, name)
  if (!fs.existsSync(p)) return []
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function writeJson(name, rows) {
  const p = path.join(dataDir, name)
  fs.writeFileSync(p, JSON.stringify(rows, null, 2) + '\n', 'utf8')
}

function walkCollect(value, bag, ctx = '') {
  if (value == null) return
  if (typeof value === 'string') {
    const s = value.trim()
    if (
      /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(s) ||
      s.includes('/uploads/') ||
      s.startsWith('/images/') ||
      s.startsWith('/resources/') ||
      /^https?:\/\//i.test(s)
    ) {
      bag.push({ url: s, ctx })
    }
    return
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => walkCollect(v, bag, `${ctx}[${i}]`))
    return
  }
  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (
        /image|img|photo|thumb|poster|logo|icon|url|src|avatar|cover/i.test(k) ||
        typeof v === 'object'
      ) {
        walkCollect(v, bag, ctx ? `${ctx}.${k}` : k)
      }
    }
  }
}

function mimeFor(file) {
  const ext = path.extname(file).toLowerCase()
  const map = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  }
  return map[ext] || 'application/octet-stream'
}

function listPublicImageFiles(dir, base = '') {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, ent.name).replace(/\\/g, '/')
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...listPublicImageFiles(full, rel))
    else if (/\.(png|jpe?g|webp|gif|svg)$/i.test(ent.name)) out.push('/' + rel)
  }
  return out
}

const sections = readJson('sections.json')
const posts = readJson('blog-posts.json')
const media = readJson('media.json')
const existingUrls = new Set(media.map((m) => m.url).filter(Boolean))

const discovered = []
sections.forEach((s, i) => {
  walkCollect(s.image_url, discovered, `sections[${i}].image_url`)
  walkCollect(s.data, discovered, `sections[${i}].data`)
})
posts.forEach((p, i) => {
  walkCollect(p.image_url, discovered, `blog-posts[${i}].image_url`)
})

const publicFiles = [
  ...listPublicImageFiles(path.join(publicDir, 'images'), 'images'),
  ...listPublicImageFiles(path.join(publicDir, 'resources'), 'resources'),
]

const uniqueUrls = [...new Set(discovered.map((d) => d.url))]
const localPublic = uniqueUrls.filter((u) => u.startsWith('/images/') || u.startsWith('/resources/'))
const uploads = uniqueUrls.filter((u) => u.startsWith('/uploads/'))
const external = uniqueUrls.filter((u) => /^https?:\/\//i.test(u))
const missingLocal = localPublic.filter((u) => !fs.existsSync(path.join(publicDir, u.replace(/^\//, ''))))

const map = []
let imported = 0

if (doImport) {
  fs.mkdirSync(uploadDir, { recursive: true })
  const stamp = Date.now()
  // Backup media.json
  const backupDir = path.join(root, 'storage', 'backups', `media-import-${new Date().toISOString().replace(/[:.]/g, '-')}`)
  fs.mkdirSync(backupDir, { recursive: true })
  fs.copyFileSync(path.join(dataDir, 'media.json'), path.join(backupDir, 'media.json'))

  let nextId = media.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1

  for (const pubPath of [...new Set([...localPublic, ...publicFiles])]) {
    const abs = path.join(publicDir, pubPath.replace(/^\//, ''))
    if (!fs.existsSync(abs)) {
      map.push({ old: pubPath, new: null, status: 'missing_on_disk', verified: false })
      continue
    }
    const already = media.find((m) => m.source_public_path === pubPath || m.alt_text === `imported:${pubPath}`)
    if (already) {
      map.push({ old: pubPath, new: already.url, status: 'already_in_media', verified: true })
      continue
    }
    const base = path.basename(pubPath)
    const safe = `${stamp}-${base.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const dest = path.join(uploadDir, safe)
    fs.copyFileSync(abs, dest)
    const url = `/uploads/${safe}`
    const stat = fs.statSync(dest)
    const row = {
      id: nextId++,
      url,
      path: safe,
      filename: base,
      mime_type: mimeFor(base),
      size: stat.size,
      alt_text: `imported:${pubPath}`,
      caption: '',
      title: base,
      poster_url: null,
      market_code: 'pk',
      source_public_path: pubPath,
      created_at: new Date().toISOString(),
    }
    media.push(row)
    existingUrls.add(url)
    imported += 1
    map.push({ old: pubPath, new: url, status: 'imported', verified: fs.existsSync(dest) })
  }

  // Register external URLs as media references (no download — keep original URL working)
  for (const ext of external) {
    if (media.some((m) => m.url === ext)) {
      map.push({ old: ext, new: ext, status: 'external_already_listed', verified: true })
      continue
    }
    media.push({
      id: nextId++,
      url: ext,
      path: null,
      filename: path.basename(new URL(ext).pathname) || 'external',
      mime_type: 'image/*',
      size: null,
      alt_text: 'external-reference',
      caption: 'External URL registered for Media Library visibility; original URL unchanged.',
      title: 'External image',
      poster_url: null,
      market_code: 'pk',
      created_at: new Date().toISOString(),
    })
    imported += 1
    map.push({ old: ext, new: ext, status: 'external_registered', verified: true })
  }

  writeJson('media.json', media)

  if (doRewrite) {
    fs.copyFileSync(path.join(dataDir, 'sections.json'), path.join(backupDir, 'sections.json'))
    fs.copyFileSync(path.join(dataDir, 'blog-posts.json'), path.join(backupDir, 'blog-posts.json'))
    const rewriteMap = Object.fromEntries(
      map.filter((m) => m.status === 'imported' && m.new).map((m) => [m.old, m.new]),
    )
    function rewriteDeep(obj) {
      if (typeof obj === 'string') return rewriteMap[obj] || obj
      if (Array.isArray(obj)) return obj.map(rewriteDeep)
      if (obj && typeof obj === 'object') {
        const out = {}
        for (const [k, v] of Object.entries(obj)) out[k] = rewriteDeep(v)
        return out
      }
      return obj
    }
    writeJson('sections.json', sections.map(rewriteDeep))
    writeJson('blog-posts.json', posts.map(rewriteDeep))
  }
}

const report = {
  dryRun: !doImport,
  importedLocalAndExternal: imported,
  discoveredUnique: uniqueUrls.length,
  localPublicRefs: localPublic.length,
  missingLocalFiles: missingLocal,
  externalRefs: external.length,
  uploadRefs: uploads.length,
  publicFilesOnDisk: publicFiles.length,
  mediaLibraryCount: media.length,
  rewriteApplied: doRewrite,
  mapSample: map.slice(0, 30),
  mapTotal: map.length,
  note:
    'Original public/ files are never deleted. External blob URLs are registered in Media Library without downloading. Use --rewrite-cms only after verifying /uploads assets.',
}

const outPath = path.join(root, 'storage', 'backups', `media-inventory-${Date.now()}.json`)
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify({ ...report, map }, null, 2))
console.log(JSON.stringify(report, null, 2))
console.log('Full map written to', outPath)
