# Vercel Postgres Database Setup Guide

This guide will help you set up Vercel Postgres for your AAL Invoice Management System.

## 🚀 Quick Setup

### 1. Create Vercel Postgres Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to the "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Choose your region and click "Create"

### 2. Get Environment Variables

After creating the database, Vercel will provide you with environment variables:

```bash
POSTGRES_PRISMA_URL="postgres://default:xxx@xxx-pooling.vercel-db.vercel.app/verceldb?sslmode=require&pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://default:xxx@xxx.vercel-db.vercel.app/verceldb?sslmode=require"
```

### 3. Add Environment Variables

#### For Vercel Deployment:
1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add both variables from step 2

#### For Local Development:
Update your `.env` file:

```bash
# Replace with your actual Vercel Postgres URLs
POSTGRES_PRISMA_URL="your_postgres_prisma_url_here"
POSTGRES_URL_NON_POOLING="your_postgres_url_non_pooling_here"
```

## 📊 Database Schema

The database includes the following tables:

- **Users** - System users with role-based access
- **Clients** - Customer information and details
- **Suppliers** - Vendor and supplier management
- **ServiceItems** - Catalog of services offered
- **LogisticsJobs** - Air, sea, and road freight jobs
- **Invoices** - Invoice management with line items
- **InvoiceLineItems** - Detailed invoice items
- **Expenses** - Expense tracking per job/supplier

## 🛠️ Available Commands

### Database Management
```bash
# Generate Prisma client
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Push schema changes (development)
npm run db:push

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (database browser)
npm run db:studio

# Reset database (destructive)
npm run db:reset
```

## 🌱 Seeding the Database

After setting up your database connection, seed it with sample data:

```bash
npm run db:push    # Push schema to database
npm run db:seed    # Populate with sample data
```

This will create:
- 3 system users (admin, finance, operations)
- 5 sample clients
- 3 suppliers
- 3 service items
- 3 logistics jobs (air, sea, road freight)
- 2 sample invoices with line items
- 3 sample expenses

## 🔧 API Endpoints

After setup, you'll have these API endpoints available:

### Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices?id={id}` - Get specific invoice
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices?id={id}` - Update invoice
- `DELETE /api/invoices?id={id}` - Delete invoice

### Jobs
- `GET /api/jobs` - List all logistics jobs
- `GET /api/jobs?id={id}` - Get specific job
- `GET /api/jobs?type=AIR_FREIGHT` - Filter by job type
- `GET /api/jobs?status=IN_PROGRESS` - Filter by status
- `POST /api/jobs` - Create new job
- `PUT /api/jobs?id={id}` - Update job
- `DELETE /api/jobs?id={id}` - Delete job

### Clients
- `GET /api/clients` - List all clients
- `GET /api/clients?id={id}` - Get specific client
- `POST /api/clients` - Create new client
- `PUT /api/clients?id={id}` - Update client
- `DELETE /api/clients?id={id}` - Delete client

## 📝 Schema Updates

When you modify the Prisma schema:

1. **For development:**
   ```bash
   npm run db:push
   ```

2. **For production:**
   ```bash
   npm run db:migrate
   ```

## 🔍 Debugging

### View Database Contents
```bash
npm run db:studio
```

### Check Connection
```bash
npx prisma db pull
```

### View Logs
Check your Vercel function logs in the Vercel dashboard.

## 🚨 Important Notes

1. **Local Development**: Use `db:push` for quick schema changes
2. **Production**: Always use `db:migrate` for schema changes
3. **Backup**: Vercel Postgres automatically backs up your data
4. **Connections**: Prisma handles connection pooling automatically
5. **Security**: Never commit real database URLs to version control

## 🆘 Troubleshooting

### Connection Issues
- Verify environment variables are set correctly
- Check that you're using the correct URLs for your environment
- Ensure your Vercel project is connected to the database

### Migration Issues
- Run `npm run db:reset` to start fresh (development only)
- Check Prisma schema syntax
- Verify all required fields are properly defined

### API Issues
- Check function logs in Vercel dashboard
- Verify Prisma client is generated: `npm run db:generate`
- Ensure proper error handling in API routes

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)