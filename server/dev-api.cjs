const express = require('express');
const cors = require('cors');
const { prisma } = require('../lib/prisma.cjs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Clients API endpoint
app.all('/api/clients', async (req, res) => {
  try {
    switch (req.method) {
      case 'GET':
        const { id } = req.query;

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
            return res.status(404).json({ error: 'Client not found' });
          }
          return res.json(client);
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

        return res.json({
          clients,
          total: clients.length,
        });

      case 'POST':
        console.log('POST /api/clients request body:', req.body);

        const { name, address, phone, tin } = req.body;

        if (!name) {
          return res.status(400).json({
            error: 'Missing required field: name',
          });
        }

        try {
          const newClient = await prisma.client.create({
            data: {
              name,
              address: address || null,
              phone: phone || null,
              tin: tin || null,
            },
          });

          console.log('Created new client:', newClient);
          return res.status(201).json(newClient);
        } catch (e) {
          console.error('Error creating client in database:', e);
          return res.status(500).json({
            error: 'Database error',
            message: e instanceof Error ? e.message : 'Unknown error',
          });
        }

      case 'PUT':
        const { id: updateId } = req.query;
        if (!updateId) {
          return res.status(400).json({ error: 'Client ID is required for updates' });
        }

        const updatedClient = await prisma.client.update({
          where: { id: String(updateId) },
          data: req.body,
        });

        return res.json(updatedClient);

      case 'DELETE':
        const { id: deleteId } = req.query;
        if (!deleteId) {
          return res.status(400).json({ error: 'Client ID is required for deletion' });
        }

        const deletedClient = await prisma.client.delete({
          where: { id: String(deleteId) },
        });

        return res.json({
          message: 'Client deleted',
          client: deletedClient,
        });

      default:
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📡 Clients endpoint: http://localhost:${PORT}/api/clients`);
});