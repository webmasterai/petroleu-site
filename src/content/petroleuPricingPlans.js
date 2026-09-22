/** Pakistan pricing plans — reference shape for CMS (en-PK). Not used when CMS returns data. */
export const PETROLEU_PRICING_PLANS = {
  monthly: [
    {
      name: 'Lite Version',
      price: '1999',
      description: 'Perfect for single-location stations',
      features: [
        'For 1 user account.',
        'Purchase - Fuel and Lubricants',
        'Sale - Nozzle sale, bulk sale, credit sale, card sale',
        'Inventory - Tank Stock - Dip Gain/loss - Lube Stock',
        'Accounts - Ledgers, Cash Book, Profit/loss, Balance Sheet',
      ],
      popular: false,
      cta_text: 'Contact Sales',
    },
    {
      name: 'Professional Version',
      price: '3999',
      description:
        'Professional version is developed for professional accountants and finance managers to gain maximum control and information of the petrol station operation.',
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
      popular: true,
      badge: 'Most Popular',
      cta_text: 'Contact Sales',
    },
    {
      name: 'Automation Station Version',
      price: '6999',
      description: '',
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
      popular: false,
      cta_text: 'Contact Sales',
    },
    {
      name: 'Multi Station Sites',
      price: 'call for special prices',
      description: '',
      features: [
        'Purchase - Fuel and Lubricants',
        'Sale - Nozzle sale, bulk sale, credit sale, card sale',
        'Inventory - Tank Stock - Dip Gain/loss - Lube Stock',
        'Accounts - Ledgers, Cash Book, Aging, Profit/loss, Balance Sheet',
        'Payroll - Attendance, Advance, Loan, Overtime, Salary sheet and Salary slip',
        'WhatsApp messages sending.',
        'AI Reporting and Business Analysis',
      ],
      popular: false,
      cta_text: 'Contact Sales',
    },
  ],
  yearly: [
    {
      name: 'Lite Version',
      price: '19990',
      description: 'Perfect for single-location stations',
      features: [
        'For 1 user account.',
        'Purchase - Fuel and Lubricants',
        'Sale - Nozzle sale, bulk sale, credit sale, card sale',
        'Inventory - Tank Stock - Dip Gain/loss - Lube Stock',
        'Accounts - Ledgers, Cash Book, Profit/loss, Balance Sheet',
      ],
      popular: false,
      cta_text: 'Contact Sales',
    },
    {
      name: 'Professional Version',
      price: '39990',
      description:
        'Professional version is developed for professional accountants and finance managers to gain maximum control and information of the petrol station operation.',
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
      popular: true,
      badge: 'Most Popular',
      cta_text: 'Contact Sales',
    },
    {
      name: 'Automation Station Version',
      price: '69990',
      description: '',
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
      popular: false,
      cta_text: 'Contact Sales',
    },
    {
      name: 'Multi Station Sites',
      price: 'call for special prices',
      description: '',
      features: [
        'Purchase - Fuel and Lubricants',
        'Sale - Nozzle sale, bulk sale, credit sale, card sale',
        'Inventory - Tank Stock - Dip Gain/loss - Lube Stock',
        'Accounts - Ledgers, Cash Book, Aging, Profit/loss, Balance Sheet',
        'Payroll - Attendance, Advance, Loan, Overtime, Salary sheet and Salary slip',
        'WhatsApp messages sending.',
        'AI Reporting and Business Analysis',
      ],
      popular: false,
      cta_text: 'Contact Sales',
    },
  ],
}

export function formatPlanPrice(price) {
  const raw = String(price ?? '').trim()
  if (!raw) return ''
  if (/call|contact|special|custom|quote/i.test(raw)) return raw
  if (/^pkr\b/i.test(raw)) return raw.replace(/^pkr\s*/i, 'PKR ')
  const digits = raw.replace(/[^\d.]/g, '')
  if (!digits) return raw
  const n = Number(digits)
  if (!Number.isFinite(n)) return raw
  return `PKR ${n.toLocaleString('en-PK')}`
}

export function planShowsPeriod(price) {
  const raw = String(price ?? '').trim()
  if (!raw) return false
  if (/call|contact|special|custom|quote/i.test(raw)) return false
  return /\d/.test(raw)
}
