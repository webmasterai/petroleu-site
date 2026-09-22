/**
 * Additive sync: ensure en-PK has exactly the four Pakistan pricing plans.
 * - Updates existing plan rows by sort_order / name match
 * - Adds missing plans
 * - Does NOT delete AF plans or other locales
 * - Does NOT touch users/passwords
 * - Writes only to local petroleu-next/storage/data and storage-seed (never /app/storage)
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'petroleu-next')
const LIVE = path.join(ROOT, 'storage', 'data', 'sections.json')
const SEED = path.join(ROOT, 'storage-seed', 'sections.json')

const PLANS = [
  {
    sort_order: 1,
    name: 'Lite Version',
    price: '1999',
    price_yearly: '19990',
    description: 'Perfect for single-location stations',
    is_popular: false,
    features: [
      'For 1 user account.',
      'Purchase - Fuel and Lubricants',
      'Sale - Nozzle sale, bulk sale, credit sale, card sale',
      'Inventory - Tank Stock - Dip Gain/loss - Lube Stock',
      'Accounts - Ledgers, Cash Book, Profit/loss, Balance Sheet',
    ],
  },
  {
    sort_order: 2,
    name: 'Professional Version',
    price: '3999',
    price_yearly: '39990',
    description:
      'Professional version is developed for professional accountants and finance managers to gain maximum control and information of the petrol station operation.',
    is_popular: true,
    badge: 'Most Popular',
    features: [
      'Up to 5 user accounts',
      'Purchase - Fuel and Lubricants',
      'Sale - Nozzle sale, bulk sale, credit sale, card sale',
      'Inventory - Tank Stock - Dip Gain/loss - Lube Stock',
      'Accounts - Ledgers, Cash Book, Aging, Profit/loss, Balance Sheet',
      'Payroll - Attendance, Advance, Loan, Overtime, Salary sheet and Salary slip',
      'WhatsApp messages sending.',
      'AI Reporting and Business Analysis',
    ],
  },
  {
    sort_order: 3,
    name: 'Automation Station Version',
    price: '6999',
    price_yearly: '69990',
    description: '',
    is_popular: false,
    features: [
      'Upto 5 user accounts.',
      'Live Sale Monitoring with dispenser Nozzles Integration',
      'Live Tank Stock Monitoring with ATG',
      'Purchase - Fuel and Lubricants',
      'Sale - Nozzle sale, bulk sale, credit sale, card sale',
      'Credit Billing - Monthly credit sale bills printing and sending on WhatsApp numbers.',
      'Inventory - Tank Stock - Dip Gain/loss - Lube Stock',
      'Accounts - Ledgers, Cash Book, Aging, Profit/loss, Balance Sheet',
      'Payroll - Attendance, Advance, Loan, Overtime, Salary sheet and Salary slip',
    ],
  },
  {
    sort_order: 4,
    name: 'Multi Station Sites',
    price: 'call for special prices',
    price_yearly: 'call for special prices',
    description: '',
    is_popular: false,
    features: [
      'Purchase - Fuel and Lubricants',
      'Sale - Nozzle sale, bulk sale, credit sale, card sale',
      'Inventory - Tank Stock - Dip Gain/loss - Lube Stock',
      'Accounts - Ledgers, Cash Book, Aging, Profit/loss, Balance Sheet',
      'Payroll - Attendance, Advance, Loan, Overtime, Salary sheet and Salary slip',
      'WhatsApp messages sending.',
      'AI Reporting and Business Analysis',
    ],
  },
]

function feat(list) {
  return list.map((feature_text) => ({ feature_text, is_included: true }))
}

function applyPlanFields(row, plan) {
  const now = new Date().toISOString()
  row.title = plan.name
  row.description = plan.description
  row.link_label = 'Contact Sales'
  row.link_url = '/contact'
  row.status = 'published'
  row.is_enabled = true
  row.sort_order = plan.sort_order
  row.page_slug = 'pricing'
  row.section_key = 'plan'
  row.updated_at = now
  row.data = {
    ...(row.data && typeof row.data === 'object' && !Array.isArray(row.data) ? row.data : {}),
    name: plan.name,
    price: plan.price,
    price_yearly: plan.price_yearly,
    period: 'month',
    price_suffix: '/month',
    is_popular: plan.is_popular,
    popular: plan.is_popular,
    badge: plan.badge || (plan.is_popular ? 'Most Popular' : ''),
    currency: 'PKR',
    features: feat(plan.features),
    cta_text: 'Contact Sales',
    cta_link: '/contact',
  }
}

function syncFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('skip (missing):', filePath)
    return { updated: 0, added: 0 }
  }
  const sections = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (!Array.isArray(sections)) throw new Error('sections.json must be an array: ' + filePath)

  let maxId = Math.max(0, ...sections.map((s) => Number(s.id) || 0))
  const nextId = () => ++maxId
  let updated = 0
  let added = 0

  const pkPlans = sections.filter(
    (s) =>
      s.market_code === 'pk' &&
      s.locale_code === 'en-PK' &&
      s.page_slug === 'pricing' &&
      s.section_key === 'plan',
  )

  for (const plan of PLANS) {
    let row =
      pkPlans.find((s) => Number(s.sort_order) === plan.sort_order) ||
      pkPlans.find((s) => String(s.title || s.data?.name || '').trim() === plan.name)

    if (row) {
      applyPlanFields(row, plan)
      updated++
    } else {
      row = {
        id: nextId(),
        market_code: 'pk',
        locale_code: 'en-PK',
        created_at: new Date().toISOString(),
      }
      applyPlanFields(row, plan)
      sections.push(row)
      pkPlans.push(row)
      added++
    }
  }

  // Disable leftover en-PK plan rows that are not one of the four (do not delete)
  const keepNames = new Set(PLANS.map((p) => p.name))
  for (const s of pkPlans) {
    const name = String(s.title || s.data?.name || '').trim()
    if (!keepNames.has(name)) {
      s.is_enabled = false
      s.status = 'draft'
      s.updated_at = new Date().toISOString()
      updated++
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(sections, null, 2) + '\n')
  console.log(`${path.relative(ROOT, filePath)}: updated=${updated} added=${added}`)
  return { updated, added }
}

console.log('Syncing Pakistan en-PK pricing plans (additive)...')
syncFile(LIVE)
syncFile(SEED)
console.log('Done. AF locales untouched. No push.')
