import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Cloud,
  Droplets,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'

const TITLE_TO_TYPE = {
  'Stock & dip blind spots': 'stock-dip',
  'Advanced Reporting Dashboard': 'reporting-dashboard',
  'Cash vs credit chaos': 'cash-credit',
  'Sales & Billing System': 'sales-billing',
  'No remote visibility': 'remote-visibility',
  'Real-Time Fuel Inventory Monitoring': 'fuel-inventory',
  'Staff Shift & Attendance Management': 'staff-shift',
  'Lubricant & Shop Inventory Management': 'lube-inventory',
  'Secure & Cloud-Based Access': 'cloud-access',
}

const INDEX_TO_TYPE = [
  'stock-dip',
  'reporting-dashboard',
  'cash-credit',
  'sales-billing',
  'remote-visibility',
  'fuel-inventory',
  'staff-shift',
  'lube-inventory',
  'cloud-access',
]

export function getFeatureMockupType(title, index = 0) {
  return TITLE_TO_TYPE[title] || INDEX_TO_TYPE[index % INDEX_TO_TYPE.length]
}

function W({ className = '', children }) {
  return (
    <div className={`rounded border border-border/70 bg-white shadow-sm ${className}`}>{children}</div>
  )
}

function StockDipMockup() {
  return (
    <div className="flex h-full flex-col gap-0.5">
      <W className="flex items-center justify-between px-1 py-0.5">
        <div className="flex items-center gap-0.5">
          <Droplets className="h-2 w-2 text-primary" />
          <span className="text-[5px] font-semibold text-foreground">Tank Stock</span>
        </div>
        <span className="rounded-full bg-primary/10 px-1 text-[4px] font-semibold text-primary">
          Dip
        </span>
      </W>
      <div className="grid flex-1 grid-cols-3 gap-0.5">
        {[
          ['Open', '22.5K'],
          ['Close', '18.2K'],
          ['Var', '-18L'],
        ].map(([label, val]) => (
          <W key={label} className="flex flex-col items-center justify-center py-0.5 text-center">
            <span className="text-[4px] text-muted-foreground">{label}</span>
            <span
              className={`text-[5px] font-bold ${label === 'Var' ? 'text-destructive' : 'text-foreground'}`}
            >
              {val}
            </span>
          </W>
        ))}
      </div>
      <W className="px-1 py-0.5">
        <div className="mb-0.5 flex justify-between text-[4px] text-muted-foreground">
          <span>Level</span>
          <span className="font-semibold text-primary">72%</span>
        </div>
        <div className="h-1 rounded-full bg-muted">
          <div className="h-full w-[72%] rounded-full bg-primary" />
        </div>
      </W>
    </div>
  )
}

function ReportingDashboardMockup() {
  return (
    <div className="flex h-full gap-0.5">
      <div className="flex w-[38%] flex-col gap-0.5">
        {[
          ['Sales', '2.8M'],
          ['Profit', '420K'],
          ['Stock', '9.8K'],
        ].map(([label, val]) => (
          <W key={label} className="flex-1 px-1 py-0.5">
            <p className="text-[4px] text-muted-foreground">{label}</p>
            <p className="text-[5px] font-bold text-foreground">{val}</p>
          </W>
        ))}
      </div>
      <W className="flex flex-1 flex-col px-1 py-0.5">
        <div className="flex items-center gap-0.5 text-[4px] text-muted-foreground">
          <BarChart3 className="h-2 w-2 text-primary" />
          Report
        </div>
        <div className="flex flex-1 items-end gap-px py-0.5">
          {[40, 65, 48, 80, 55, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-slate-800/85"
              style={{ height: `${h}%`, minHeight: '4px' }}
            />
          ))}
        </div>
      </W>
    </div>
  )
}

function CashCreditMockup() {
  return (
    <div className="flex h-full flex-col gap-0.5">
      <div className="grid grid-cols-3 gap-0.5">
        {[
          ['Cash', '1.9M', 'text-emerald-700'],
          ['Credit', '890K', 'text-orange-700'],
          ['Due', '248K', 'text-primary'],
        ].map(([label, val, color]) => (
          <W key={label} className="px-0.5 py-0.5 text-center">
            <p className="text-[4px] text-muted-foreground">{label}</p>
            <p className={`text-[5px] font-bold ${color}`}>{val}</p>
          </W>
        ))}
      </div>
      <W className="flex-1 overflow-hidden p-0">
        <div className="bg-muted px-1 py-0.5 text-[4px] font-semibold text-muted-foreground">
          Ledger
        </div>
        {[
          ['Shift A', 'PKR 45K'],
          ['Credit', 'PKR 12K'],
        ].map(([row, amt]) => (
          <div key={row} className="flex justify-between border-t border-border/50 px-1 py-0.5 text-[4px]">
            <span className="text-foreground">{row}</span>
            <span className="font-semibold text-primary">{amt}</span>
          </div>
        ))}
      </W>
    </div>
  )
}

function SalesBillingMockup() {
  return (
    <W className="flex h-full flex-col overflow-hidden p-0">
      <div className="bg-[#C4511A] px-1 py-0.5 text-center text-[4px] font-semibold text-white">
        Invoice #1042
      </div>
      <div className="flex flex-1 flex-col justify-between px-1 py-0.5">
        <div className="flex justify-between text-[4px]">
          <span className="text-muted-foreground">Nozzle #2</span>
          <span className="font-medium text-foreground">420 L</span>
        </div>
        <div className="flex justify-between text-[4px]">
          <span className="text-muted-foreground">Rate</span>
          <span className="text-foreground">PKR 289</span>
        </div>
        <div className="flex justify-between border-t border-border/60 pt-0.5 text-[5px] font-bold">
          <span className="text-foreground">Total</span>
          <span className="text-primary">PKR 121K</span>
        </div>
      </div>
    </W>
  )
}

function RemoteVisibilityMockup() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-full w-[52%] rounded-md border-[1.5px] border-slate-700 bg-white p-0.5 shadow-sm">
        <div className="rounded-t bg-[#C4511A] py-0.5 text-center text-[4px] font-semibold text-white">
          Petroleu
        </div>
        <div className="space-y-0.5 p-0.5" style={{ background: '#faf6f1' }}>
          <W className="px-0.5 py-0.5">
            <div className="flex items-center gap-0.5 text-[4px] text-muted-foreground">
              <TrendingUp className="h-1.5 w-1.5 text-primary" />
              Sales
            </div>
            <p className="text-[5px] font-bold text-foreground">2.8M</p>
          </W>
          <div className="grid grid-cols-2 gap-0.5">
            <W className="px-0.5 py-0.5">
              <p className="text-[3px] text-muted-foreground">Stock</p>
              <p className="text-[4px] font-bold">9.8K L</p>
            </W>
            <W className="px-0.5 py-0.5">
              <div className="flex items-center gap-0.5 text-[3px] text-muted-foreground">
                <Wallet className="h-1.5 w-1.5 text-primary" />
                Cash
              </div>
              <p className="text-[4px] font-bold">1.9M</p>
            </W>
          </div>
        </div>
      </div>
    </div>
  )
}

function FuelInventoryMockup() {
  return (
    <div className="flex h-full flex-col gap-0.5">
      <W className="flex items-center justify-between px-1 py-0.5">
        <span className="text-[5px] font-semibold text-foreground">Inventory</span>
        <span className="flex items-center gap-0.5 rounded-full bg-orange-50 px-1 text-[3px] font-semibold text-orange-700">
          <AlertTriangle className="h-1.5 w-1.5" />
          Low
        </span>
      </W>
      {[
        ['Petrol', 72],
        ['Diesel', 45],
      ].map(([fuel, pct]) => (
        <W key={fuel} className="px-1 py-0.5">
          <div className="mb-0.5 flex justify-between text-[4px]">
            <span className="text-muted-foreground">{fuel}</span>
            <span className="font-semibold text-primary">{pct}%</span>
          </div>
          <div className="h-1 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </W>
      ))}
    </div>
  )
}

function StaffShiftMockup() {
  return (
    <div className="flex h-full flex-col gap-0.5">
      <W className="flex items-center justify-between px-1 py-0.5">
        <div className="flex items-center gap-0.5">
          <Users className="h-2 w-2 text-primary" />
          <span className="text-[5px] font-semibold text-foreground">Shift</span>
        </div>
        <span className="rounded-full bg-emerald-50 px-1 text-[3px] font-semibold text-emerald-700">
          Present
        </span>
      </W>
      <W className="flex-1 overflow-hidden p-0">
        {[
          ['Ali K.', '8AM–4PM'],
          ['Salary', 'PKR 42K'],
          ['OT', '+4 hrs'],
        ].map(([label, val]) => (
          <div
            key={label}
            className="flex justify-between border-t border-border/50 px-1 py-0.5 text-[4px] first:border-t-0"
          >
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold text-foreground">{val}</span>
          </div>
        ))}
      </W>
    </div>
  )
}

function LubeInventoryMockup() {
  return (
    <div className="flex h-full flex-col gap-0.5">
      <div className="grid grid-cols-2 gap-0.5">
        <W className="px-0.5 py-0.5">
          <p className="text-[4px] text-muted-foreground">Engine Oil</p>
          <p className="text-[5px] font-bold text-foreground">48 pcs</p>
        </W>
        <W className="px-0.5 py-0.5">
          <p className="text-[4px] text-muted-foreground">Brake Fluid</p>
          <p className="text-[5px] font-bold text-foreground">22 pcs</p>
        </W>
      </div>
      <W className="flex-1 overflow-hidden p-0">
        <div className="bg-muted px-1 py-0.5 text-[4px] font-semibold text-muted-foreground">
          Shop Stock
        </div>
        {[
          ['5W-30', '12'],
          ['ATF', '8'],
        ].map(([item, qty]) => (
          <div
            key={item}
            className="flex justify-between border-t border-border/50 px-1 py-0.5 text-[4px]"
          >
            <span className="text-foreground">{item}</span>
            <span className="font-semibold text-primary">{qty}</span>
          </div>
        ))}
      </W>
      <span className="self-start rounded-full bg-orange-50 px-1 text-[3px] font-semibold text-orange-700">
        Low Stock
      </span>
    </div>
  )
}

function CloudAccessMockup() {
  return (
    <div className="flex h-full gap-0.5">
      <W className="flex w-[40%] flex-col items-center justify-center gap-0.5 px-0.5 py-0.5 text-center">
        <Cloud className="h-2.5 w-2.5 text-primary" />
        <span className="text-[4px] font-semibold text-foreground">Cloud</span>
        <span className="flex items-center gap-0.5 text-[3px] text-emerald-700">
          <CheckCircle2 className="h-1.5 w-1.5" />
          Backup
        </span>
        <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1 text-[3px] font-semibold text-primary">
          <RefreshCw className="h-1.5 w-1.5" />
          Sync
        </span>
      </W>
      <W className="flex flex-1 flex-col justify-between px-1 py-0.5">
        <div className="flex items-center gap-0.5 text-[4px] font-semibold text-foreground">
          <Shield className="h-2 w-2 text-primary" />
          Roles
        </div>
        {['Admin', 'Manager', 'Staff'].map((role) => (
          <div key={role} className="flex items-center justify-between text-[4px]">
            <span className="text-muted-foreground">{role}</span>
            <span className="rounded bg-emerald-50 px-0.5 text-[3px] font-semibold text-emerald-700">
              OK
            </span>
          </div>
        ))}
      </W>
    </div>
  )
}

const MOCKUPS = {
  'stock-dip': StockDipMockup,
  'reporting-dashboard': ReportingDashboardMockup,
  'cash-credit': CashCreditMockup,
  'sales-billing': SalesBillingMockup,
  'remote-visibility': RemoteVisibilityMockup,
  'fuel-inventory': FuelInventoryMockup,
  'staff-shift': StaffShiftMockup,
  'lube-inventory': LubeInventoryMockup,
  'cloud-access': CloudAccessMockup,
}

export function FeatureMiniMockup({ type, title, index = 0 }) {
  const resolvedType = type || getFeatureMockupType(title, index)
  const Mockup = MOCKUPS[resolvedType] || StockDipMockup

  return (
    <div
      className="h-[75px] w-[115px] shrink-0 overflow-hidden rounded-lg p-1"
      style={{ background: '#faf6f1' }}
      aria-hidden="true"
    >
      <Mockup />
    </div>
  )
}

export default FeatureMiniMockup
