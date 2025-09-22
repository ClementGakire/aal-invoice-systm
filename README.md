# AAL Invoice Frontend (Mock)

This repository contains a mock frontend implementation of the AAL Invoice dashboard built with Vite + React + TypeScript and Tailwind utility styles.

Features implemented (mock):

- Dashboard with KPI cards
- Clients, Jobs, Suppliers, Services, Invoices, Expenses pages
- Role selector (admin/finance/operations/client) - client-side only
- Mock data in `src/services/mockData.ts`

Install and run

1. Install dependencies

```bash
npm install
```

2. Start the dev server

```bash
npm run dev
```

Open the URL shown by Vite (usually http://localhost:5173)

Notes

- This is frontend-only and uses in-memory mock data. No API integration yet.
- For production, implement server-side auth, persistence, backups, and exports.

Next steps you can ask me to implement:

- Add create/edit forms and persist mock data to localStorage
- Add CSV / PDF exports for invoices
- Implement real authentication and API wiring

# AAL Invoice Frontend (mock)

This is a scaffolded Vite + React + TypeScript frontend that implements the UI structure described in `docs/frontend-spec.md` using mock data.

Features implemented (mocked):

- Clients list and simple client cards
- Jobs list
- Suppliers list
- Services (revenue streams) with VAT toggle
- Invoices list and counts on dashboard
- Expenses list
- Client Portal placeholder
- Role selector (Admin, Finance, Operations, Client) to simulate role-based visibility

How to run

1. Install dependencies

```bash
cd /Users/clementgakire/Documents/APPS/aal-invoice-frontend
npm install
```

2. Run dev server

```bash
npm run dev
```

Notes

- This uses mock data in `src/services/mockData.ts`. The API is not implemented yet.
- Tailwind is configured but you must install dependencies for it to work.

Next steps

- Wire the frontend to a real API.
- Add forms for creating clients/jobs/suppliers/invoices/expenses.
- Implement file-based backups and export features.
