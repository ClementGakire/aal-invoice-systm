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

        // Build where clause for filters
        const where: any = {};

        if (type) {
          where.jobType = String(type);
        }

        if (status) {
          where.status = String(status);
        }

        if (clientId) {
          where.clientId = String(clientId);
        }

        const jobs = await prisma.logisticsJob.findMany({
          where,
          include: {
            client: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: { invoices: true, expenses: true },
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
        const { clientId: newJobClientId, ...jobData } = request.body;

        if (!newJobClientId || !jobData.jobNumber || !jobData.title) {
          return response.status(400).json({
            error: 'Missing required fields: clientId, jobNumber, title',
          });
        }

        const newJob = await prisma.logisticsJob.create({
          data: {
            ...jobData,
            clientId: newJobClientId,
          },
          include: {
            client: true,
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
