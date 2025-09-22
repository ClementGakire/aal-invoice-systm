import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@aal.com' },
      update: {},
      create: {
        id: 'u1',
        name: 'John Administrator',
        email: 'admin@aal.com',
        role: 'ADMIN',
        department: 'IT',
        phone: '+1-555-0101',
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'finance@aal.com' },
      update: {},
      create: {
        id: 'u2',
        name: 'Sarah Finance',
        email: 'finance@aal.com',
        role: 'FINANCE',
        department: 'Finance',
        phone: '+1-555-0102',
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'operations@aal.com' },
      update: {},
      create: {
        id: 'u3',
        name: 'Mike Operations',
        email: 'operations@aal.com',
        role: 'OPERATIONS',
        department: 'Operations',
        phone: '+1-555-0103',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Created users');

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { id: 's1' },
      update: {},
      create: {
        id: 's1',
        name: 'Supplier One',
        contact: 'sup1@example.com',
      },
    }),
    prisma.supplier.upsert({
      where: { id: 's2' },
      update: {},
      create: {
        id: 's2',
        name: 'Parts & Equipment',
        contact: 'parts@example.com',
      },
    }),
    prisma.supplier.upsert({
      where: { id: 's3' },
      update: {},
      create: {
        id: 's3',
        name: 'Office Supplies Co',
        contact: 'office@example.com',
      },
    }),
  ]);

  console.log('✅ Created suppliers');

  // Create service items
  const services = await Promise.all([
    prisma.serviceItem.upsert({
      where: { id: 'sv1' },
      update: {},
      create: {
        id: 'sv1',
        name: 'Consulting',
        price: 500,
        currency: 'USD',
        vat: true,
      },
    }),
    prisma.serviceItem.upsert({
      where: { id: 'sv2' },
      update: {},
      create: {
        id: 'sv2',
        name: 'Delivery',
        price: 50,
        currency: 'USD',
        vat: false,
      },
    }),
    prisma.serviceItem.upsert({
      where: { id: 'sv3' },
      update: {},
      create: {
        id: 'sv3',
        name: 'Installation',
        price: 800,
        currency: 'USD',
        vat: true,
      },
    }),
  ]);

  console.log('✅ Created service items');

  // Create logistics jobs


  console.log('✅ Created logistics jobs');

  // Create invoices with line items
  const invoice1 = await prisma.invoice.upsert({
    where: { number: 'RW-CI-22-00275' },
    update: {},
    create: {
      id: 'i1',
      number: 'RW-CI-22-00275',
      clientId: 'c1',
      jobId: 'j1',
      jobNumber: 'AF-2024-001',
      bookingNumber: 'RW-BK-22-00279',
      status: 'UNPAID',
      invoiceDate: new Date('2024-01-22'),
      dueDate: new Date('2024-02-22'),
      subTotal: 10500.0,
      total: 10500.0,
      currency: 'USD',
      amountInWords: 'Ten Thousand Five Hundred Dollars And Zero Cents',
      userId: 'u2',
      lineItems: {
        create: [
          {
            id: 'li1-1',
            description: 'Seafreight Charges',
            basedOn: 'Shipment',
            rate: 6500.0,
            currency: 'USD',
            amount: 6500.0,
            billingAmount: 6500.0,
          },
          {
            id: 'li1-2',
            description: 'Transport Charges New York-Kigali',
            basedOn: 'Shipment',
            rate: 4000.0,
            currency: 'USD',
            amount: 4000.0,
            billingAmount: 4000.0,
          },
        ],
      },
    },
  });

  const invoice2 = await prisma.invoice.upsert({
    where: { number: 'RW-CI-22-00276' },
    update: {},
    create: {
      id: 'i2',
      number: 'RW-CI-22-00276',
      clientId: 'c2',
      jobId: 'j2',
      jobNumber: 'SF-2024-002',
      bookingNumber: 'RW-BK-22-00280',
      status: 'PAID',
      invoiceDate: new Date('2024-02-12'),
      dueDate: new Date('2024-03-12'),
      subTotal: 9700.0,
      total: 9700.0,
      currency: 'USD',
      amountInWords: 'Nine Thousand Seven Hundred Dollars And Zero Cents',
      userId: 'u2',
      lineItems: {
        create: [
          {
            id: 'li2-1',
            description: 'Sea Freight Charges - Container',
            basedOn: 'Shipment',
            rate: 8500.0,
            currency: 'USD',
            amount: 8500.0,
            billingAmount: 8500.0,
          },
          {
            id: 'li2-2',
            description: 'Port Handling Charges',
            basedOn: 'Shipment',
            rate: 1200.0,
            currency: 'USD',
            amount: 1200.0,
            billingAmount: 1200.0,
          },
        ],
      },
    },
  });

  console.log('✅ Created invoices');

  // Create expenses
  const expenses = await Promise.all([
    prisma.expense.upsert({
      where: { id: 'e1' },
      update: {},
      create: {
        id: 'e1',
        title: 'Equipment parts',
        amount: 320,
        currency: 'USD',
        jobNumber: 'AF-2024-001',
        supplierId: 's1',
        supplierName: 'Supplier One',
        jobId: 'j1',
      },
    }),
    prisma.expense.upsert({
      where: { id: 'e2' },
      update: {},
      create: {
        id: 'e2',
        title: 'Office supplies',
        amount: 150,
        currency: 'USD',
        supplierId: 's3',
        supplierName: 'Office Supplies Co',
      },
    }),
    prisma.expense.upsert({
      where: { id: 'e3' },
      update: {},
      create: {
        id: 'e3',
        title: 'Hardware components',
        amount: 890,
        currency: 'USD',
        jobNumber: 'SF-2024-002',
        supplierId: 's2',
        supplierName: 'Parts & Equipment',
        jobId: 'j2',
      },
    }),
  ]);

  console.log('✅ Created expenses');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Database seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
