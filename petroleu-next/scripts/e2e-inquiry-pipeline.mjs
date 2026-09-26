/**
 * Local inquiry pipeline smoke test (dummy data only).
 * Run with: npx tsx scripts/e2e-inquiry-pipeline.mjs
 * Expects Next.js already listening on PORT (default 3000).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const base = process.env.E2E_BASE || 'http://127.0.0.1:3000'
const storagePath = path.join(root, 'storage', 'data', 'inquiries.json')

function countFields(rows) {
  const hasName = (r) => !!(r.name || r.full_name || r.fullName)
  const hasPhone = (r) => !!(r.phone || r.phoneNumber || r.mobile)
  const hasMsg = (r) => !!(r.message || r.messageText || r.body || r.comments)
  return {
    total: rows.length,
    withName: rows.filter(hasName).length,
    missingName: rows.filter((r) => !hasName(r)).length,
    withPhone: rows.filter(hasPhone).length,
    missingPhone: rows.filter((r) => !hasPhone(r)).length,
    withMessage: rows.filter(hasMsg).length,
    missingMessage: rows.filter((r) => !hasMsg(r)).length,
  }
}

async function post(pathSuffix, body) {
  const res = await fetch(`${base}/api/cms${pathSuffix}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, json }
}

async function main() {
  // Seed one legacy-shaped row (aliases only) to prove read-normalization path
  let rows = []
  if (fs.existsSync(storagePath)) {
    rows = JSON.parse(fs.readFileSync(storagePath, 'utf8'))
  }
  const legacyId = (rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) || 0) + 1
  rows.push({
    id: legacyId,
    type: 'contact',
    market_code: 'pk',
    locale_code: 'en-PK',
    full_name: 'Legacy Alias Person',
    email: 'legacy-alias-test@example.com',
    mobile: '0325 7865000',
    body: 'Legacy body text under body key',
    source: 'e2e-legacy',
    status: 'new',
    created_at: new Date().toISOString(),
  })
  fs.writeFileSync(storagePath, JSON.stringify(rows, null, 2) + '\n')

  const contactPayload = {
    full_name: 'E2E Contact Tester',
    email: 'e2e-contact@example.com',
    phone: '+92 300 1112233',
    company: 'Test Fuel Co',
    city: 'Lahore',
    address: 'Dummy Road 1',
    message: 'E2E contact message — please ignore.',
    market: 'pk',
    locale: 'en-PK',
    source: 'e2e-contact',
  }

  const demoPayload = {
    full_name: 'E2E Demo Tester',
    email: 'e2e-demo@example.com',
    company: 'Demo Station',
    fuel_brand: 'PSO',
    phone: '0325 7865000',
    message: 'E2E demo message — please ignore.',
    market: 'pk',
    locale: 'en-PK',
    source: 'e2e-demo',
  }

  const contact = await post('/contact', contactPayload)
  const demo = await post('/demo-request', demoPayload)

  const after = JSON.parse(fs.readFileSync(storagePath, 'utf8'))
  const contactRow = after.find((r) => r.email === contactPayload.email)
  const demoRow = after.find((r) => r.email === demoPayload.email)
  const legacyRow = after.find((r) => r.id === legacyId)

  // Simulate CMS display resolution (same aliases as normalizeInquiryRead)
  function display(r) {
    return {
      name: r?.name || r?.full_name || r?.fullName || '',
      phone: r?.phone || r?.phoneNumber || r?.mobile || '',
      message: r?.message || r?.messageText || r?.body || r?.comments || '',
      type: r?.type,
      market: r?.market_code || r?.market,
    }
  }

  const report = {
    contactApi: {
      status: contact.status,
      ok: contact.json?.success === true,
      returnedName: contact.json?.data?.name,
      returnedPhone: contact.json?.data?.phone,
      returnedMessage: contact.json?.data?.message,
    },
    demoApi: {
      status: demo.status,
      ok: demo.json?.success === true,
      returnedName: demo.json?.data?.name,
      returnedPhone: demo.json?.data?.phone,
      returnedMessage: demo.json?.data?.message,
    },
    storedContact: display(contactRow),
    storedDemo: display(demoRow),
    legacyAliasesStillPresent: {
      hasFullName: !!legacyRow?.full_name,
      hasMobile: !!legacyRow?.mobile,
      hasBody: !!legacyRow?.body,
      displayResolved: display(legacyRow),
    },
    counts: countFields(after),
    idsPreserved: after.every((r) => r.id != null),
  }

  console.log(JSON.stringify(report, null, 2))

  const pass =
    contact.status === 201 &&
    demo.status === 201 &&
    display(contactRow).name === contactPayload.full_name &&
    display(contactRow).phone === contactPayload.phone &&
    display(contactRow).message === contactPayload.message &&
    display(demoRow).name === demoPayload.full_name &&
    display(demoRow).phone === demoPayload.phone &&
    display(demoRow).message === demoPayload.message &&
    display(legacyRow).name === 'Legacy Alias Person' &&
    display(legacyRow).phone === '0325 7865000' &&
    display(legacyRow).message === 'Legacy body text under body key'

  if (!pass) {
    console.error('E2E FAILED')
    process.exit(1)
  }
  console.log('E2E PASSED')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
