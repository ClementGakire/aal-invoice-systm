import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateJobTypes() {
  try {
    console.log('Starting job type migration...');

    // Get all jobs with old job types
    const jobs = await prisma.logisticsJob.findMany({
      where: {
        OR: [
          { jobType: 'AIR_FREIGHT' },
          { jobType: 'SEA_FREIGHT' },
          { jobType: 'ROAD_FREIGHT' },
        ],
      },
    });

    console.log(`Found ${jobs.length} jobs to migrate`);

    // Migrate each job
    for (const job of jobs) {
      let newJobType;
      let newJobNumber;

      // Determine new job type based on existing data or default to IMPORT
      switch (job.jobType) {
        case 'AIR_FREIGHT':
          newJobType = 'AIR_FREIGHT_IMPORT'; // Default to import, could be enhanced with logic to detect export
          break;
        case 'SEA_FREIGHT':
          newJobType = 'SEA_FREIGHT_IMPORT';
          break;
        case 'ROAD_FREIGHT':
          newJobType = 'ROAD_FREIGHT_IMPORT';
          break;
        default:
          continue; // Skip if already using new format
      }

      // Generate new job number in AAL format
      const abbreviations = {
        AIR_FREIGHT_IMPORT: 'AI',
        SEA_FREIGHT_IMPORT: 'SI',
        ROAD_FREIGHT_IMPORT: 'RI',
      };

      const abbreviation = abbreviations[newJobType];
      const year = new Date().getFullYear().toString().slice(-2);

      // Find next sequence number for this job type
      const existingJobsWithType = await prisma.logisticsJob.findMany({
        where: {
          jobType: newJobType,
          jobNumber: {
            startsWith: `AAL-${abbreviation}-${year}-`,
          },
        },
        orderBy: {
          jobNumber: 'desc',
        },
        take: 1,
      });

      let sequenceNumber = 1;
      if (existingJobsWithType.length > 0) {
        const lastJobNumber = existingJobsWithType[0].jobNumber;
        const parts = lastJobNumber.split('-');
        if (parts.length === 4) {
          const lastSequence = parseInt(parts[3], 10);
          if (!isNaN(lastSequence)) {
            sequenceNumber = lastSequence + 1;
          }
        }
      }

      newJobNumber = `AAL-${abbreviation}-${year}-${sequenceNumber
        .toString()
        .padStart(3, '0')}`;

      // Update the job
      await prisma.logisticsJob.update({
        where: { id: job.id },
        data: {
          jobType: newJobType,
          jobNumber: newJobNumber,
        },
      });

      console.log(
        `Migrated job ${job.jobNumber} -> ${newJobNumber} (${job.jobType} -> ${newJobType})`
      );
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateJobTypes();
