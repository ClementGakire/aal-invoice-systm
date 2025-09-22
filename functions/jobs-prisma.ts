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
        const { id, type, status, clientId } = request.query;

        // Get specific job by ID
        if (id) {
          const job = await prisma.logisticsJob.findUnique({
            where: { id: String(id) },
            include: {
              client: true,
              user: true,
              invoices: true,
              expenses: true,
            },
          });

          if (!job) {
            return response.status(404).json({ error: 'Job not found' });
          }
          return response.status(200).json(job);
        }

        // Build filter conditions
        const where: any = {};
        if (type) where.jobType = type;
        if (status) where.status = status;
        if (clientId) where.clientId = clientId;

        const jobs = await prisma.logisticsJob.findMany({
          where,
          include: {
            client: true,
            user: true,
            invoices: {
              select: { id: true, number: true, status: true, total: true },
            },
            expenses: {
              select: { id: true, title: true, amount: true, currency: true },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return response.status(200).json({
          jobs,
          total: jobs.length,
          filters: { type, status, clientId },
        });

      case 'POST':
        const { clientId: newClientId, userId, ...jobData } = request.body;

        // Validate required fields
        if (
          !newClientId ||
          !jobData.jobNumber ||
          !jobData.title ||
          !jobData.jobType
        ) {
          return response.status(400).json({
            error:
              'Missing required fields: clientId, jobNumber, title, jobType',
          });
        }

        // Check if client exists
        const client = await prisma.client.findUnique({
          where: { id: newClientId },
        });

        if (!client) {
          return response.status(400).json({ error: 'Client not found' });
        }

        // Check if user exists (if provided)
        if (userId) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
          });

          if (!user) {
            return response.status(400).json({ error: 'User not found' });
          }
        }

        const newJob = await prisma.logisticsJob.create({
          data: {
            ...jobData,
            clientId: newClientId,
            userId: userId || null,
          },
          include: {
            client: true,
            user: true,
            invoices: true,
            expenses: true,
          },
        });

        return response.status(201).json(newJob);

      case 'PUT':
        const { id: updateId } = request.query;
        if (!updateId) {
          return response
            .status(400)
            .json({ error: 'Job ID is required for updates' });
        }

        const updatedJob = await prisma.logisticsJob.update({
          where: { id: String(updateId) },
          data: request.body,
          include: {
            client: true,
            user: true,
            invoices: true,
            expenses: true,
          },
        });

        return response.status(200).json(updatedJob);

      case 'DELETE':
        const { id: deleteId } = request.query;
        if (!deleteId) {
          return response
            .status(400)
            .json({ error: 'Job ID is required for deletion' });
        }

        const deletedJob = await prisma.logisticsJob.delete({
          where: { id: String(deleteId) },
          include: {
            client: true,
            user: true,
            invoices: true,
            expenses: true,
          },
        });

        return response.status(200).json({
          message: 'Job deleted',
          job: deletedJob,
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
