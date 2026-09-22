/**
 * websiteContent.js
 *
 * Static fallback content for the marketing site. Mirrors the v2 reference
 * located at /home/developer-1/Desktop/v0-petrolue-saas-website-inspiration/data/content.json,
 * with the approved branding rules applied:
 *
 *   • brand display name        : "Petroleu" (no .pk suffix)
 *   • all URLs                  : petroleu.com
 *   • all emails                : @petroleu.com
 *
 * Every marketing section MUST first try CMS content (via cmsApi/cmsPublic)
 * and only fall back to this object when the API is unavailable.
 */

export const websiteContent = {
  brand: {
    name: 'Petroleu',
    domain: 'petroleu.com',
    siteUrl: 'https://petroleu.com',
    appUrl: 'https://app.petroleu.com',
    supportEmail: 'support@petroleu.com',
    salesEmail: 'sales@petroleu.com',
    contactEmail: 'sales@petroleu.com',
    phone: '0325 7865000',
    phoneTel: '+923257865000',
    phoneUk: '+44 7446 448889',
    addressPk: 'Karachi, Pakistan.',
    whatsappNumber: '923257865000',
    whatsappMessage:
      "Hi! I'm interested in Petroleu petrol pump software. Can you please help me?",
    googleReviewUrl: 'https://g.page/r/petroleu/review',
  },

  hero: {
    badge: 'Best Petrol Pump Management Software',
    title: 'Manage your petrol pump without being present there Pakistan',
    titleHighlight: '',
    description:
      'Run your fuel station smarter with Petroleu. Manage nozzle readings, tank stock, credit customers, daily closing, accounts, reports, and mobile monitoring from one system.',
    primaryButton: 'See it in Action',
    secondaryButton: 'View Pricing',
    features: [
      'Nozzle reading management',
      'Tank dipping and stock control',
      'Cash and credit sale tracking',
      'Customer ledgers and vehicle-wise billing',
      'Daily closing and shift reports',
      'Mobile owner dashboard',
    ],
    dashboardImageUrl:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PetroleuDashboard-45o0LNfASWEDxtDgDI6KSRExrYyMNC.png',
    dashboardUrl: 'app.petroleu.com/dashboard',
  },

  stats: [
    { value: '1350+', label: 'Petrol Pumps' },
    { value: '20+', label: 'Years of Excellence' },
    { value: '4.8', label: 'Google Reviews' },
    { value: '24/7', label: 'Support' },
  ],

  trustedLogosImage:
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-04-25%20at%2010.54.14%E2%80%AFPM-tCsoz7x0MUzpqAy3VGnkK5P2cKj1bN.png',

  features: [
    {
      title: 'Nozzle Reading Management',
      description:
        'Record opening and closing nozzle readings, calculate fuel sale quantity, and review nozzle-wise daily sales without manual register work.',
      badge: 'Core',
    },
    {
      title: 'Tank Dipping & Stock Control',
      description:
        'Track tank stock, purchases, sales, dip readings, and dip gain/loss for petrol, diesel, HOBC, and lubricants.',
      badge: 'Core',
    },
    {
      title: 'Cash & Credit Sales',
      description:
        'Separate cash sales, credit sales, card sales, and bulk sales so daily closing stays clear and easy to verify.',
      badge: null,
    },
    {
      title: 'Customer Credit Management',
      description:
        'Maintain customer ledgers, vehicle-wise billing, monthly credit bills, payments, and outstanding balances.',
      badge: 'Popular',
    },
    {
      title: 'Daily Closing Reports',
      description:
        'Review sales, stock, cash, credit, expenses, and shift-wise closing reports from one dashboard.',
      badge: null,
    },
    {
      title: 'Accounts & Ledgers',
      description:
        'Manage cash book, ledgers, supplier payments, receivables, payables, profit/loss, and balance sheet reports.',
      badge: null,
    },
    {
      title: 'Mobile Owner Dashboard',
      description:
        'Check sales, stock, cash, credit, and reports from mobile without staying at the station all day.',
      badge: null,
    },
    {
      title: 'Automation Station Monitoring',
      description:
        'Support for dispenser integration and ATG tank monitoring can help track live nozzle sales and tank stock.',
      badge: null,
    },
    {
      title: 'AI Reporting & Business Analysis',
      description:
        'Use smart reports to review station performance, stock movement, receivables, and business trends.',
      badge: 'AI Powered',
    },
  ],

  pricing: {
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
      },
    ],
  },

  testimonials: {
    rating: '4.9',
    reviewCount: '1000+',
    reviews: [
      {
        name: 'Muhammad Ahmed',
        role: 'Owner, PSO Station',
        city: 'Lahore',
        rating: 5,
        date: '2 weeks ago',
        content:
          'Nozzle readings and daily closing are much easier now. We catch meter variances during the shift instead of finding problems in the register at night.',
      },
      {
        name: 'Hassan Ali Khan',
        role: 'Manager, Shell Franchise',
        city: 'Karachi',
        rating: 5,
        date: '1 month ago',
        content:
          'Daily closing used to take hours with manual registers. Credit customer ledgers and shift reports are now in one place, which saves our team real time.',
      },
      {
        name: 'Rizwan Malik',
        role: 'Owner, Total Parco Station',
        city: 'Islamabad',
        rating: 5,
        date: '3 weeks ago',
        content:
          'I check sales, tank stock, and credit outstanding from mobile when I am away from the forecourt. Support has been responsive when we needed help.',
      },
      {
        name: 'Tariq Mehmood',
        role: 'Director, Fuel Network',
        city: 'Faisalabad',
        rating: 5,
        date: '1 week ago',
        content:
          'We run five stations and needed branch-wise closing reports without collecting notebooks from each site. Petroleu gives us that view from one login.',
      },
      {
        name: 'Imran Sheikh',
        role: 'Owner, Attock Petroleum',
        city: 'Multan',
        rating: 4,
        date: '2 months ago',
        content:
          'Tank dipping reports help us compare book stock with physical dips. Variance shows up early, which makes stock follow-up more practical.',
      },
      {
        name: 'Fahad Hussain',
        role: 'Station Manager',
        city: 'Peshawar',
        rating: 5,
        date: '3 days ago',
        content:
          'Urdu interface helps our attendants with nozzle entry and shift closing. Credit customers like receiving WhatsApp invoice details after fills.',
      },
    ],
  },

  faq: [
    {
      question: 'How long does it take to set up Petroleu?',
      answer:
        'Most single-site pumps are set up in one to two working days. Our team configures tanks, nozzles, opening stock, and credit customers, then guides staff through the first daily closing.',
    },
    {
      question: 'Can I use Petroleu offline?',
      answer:
        'The desktop app keeps running when internet drops. Staff continue entering nozzle readings, dips, and sales locally, and records sync automatically when the connection returns.',
    },
    {
      question: 'Is my data secure?',
      answer:
        'Station data is encrypted in transit, backed up to the cloud, and protected by role-based access. Only authorized users on your team can view sales, stock, and account records.',
    },
    {
      question: 'Can I manage multiple fuel stations?',
      answer:
        'Multi-station setups support branch-wise sales, stock, and closing reports from one login. Each site runs its own shifts while head office sees consolidated figures across locations.',
    },
    {
      question: 'Do you provide training?',
      answer:
        'Training covers nozzle readings, tank dipping, credit sales, and daily closing for owners, managers, and attendants. Video guides and live sessions are included with onboarding.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept bank transfers, JazzCash, EasyPaisa, and major credit and debit cards for subscription payments.',
    },
    {
      question: 'Does Petroleu support WhatsApp invoices and payment reminders?',
      answer:
        'Credit invoices and payment reminders can be shared on WhatsApp from Petroleu, depending on your package. This keeps billing tied to the same ledger that records the sale.',
    },
    {
      question: 'Can Petroleu manage petrol, diesel, HOBC and lubricants stock?',
      answer:
        'Petrol, diesel, HOBC, and lubricants are tracked separately with purchases, nozzle sales, dip gain/loss, and closing stock reports for each product and tank.',
    },
  ],

  cta: {
    title: 'Ready to Run Your Fuel Station Smarter?',
    description:
      'Talk to our team and see how Petroleu can help manage nozzle readings, tank stock, credit customers, daily closing, and reports.',
    primaryButton: 'WhatsApp Us',
    secondaryButton: 'Book a Demo',
  },

  footer: {
    description: 'Modern petrol pump software for fuel stations in Pakistan.',
    phone: '0325 7865000',
    phoneTel: '+923257865000',
    email: 'sales@petroleu.com',
    website: 'www.petroleu.com',
    address: 'Karachi, Pakistan.',
  },

  industries: [
    {
      icon: 'Fuel',
      title: 'Petrol Pumps',
      description: 'PSO, Shell, Total, Attock and independent fuel stations',
      colorClass: 'bg-primary/10 text-primary',
    },
    {
      icon: 'Droplets',
      title: 'CNG Stations',
      description: 'Compressed natural gas filling stations and hybrid pumps',
      colorClass: 'bg-accent/10 text-accent',
    },
    {
      icon: 'Truck',
      title: 'Fleet Fueling',
      description: 'Transport companies with in-house fueling facilities',
      colorClass: 'bg-chart-5/10 text-chart-5',
    },
  ],

  industriesPage: [
    {
      icon: 'Fuel',
      title: 'Petrol Pumps',
      description:
        'Complete management for traditional petrol stations with multi-nozzle and multi-tank support.',
      colorClass: 'bg-primary/10 text-primary',
    },
    {
      icon: 'Droplets',
      title: 'CNG Stations',
      description:
        'Track CNG sales, fill counts, pressure logs, and vehicle records in real-time.',
      colorClass: 'bg-accent/10 text-accent',
    },
    {
      icon: 'Truck',
      title: 'Fleet Fueling',
      description: 'Manage company vehicle fueling, credit accounts, and reimbursements.',
      colorClass: 'bg-chart-5/10 text-chart-5',
    },
    {
      icon: 'Factory',
      title: 'Industrial Sites',
      description: 'On-site fuel management for factories, plants, and construction sites.',
      colorClass: 'bg-chart-4/10 text-chart-4',
    },
    {
      icon: 'Building2',
      title: 'Multi-Outlet Networks',
      description:
        'Centralized control for fuel-station chains and franchises with consolidated reports.',
      colorClass: 'bg-primary/10 text-primary',
    },
    {
      icon: 'Plane',
      title: 'Aviation Fuel',
      description: 'Specialized handling for aviation and helipad fueling operations.',
      colorClass: 'bg-accent/10 text-accent',
    },
    {
      icon: 'Ship',
      title: 'Marine Bunkers',
      description: 'Bunker fuel sales for ports, ferries, and marine fleet operators.',
      colorClass: 'bg-chart-5/10 text-chart-5',
    },
    {
      icon: 'Tractor',
      title: 'Agricultural Fueling',
      description: 'Diesel and HSD distribution for farms, harvesters, and rural co-ops.',
      colorClass: 'bg-chart-4/10 text-chart-4',
    },
  ],

  mobileFeatures: [
    {
      icon: 'BarChart3',
      title: 'Live Sales Overview',
      description: 'See today\'s nozzle sales, cash totals, and credit charges from your phone.',
    },
    {
      icon: 'Droplets',
      title: 'Tank Stock Status',
      description: 'Check petrol, diesel, and HOBC stock levels without calling the forecourt.',
    },
    {
      icon: 'Wallet',
      title: 'Cash and Credit Summary',
      description: 'Review how much was collected in cash versus charged to credit accounts.',
    },
    {
      icon: 'Fuel',
      title: 'Customer Outstanding Balances',
      description: 'See which credit customers owe money before month-end collection.',
    },
    {
      icon: 'FileText',
      title: 'Daily Closing Reports',
      description: 'Open shift and day-end closing figures from the mobile owner dashboard.',
    },
    {
      icon: 'Activity',
      title: 'Mobile-Friendly Dashboard',
      description: 'Built for quick checks while travelling or managing more than one station.',
    },
  ],

  analyticsCards: [
    {
      icon: 'TrendingUp',
      title: 'Daily Fuel Sales',
      value: '2,850,000',
      subtitle: 'Avg: 2.5M/day',
      colorClass: 'bg-primary/10 text-primary',
      description: 'Track daily fuel sales with comparison to previous periods.',
    },
    {
      icon: 'Droplets',
      title: 'Fuel Stock Level',
      value: '45,200 L',
      subtitle: 'Petrol + HSD',
      colorClass: 'bg-accent/10 text-accent',
      description: 'Monitor real-time stock levels across all tanks.',
    },
    {
      icon: 'Fuel',
      title: 'Gross Margin',
      value: 'PKR 185,000',
      subtitle: 'Per Day Avg',
      colorClass: 'bg-chart-4/10 text-chart-4',
      description: 'Analyze profit margins per product and track trends.',
    },
    {
      icon: 'Gauge',
      title: 'Nozzle Performance',
      value: '8/8 Active',
      subtitle: '100% Uptime',
      colorClass: 'bg-primary/10 text-primary',
      description: 'Monitor nozzle performance and identify issues quickly.',
    },
    {
      icon: 'Users',
      title: 'Credit Receivables',
      value: '4.5M',
      subtitle: '156 Customers',
      colorClass: 'bg-chart-5/10 text-chart-5',
      description: 'Track outstanding credit and customer payment patterns.',
    },
    {
      icon: 'Calendar',
      title: 'Monthly Trend',
      value: '+23%',
      subtitle: 'vs Last Month',
      colorClass: 'bg-accent/10 text-accent',
      description: 'Compare monthly performance and identify growth areas.',
    },
  ],

  whyChoose: {
    reasons: [
      {
        icon: 'Cloud',
        title: 'Cloud-Based Access',
        description:
          'Review sales, tank stock, and closing reports from desktop or mobile when you are away from the forecourt.',
      },
      {
        icon: 'Globe',
        title: 'Urdu Interface',
        description:
          'Use Petroleu in Urdu or English so owners, managers, and attendants can work in the language they prefer.',
      },
      {
        icon: 'Droplets',
        title: 'Stock Variance Tracking',
        description:
          'Compare nozzle sales, dip readings, and tank stock so unusual variance can be reviewed during the shift.',
      },
      {
        icon: 'Shield',
        title: 'Multi-Station Support',
        description:
          'Run branch-wise sales, stock, and closing reports from one login when you operate more than one pump.',
      },
    ],
    brands: [
      'PSO Stations',
      'Shell Pumps',
      'Total Parco',
      'Attock Petroleum',
      'Independent Pumps',
      'CNG Stations',
    ],
  },

  gettingStarted: [
    {
      number: '01',
      icon: 'UserPlus',
      title: 'Sign up',
      description:
        'Create your account with station details in minutes — no IT team required.',
    },
    {
      number: '02',
      icon: 'Settings',
      title: 'Configure',
      description: 'Add tanks, nozzles, and products using the guided setup wizard.',
    },
    {
      number: '03',
      icon: 'Rocket',
      title: 'Run & report',
      description: 'Record shifts, nozzle readings, and credit sales; pull reports instantly.',
    },
  ],

  invoiceDemo: {
    stationName: 'PSO Petrol Station',
    stationAddress: 'Main GT Road, Lahore',
    invoiceNumber: 'INV-2024-1542',
    date: '25 April 2024',
    customerName: 'Raza Transport Co.',
    customerAccount: 'Credit Account #156',
    amountDue: 'PKR 125,400',
    rows: [
      { vehicle: 'LEA-4521 (Truck)', fuel: 'HSD', qty: '250', amount: '72,500' },
      { vehicle: 'LEC-8832 (Truck)', fuel: 'HSD', qty: '180', amount: '52,200' },
      { vehicle: 'LED-1145 (Pickup)', fuel: 'Petrol', qty: '25', amount: '7,000' },
    ],
    subtotal: '131,700',
    previousBalance: '-6,300',
    total: 'PKR 125,400',
  },

  reportsDemo: {
    tankDipping: [
      { tank: 'Tank 1 - Petrol', opening: '15,200', received: '25,000', sales: '28,450', closing: '11,750', variance: '-50' },
      { tank: 'Tank 2 - HSD',    opening: '22,500', received: '30,000', sales: '35,200', closing: '17,300', variance: '+0' },
      { tank: 'Tank 3 - Petrol', opening: '8,900',  received: '20,000', sales: '18,650', closing: '10,250', variance: '-0' },
    ],
    nozzleReadings: [
      { nozzle: 'Nozzle 1 - Petrol', opening: '125,450', closing: '128,720', sales: '3,270', amount: '916,560' },
      { nozzle: 'Nozzle 2 - Petrol', opening: '98,230',  closing: '101,480', sales: '3,250', amount: '910,000' },
      { nozzle: 'Nozzle 3 - HSD',    opening: '156,780', closing: '161,200', sales: '4,420', amount: '1,281,800' },
      { nozzle: 'Nozzle 4 - HSD',    opening: '143,560', closing: '147,890', sales: '4,330', amount: '1,255,700' },
    ],
  },
}

export function withBestPrefix(text) {
  if (!text) return text
  const trimmed = String(text).trim()
  const wrongOrder = trimmed.match(/^best\s+(#\d+)\s+(.+)$/i)
  if (wrongOrder) return `${wrongOrder[1]} Best ${wrongOrder[2]}`
  if (/\bbest\b/i.test(trimmed)) return trimmed
  const numbered = trimmed.match(/^(#\d+)\s+(.+)$/i)
  if (numbered) return `${numbered[1]} Best ${numbered[2]}`
  return `Best ${trimmed}`
}

export default websiteContent
