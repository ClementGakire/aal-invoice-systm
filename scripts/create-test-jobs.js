// Script to create test jobs for invoice generation
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestJobs() {
  try {
    console.log('🚢 Creating test jobs for invoice generation...');

    // First, let's check if we have any clients
    const clients = await prisma.client.findMany();
    if (clients.length === 0) {
      console.log('📝 Creating test client...');
      await prisma.client.create({
        data: {
          name: 'ABC Logistics Company',
          email: 'contact@abclogistics.com',
          phone: '+250788123456',
          address: 'Kigali, Rwanda',
          contactPerson: 'John Doe',
          tin: 'TIN123456789',
        },
      });
    }

    const availableClients = await prisma.client.findMany();
    const testClient = availableClients[0];

    // Create sample jobs
    const testJobs = [
      {
        jobNumber: 'AFI-2024-001',
        title: 'Air Freight Import - Electronics',
        clientId: testClient.id,
        jobType: 'AIR_FREIGHT_IMPORT',
        status: 'DELIVERED',
        portOfLoading: 'Dubai International Airport',
        portOfDischarge: 'Kigali International Airport',
        grossWeight: 500,
        chargeableWeight: 650,
        shipper: 'Tech Electronics LLC',
        consignee: 'ABC Logistics Company',
        package: '10 boxes',
        goodDescription: 'Consumer electronics and accessories',
        masterAirWaybill: 'EK-123456789',
        houseAirWaybill: 'AAL-001-2024',
      },
      {
        jobNumber: 'SFI-2024-002',
        title: 'Sea Freight Import - Machinery',
        clientId: testClient.id,
        jobType: 'SEA_FREIGHT_IMPORT',
        status: 'DELIVERED',
        portOfLoading: 'Mombasa Port',
        portOfDischarge: 'Kigali Inland Port',
        grossWeight: 5000,
        chargeableWeight: 5000,
        shipper: 'Machinery World Ltd',
        consignee: 'ABC Logistics Company',
        package: '1 container',
        goodDescription: 'Industrial machinery and spare parts',
        containerNumber: 'MSKU-1234567',
        masterBL: 'MSK-789654123',
        houseBL: 'AAL-002-2024',
      },
      {
        jobNumber: 'RFI-2024-003',
        title: 'Road Freight - General Cargo',
        clientId: testClient.id,
        jobType: 'ROAD_FREIGHT_IMPORT',
        status: 'IN_PROGRESS',
        portOfLoading: 'Kampala, Uganda',
        portOfDischarge: 'Kigali, Rwanda',
        grossWeight: 2000,
        chargeableWeight: 2000,
        shipper: 'East Africa Traders',
        consignee: 'ABC Logistics Company',
        package: '50 packages',
        goodDescription: 'General merchandise and consumables',
        plateNumber: 'RF-2024-789',
      },
    ];

    for (const job of testJobs) {
      const existingJob = await prisma.logisticsJob.findUnique({
        where: { jobNumber: job.jobNumber },
      });

      if (!existingJob) {
        const createdJob = await prisma.logisticsJob.create({ data: job });
        console.log(
          `✅ Created job: ${createdJob.jobNumber} - ${createdJob.title}`
        );
      } else {
        console.log(`⚠️ Job ${job.jobNumber} already exists`);
      }
    }

    console.log('🎉 Test jobs setup completed!');

    // Display summary
    const allJobs = await prisma.logisticsJob.findMany({
      include: { client: true },
    });

    console.log('\n📋 Available Jobs:');
    allJobs.forEach((job) => {
      console.log(
        `  ${job.jobNumber} - ${job.client.name} (${job.jobType}) - ${job.status}`
      );
    });
  } catch (error) {
    console.error('❌ Error creating test jobs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestJobs();
