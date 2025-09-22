# AAL Invoice — Frontend Developer Spec (Next.js)

This document describes the API, data shapes, auth flow, pages, components and examples necessary to begin implementing a Next.js frontend for the AAL Invoice system.

## High-level app structure
- Pages (Next.js):
  - `/` — Home / Announcements / Services overview
  - `/services` — Service revenue streams list
  - `/announcements` — Public announcements
  - `/auth/login` — Login page
  - `/portal/[clientId]/jobs` — Client job list (public)
  - `/portal/[clientId]/invoices` — Client invoice list (public)
  - `/jobs` — Staff jobs (protected: operations/admin)
  - `/jobs/[id]` — Job details + delivery status editor (ops/admin)
  - `/clients` — Clients management (admin/ops)
  - `/invoices` — Invoices list & create (finance/operations)
  - `/invoices/[id]/export` — Download invoice PDF/XLSX

## Authentication
- Login: POST `/auth/login` with body `{ email, password }` returns `{ token }`.
- Token: JWT, expires in 7 days. For production prefer httpOnly cookie; for a quick SPA you can store token in memory or localStorage.
- Attach header `Authorization: Bearer <token>` for protected endpoints.
- Roles (from token payload): `admin`, `finance`, `operations`, `client`.
- Server enforces roles; front-end should also gate UI based on roles for UX.

## API endpoints (summary)
Base: `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:3000`)

Public
- GET `/` → root info `{ name: 'AAL Invoice API' }`
- GET `/services` → `[ { id, name, price, currency, vatApplicable } ]`
- GET `/announcements` → `[ { id, title, body, createdAt } ]`
- GET `/portal/:clientId/jobs` → `[ Job ]`
- GET `/portal/:clientId/invoices` → `[ Invoice ]`

Auth / Protected (server enforces roles)
- POST `/auth/login` → `{ token }`

Clients
- GET `/clients` → `[ Client ]` (admin/ops)
- POST `/clients` body `{ name, address?, phone? }` → created Client
- GET `/clients/:id` → Client

Jobs
- GET `/jobs` → `[ Job ]` (ops/admin)
- POST `/jobs` body `{ jobNumber, description, client: { id } }` → created Job
- GET `/jobs/:id` → Job
- POST `/jobs/:id/delivery` body `{ deliveryStatus, deliveryNotes }` → update (roles: operations, admin)

Invoices
- GET `/invoices` → `[ Invoice ]` (finance/operations/admin)
- POST `/invoices` body expected: `{ invoiceNumber, job?, client?, amount (base), currency, vatPercent, vatApplicable }` → server calculates VAT and saves invoice.amount = total; returns `{ invoice, breakdown: { base, vat, total } }` (roles: finance/operations/admin)
- GET `/invoices/:id/pdf` → returns PDF (download, auth required)
- GET `/invoices/:id/xlsx` → returns Excel (download, auth required)

Suppliers
- GET `/suppliers`, POST `/suppliers`

Expenses
- GET `/expenses`, POST `/expenses` (track by job or supplier)

Users
- POST `/users` create user `{ email, password, roles }` (admin)
- GET `/users` (admin)

Announcements
- GET `/announcements` public
- POST `/announcements` (admin)

## Data shapes (TypeScript interfaces)
Use these in your Next.js `types/` or `lib/models.ts`.

interface Client {
  id: string
  name: string
  address?: string
  phone?: string
}

interface Job {
  id: string
  jobNumber: string
  description?: string
  deliveryStatus: string
  deliveryNotes?: string
  client: Client
}

interface Service { id: string; name: string; price: number; currency: string; vatApplicable: boolean }

interface Invoice {
  id: string
  invoiceNumber: string
  job?: Job | null
  client?: Client | null
  amount: number
  currency: string
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'overdue'
}

interface Expense { id: string; amount: number; category?: string; job?: Job; supplier?: Supplier }

interface Supplier { id: string; name: string; contact?: string }

interface Announcement { id: string; title: string; body: string; createdAt: string }

interface User { id: string; email: string; roles: string[] }

## Suggested React hooks & utilities
- `lib/api.ts`: centralized fetch wrapper that injects `Authorization` header from `useAuth()`.
- `hooks/useAuth.tsx`: manages token, login, logout, currentUser, hasRole(role)
- `hooks/useFetch.ts`: generic fetch wrapper for SWR or React Query integration.

Example `api.ts` helper:
```ts
export async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('aal_token') : null;
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) } as any;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, { ...opts, headers });
  if (res.status === 401) {
    // redirect to login or throw
    throw new Error('Unauthorized');
  }
  return res.json();
}
```

## Example flows & UI notes
- Invoice create: show a form where user enters base amount and toggles VAT (and VAT %). Call POST `/invoices` and render returned breakdown to the user.
- Job delivery: for operations/admin users show editor for `deliveryStatus` and `deliveryNotes` and call POST `/jobs/:id/delivery`.
- Client portal: public pages `portal/[clientId]/jobs` and `portal/[clientId]/invoices` to display read-only lists.
- File downloads: For PDF/XLSX, you may fetch with Authorization header and create blob URL to trigger download; safer approach is server-set httpOnly cookie so browser can download directly via anchor link.

## Environment variables (Next.js)
- `NEXT_PUBLIC_API_URL` — API base URL (e.g., `http://localhost:3000`)

## Quick-start checklist for frontend dev
1. Create Next.js app (v13+), add TypeScript.
2. Add `lib/api.ts` and `hooks/useAuth.tsx`.
3. Implement pages: `/`, `/services`, `/announcements`, `/auth/login`, `/portal/[clientId]/jobs`, `/portal/[clientId]/invoices`.
4. Implement login flow with token storage (prefer httpOnly cookie for prod).
5. Implement protected pages with role checks.

## Next possible improvements (for collaboration)
- Add endpoints for server-set httpOnly cookie login (to simplify downloads).
- Add invoice line-items API and richer PDF template (company branding, totals, VAT breakdown).
- Add client registration endpoint and verification flow.

## Contact & handoff notes for API changes
- If the frontend needs additional endpoints (e.g., server cookie-set login, invoice-line endpoints, better search/filters), open an issue and we'll add them.

---
This file was generated from the backend API code in the repository. If you want I can also: (A) scaffold a Next.js starter with example pages wired to these endpoints, or (B) produce a typed `lib/models.ts` file with the interfaces above. Tell me which and I'll create it.
