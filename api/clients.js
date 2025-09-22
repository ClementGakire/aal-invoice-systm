// Dynamic import approach to avoid ES module compilation issues
let prisma;

async function getPrisma() {
  if (!prisma) {
    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma;
}

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
    
    const db = await getPrisma();
    
    switch (request.method) {
      case 'GET':
        const { id } = request.query;

        if (id) {
          console.log('🔍 Finding client with ID:', id);
          const client = await db.client.findUnique({
            where: { id: parseInt(id) },
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
        const clients = await db.client.findMany({
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

        if (!name || !email) {
          return response.status(400).json({
            error: 'Missing required fields: name and email are required',
          });
        }

        const newClient = await db.client.create({
          data: {
            name,
            email,
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

        const updatedClient = await db.client.update({
          where: { id: parseInt(updateId) },
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

        if (!deleteId) {
          return response.status(400).json({ error: 'Client ID is required' });
        }

        const deletedClient = await db.client.delete({
          where: { id: parseInt(deleteId) },
        });

        return response.status(200).json({
          message: 'Client deleted',
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
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};