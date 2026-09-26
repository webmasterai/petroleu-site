/**
 * Additive, backup-first migration for inquiries.json
 *
 * Maps missing canonical fields from legacy aliases WITHOUT deleting records
 * or overwriting existing canonical values.
 *
 * Usage (do NOT run automatically in CI/deploy):
 *   node scripts/migrate-inquiries-aliases.mjs [--dry-run] [--file path/to/inquiries.json]
 *
 * Default file: storage/data/inquiries.json (relative to petroleu-next cwd)
 *
 * Safe guarantees:
 * - preserves id, email, timestamps, status, admin_notes
 * - only fills missing name / full_name / phone / message / company / market_code / locale_code
 * - writes a timestamped backup beside the target file before any write
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const fileIdx = args.indexOf('--file')
const target =
  fileIdx >= 0 && args[fileIdx + 1]
    ? path.resolve(args[fileIdx + 1])
    : path.join(root, 'storage', 'data', 'inquiries.json')

function pickStr(...vals) {
  for (const v of vals) {
    if (v == null) continue
    const s = String(v).trim()
    if (s) return s
  }
  return ''
}

function migrateRow(row) {
  if (!row || typeof row !== 'object') return { row, changed: false }
  const next = { ...row }
  let changed = false

  const name = pickStr(next.name, next.full_name, next.fullName, next.contact_name)
  if (!pickStr(next.name) && name) {
    next.name = name
    changed = true
  }
  if (!pickStr(next.full_name) && name) {
    next.full_name = name
    changed = true
  }

  const phone = pickStr(
    next.phone,
    next.phoneNumber,
    next.phone_number,
    next.mobile,
    next.contactNumber,
  )
  if (!pickStr(next.phone) && phone) {
    next.phone = phone
    changed = true
  }

  const message = pickStr(
    next.message,
    next.messageText,
    next.message_text,
    next.body,
    next.comments,
  )
  if (!pickStr(next.message) && message) {
    next.message = message
    changed = true
  }

  const company = pickStr(next.company, next.companyName, next.company_name, next.business_name)
  if (!pickStr(next.company) && company) {
    next.company = company
    changed = true
  }

  const market = pickStr(next.market_code, next.market)
  if (!pickStr(next.market_code) && market) {
    next.market_code = market
    changed = true
  }

  const locale = pickStr(next.locale_code, next.locale)
  if (!pickStr(next.locale_code) && locale) {
    next.locale_code = locale
    changed = true
  }

  // Never touch: id, email, status, admin_notes, created_at (unless missing updated_at only)
  if (!pickStr(next.updated_at) && pickStr(next.created_at)) {
    next.updated_at = next.created_at
    changed = true
  }

  return { row: next, changed }
}

function main() {
  if (!fs.existsSync(target)) {
    console.error(`File not found: ${target}`)
    process.exit(1)
  }

  const raw = fs.readFileSync(target, 'utf8')
  const rows = JSON.parse(raw)
  if (!Array.isArray(rows)) {
    console.error('Expected inquiries.json to be a JSON array')
    process.exit(1)
  }

  let changedCount = 0
  const out = rows.map((r) => {
    const { row, changed } = migrateRow(r)
    if (changed) changedCount += 1
    return row
  })

  console.log(
    JSON.stringify(
      {
        target,
        dryRun,
        total: rows.length,
        rowsNeedingCanonicalFill: changedCount,
        note: 'IDs, emails, timestamps, status, admin_notes preserved; only missing canonical fields filled from aliases.',
      },
      null,
      2,
    ),
  )

  if (dryRun) {
    console.log('Dry run — no files written.')
    return
  }

  if (changedCount === 0) {
    console.log('Nothing to migrate.')
    return
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(path.dirname(target), '..', 'backups', `inquiries-alias-migrate-${stamp}`)
  fs.mkdirSync(backupDir, { recursive: true })
  const backupPath = path.join(backupDir, 'inquiries.json')
  fs.copyFileSync(target, backupPath)
  fs.writeFileSync(target, JSON.stringify(out, null, 2) + '\n', 'utf8')
  console.log(`Backup: ${backupPath}`)
  console.log(`Updated: ${target}`)
}

main()
