# Vercel Serverless Functions

This directory contains serverless functions that can be deployed to Vercel.

## Available Endpoints

### 1. Hello Function

**Endpoint:** `/api/hello`

- **Method:** GET
- **Query Parameters:** `name` (optional)
- **Description:** Simple hello world function for testing
- **Example:** `/api/hello?name=John`

### 2. Invoices API

**Endpoint:** `/api/invoices`

- **Methods:** GET, POST
- **Description:** Manage invoices

#### GET /api/invoices

- Get all invoices or specific invoice by ID
- **Query Parameters:** `id` (optional)
- **Examples:**
  - `/api/invoices` - Get all invoices
  - `/api/invoices?id=1` - Get invoice with ID 1

#### POST /api/invoices

- Create a new invoice
- **Body:** JSON object with invoice data
- **Required fields:** `clientName`, `total`, `status`

### 3. Jobs API

**Endpoint:** `/api/jobs`

- **Methods:** GET, POST, PUT, DELETE
- **Description:** Manage logistics jobs

#### GET /api/jobs

- Get all jobs or filter by criteria
- **Query Parameters:**
  - `id` (optional) - Get specific job
  - `type` (optional) - Filter by job type
  - `status` (optional) - Filter by status
- **Examples:**
  - `/api/jobs` - Get all jobs
  - `/api/jobs?type=air_freight` - Get air freight jobs
  - `/api/jobs?status=in_transit` - Get jobs in transit

#### POST /api/jobs

- Create a new logistics job
- **Body:** JSON object with job data
- **Required fields:** `type`, `client`, `origin`, `destination`

#### PUT /api/jobs?id={id}

- Update an existing job
- **Query Parameters:** `id` (required)
- **Body:** JSON object with updated job data

#### DELETE /api/jobs?id={id}

- Delete a job
- **Query Parameters:** `id` (required)

## Development

### Local Testing

To test these functions locally, you can use the Vercel CLI:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Run development server
vercel dev
```

### Deployment

These functions will be automatically deployed when you deploy your project to Vercel:

```bash
vercel --prod
```

## CORS Configuration

All API functions include CORS headers to allow cross-origin requests from your frontend application.

## Error Handling

All functions include proper error handling with appropriate HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 405: Method Not Allowed
- 500: Internal Server Error
