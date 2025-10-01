const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    // Test the connection
    await prisma.$connect();

    // Test client fetching

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

    clients.forEach((client) => {});

    // Test creating a new client

    const newClient = await prisma.client.create({
      data: {
        name: 'Test Client ' + Date.now(),
        address: '123 Test Street',
        phone: '+1-555-TEST',
        tin: 'TEST123456',
      },
    });

    // Delete the test client

    await prisma.client.delete({
      where: { id: newClient.id },
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase().catch(console.error);
