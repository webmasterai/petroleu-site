/** Original Petroleu marketing pricing plans (homepage / pricing page design). */
export const PETROLEU_PRICING_PLANS = {
  monthly: [
    {
      name: 'Lite Version',
      price: '1999',
      description: 'Perfect for single-location stations',
      features: [
        'For 1 user account',
        'Purchase: fuel and lubricants',
        'Sale: nozzle sale, bulk sale, credit sale, card sale',
        'Inventory: tank stock, dip gain/loss, lube stock',
        'Accounts: ledgers, cash book, profit/loss, balance sheet',
      ],
      popular: false,
    },
    {
      name: 'Professional Version',
      price: '3999',
      description:
        'For professional accountants and finance managers who need better control over petrol station operations.',
      features: [
        'Up to 5 user accounts',
        'Purchase: fuel and lubricants',
        'Sale: nozzle sale, bulk sale, credit sale, card sale',
        'Inventory: tank stock, dip gain/loss, lube stock',
        'Accounts: ledgers, cash book, aging, profit/loss, balance sheet',
        'Payroll: attendance, advance, loan, overtime, salary sheet and salary slip',
        'WhatsApp message sending',
        'AI reporting and business analysis',
      ],
      popular: true,
    },
    {
      name: 'Automation Station Version',
      price: '6999',
      description: '',
      features: [
        'Up to 5 user accounts',
        'Live sale monitoring with dispenser nozzle integration',
        'Live tank stock monitoring with ATG',
        'Purchase: fuel and lubricants',
        'Sale: nozzle sale, bulk sale, credit sale, card sale',
        'Credit billing: monthly credit sale bills with WhatsApp sending',
        'Inventory: tank stock, dip gain/loss, lube stock',
        'Accounts: ledgers, cash book, aging, profit/loss, balance sheet',
        'Payroll: attendance, advance, loan, overtime, salary sheet and salary slip',
      ],
      popular: false,
    },
    {
      name: 'Multi Station Sites',
      price: 'call for special prices',
      description: '',
      features: [
        'Multi-station fuel network management',
        'Purchase: fuel and lubricants',
        'Sale: nozzle sale, bulk sale, credit sale, card sale',
        'Inventory: tank stock, dip gain/loss, lube stock',
        'Accounts: ledgers, cash book, aging, profit/loss, balance sheet',
        'Payroll: attendance, advance, loan, overtime, salary sheet and salary slip',
        'WhatsApp message sending',
        'AI reporting and business analysis',
      ],
      popular: false,
    },
  ],
  yearly: [
    {
      name: 'Lite Version',
      price: '19,990',
      description: 'Perfect for single-location stations',
      features: [
        'For 1 user account',
        'Purchase: fuel and lubricants',
        'Sale: nozzle sale, bulk sale, credit sale, card sale',
        'Inventory: tank stock, dip gain/loss, lube stock',
        'Accounts: ledgers, cash book, profit/loss, balance sheet',
      ],
      popular: false,
    },
    {
      name: 'Professional Version',
      price: '39,990',
      description:
        'For professional accountants and finance managers who need better control over petrol station operations.',
      features: [
        'Up to 5 user accounts',
        'Purchase: fuel and lubricants',
        'Sale: nozzle sale, bulk sale, credit sale, card sale',
        'Inventory: tank stock, dip gain/loss, lube stock',
        'Accounts: ledgers, cash book, aging, profit/loss, balance sheet',
        'Payroll: attendance, advance, loan, overtime, salary sheet and salary slip',
        'WhatsApp message sending',
        'AI reporting and business analysis',
      ],
      popular: true,
    },
    {
      name: 'Automation Station Version',
      price: '69,990',
      description: '',
      features: [
        'Up to 5 user accounts',
        'Live sale monitoring with dispenser nozzle integration',
        'Live tank stock monitoring with ATG',
        'Purchase: fuel and lubricants',
        'Sale: nozzle sale, bulk sale, credit sale, card sale',
        'Credit billing: monthly credit sale bills with WhatsApp sending',
        'Inventory: tank stock, dip gain/loss, lube stock',
        'Accounts: ledgers, cash book, aging, profit/loss, balance sheet',
        'Payroll: attendance, advance, loan, overtime, salary sheet and salary slip',
      ],
      popular: false,
    },
    {
      name: 'Multi Station Sites',
      price: 'call for special prices',
      description: '',
      features: [
        'Multi-station fuel network management',
        'Purchase: fuel and lubricants',
        'Sale: nozzle sale, bulk sale, credit sale, card sale',
        'Inventory: tank stock, dip gain/loss, lube stock',
        'Accounts: ledgers, cash book, aging, profit/loss, balance sheet',
        'Payroll: attendance, advance, loan, overtime, salary sheet and salary slip',
        'WhatsApp message sending',
        'AI reporting and business analysis',
      ],
      popular: false,
    },
  ],
}

export function formatPlanPrice(price) {
  if (price === 'Custom' || price === 'Custom quote') return price
  if (typeof price === 'string' && /[^\d.,\s]/.test(price) && !/^\d/.test(price.trim())) {
    return price // already localized label (Dari/Pashto/contact quote)
  }
  if (price === 'call for special prices') return 'PKR call for special prices'
  return `PKR ${price}`
}

export function planShowsPeriod(price) {
  if (price === 'Custom' || price === 'Custom quote') return false
  if (typeof price === 'string' && /[^\d.,\s]/.test(price) && !/^\d/.test(price.trim())) return false
  return true
}

