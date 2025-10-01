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
    console.log('📝 API Request:', request.method, request.url);
    console.log('🔗 Database URL present:', !!process.env.DATABASE_URL);

    switch (request.method) {
      case 'GET':
        const { id } = request.query;

        if (id) {
          console.log('🔍 Finding client with ID:', id);
          const client = await prisma.client.findUnique({
            where: { id: id }, // Use string ID directly, not parseInt
            include: {
              jobs: {
                select: { id: true, title: true, status: true },
              },
              invoices: {
                select: { id: true, number: true, status: true, total: true },
              },
            },
          });

          if (!client) {
            return response.status(404).json({ error: 'Client not found' });
          }
          return response.status(200).json(client);
        }

        console.log('📋 Getting all clients...');
        const clients = await prisma.client.findMany({
          include: {
            _count: {
              select: { jobs: true, invoices: true },
            },
          },
          orderBy: {
            name: 'asc',
          },
        });

        console.log('✅ Found clients:', clients.length);
        return response.status(200).json({
          clients,
          total: clients.length,
          success: true,
        });

      case 'POST':
        const { name, email, phone, address, contactPerson } = request.body;

        if (!name) {
          return response.status(400).json({
            error: 'Missing required fields: name is required',
          });
        }

        const newClient = await prisma.client.create({
          data: {
            name,
            email: email || null,
            phone: phone || null,
            address: address || null,
            contactPerson: contactPerson || null,
          },
          include: {
            _count: {
              select: { jobs: true, invoices: true },
            },
          },
        });

        return response.status(201).json({
          message: 'Client created successfully',
          client: newClient,
        });

      case 'PUT':
        const updateId = request.query.id;
        const updateData = request.body;

        if (!updateId) {
          return response.status(400).json({ error: 'Client ID is required' });
        }

        const updatedClient = await prisma.client.update({
          where: { id: updateId }, // Use string ID directly, not parseInt
          data: updateData,
          include: {
            _count: {
              select: { jobs: true, invoices: true },
            },
          },
        });

        return response.status(200).json({
          message: 'Client updated successfully',
          client: updatedClient,
        });

      case 'DELETE':
        const deleteId = request.query.id;

        console.log('🗑️ DELETE request - query:', request.query);
        console.log('🗑️ DELETE request - deleteId:', deleteId);
        console.log('🗑️ DELETE request - URL:', request.url);

        if (!deleteId) {
          return response.status(400).json({ error: 'Client ID is required' });
        }

        // Check if client has related invoices or jobs
        const clientWithRelations = await prisma.client.findUnique({
          where: { id: deleteId },
          include: {
            _count: {
              select: { jobs: true, invoices: true },
            },
          },
        });

        if (!clientWithRelations) {
          return response.status(404).json({ error: 'Client not found' });
        }

        // Prevent deletion if client has related records
        if (
          clientWithRelations._count.jobs > 0 ||
          clientWithRelations._count.invoices > 0
        ) {
          return response.status(400).json({
            error: 'Cannot delete client with existing jobs or invoices',
            details: {
              jobs: clientWithRelations._count.jobs,
              invoices: clientWithRelations._count.invoices,
            },
          });
        }

        const deletedClient = await prisma.client.delete({
          where: { id: deleteId }, // Use string ID directly, not parseInt
        });

        return response.status(200).json({
          message: 'Client deleted successfully',
          client: deletedClient,
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
    console.error('🚨 API Error:', error);
    console.error('🚨 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });

    // Check if this is a Prisma error related to foreign key constraints
    if (
      error instanceof Error &&
      (error.message.includes('Foreign key constraint') ||
        error.message.includes('Record to delete does not exist'))
    ) {
      return response.status(400).json({
        error: 'Cannot delete client',
        message:
          'This client cannot be deleted because it has related jobs or invoices.',
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
