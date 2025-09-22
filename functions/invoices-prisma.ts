import type { VercelRequest, VercelResponse } from '@vercel/node';
// Use the CommonJS module version for better compatibility
// @ts-ignore
import { prisma } from '../lib/prisma.cjs';

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
            client: true,
            job: true,
            lineItems: true,
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
        // Create new invoice
        const { lineItems, clientId, jobId, ...invoiceData } = request.body;

        // Validate required fields
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

      case 'PUT':
        const { id: updateId } = request.query;
        if (!updateId) {
          return response
            .status(400)
            .json({ error: 'Invoice ID is required for updates' });
        }

        const { lineItems: updateLineItems, ...updateData } = request.body;

        const updatedInvoice = await prisma.invoice.update({
          where: { id: String(updateId) },
          data: {
            ...updateData,
            ...(updateLineItems && {
              lineItems: {
                deleteMany: {},
                create: updateLineItems,
              },
            }),
          },
          include: {
            client: true,
            job: true,
            lineItems: true,
          },
        });

        return response.status(200).json(updatedInvoice);

      case 'DELETE':
        const { id: deleteId } = request.query;
        if (!deleteId) {
          return response
            .status(400)
            .json({ error: 'Invoice ID is required for deletion' });
        }

        const deletedInvoice = await prisma.invoice.delete({
          where: { id: String(deleteId) },
          include: {
            client: true,
            job: true,
            lineItems: true,
          },
        });

        return response.status(200).json({
          message: 'Invoice deleted',
          invoice: deletedInvoice,
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
}
