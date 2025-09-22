const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('🔍 Testing database connection...');
    
    // Test the connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test client fetching
    console.log('🔍 Fetching clients from database...');
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
    
    console.log(`✅ Successfully fetched ${clients.length} clients:`);
    clients.forEach(client => {
      console.log(`  - ${client.name} (ID: ${client.id})`);
      console.log(`    Address: ${client.address || 'N/A'}`);
      console.log(`    Phone: ${client.phone || 'N/A'}`);
      console.log(`    TIN: ${client.tin || 'N/A'}`);
      console.log(`    Jobs: ${client._count.jobs}, Invoices: ${client._count.invoices}`);
      console.log('');
    });

    // Test creating a new client
    console.log('🔍 Testing client creation...');
    const newClient = await prisma.client.create({
      data: {
        name: 'Test Client ' + Date.now(),
        address: '123 Test Street',
        phone: '+1-555-TEST',
        tin: 'TEST123456',
      },
    });
    
    console.log('✅ Successfully created new client:', newClient);
    
    // Delete the test client
    console.log('🔍 Cleaning up test client...');
    await prisma.client.delete({
      where: { id: newClient.id },
    });
    console.log('✅ Test client deleted successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
  } finally {
    await prisma.$disconnect();
    console.log('🔍 Database connection closed');
  }
}

testDatabase().catch(console.error);