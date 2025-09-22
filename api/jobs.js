// Import edge-compatible Prisma client
import prisma from '../lib/prisma-edge.js';

// Transform job data to match frontend expectations
function transformJobData(job) {
  if (!job) return job;

  const transformed = { ...job };

  // Add flat client name for easier access in frontend
  if (job.client) {
    transformed.clientName = job.client.name;
  }

  // Transform based on job type
  if (job.jobType === 'AIR_FREIGHT') {
    transformed.awb = {
      masterAirWaybill: job.masterAirWaybill || '',
      houseAirWaybill: job.houseAirWaybill || '',
    };
  } else if (job.jobType === 'SEA_FREIGHT') {
    transformed.billOfLading = {
      masterBL: job.masterBL || '',
      houseBL: job.houseBL || '',
    };
  }
  // For ROAD_FREIGHT, plateNumber and containerNumber are already flat properties

  return transformed;
} // Transform job data from frontend format to database format
function flattenJobData(jobData) {
  const flattened = { ...jobData };

  // Flatten nested structures for database storage
  if (jobData.awb) {
    flattened.masterAirWaybill = jobData.awb.masterAirWaybill;
    flattened.houseAirWaybill = jobData.awb.houseAirWaybill;
    delete flattened.awb;
  }

  if (jobData.billOfLading) {
    flattened.masterBL = jobData.billOfLading.masterBL;
    flattened.houseBL = jobData.billOfLading.houseBL;
    delete flattened.billOfLading;
  }

  return flattened;
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

    switch (request.method) {
      case 'GET':
        const { id, type, status, clientId } = request.query;

        if (id) {
          console.log('🔍 Finding job with ID:', id);
          const job = await prisma.logisticsJob.findUnique({
            where: { id: id },
            include: {
              client: {
                select: { id: true, name: true, email: true },
              },
              user: {
                select: { id: true, name: true, email: true },
              },
              expenses: {
                select: { id: true, title: true, amount: true, currency: true },
              },
              invoices: {
                select: { id: true, number: true, status: true, total: true },
              },
            },
          });

          if (!job) {
            return response.status(404).json({ error: 'Job not found' });
          }

          const transformedJob = transformJobData(job);
          return response.status(200).json(transformedJob);
        }

        console.log('📋 Getting all jobs with filters...');

        // Build where clause for filters
        const where = {};
        if (type) where.jobType = type;
        if (status) where.status = status;
        if (clientId) where.clientId = clientId;

        const jobs = await prisma.logisticsJob.findMany({
          where,
          include: {
            client: {
              select: { id: true, name: true, email: true },
            },
            user: {
              select: { id: true, name: true, email: true },
            },
            _count: {
              select: { expenses: true, invoices: true },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        console.log('✅ Found jobs:', jobs.length);

        // Transform all jobs to match frontend expectations
        const transformedJobs = jobs.map(transformJobData);

        return response.status(200).json({
          jobs: transformedJobs,
          total: transformedJobs.length,
          filters: { type, status, clientId },
          success: true,
        });

      case 'POST':
        const jobData = request.body;

        if (!jobData.title || !jobData.clientId || !jobData.jobType) {
          return response.status(400).json({
            error:
              'Missing required fields: title, clientId, and jobType are required',
          });
        }

        // Flatten nested data structures for database storage
        const flattenedData = flattenJobData(jobData);

        // Generate unique job number
        const jobNumber = `JOB-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 5)
          .toUpperCase()}`;

        const newJob = await prisma.logisticsJob.create({
          data: {
            jobNumber,
            title: flattenedData.title,
            clientId: flattenedData.clientId,
            jobType: flattenedData.jobType,
            portOfLoading: flattenedData.portOfLoading,
            portOfDischarge: flattenedData.portOfDischarge,
            grossWeight: flattenedData.grossWeight
              ? parseFloat(flattenedData.grossWeight)
              : null,
            chargeableWeight: flattenedData.chargeableWeight
              ? parseFloat(flattenedData.chargeableWeight)
              : null,
            shipper: flattenedData.shipper || null,
            consignee: flattenedData.consignee || null,
            package: flattenedData.package || null,
            goodDescription: flattenedData.goodDescription || null,
            plateNumber: flattenedData.plateNumber || null,
            containerNumber: flattenedData.containerNumber || null,
            masterAirWaybill: flattenedData.masterAirWaybill || null,
            houseAirWaybill: flattenedData.houseAirWaybill || null,
            masterBL: flattenedData.masterBL || null,
            houseBL: flattenedData.houseBL || null,
            userId: flattenedData.userId || null,
          },
          include: {
            client: {
              select: { id: true, name: true, email: true },
            },
            user: {
              select: { id: true, name: true, email: true },
            },
            _count: {
              select: { expenses: true, invoices: true },
            },
          },
        });

        return response.status(201).json({
          message: 'Job created successfully',
          job: transformJobData(newJob),
        });

      case 'PUT':
        const updateId = request.query.id;
        const updateData = request.body;

        if (!updateId) {
          return response.status(400).json({ error: 'Job ID is required' });
        }

        // Flatten nested data structures for database storage
        const flattenedUpdateData = flattenJobData(updateData);

        // Remove fields that shouldn't be updated directly
        const {
          id: _,
          jobNumber: __,
          createdAt: ___,
          updatedAt: ____,
          ...fieldsToUpdate
        } = flattenedUpdateData;

        const updatedJob = await prisma.logisticsJob.update({
          where: { id: updateId },
          data: fieldsToUpdate,
          include: {
            client: {
              select: { id: true, name: true, email: true },
            },
            user: {
              select: { id: true, name: true, email: true },
            },
            _count: {
              select: { expenses: true, invoices: true },
            },
          },
        });

        return response.status(200).json({
          message: 'Job updated successfully',
          job: transformJobData(updatedJob),
        });

      case 'DELETE':
        const deleteId = request.query.id;

        if (!deleteId) {
          return response.status(400).json({ error: 'Job ID is required' });
        }

        const deletedJob = await prisma.logisticsJob.delete({
          where: { id: deleteId },
          include: {
            client: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        return response.status(200).json({
          message: 'Job deleted successfully',
          job: transformJobData(deletedJob),
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

    return response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
