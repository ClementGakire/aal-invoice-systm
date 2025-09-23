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
    console.log('📝 Suppliers API Request:', request.method, request.url);
    console.log('🔗 Database URL present:', !!process.env.DATABASE_URL);

    switch (request.method) {
      case 'GET':
        const { id } = request.query;

        if (id) {
          console.log('🔍 Finding supplier with ID:', id);
          const supplier = await prisma.supplier.findUnique({
            where: { id: id },
            include: {
              expenses: {
                select: { id: true, title: true, amount: true, currency: true },
              },
              _count: {
                select: { expenses: true },
              },
            },
          });

          if (!supplier) {
            return response.status(404).json({ error: 'Supplier not found' });
          }
          return response.status(200).json(supplier);
        }

        console.log('📋 Getting all suppliers...');
        const suppliers = await prisma.supplier.findMany({
          include: {
            _count: {
              select: { expenses: true },
            },
          },
          orderBy: {
            name: 'asc',
          },
        });

        console.log('✅ Found suppliers:', suppliers.length);
        return response.status(200).json({
          suppliers,
          total: suppliers.length,
          success: true,
        });

      case 'POST':
        const { name, contact } = request.body;

        if (!name) {
          return response.status(400).json({
            error: 'Missing required fields: name is required',
          });
        }

        const newSupplier = await prisma.supplier.create({
          data: {
            name,
            contact: contact || null,
          },
          include: {
            _count: {
              select: { expenses: true },
            },
          },
        });

        return response.status(201).json({
          message: 'Supplier created successfully',
          supplier: newSupplier,
        });

      case 'PUT':
        const updateId = request.query.id;
        const updateData = request.body;

        if (!updateId) {
          return response
            .status(400)
            .json({ error: 'Supplier ID is required' });
        }

        // Handle optional fields - set to null if empty string
        const dataToUpdate = { ...updateData };
        if (dataToUpdate.contact === '') dataToUpdate.contact = null;

        const updatedSupplier = await prisma.supplier.update({
          where: { id: updateId },
          data: dataToUpdate,
          include: {
            _count: {
              select: { expenses: true },
            },
          },
        });

        return response.status(200).json({
          message: 'Supplier updated successfully',
          supplier: updatedSupplier,
        });

      case 'DELETE':
        const deleteId = request.query.id;

        console.log('🗑️ DELETE request - query:', request.query);
        console.log('🗑️ DELETE request - deleteId:', deleteId);
        console.log('🗑️ DELETE request - URL:', request.url);

        if (!deleteId) {
          return response
            .status(400)
            .json({ error: 'Supplier ID is required' });
        }

        const deletedSupplier = await prisma.supplier.delete({
          where: { id: deleteId },
        });

        return response.status(200).json({
          message: 'Supplier deleted successfully',
          supplier: deletedSupplier,
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
    console.error('🚨 Suppliers API Error:', error);
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
