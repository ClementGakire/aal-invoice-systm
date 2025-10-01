import { LogisticsJob, JobType } from '../types/logistics';
import { User } from '../types';

export type Role = 'admin' | 'finance' | 'operations' | 'client';

export type Client = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  tin?: string;
};
export type Supplier = { id: string; name: string; contact?: string };
export type ServiceItem = {
  id: string;
  name: string;
  price: number;
  currency: string;
  vat?: boolean;
};

// Legacy Job type for backward compatibility
export type Job = {
  id: string;
  jobNumber: string;
  title: string;
  clientId: string;
  clientName: string;
  status: string;
};

// Export LogisticsJob as the main job type
export type { LogisticsJob, JobType };
export type { User };

export let usersMock: User[] = load('users', [
  {
    id: 'u1',
    name: 'John Administrator',
    email: 'admin@aal.com',
    role: 'admin',
    department: 'IT',
    phone: '+1-555-0101',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'u2',
    name: 'Sarah Finance',
    email: 'finance@aal.com',
    role: 'finance',
    department: 'Finance',
    phone: '+1-555-0102',
    isActive: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'u3',
    name: 'Mike Operations',
    email: 'operations@aal.com',
    role: 'operations',
    department: 'Operations',
    phone: '+1-555-0103',
    isActive: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: 'u4',
    name: 'Lisa Johnson',
    email: 'lisa@acmecorp.com',
    role: 'client',
    department: 'Procurement',
    phone: '+1-555-0104',
    isActive: true,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: 'u5',
    name: 'David Chen',
    email: 'david@betalink.com',
    role: 'client',
    department: 'Logistics',
    phone: '+1-555-0105',
    isActive: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-02-15'),
  },
]);

export type InvoiceLineItem = {
  id: string;
  description: string;
  basedOn: string; // e.g., "Qty & UOM", "Shipment"
  rate: number;
  currency: string;
  amount: number;
  taxPercent?: number;
  taxAmount?: number;
  billingAmount: number;
};

export type Invoice = {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  jobId?: string;
  jobNumber?: string;
  bookingNumber?: string;
  status: string;
  invoiceDate: Date;
  dueDate?: Date;
  lineItems: InvoiceLineItem[];
  subTotal: number;
  total: number;
  currency: string;
  amountInWords?: string;
  remarks?: string;
};
export type Expense = {
  id: string;
  title: string;
  amount: number;
  currency: string;
  jobNumber?: string;
  jobId?: string;
  supplierId?: string;
  supplierName?: string;
  createdAt?: Date;
  updatedAt?: Date;
  job?: {
    id: string;
    jobNumber: string;
    title: string;
  };
  supplier?: {
    id: string;
    name: string;
  };
};

const LS_PREFIX = 'aal_demo_v1:';

function load<T>(key: string, fallback: T) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (e) {
    return fallback;
  }
}

function save<T>(key: string, val: T) {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(val));
  } catch (e) {}
}

export let clientsMock: Client[] = load('clients', []);

export function addClient(c: Client) {
  clientsMock = [c, ...clientsMock];
  save('clients', clientsMock);
}

export function updateClient(id: string, updates: Partial<Client>) {
  clientsMock = clientsMock.map((c) =>
    c.id === id ? { ...c, ...updates } : c
  );
  save('clients', clientsMock);
}

export function deleteClient(id: string) {
  clientsMock = clientsMock.filter((c) => c.id !== id);
  save('clients', clientsMock);
}

export const suppliersMock: Supplier[] = load('suppliers', [
  { id: 's1', name: 'Supplier One', contact: 'sup1@example.com' },
  { id: 's2', name: 'Parts & Equipment', contact: 'parts@example.com' },
  { id: 's3', name: 'Office Supplies Co', contact: 'office@example.com' },
  { id: 's4', name: 'Tech Hardware Ltd', contact: 'tech@example.com' },
]);

export const servicesMock: ServiceItem[] = load('services', [
  { id: 'sv1', name: 'Consulting', price: 500, currency: 'USD', vat: true },
  { id: 'sv2', name: 'Delivery', price: 50, currency: 'USD', vat: false },
  { id: 'sv3', name: 'Installation', price: 800, currency: 'USD', vat: true },
  { id: 'sv4', name: 'Maintenance', price: 300, currency: 'USD', vat: true },
  { id: 'sv5', name: 'Training', price: 200, currency: 'USD', vat: false },
]);

// NOTE: Services now use database via API. Mock functions kept for backward compatibility
// but should not be used in new code. Use the API instead.

// Deprecated - Use api.services.create() instead
export function addService(s: ServiceItem) {
  console.warn('addService is deprecated - use api.services.create() instead');
  const arr = [s, ...((exports as any).servicesMock || [])];
  try {
    localStorage.setItem(LS_PREFIX + 'services', JSON.stringify(arr));
  } catch (e) {}
  (exports as any).servicesMock = arr;
}

// Deprecated - Use api.services.update() instead
export function updateService(id: string, updates: Partial<ServiceItem>) {
  console.warn(
    'updateService is deprecated - use api.services.update() instead'
  );
  const current = (exports as any).servicesMock || [];
  const updated = current.map((s: ServiceItem) =>
    s.id === id ? { ...s, ...updates } : s
  );
  try {
    localStorage.setItem(LS_PREFIX + 'services', JSON.stringify(updated));
  } catch (e) {}
  (exports as any).servicesMock = updated;
}

// Deprecated - Use api.services.delete() instead
export function deleteService(id: string) {
  console.warn(
    'deleteService is deprecated - use api.services.delete() instead'
  );
  const current = (exports as any).servicesMock || [];
  const filtered = current.filter((s: ServiceItem) => s.id !== id);
  try {
    localStorage.setItem(LS_PREFIX + 'services', JSON.stringify(filtered));
  } catch (e) {}
  (exports as any).servicesMock = filtered;
}

export const jobsMock: LogisticsJob[] = load('jobs', []);

export let invoicesMock: Invoice[] = load('invoices', [
  {
    id: 'i1',
    number: 'RW-CI-22-00275',
    clientId: 'c1',
    clientName: 'Acme Corp',
    jobId: 'j1',
    jobNumber: 'AF-2024-001',
    bookingNumber: 'RW-BK-22-00279',
    status: 'unpaid',
    invoiceDate: new Date('2024-01-22'),
    dueDate: new Date('2024-02-22'),
    lineItems: [
      {
        id: 'li1-1',
        description: 'Seafreight Charges',
        basedOn: 'Shipment',
        rate: 6500.0,
        currency: 'USD',
        amount: 6500.0,
        billingAmount: 6500.0,
      },
      {
        id: 'li1-2',
        description: 'Transport Charges New York-Kigali',
        basedOn: 'Shipment',
        rate: 4000.0,
        currency: 'USD',
        amount: 4000.0,
        billingAmount: 4000.0,
      },
    ],
    subTotal: 10500.0,
    total: 10500.0,
    currency: 'USD',
    amountInWords: 'Ten Thousand Five Hundred Dollars And Zero Cents',
    remarks: '',
  },
  {
    id: 'i2',
    number: 'RW-CI-22-00276',
    clientId: 'c2',
    clientName: 'Beta LLC',
    jobId: 'j2',
    jobNumber: 'SF-2024-002',
    bookingNumber: 'RW-BK-22-00280',
    status: 'paid',
    invoiceDate: new Date('2024-02-12'),
    dueDate: new Date('2024-03-12'),
    lineItems: [
      {
        id: 'li2-1',
        description: 'Sea Freight Charges - Container',
        basedOn: 'Shipment',
        rate: 8500.0,
        currency: 'USD',
        amount: 8500.0,
        billingAmount: 8500.0,
      },
      {
        id: 'li2-2',
        description: 'Port Handling Charges',
        basedOn: 'Shipment',
        rate: 1200.0,
        currency: 'USD',
        amount: 1200.0,
        billingAmount: 1200.0,
      },
    ],
    subTotal: 9700.0,
    total: 9700.0,
    currency: 'USD',
    amountInWords: 'Nine Thousand Seven Hundred Dollars And Zero Cents',
  },
  {
    id: 'i3',
    number: 'RW-CI-22-00277',
    clientId: 'c3',
    clientName: 'TechStart Inc',
    jobId: 'j3',
    jobNumber: 'RF-2024-003',
    bookingNumber: 'RW-BK-22-00281',
    status: 'paid',
    invoiceDate: new Date('2024-02-18'),
    dueDate: new Date('2024-03-18'),
    lineItems: [
      {
        id: 'li3-1',
        description: 'Road Freight Charges',
        basedOn: 'Shipment',
        rate: 3500.0,
        currency: 'USD',
        amount: 3500.0,
        billingAmount: 3500.0,
      },
      {
        id: 'li3-2',
        description: 'Loading/Unloading Charges',
        basedOn: 'Shipment',
        rate: 500.0,
        currency: 'USD',
        amount: 500.0,
        billingAmount: 500.0,
      },
    ],
    subTotal: 4000.0,
    total: 4000.0,
    currency: 'USD',
    amountInWords: 'Four Thousand Dollars And Zero Cents',
  },
  {
    id: 'i4',
    number: 'RW-CI-22-00278',
    clientId: 'c4',
    clientName: 'Global Solutions',
    jobId: 'j4',
    jobNumber: 'AF-2024-004',
    bookingNumber: 'RW-BK-22-00282',
    status: 'paid',
    invoiceDate: new Date('2024-02-28'),
    dueDate: new Date('2024-03-28'),
    lineItems: [
      {
        id: 'li4-1',
        description: 'Air Freight Charges - Express',
        basedOn: 'Qty & UOM',
        rate: 12.5,
        currency: 'USD',
        amount: 3125.0,
        billingAmount: 3125.0,
      },
      {
        id: 'li4-2',
        description: 'Temperature Control Service',
        basedOn: 'Shipment',
        rate: 800.0,
        currency: 'USD',
        amount: 800.0,
        billingAmount: 800.0,
      },
    ],
    subTotal: 3925.0,
    total: 3925.0,
    currency: 'USD',
    amountInWords:
      'Three Thousand Nine Hundred Twenty Five Dollars And Zero Cents',
  },
  {
    id: 'i5',
    number: 'RW-CI-22-00279',
    clientId: 'c5',
    clientName: 'Creative Agency',
    jobId: 'j5',
    jobNumber: 'SF-2024-005',
    bookingNumber: 'RW-BK-22-00283',
    status: 'unpaid',
    invoiceDate: new Date('2024-03-08'),
    dueDate: new Date('2024-04-08'),
    lineItems: [
      {
        id: 'li5-1',
        description: 'Sea Freight Charges - FCL',
        basedOn: 'Shipment',
        rate: 7200.0,
        currency: 'USD',
        amount: 7200.0,
        billingAmount: 7200.0,
      },
      {
        id: 'li5-2',
        description: 'Customs Clearance',
        basedOn: 'Shipment',
        rate: 450.0,
        currency: 'USD',
        amount: 450.0,
        billingAmount: 450.0,
      },
    ],
    subTotal: 7650.0,
    total: 7650.0,
    currency: 'USD',
    amountInWords: 'Seven Thousand Six Hundred Fifty Dollars And Zero Cents',
  },
]);

export function addInvoice(inv: Invoice) {
  invoicesMock = [inv, ...invoicesMock];
  save('invoices', invoicesMock);
}

export function updateInvoice(id: string, updates: Partial<Invoice>) {
  invoicesMock = invoicesMock.map((i) =>
    i.id === id ? { ...i, ...updates } : i
  );
  save('invoices', invoicesMock);
}

export function deleteInvoice(id: string) {
  invoicesMock = invoicesMock.filter((i) => i.id !== id);
  save('invoices', invoicesMock);
}

export const expensesMock: Expense[] = load('expenses', [
  {
    id: 'e1',
    title: 'Equipment parts',
    amount: 320,
    currency: 'USD',
    jobNumber: '1001',
    supplierId: 's1',
    supplierName: 'Parts & Equipment',
  },
  {
    id: 'e2',
    title: 'Office supplies',
    amount: 150,
    currency: 'USD',
    supplierId: 's3',
    supplierName: 'Office Supplies Co',
  },
  {
    id: 'e3',
    title: 'Hardware components',
    amount: 890,
    currency: 'USD',
    jobNumber: '1003',
    supplierId: 's4',
    supplierName: 'Tech Hardware Ltd',
  },
  {
    id: 'e4',
    title: 'Maintenance tools',
    amount: 245,
    currency: 'USD',
    jobNumber: '1002',
    supplierId: 's2',
    supplierName: 'Parts & Equipment',
  },
  {
    id: 'e5',
    title: 'Training materials',
    amount: 125,
    currency: 'USD',
    jobNumber: '1004',
    supplierId: 's3',
    supplierName: 'Office Supplies Co',
  },
]);

export function addSupplier(s: Supplier) {
  const arr = [s, ...((exports as any).suppliersMock || [])];
  try {
    localStorage.setItem(LS_PREFIX + 'suppliers', JSON.stringify(arr));
  } catch (e) {}
  (exports as any).suppliersMock = arr;
}

export function updateSupplier(id: string, updates: Partial<Supplier>) {
  const current = (exports as any).suppliersMock || [];
  const updated = current.map((s: Supplier) =>
    s.id === id ? { ...s, ...updates } : s
  );
  try {
    localStorage.setItem(LS_PREFIX + 'suppliers', JSON.stringify(updated));
  } catch (e) {}
  (exports as any).suppliersMock = updated;
}

export function deleteSupplier(id: string) {
  const current = (exports as any).suppliersMock || [];
  const filtered = current.filter((s: Supplier) => s.id !== id);
  try {
    localStorage.setItem(LS_PREFIX + 'suppliers', JSON.stringify(filtered));
  } catch (e) {}
  (exports as any).suppliersMock = filtered;
}

export function addJob(j: LogisticsJob) {
  const arr = [j, ...((exports as any).jobsMock || [])];
  try {
    localStorage.setItem(LS_PREFIX + 'jobs', JSON.stringify(arr));
  } catch (e) {}
  (exports as any).jobsMock = arr;
}

export function updateJob(id: string, updates: Partial<LogisticsJob>) {
  const current = (exports as any).jobsMock || [];
  const updated = current.map((j: LogisticsJob) =>
    j.id === id ? { ...j, ...updates } : j
  );
  try {
    localStorage.setItem(LS_PREFIX + 'jobs', JSON.stringify(updated));
  } catch (e) {}
  (exports as any).jobsMock = updated;
}

export function deleteJob(id: string) {
  const current = (exports as any).jobsMock || [];
  const filtered = current.filter((j: LogisticsJob) => j.id !== id);
  try {
    localStorage.setItem(LS_PREFIX + 'jobs', JSON.stringify(filtered));
  } catch (e) {}
  (exports as any).jobsMock = filtered;
}

export function addExpense(e: Expense) {
  console.warn(
    '⚠️ DEPRECATED: addExpense() is deprecated. Use database operations via api/expenses.js instead.'
  );
  const arr = [e, ...((exports as any).expensesMock || [])];
  try {
    localStorage.setItem(LS_PREFIX + 'expenses', JSON.stringify(arr));
  } catch (e) {}
  (exports as any).expensesMock = arr;
}

export function updateExpense(id: string, updates: Partial<Expense>) {
  console.warn(
    '⚠️ DEPRECATED: updateExpense() is deprecated. Use database operations via api/expenses.js instead.'
  );
  const current = (exports as any).expensesMock || [];
  const updated = current.map((e: Expense) =>
    e.id === id ? { ...e, ...updates } : e
  );
  try {
    localStorage.setItem(LS_PREFIX + 'expenses', JSON.stringify(updated));
  } catch (e) {}
  (exports as any).expensesMock = updated;
}

export function deleteExpense(id: string) {
  console.warn(
    '⚠️ DEPRECATED: deleteExpense() is deprecated. Use database operations via api/expenses.js instead.'
  );
  const current = (exports as any).expensesMock || [];
  const filtered = current.filter((e: Expense) => e.id !== id);
  try {
    localStorage.setItem(LS_PREFIX + 'expenses', JSON.stringify(filtered));
  } catch (e) {}
  (exports as any).expensesMock = filtered;
}

export function addUser(u: User) {
  usersMock = [u, ...usersMock];
  save('users', usersMock);
}

export function updateUser(id: string, updates: Partial<User>) {
  usersMock = usersMock.map((u) => (u.id === id ? { ...u, ...updates } : u));
  save('users', usersMock);
}

export function deleteUser(id: string) {
  usersMock = usersMock.filter((u) => u.id !== id);
  save('users', usersMock);
}
