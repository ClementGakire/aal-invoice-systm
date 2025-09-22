const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.prisma;
}

module.exports = async function handler(request, response) {
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
    switch (request.method) {
      case 'GET':
        const { id } = request.query;

        if (id) {
          const client = await prisma.client.findUnique({
            where: { id: String(id) },
            include: {
              jobs: {
                select: {
                  id: true,
                  jobNumber: true,
                  title: true,
                  status: true,
                },
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

        return response.status(200).json({
          clients,
          total: clients.length,
        });

      case 'POST':
        console.log('POST /api/clients request body:', request.body);

        let requestData = request.body;
        if (typeof request.body === 'string') {
          try {
            requestData = JSON.parse(request.body);
          } catch (e) {
            return response.status(400).json({
              error: 'Invalid JSON in request body',
            });
          }
        }

        const { name, address, phone, tin } = requestData;

        if (!name) {
          return response.status(400).json({
            error: 'Missing required field: name',
          });
        }

        const newClient = await prisma.client.create({
          data: {
            name,
            address: address || null,
            phone: phone || null,
            tin: tin || null,
          },
        });

        return response.status(201).json(newClient);

      case 'PUT':
        const { id: updateId } = request.query;
        if (!updateId) {
          return response
            .status(400)
            .json({ error: 'Client ID is required for updates' });
        }

        const updatedClient = await prisma.client.update({
          where: { id: String(updateId) },
          data: request.body,
        });

        return response.status(200).json(updatedClient);

      case 'DELETE':
        const { id: deleteId } = request.query;
        if (!deleteId) {
          return response
            .status(400)
            .json({ error: 'Client ID is required for deletion' });
        }

        const deletedClient = await prisma.client.delete({
          where: { id: String(deleteId) },
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
    console.error('API Error:', error);
    return response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};