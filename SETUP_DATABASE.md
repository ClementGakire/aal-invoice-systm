# Setting Up Vercel Postgres Database

## Step 1: Create Database in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project: "aal-front-end"
3. Click on the "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Name it: "aal-invoice-db"
7. Select your preferred region
8. Click "Create"

## Step 2: Get Environment Variables

After creating the database:

1. Click on your new database
2. Go to ".env.local" tab
3. Copy all the environment variables
4. Paste them into your `.env.local` file

The variables should look like this:

```
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NO_SSL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

## Step 3: Connect to Database

After adding the environment variables:

1. Run `npx prisma db push` to create the database schema
2. Run `npx prisma db seed` to populate with initial data
3. Your API endpoints will now connect to the real database

## Step 4: Test the Connection

Visit http://localhost:3000 and the application should now use the real database instead of mock data.
