// Import edge-compatible Prisma client
import prisma from '../lib/prisma-edge.js';

export default async function handler(request, response) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  response.setHeader('Content-Type', 'application/json');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    console.log('📊 Dashboard API Request:', request.method, request.url);
    console.log('🔗 Database URL present:', !!process.env.DATABASE_URL);

    if (request.method !== 'GET') {
      response.setHeader('Allow', ['GET', 'OPTIONS']);
      return response
        .status(405)
        .json({ error: `Method ${request.method} not allowed` });
    }

    // Get current date for calculations
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Calculate date ranges
    const startOfYear = new Date(currentYear, 0, 1);
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const startOfLast7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfLast6Months = new Date(currentYear, currentMonth - 5, 1);

    console.log('📅 Date ranges calculated:', {
      startOfYear: startOfYear.toISOString(),
      startOfMonth: startOfMonth.toISOString(),
      startOfLast7Days: startOfLast7Days.toISOString(),
      startOfLast6Months: startOfLast6Months.toISOString(),
    });

    // Fetch all required data in parallel
    const [
      totalClients,
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      totalJobs,
      activeJobs,
      totalExpenses,
      recentJobs,
      recentInvoices,
      salesLast7Days,
      salesLast6Months,
      expensesByCategory,
    ] = await Promise.all([
      // Basic counts
      prisma.client.count(),

      // Invoice statistics
      prisma.invoice.count(),
      prisma.invoice.findMany({
        where: { status: 'PAID' },
        select: { total: true },
      }),
      prisma.invoice.findMany({
        where: { status: { not: 'PAID' } },
        select: { id: true },
      }),

      // Job statistics
      prisma.logisticsJob.count(),
      prisma.logisticsJob.count({
        where: { status: { not: 'DELIVERED' } },
      }),

      // Expense statistics
      prisma.expense.findMany({
        select: { amount: true, currency: true },
      }),

      // Recent data
      prisma.logisticsJob.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { name: true } },
        },
      }),
      prisma.invoice.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { name: true } },
        },
      }),

      // Sales data for charts - last 7 days
      prisma.invoice.findMany({
        where: {
          invoiceDate: { gte: startOfLast7Days },
          status: 'PAID',
        },
        select: {
          total: true,
          invoiceDate: true,
          currency: true,
        },
        orderBy: { invoiceDate: 'asc' },
      }),

      // Sales data for charts - last 6 months
      prisma.invoice.findMany({
        where: {
          invoiceDate: { gte: startOfLast6Months },
          status: 'PAID',
        },
        select: {
          total: true,
          invoiceDate: true,
          currency: true,
        },
        orderBy: { invoiceDate: 'asc' },
      }),

      // Expenses by category (assuming we'll use title as category)
      prisma.expense.findMany({
        select: {
          title: true,
          amount: true,
          currency: true,
        },
      }),
    ]);

    console.log('📊 Data fetched successfully');

    // Calculate revenue (total paid invoices - total expenses)
    const totalRevenue = paidInvoices.reduce(
      (sum, invoice) => sum + (invoice.total || 0),
      0
    );
    const totalExpenseAmount = totalExpenses.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );
    const netRevenue = totalRevenue - totalExpenseAmount;

    // Process sales data for last 7 days
    const salesByDay = {};
    salesLast7Days.forEach((invoice) => {
      const dateKey = new Date(invoice.invoiceDate).toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: 'numeric',
        }
      );
      salesByDay[dateKey] = (salesByDay[dateKey] || 0) + (invoice.total || 0);
    });

    // Create array for last 7 days with zeros for missing days
    const last7DaysData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      last7DaysData.push({
        date: dateKey,
        value: salesByDay[dateKey] || 0,
      });
    }

    // Process sales data for last 6 months
    const salesByMonth = {};
    salesLast6Months.forEach((invoice) => {
      const monthKey = new Date(invoice.invoiceDate).toLocaleDateString(
        'en-US',
        {
          month: 'short',
        }
      );
      salesByMonth[monthKey] =
        (salesByMonth[monthKey] || 0) + (invoice.total || 0);
    });

    // Create array for last 6 months
    const last6MonthsData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', {
        month: 'short',
      });
      last6MonthsData.push({
        month: monthKey,
        value: salesByMonth[monthKey] || 0,
      });
    }

    // Process expenses by category
    const expenseCategories = {};
    let totalExpensesForPie = 0;

    expensesByCategory.forEach((expense) => {
      const category = expense.title || 'Other';
      expenseCategories[category] =
        (expenseCategories[category] || 0) + (expense.amount || 0);
      totalExpensesForPie += expense.amount || 0;
    });

    // Convert to pie chart format with colors
    const colors = [
      '#ef4444',
      '#3b82f6',
      '#f59e0b',
      '#10b981',
      '#8b5cf6',
      '#06b6d4',
      '#f97316',
      '#84cc16',
    ];
    const expensesChartData = Object.entries(expenseCategories)
      .map(([category, amount], index) => ({
        category: category.toUpperCase(),
        value:
          totalExpensesForPie > 0
            ? Math.round((amount / totalExpensesForPie) * 100)
            : 0,
        amount: amount,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8); // Top 8 categories

    // Transform recent jobs to match frontend expectations
    const transformedRecentJobs = recentJobs.map((job) => ({
      id: job.id,
      title: job.title,
      clientName: job.client?.name || 'Unknown Client',
      status: job.status,
    }));

    // Transform recent invoices to match frontend expectations
    const transformedRecentInvoices = recentInvoices.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      clientName: invoice.client?.name || 'Unknown Client',
      total: invoice.total,
      status: invoice.status,
    }));

    const dashboardData = {
      // Basic metrics
      metrics: {
        totalClients,
        totalInvoices,
        openInvoices: unpaidInvoices.length,
        activeJobs,
        totalRevenue,
        totalExpenses: totalExpenseAmount,
        netRevenue,
      },

      // Recent data
      recentJobs: transformedRecentJobs,
      recentInvoices: transformedRecentInvoices,

      // Chart data
      charts: {
        salesLast7Days: last7DaysData,
        salesLast6Months: last6MonthsData,
        expensesByCategory: expensesChartData,
      },

      // Metadata
      generatedAt: new Date().toISOString(),
      success: true,
    };

    console.log('✅ Dashboard data compiled successfully');
    console.log('📊 Metrics summary:', dashboardData.metrics);

    return response.status(200).json(dashboardData);
  } catch (error) {
    console.error('🚨 Dashboard API Error:', error);
    console.error('🚨 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });

    return response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
