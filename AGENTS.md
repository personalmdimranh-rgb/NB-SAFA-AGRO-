<!-- BEGIN:nextjs-agent-rules -->
# Livestock Agro Farm Management System - Agent Development Guide

This guide establishes the rules, architectural patterns, and database standards for implementing the conversion of the project into the NB Safa Agro Farm Management System. All future agents working on this codebase must strictly adhere to these instructions.

## 1. Project Context & Purpose
- **Target System:** A secure, responsive Livestock Agro Farm Management System (NB Safa Agro) optimized for mobile, desktop, and office usage.
- **Core Focus:** Silage production tracking, accounting (cash/bank ledger, P&L, dues), dealer portal (sales, commission, invoicing), director metrics (shares, investments, dividends), and employee management.

## 2. Technical Stack & UI Patterns
- **Framework:** Next.js (App Router with React Server Components & Server Actions).
- **Database:** MongoDB via Mongoose.
- **Styling:** Tailwind CSS. Dynamic themes must utilize CSS variables in `src/app/theme.css` representing organic/farm-themed brand colors (curated greens and earth tones).
- **Strict Dynamic Theming & Typography:** No hardcoded static color classes (e.g., `bg-emerald-950`, `text-emerald-400`) or hardcoded fonts may be used in layout templates or component screens. All custom components and pages must reference theme-relative classes or variables (e.g. `bg-primary`, `text-primary-foreground`, `font-body`) tied to `src/app/theme.css` so that the theme palette and body/logo typography can be changed dynamically by the super_admin from the System Design configuration panel.
- **Component System:** shadcn/ui.
- **Alerts & Dialogs:**
  - Use **SweetAlert2** for all administrative confirmations (e.g., deleting records, approving dealer registrations, confirming dividend releases, and confirming payroll).
  - Use **shadcn/ui Sonner (sonner)** for lightweight toast notifications (e.g., settings saved, quick status updates).
- **Icons:** Use `lucide-react`.

## 3. Role-Based Access Control & Routing
The system supports 5 primary roles: `admin`, `manager`, `director`, `dealer`, and `staff`.
- **Administrative Portal:** Located under `src/app/(admin)/admin/`. Accessible by `admin`, `manager`, and `staff`.
- **Director Panel:** Located under a dedicated routing group (e.g., `/director/` or within the admin layout with strict director check). Access is restricted to `director` role.
- **Dealer Portal:** Located under a dedicated routing group (e.g., `/dealer/`). Accessible only by registered and approved `dealer` accounts.

## 4. Coding & Data Mutation Standards
- **Server Actions:** All database write operations (creation, update, deletion) must be executed using Next.js Server Actions placed in `src/app/actions/`.
- **Database Models:** All database models must be defined in `src/models/` using Mongoose schemas.
- **Responsive Layouts:** The UI must be fully mobile-responsive (especially for employee attendance, daily production logs, and farmer sales).

## 5. Mongoose Database Models
Ensure the following Mongoose schemas are adhered to when creating/modifying models:

### 5.1. User Schema (`src/models/User.ts`)
```typescript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'director', 'dealer', 'staff'], required: true },
  passwordHash: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}
```

### 5.2. Dealer Schema (`src/models/Dealer.ts`)
```typescript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  shopName: { type: String, required: true },
  address: {
    village: String,
    union: String,
    thana: String,
    district: String
  },
  tradeLicense: String,
  nidNumber: String,
  commissionRate: { type: Number, default: 0 }, // Commission per bag/ton or percentage
  commissionWallet: { type: Number, default: 0 },
  totalSalesCount: { type: Number, default: 0 },
  creditLimit: { type: Number, default: 0 },
  currentDues: { type: Number, default: 0 }
}
```

### 5.3. LedgerTransaction Schema (`src/models/LedgerTransaction.ts`)
```typescript
{
  date: { type: Date, required: true, default: Date.now },
  type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
  source: { type: String, enum: ['cash', 'bank'], required: true },
  bankDetails: {
    bankName: String,
    accountNo: String
  },
  category: { type: String, required: true }, // e.g., 'Raw Materials', 'Salary', 'Silage Sale'
  amount: { type: Number, required: true },
  description: String,
  voucherImage: String,
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}
```

### 5.4. Sale Schema / Invoice (`src/models/Sale.ts`)
```typescript
{
  invoiceNumber: { type: String, required: true, unique: true },
  buyerType: { type: String, enum: ['dealer', 'farmer'], required: true },
  buyerId: { type: Schema.Types.ObjectId, required: true }, // Refs either Dealer or Farmer
  items: [{
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  commissionApplied: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['paid', 'partially-paid', 'unpaid'], required: true },
  paymentMethod: { type: String, enum: ['cash', 'bank-transfer', 'bkash', 'nagad'], required: true },
  distributionDistrict: { type: String, required: true },
  date: { type: Date, default: Date.now }
}
```

### 5.5. ProductionBatch Schema (`src/models/ProductionBatch.ts`)
```typescript
{
  batchNumber: { type: String, required: true, unique: true },
  rawMaterialsUsed: [{
    materialName: String,
    quantity: Number, // In kg/tons
    cost: Number
  }],
  totalProducedQty: { type: Number, required: true }, // In bags or tons
  productionCostPerUnit: { type: Number, required: true },
  productionDate: { type: Date, required: true, default: Date.now },
  warehouseLocation: String
}
```

### 5.6. Investment Schema (`src/models/Investment.ts`)
```typescript
{
  directorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  investmentAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  equitySharePercentage: { type: Number, required: true },
  paymentMethod: String,
  notes: String
}
```

### 5.7. Employee Schema (`src/models/Employee.ts`)
```typescript
{
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: String,
  designation: { type: String, required: true },
  salaryStructure: {
    basic: { type: Number, required: true },
    allowance: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 }
  },
  attendanceRecords: [{
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'leave'], required: true }
  }],
  workReports: [{
    date: { type: Date, required: true },
    taskPerformed: { type: String, required: true }
  }],
  joiningDate: { type: Date, default: Date.now }
}
```

### 5.8. Farmer Schema (`src/models/Farmer.ts`)
```typescript
{
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  address: {
    village: String,
    thana: String,
    district: String
  },
  cattleCount: { type: Number, default: 0 },
  purchaseCount: { type: Number, default: 0 },
  totalPurchasedQty: { type: Number, default: 0 },
  creditLimit: { type: Number, default: 0 },
  currentDues: { type: Number, default: 0 }
}
```

## 6. System Design Page Constraints
- **Preserve Functionality:** All existing functionalities of the System Design page (`/admin/system-design`) must remain completely unchanged and preserved in future updates.
- **Auto Super Admin Rule:** The email address `imranshuvo101@gmail.com` must be automatically registered/configured as `super_admin` in the system, and this rule/configuration must never be modified or removed.
- **Admin Assignment Workflow:** Only the `super_admin` is permitted to assign the `admin` role to users using only their email address from the user management page. This functionality must be preserved.
- **Project Expiration Setting:** The `super_admin` must be able to set the project's expiration date from the System Design page (`/admin/system-design`), and this functionality must remain fully functional.
<!-- END:nextjs-agent-rules -->
