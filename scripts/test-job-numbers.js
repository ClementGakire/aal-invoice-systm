// Test script to verify automatic job number generation
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testJobNumberGeneration() {
  try {
    console.log('🧪 Testing automatic job number generation...\n');

    // Test data for different job types
    const testJobs = [
      {
        title: 'Test Air Import Job',
        clientId: 'test-client-id',
        jobType: 'AIR_FREIGHT_IMPORT',
        portOfLoading: 'JFK - New York',
        portOfDischarge: 'KGL - Kigali',
        grossWeight: 500.0,
        chargeableWeight: 550.0,
        shipper: 'Test Shipper Inc',
        consignee: 'Test Consignee Ltd',
        package: '15 Boxes',
        goodDescription: 'Electronic Components',
        masterAirWaybill: 'MAWB-176-12345678',
      },
      {
        title: 'Test Air Export Job',
        clientId: 'test-client-id',
        jobType: 'AIR_FREIGHT_EXPORT',
        portOfLoading: 'KGL - Kigali',
        portOfDischarge: 'JFK - New York',
        grossWeight: 300.0,
        chargeableWeight: 320.0,
        shipper: 'Rwanda Exporter Ltd',
        consignee: 'US Importer Inc',
        package: '8 Boxes',
        goodDescription: 'Coffee Products',
        masterAirWaybill: 'MAWB-176-87654321',
      },
      {
        title: 'Test Sea Import Job',
        clientId: 'test-client-id',
        jobType: 'SEA_FREIGHT_IMPORT',
        portOfLoading: 'SHA - Shanghai',
        portOfDischarge: 'MSA - Mombasa',
        grossWeight: 15000.0,
        chargeableWeight: 15000.0,
        shipper: 'China Manufacturer Ltd',
        consignee: 'Rwanda Distributor',
        package: '1 x 40ft Container',
        goodDescription: 'Machinery Equipment',
        masterBL: 'MBL-MAEU-9876543210',
      },
      {
        title: 'Test Road Import Job',
        clientId: 'test-client-id',
        jobType: 'ROAD_FREIGHT_IMPORT',
        portOfLoading: 'MSA - Mombasa',
        portOfDischarge: 'KGL - Kigali',
        grossWeight: 8000.0,
        chargeableWeight: 8000.0,
        shipper: 'Kenya Supplier Ltd',
        consignee: 'Rwanda Buyer Ltd',
        package: '1 Truck Load',
        goodDescription: 'Construction Materials',
        plateNumber: 'TRK-456-ABC',
        containerNumber: 'CONT-789-XYZ',
      },
    ];

    // First, let's ensure we have a test client
    const testClient = await prisma.client.upsert({
      where: { id: 'test-client-id' },
      update: {},
      create: {
        id: 'test-client-id',
        name: 'Test Client Company',
        email: 'test@client.com',
        phone: '+250788123456',
        address: 'Kigali, Rwanda',
      },
    });

    console.log('✅ Test client ready:', testClient.name);

    // Generate job numbers using our API logic
    const JOB_TYPE_ABBREVIATIONS = {
      AIR_FREIGHT_IMPORT: 'AI',
      AIR_FREIGHT_EXPORT: 'AE',
      SEA_FREIGHT_IMPORT: 'SI',
      SEA_FREIGHT_EXPORT: 'SE',
      ROAD_FREIGHT_IMPORT: 'RI',
    };

    async function generateJobNumber(jobType) {
      const abbreviation = JOB_TYPE_ABBREVIATIONS[jobType];
      const year = new Date().getFullYear().toString().slice(-2);
      const jobNumberPrefix = `AAL-${abbreviation}-${year}-`;

      const latestJob = await prisma.logisticsJob.findFirst({
        where: {
          jobType: jobType,
          jobNumber: {
            startsWith: jobNumberPrefix,
          },
        },
        orderBy: {
          jobNumber: 'desc',
        },
      });

      let sequenceNumber = 1;
      if (latestJob && latestJob.jobNumber) {
        const parts = latestJob.jobNumber.split('-');
        if (parts.length === 4) {
          const lastSequence = parseInt(parts[3], 10);
          if (!isNaN(lastSequence)) {
            sequenceNumber = lastSequence + 1;
          }
        }
      }

      const sequence = sequenceNumber.toString().padStart(3, '0');
      return `${jobNumberPrefix}${sequence}`;
    }

    // Create test jobs
    for (const jobData of testJobs) {
      try {
        const jobNumber = await generateJobNumber(jobData.jobType);

        const newJob = await prisma.logisticsJob.create({
          data: {
            ...jobData,
            jobNumber,
          },
        });

        console.log(
          `✅ Created ${jobData.jobType}: ${newJob.jobNumber} - ${newJob.title}`
        );
      } catch (error) {
        console.log(`❌ Failed to create ${jobData.jobType}: ${error.message}`);
      }
    }

    // Test sequence increment for same job type
    console.log('\n🔄 Testing sequence increment...');
    const additionalAirImport = {
      title: 'Second Air Import Job',
      clientId: 'test-client-id',
      jobType: 'AIR_FREIGHT_IMPORT',
      portOfLoading: 'DXB - Dubai',
      portOfDischarge: 'KGL - Kigali',
      grossWeight: 200.0,
      chargeableWeight: 250.0,
      shipper: 'Dubai Shipper Ltd',
      consignee: 'Rwanda Consignee Ltd',
      package: '5 Boxes',
      goodDescription: 'Electronics',
      masterAirWaybill: 'MAWB-176-11111111',
    };

    const secondJobNumber = await generateJobNumber(
      additionalAirImport.jobType
    );
    const secondJob = await prisma.logisticsJob.create({
      data: {
        ...additionalAirImport,
        jobNumber: secondJobNumber,
      },
    });

    console.log(
      `✅ Created second AIR_FREIGHT_IMPORT: ${secondJob.jobNumber} - ${secondJob.title}`
    );

    // Show summary of all generated job numbers
    console.log('\n📋 Summary of generated job numbers:');
    const allJobs = await prisma.logisticsJob.findMany({
      where: {
        jobNumber: {
          startsWith: 'AAL-',
        },
      },
      orderBy: {
        jobNumber: 'asc',
      },
      select: {
        jobNumber: true,
        jobType: true,
        title: true,
      },
    });

    allJobs.forEach((job) => {
      console.log(
        `  ${job.jobNumber} | ${job.jobType.padEnd(20)} | ${job.title}`
      );
    });

    console.log('\n🎉 Job number generation test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testJobNumberGeneration();
