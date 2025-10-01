// Import edge-compatible Prisma client
import prisma from '../../../lib/prisma-edge.js';

export default async function handler(request, response) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  response.setHeader('Content-Type', 'application/json');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const { id: jobId } = request.query;

  if (!jobId) {
    return response.status(400).json({ error: 'Job ID is required' });
  }

  try {
    console.log('📝 Job Expenses API Request:', request.method, jobId);

    switch (request.method) {
      case 'GET':
        // Get all expenses for a specific job
        console.log('📋 Getting expenses for job:', jobId);
        
        const job = await prisma.logisticsJob.findUnique({
          where: { id: jobId },
          select: { id: true, jobNumber: true, title: true }
        });

        if (!job) {
          return response.status(404).json({ error: 'Job not found' });
        }

        const expenses = await prisma.expense.findMany({
          where: { jobId: jobId },
          include: {
            supplier: {
              select: { id: true, name: true },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Calculate total expenses
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        console.log('✅ Found expenses for job:', expenses.length);
        return response.status(200).json({
          job,
          expenses,
          totalExpenses,
          count: expenses.length,
          success: true,
        });

      case 'POST':
        // Create a new expense for this job
        const {
          title,
          amount,
          currency,
          supplierId,
          supplierName,
        } = request.body;

        if (!title || amount === undefined) {
          return response.status(400).json({
            error: 'Missing required fields: title and amount are required',
          });
        }

        // Verify the job exists
        const targetJob = await prisma.logisticsJob.findUnique({
          where: { id: jobId },
          select: { id: true, jobNumber: true, title: true }
        });

        if (!targetJob) {
          return response.status(404).json({ error: 'Job not found' });
        }

        const expenseData = {
          title,
          amount: parseFloat(amount),
          currency: currency || 'USD',
          jobId: jobId,
          jobNumber: targetJob.jobNumber,
          supplierId: supplierId || null,
          supplierName: supplierName || null,
        };

        const newExpense = await prisma.expense.create({
          data: expenseData,
          include: {
            job: {
              select: { id: true, jobNumber: true, title: true },
            },
            supplier: {
              select: { id: true, name: true },
            },
          },
        });

        // Get updated total expenses for the job
        const updatedExpenses = await prisma.expense.findMany({
          where: { jobId: jobId },
        });
        const updatedTotal = updatedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        return response.status(201).json({
          message: 'Expense created successfully',
          expense: newExpense,
          totalExpenses: updatedTotal,
          expenseCount: updatedExpenses.length,
        });

      default:
        response.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
        return response
          .status(405)
          .json({ error: `Method ${request.method} not allowed` });
    }
  } catch (error) {
    console.error('🚨 Job Expenses API Error:', error);
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