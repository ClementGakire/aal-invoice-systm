// Import edge-compatible Prisma client
import prisma from '../lib/prisma-edge.js';

// Job type abbreviation mapping for job numbers
const JOB_TYPE_ABBREVIATIONS = {
  AIR_FREIGHT_IMPORT: 'AI',
  AIR_FREIGHT_EXPORT: 'AE',
  SEA_FREIGHT_IMPORT: 'SI',
  SEA_FREIGHT_EXPORT: 'SE',
  ROAD_FREIGHT_IMPORT: 'RI',
};

// Generate automatic job number based on job type and sequence
async function generateJobNumber(jobType, retryOffset = 0) {
  const abbreviation = JOB_TYPE_ABBREVIATIONS[jobType];
  if (!abbreviation) {
    throw new Error(`Invalid job type: ${jobType}`);
  }

  const year = new Date().getFullYear().toString().slice(-2);
  const jobNumberPrefix = `AAL-${abbreviation}-${year}-`;

  // Find all jobs with this prefix to determine the next sequence
  const existingJobs = await prisma.logisticsJob.findMany({
    where: {
      jobType: jobType,
      jobNumber: {
        startsWith: jobNumberPrefix,
      },
    },
    select: {
      jobNumber: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  let maxSequence = 0;

  // Extract all sequence numbers and find the maximum
  for (const job of existingJobs) {
    const parts = job.jobNumber.split('-');
    if (parts.length === 4) {
      const sequence = parseInt(parts[3], 10);
      if (!isNaN(sequence) && sequence > maxSequence) {
        maxSequence = sequence;
      }
    }
  }

  // Add retry offset to handle race conditions
  const sequenceNumber = maxSequence + 1 + retryOffset;
  const sequence = sequenceNumber.toString().padStart(3, '0');
  return `${jobNumberPrefix}${sequence}`;
}

// Transform job data to match frontend expectations
function transformJobData(job) {
  if (!job) return job;

  const transformed = { ...job };

  // Add flat client name for easier access in frontend
  if (job.client) {
    transformed.clientName = job.client.name;
  }

  // Transform based on job type
  if (
    job.jobType === 'AIR_FREIGHT_IMPORT' ||
    job.jobType === 'AIR_FREIGHT_EXPORT'
  ) {
    transformed.awb = {
      masterAirWaybill: job.masterAirWaybill || '',
      houseAirWaybill: job.houseAirWaybill || '',
    };
  } else if (
    job.jobType === 'SEA_FREIGHT_IMPORT' ||
    job.jobType === 'SEA_FREIGHT_EXPORT'
  ) {
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
                select: {
                  id: true,
                  title: true,
                  amount: true,
                  currency: true,
                  createdAt: true,
                  supplierName: true,
                },
              },
              invoices: {
                select: { id: true, number: true, status: true, total: true },
              },
            },
          });

          if (!job) {
            return response.status(404).json({ error: 'Job not found' });
          }

          // Calculate total expenses for this job
          const totalExpenses = job.expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          );

          const transformedJob = transformJobData(job);
          // Add total expenses to the response
          transformedJob.totalExpenses = totalExpenses;
          transformedJob.expenseCount = job.expenses.length;

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
            expenses: {
              select: { amount: true, currency: true },
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

        // Transform all jobs to match frontend expectations and add total expenses
        const transformedJobs = jobs.map((job) => {
          const transformed = transformJobData(job);
          // Calculate total expenses for this job
          const totalExpenses = job.expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          );
          transformed.totalExpenses = totalExpenses;
          transformed.expenseCount = job.expenses.length;
          return transformed;
        });

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

        // Generate automatic job number with retry logic for race conditions
        let jobNumber;
        let retries = 0;
        const maxRetries = 5;

        while (retries < maxRetries) {
          // Pass retry count as offset to generate different numbers on retry
          jobNumber = await generateJobNumber(flattenedData.jobType, retries);

          // Check if this number already exists
          const existingJob = await prisma.logisticsJob.findUnique({
            where: { jobNumber },
            select: { id: true },
          });

          if (!existingJob) {
            break; // Job number is unique, proceed
          }

          retries++;
          if (retries >= maxRetries) {
            throw new Error(
              'Failed to generate unique job number after multiple attempts'
            );
          }

          // Small delay to avoid tight loop
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

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

        // Remove fields that shouldn't be updated directly and handle clientId
        const {
          id: _,
          jobNumber: __,
          createdAt: ___,
          updatedAt: ____,
          clientName: _____,
          clientId: updateClientId,
          ...fieldsToUpdate
        } = flattenedUpdateData;

        // If clientId is present, use nested connect
        if (updateClientId) {
          fieldsToUpdate.client = { connect: { id: updateClientId } };
        }

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
