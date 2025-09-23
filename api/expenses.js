// Import edge-compatible Prisma client
import prisma from '../lib/prisma-edge.js';

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

  try {
    console.log('📝 Expenses API Request:', request.method, request.url);
    console.log('🔗 Database URL present:', !!process.env.DATABASE_URL);

    switch (request.method) {
      case 'GET':
        const { id } = request.query;

        if (id) {
          console.log('🔍 Finding expense with ID:', id);
          const expense = await prisma.expense.findUnique({
            where: { id: id },
            include: {
              job: {
                select: { id: true, jobNumber: true, title: true },
              },
              supplier: {
                select: { id: true, name: true },
              },
            },
          });

          if (!expense) {
            return response.status(404).json({ error: 'Expense not found' });
          }
          return response.status(200).json(expense);
        }

        console.log('📋 Getting all expenses...');
        const expenses = await prisma.expense.findMany({
          include: {
            job: {
              select: { id: true, jobNumber: true, title: true },
            },
            supplier: {
              select: { id: true, name: true },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        console.log('✅ Found expenses:', expenses.length);
        return response.status(200).json({
          expenses,
          total: expenses.length,
          success: true,
        });

      case 'POST':
        const { title, amount, currency, jobNumber, jobId, supplierId, supplierName } = request.body;

        if (!title || amount === undefined) {
          return response.status(400).json({
            error: 'Missing required fields: title and amount are required',
          });
        }

        const expenseData = {
          title,
          amount: parseFloat(amount),
          currency: currency || 'USD',
          jobNumber: jobNumber || null,
          jobId: jobId || null,
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

        return response.status(201).json({
          message: 'Expense created successfully',
          expense: newExpense,
        });

      case 'PUT':
        const updateId = request.query.id;
        const updateData = request.body;

        if (!updateId) {
          return response.status(400).json({ error: 'Expense ID is required' });
        }

        // Prepare update data, converting amount to float if provided
        const dataToUpdate = { ...updateData };
        if (dataToUpdate.amount !== undefined) {
          dataToUpdate.amount = parseFloat(dataToUpdate.amount);
        }
        
        // Handle optional fields - set to null if empty string
        if (dataToUpdate.jobNumber === '') dataToUpdate.jobNumber = null;
        if (dataToUpdate.jobId === '') dataToUpdate.jobId = null;
        if (dataToUpdate.supplierId === '') dataToUpdate.supplierId = null;
        if (dataToUpdate.supplierName === '') dataToUpdate.supplierName = null;

        const updatedExpense = await prisma.expense.update({
          where: { id: updateId },
          data: dataToUpdate,
          include: {
            job: {
              select: { id: true, jobNumber: true, title: true },
            },
            supplier: {
              select: { id: true, name: true },
            },
          },
        });

        return response.status(200).json({
          message: 'Expense updated successfully',
          expense: updatedExpense,
        });

      case 'DELETE':
        const deleteId = request.query.id;

        console.log('🗑️ DELETE request - query:', request.query);
        console.log('🗑️ DELETE request - deleteId:', deleteId);
        console.log('🗑️ DELETE request - URL:', request.url);

        if (!deleteId) {
          return response.status(400).json({ error: 'Expense ID is required' });
        }

        const deletedExpense = await prisma.expense.delete({
          where: { id: deleteId },
        });

        return response.status(200).json({
          message: 'Expense deleted successfully',
          expense: deletedExpense,
        });

      default:
        response.setHeader('Allow', [
          'GET',
          'POST',
          'PUT',
          'DELETE',
          'OPTIONS',
        ]);
        return response
          .status(405)
          .json({ error: `Method ${request.method} not allowed` });
    }
  } catch (error) {
    console.error('🚨 Expenses API Error:', error);
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