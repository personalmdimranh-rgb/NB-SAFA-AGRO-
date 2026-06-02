# NB Safa Agro - Livestock Agro Farm Management System
## Detailed Technical & Functional Feature Proposal
---

এই প্রস্তাবনাটি (Proposal) **NB Safa Agro**-কে একটি প্রিমিয়াম লাইভস্টক এবং এগ্রো ফার্ম ম্যানেজমেন্ট সিস্টেমে রূপান্তরিত করার লক্ষ্যে তৈরি করা হয়েছে। এটি মোবাইল, কম্পিউটার ও অফিস থেকে রিয়েল-টাইম ডাটা সিঙ্ক নিশ্চিত করে একক প্ল্যাটফর্মের মাধ্যমে পরিচালনা করা যাবে।

---

## ১. প্রযুক্তিগত ওভারভিউ (Tech Stack Overview)
- **Frontend / Backend Framework:** Next.js (App Router with Server Actions)
- **Database:** MongoDB (using Mongoose for robust schema design and aggregations)
- **Styling:** Tailwind CSS (using CSS variables for dynamic themes: Organic Greens & Earthy Tones)
- **UI Components:** Shadcn/ui (Radix Primitives)
- **Alerts & Toasts:** SweetAlert2 (for administrative validations/confirmations) & Shadcn Sonner (for user-facing toast notifications)
- **Icons & Charts:** Lucide React & Recharts (for dashboards and financial reports)
- **Document Generation:** PDFKit or Puppeteer-based server-side PDF generator (for Invoices & Appointment letters)

---

## ২. মডিউল-ভিত্তিক বিস্তারিত ফিচারসমূহ (Module-wise Features)

### মডিউল ১: অ্যাকাউন্টস ম্যানেজমেন্ট (Accounts Management)
একটি খামারের মূল ভিত্তি হলো সঠিক হিসাব-নিকাশ। এই মডিউলে থাকবে:
- **ক্যাশ হিসাব (Cash Ledger):** অফিসের দৈনিক ক্যাশ-ইন এবং ক্যাশ-আউটের রিয়েল-টাইম ব্যালেন্স হিসাব।
- **ব্যাংক হিসাব (Bank Accounts & Ledgers):** একাধিক ব্যাংক অ্যাকাউন্টের ব্যালেন্স ট্র্যাকিং, অ্যাকাউন্ট থেকে অ্যাকাউন্টে ফান্ড ট্রান্সফার এবং ব্যাংক ডিপোজিট/উইথড্র ট্র্যাকিং।
- **আয়-ব্যয় ক্যাটাগরি (Income & Expense Logging):** 
  - আয়ের উৎস: সাইলেজ বিক্রয়, ডিলার রেজিস্ট্রেশন ফি, ইনভেস্টমেন্ট।
  - ব্যয়ের উৎস: কর্মচারীদের বেতন, কাঁচামাল ক্রয়, গাড়ি ভাড়া, বিদ্যুৎ বিল, অবচয় (Depreciation) ইত্যাদি।
- **দৈনিক লেনদেন (Daily Transactions):** একটি দৈনিক সাধারণ খতিয়ান (General Ledger) যেখানে যেকোনো খরচের ইনভয়েস/ভাউচার আপলোড করা যাবে।
- **লাভ-লোকসান রিপোর্ট (Profit & Loss Report):** নির্দিষ্ট দিন, মাস বা বছরের জন্য ফিল্টারযোগ্য গ্রাফিকাল রিপ্রেজেন্টেশন সহ ডাইনামিক P&L স্টেটমেন্ট।
- **বকেয়া হিসাব (Receivables & Dues Ledger):** কাস্টমার এবং ডিলারদের মোট কত বকেয়া রয়েছে এবং কখন তারা পরিশোধ করবে তার রিমাইন্ডার সিস্টেম।

---

### মডিউল ২: সেলস ও ডিলার সিস্টেম (Sales & Dealer System)
সাইলেজ (Silage) বিক্রয় এবং ডিস্ট্রিবিউশন চ্যানেল মজবুত করার জন্য এই মডিউলটি ডিজাইন করা হবে:
- **ডিলার নিবন্ধন পোর্টাল (Dealer Registration Portal):**
  - ডিলাররা একটি নির্দিষ্ট পোর্টালের মাধ্যমে তাদের ট্রেড লাইসেন্স, জাতীয় পরিচয়পত্র ও দোকান সম্পর্কিত তথ্য দিয়ে আবেদন করবে।
  - অ্যাডমিন প্যানেল থেকে আবেদন রিভিউ এবং অনুমোদন করার পর ডিলার অ্যাকাউন্ট অ্যাক্টিভ হবে।
- **সাইলেজ বিক্রয় ও অর্ডার বুকিং (Silage Sales Engine):** 
  - ডিলার এবং রিটেইল কাস্টমারদের জন্য পৃথক প্রাইস লিস্ট নির্ধারণের সুবিধা।
  - ওজনের ভিত্তিতে (যেমন: ৫০ কেজি ব্যাগ, ১০০ কেজি ব্যাগ বা টন) সাইলেজ বুকিং।
- **ডাইনামিক ইনভয়েস জেনারেশন (Invoice Generation):** 
  - অর্ডারের সাথে সাথেই অটো-জেনারেটেড প্রফেশনাল ইনভয়েস (PDF)।
  - ইনভয়েসের প্রিন্ট কপি এবং ডিলারদের মোবাইলে এসএমএস-এর মাধ্যমে ইনভয়েসের লিংক প্রেরণ।
- **কমিশন হিসাব (Commission Engine):**
  - প্রতি ব্যাগ বা প্রতি টনে ডিলারদের নির্ধারিত কমিশন হিসাব।
  - ডিলারদের মোট বিক্রির উপর ভিত্তি করে ডাইনামিক কমিশন ওয়ালেট, যা তারা পরবর্তী অর্ডারে অ্যাডজাস্ট করতে পারবে বা ক্যাশ আউট করতে পারবে।
- **বিক্রির রিপোর্ট (Sales Analytics):**
  - ডিলার-ভিত্তিক, জেলা-ভিত্তিক ও নির্দিষ্ট সময়সীমার মধ্যে সাইলেজ বিক্রির বিস্তারিত বিবরণ এবং চার্ট।

---

### মডিউল ৩: ডিরেক্টর প্যানেল (Director Panel)
বিনিয়োগকারী ও পরিচালকদের পারফরম্যান্স ও লভ্যাংশ নিশ্চিত করার জন্য এই সুরক্ষিত প্যানেল থাকবে:
- **বিনিয়োগ হিসেব (Investment Ledger):** কোন ডিরেক্টর কত টাকা বিনিয়োগ করেছেন, তার তারিখ এবং ক্যাপিটাল হিস্ট্রি।
- **শেয়ার শতাংশ (Share Percentage Tracker):** মোট মূলধনের (Total Capital Equity) সাপেক্ষে প্রত্যেক ডিরেক্টরের শেয়ার শতাংশ স্বয়ংক্রিয়ভাবে হিসাব করা।
- **লভ্যাংশ বন্টন ক্যালকুলেটর (Dividend Distribution Engine):** P&L রিপোর্টের নিট মুনাফা (Net Profit) অনুযায়ী ডিরেক্টরদের শেয়ারের হার অনুযায়ী কে কত লভ্যাংশ পাবেন তা স্বয়ংক্রিয়ভাবে হিসাব ও রেকর্ড করা।
- **মিটিং ও রেজুলেশন রিপোর্ট (Board Meetings & Reports):** 
  - বোর্ড মিটিংয়ের এজেন্ডা, তারিখ এবং সদস্যদের উপস্থিতির বিবরণ।
  - মিটিংয়ে নেওয়া সিদ্ধান্তসমূহ (Board Resolutions) পিডিএফ হিসেবে আপলোড ও ডিরেক্টরদের জন্য শেয়ার করার সুবিধা।

---

### মডিউল ৪: ইনভেন্টরি ও স্টক (Inventory & Stock Management)
সাইলেজ উৎপাদন থেকে বিক্রয় পর্যন্ত প্রতিটি ধাপ ট্র্যাক করার জন্য:
- **সাইলেজ উৎপাদন ট্র্যাকিং (Production Log):**
  - কাঁচামাল (ভুট্টা গাছ, চিটাগুড়, প্রিজারভেটিভ) খরচের ডাটা সহ উৎপাদনের ব্যাচ তৈরি।
  - প্রতি ব্যাচে কত কেজি/টন সাইলেজ উৎপাদিত হলো এবং গুদামে প্রবেশ করল তা নথিবদ্ধ করা।
- **গুদামজাত পণ্য ট্র্যাকিং (Warehouse Stock):**
  - বর্তমান স্টকের তাৎক্ষণিক বিবরণ (Current Available Stock)।
  - সর্বনিম্ন মজুদ (Low Stock Alert) নির্ধারণ করা, যা উৎপাদনকারীদের পুনরায় উৎপাদনের সংকেত দিবে।
- **জেলা-ভিত্তিক বিতরণ (District-wise Distribution Map):** 
  - কোন জেলায় কত টন সাইলেজ পাঠানো হয়েছে এবং বিক্রয় হয়েছে তার ডেডিকেটেড হিটম্যাপ বা ডিস্ট্রিক্ট ফিল্টার ডাটাবেজ।

---

### মডিউল ৫: এমপ্লয়ি ম্যানেজমেন্ট (Employee Management)
খামারের কর্মচারী ও কর্মকর্তাদের কর্মক্ষমতা ও বেতন ব্যবস্থাপনার জন্য:
- **কর্মচারী প্রোফাইল (Employee Database):** ব্যক্তিগত বিবরণ, এনআইডি, পদের নাম, বেতন কাঠামো এবং যোগদানের তারিখ।
- **দৈনিক হাজিরা (Daily Attendance Logger):** সুপারভাইজারের মোবাইল ডিভাইস থেকে খুব সহজে কর্মচারীদের উপস্থিতি ও অনুপস্থিতি ট্র্যাকিং।
- **কাজের দৈনিক রিপোর্ট (Daily Work Logs):** কে কোন ব্যাচের প্রোডাকশনে বা ডেলিভারিতে যুক্ত ছিল তার ট্র্যাকিং।
- **বেতন ও পে-রোল (Payroll Processing):** হাজিরা ও বকেয়া/অগ্রিমের ভিত্তিতে মাসিক স্যালারি শিট তৈরি ও পে-স্লিপ প্রিন্ট করার সুবিধা।
- **নিয়োগপত্র জেনারেটর (Appointment Letter Template Engine):** অ্যাডমিন প্যানেল থেকে নতুন কর্মচারীদের জন্য স্বয়ংক্রিয় নিয়োগপত্র (Niyogpatra) তৈরি ও প্রিন্ট করার সুবিধা।

---

### মডিউল ৬: খামারী ও কাস্টমার ডাটাবেজ (Farmer & Customer CRM)
ফার্মের প্রধান ভোক্তা তথা খামারীদের সাথে সম্পর্ক জোরদার করতে:
- **খামারী প্রোফাইল (Farmer CRM Profile):** খামারীর নাম, খামারের ঠিকানা (গ্রাম, থানা, জেলা), মোবাইল নাম্বার এবং পশুর সংখ্যা।
- **ক্রয় ফ্রিকোয়েন্সি (Purchase History Ledger):** নির্দিষ্ট খামারী কতবার পণ্য ক্রয় করেছেন এবং তার গড় অর্ডারের পরিমাণ কত তা ট্র্যাক করা।
- **বকেয়া ও বাকির লিমিট (Dues & Credit Management):**
  - কোন খামারীর কাছে কত টাকা বকেয়া আছে।
  - খামারী-ভিত্তিক সর্বোচ্চ বাকির সীমা (Credit Limit) নির্ধারণ। লিমিট অতিক্রম করলে অর্ডার সিস্টেমে লক হয়ে যাবে।

---

## ৩. ড্যাশবোর্ড ও ইন্টারফেস ডিজাইন (UI/UX Mockup Flow)

### ক. অ্যাডমিন পোর্টাল (Admin & Manager Portal - Manager View Only)
*দ্রষ্টব্য: অ্যাডমিন প্যানেল অ্যাক্সেস শুধুমাত্র `admin`, `super_admin` (সম্পূর্ণ এডিট, আপডেট, ডিলিট অধিকার) এবং `manager` (শুধুমাত্র ভিউ/রিড-অনলি অধিকার) রোলের জন্য সীমাবদ্ধ। `staff` বা অন্য কোনো রোলের অ্যাডমিন প্যানেলে প্রবেশাধিকার থাকবে না।*
- ক্যাশ ব্যালেন্স ও ব্যাংক স্টেটমেন্টের রিয়েল-টাইম উইজেট।
- দৈনিক আয়-ব্যয় এবং উৎপাদন বনাম বিক্রয়ের তুলনা গ্রাফ।
- পেন্ডিং ডিলার এপ্রুভাল রিকোয়েস্ট এবং বকেয়া নোটিফিকেশন এলার্ট।

### খ. ডিলার ড্যাশবোর্ড (Dealer Dashboard)
- ডিলারের নিজের প্রোফাইল, বর্তমান অর্ডার স্ট্যাটাস ও ট্র্যাকিং.
- অর্জিত মোট কমিশন ওয়ালেট ও বকেয়ার বিবরণ।
- সাইলেজের অর্ডার প্লেস করার সরাসরি বুকিং ফরম।

### গ. ডিরেক্টর ড্যাশবোর্ড (Director Dashboard)
- ফার্মের মোট মূলধন (Total Capital) এবং শেয়ার বণ্টন পাই-চার্ট।
- চলতি মাসের নিট মুনাফা (Net Profit) ও ডিরেক্টরের শেয়ার অনুযায়ী প্রাপ্য লভ্যাংশ।
- পূর্ববর্তী মিটিংয়ের সিদ্ধান্তসমূহ এবং নোটিশ বোর্ড।

---

## ৪. ডাটাবেজ আর্কিটেকচার (MongoDB Schema Design)

निम्नोक्त स्कीमाग़ुलो MongoDB-तें तैरी करा हबे:

### User Schema (সদস্য/অ্যাডমিনদের জন্য)
```typescript
{
  name: String,
  email: String,
  phone: String,
  role: ['admin', 'manager', 'director', 'dealer', 'staff'],
  passwordHash: String,
  status: ['active', 'inactive']
}
```
*দ্রষ্টব্য: `super_admin` রোলটি অথেনটিকেশন স্তরে অ্যাসাইন করা থাকবে।*

### Dealer Schema (ডিলার প্রোফাইল)
```typescript
{
  userId: ObjectId (ref: User),
  shopName: String,
  address: { village: String, union: String, thana: String, district: String },
  tradeLicense: String,
  nidNumber: String,
  commissionRate: Number, // Percentage or fixed amount per bag
  commissionWallet: Number,
  totalSalesCount: Number,
  creditLimit: Number,
  currentDues: Number
}
```

### LedgerTransaction Schema (আয়-ব্যয় ও দৈনিক লেনদেন)
```typescript
{
  date: Date,
  type: ['income', 'expense', 'transfer'],
  source: ['cash', 'bank'],
  bankDetails: { bankName: String, accountNo: String }, // Optional
  category: String, // e.g., Raw Materials, Salary, Silage Sale
  amount: Number,
  description: String,
  voucherImage: String, // File path/URL
  recordedBy: ObjectId (ref: User)
}
```

### Sale/Invoice Schema (বিক্রয় ও ইনভয়েস)
```typescript
{
  invoiceNumber: String, // Dynamic Auto-incremental (e.g. SA-2026-0001)
  buyerType: ['dealer', 'farmer'],
  buyerId: ObjectId, // Refs either Dealer or Farmer
  items: [{
    productName: String, // e.g., Silage 50kg Bag
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  subtotal: Number,
  discount: Number,
  commissionApplied: Number,
  grandTotal: Number,
  paidAmount: Number,
  dueAmount: Number,
  paymentStatus: ['paid', 'partially-paid', 'unpaid'],
  paymentMethod: ['cash', 'bank-transfer', 'bkash', 'nagad'],
  distributionDistrict: String,
  date: Date
}
```

### ProductionBatch Schema (উৎপাদন ট্র্যাকিং)
```typescript
{
  batchNumber: String,
  rawMaterialsUsed: [{
    materialName: String, // e.g., Maize Plant, Molasses
    quantity: Number, // in kg/tons
    cost: Number
  }],
  totalProducedQty: Number, // in kg/tons
  productionCostPerUnit: Number,
  productionDate: Date,
  warehouseLocation: String
}
```

### Investment Schema (ডিরেক্টরদের বিনিয়োগ)
```typescript
{
  directorId: ObjectId (ref: User),
  investmentAmount: Number,
  date: Date,
  equitySharePercentage: Number,
  paymentMethod: String,
  notes: String
}
```

### Employee Schema (কর্মচারী ও বেতন)
```typescript
{
  name: String,
  phone: String,
  address: String,
  designation: String,
  salaryStructure: {
    basic: Number,
    allowance: Number,
    deductions: Number
  },
  attendanceRecords: [{
    date: Date,
    status: ['present', 'absent', 'leave']
  }],
  workReports: [{
    date: Date,
    taskPerformed: String
  }],
  joiningDate: Date
}
```

### Farmer Schema (খামারী ডাটাবেজ)
```typescript
{
  name: String,
  phone: String,
  address: { village: String, thana: String, district: String },
  cattleCount: Number,
  purchaseCount: Number,
  totalPurchasedQty: Number,
  creditLimit: Number,
  currentDues: Number
}
```

---

## ৫. বাস্তবায়ন পরিকল্পনা ও রোডম্যাপ (১০-১২ দিন)

দ্রুত এবং কার্যকরীভাবে প্রজেক্টটি শেষ করার জন্য ১০-১২ দিনের একটি পর্যায়ভিত্তিক পরিকল্পনা নিচে দেওয়া হলো:

- **দিন ১-২: ডাটাবেজ মডেলিং, রোল-বেসড অথেন্টিকেশন এবং লেআউট রিফ্যাক্টরিং**
  - পূর্ববর্তী ই-কমার্স কোডবেস রিফ্যাক্টরিং এবং MongoDB স্কিমা ইন্টিগ্রেশন।
  - Multi-role (Admin, Manager, Director, Dealer, Staff) রাউটিং ও অ্যাক্সেস কন্ট্রোল স্থাপন।
- **দিন ৩-৪: ইনভেন্টরি, সাইলেজ উৎপাদন ও স্টক ট্র্যাকিং**
  - সাইলেজ উৎপাদন ব্যাচ এন্ট্রি এবং অটোমেটিক স্টক আপডেট সিস্টেম।
  - গুদামে বর্তমান মজুদ ট্র্যাকিং এবং জেলা-ভিত্তিক ডিস্ট্রিবিউশন এন্ট্রি।
- **দিন ৫-৬: অ্যাকাউন্টস ম্যানেজমেন্ট ও সাধারণ খতিয়ান**
  - ক্যাশ এবং ব্যাংক লেজার পোস্টিং, ডেইলি ক্যাশফ্লো এন্ট্রি।
  - লাভ-লোকসান এবং দৈনিক লেনদেনের ডাইনামিক ফিল্টারেবল চার্ট/রিপোর্ট জেনারেটর।
- **দিন ৭-৮: সেলস, ডিলার পোর্টাল ও পিডিএফ ইনভয়েসিং**
  - ডিলার রেজিস্ট্রেশন, অনুমোদন সিস্টেম এবং ডিলার পোর্টাল ড্যাশবোর্ড।
  - বুকিং/বিক্রয় অর্ডার এন্ট্রি, পিডিএফ ইনভয়েস ডাউনলোড এবং কমিশন ক্যালকুলেটর।
- **দিন ৯-১০: ডিরেক্টর প্যানেল এবং এমপ্লয়ি স্যালারি-হাজিরা**
  - ডিরেক্টরদের লভ্যাংশ (Dividend) বণ্টন ক্যালকুলেটর এবং শেয়ার শতাংশ বণ্টন।
  - মিটিং রেজুলেশন পোর্টাল, কর্মচারী হাজিরা ও বেতন কাঠামো (Payroll) ইন্টিগ্রেশন।
- **দিন ১১-১২: কাস্টমার ডাটাবেজ, বাগ ফিক্সিং ও ফাইনাল টেস্টিং**
  - খামারী/কাস্টমার ডাটাবেজ (CRM) ইন্টিগ্রেশন এবং বাকির লিমিট সেটআপ।
  - SweetAlert2 নোটিফিকেশন যুক্ত করে মোবাইল ও পিসিতে ফাইনাল রেসপন্সিভনেস টেস্টিং এবং ডেলিভারি।

---

# ৬. বাজেট ও পেমেন্ট

## **মোট বাজেট:** ১০,০০০ টাকা (BDT 10,000)
