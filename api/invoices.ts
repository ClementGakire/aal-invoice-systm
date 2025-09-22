import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  import type { VercelRequest, VercelResponse } from '@vercel/node';
  import { prisma } from '../lib/prisma.js';

  export default async function handler(
    request: VercelRequest,
    response: VercelResponse
  ) {
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

    if (request.method === 'OPTIONS') {
      return response.status(200).end();
    }

    try {
      switch (request.method) {
        case 'GET':
          // Get all invoices or specific invoice by ID
          const { id } = request.query;

          if (id) {
            const invoice = await prisma.invoice.findUnique({
              where: { id: String(id) },
              include: {
                client: true,
                job: true,
                lineItems: true,
              },
            });

            if (!invoice) {
              return response.status(404).json({ error: 'Invoice not found' });
            }
            return response.status(200).json(invoice);
          }

          const invoices = await prisma.invoice.findMany({
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                },
              },
              job: {
                select: {
                  id: true,
                  jobNumber: true,
                  title: true,
                },
              },
              _count: {
                select: { lineItems: true },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          return response.status(200).json({
            invoices,
            total: invoices.length,
          });

        case 'POST':
          // Create new invoice with basic validation
          const { clientId, jobId, lineItems, ...invoiceData } = request.body;

          if (!clientId || !invoiceData.number) {
            return response.status(400).json({
              error: 'Missing required fields: clientId, number',
            });
          }

          // Check if client exists
          const client = await prisma.client.findUnique({
            where: { id: clientId },
          });

          if (!client) {
            return response.status(400).json({ error: 'Client not found' });
          }

          // Check if job exists (if provided)
          if (jobId) {
            const job = await prisma.logisticsJob.findUnique({
              where: { id: jobId },
            });

            if (!job) {
              return response.status(400).json({ error: 'Job not found' });
            }
          }

          const newInvoice = await prisma.invoice.create({
            data: {
              ...invoiceData,
              clientId,
              jobId: jobId || null,
              lineItems: {
                create: lineItems || [],
              },
            },
            include: {
              client: true,
              job: true,
              lineItems: true,
            },
          });

          return response.status(201).json(newInvoice);

        default:
          response.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
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
  }
}
