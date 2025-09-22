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

  // Create clients
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: 'c1' },
      update: {},
      create: {
        id: 'c1',
        name: 'Acme Corp',
        address: '1 Main St',
        phone: '+123456',
        tin: 'TIN123456789',
      },
    }),
    prisma.client.upsert({
      where: { id: 'c2' },
      update: {},
      create: {
        id: 'c2',
        name: 'Beta LLC',
        address: '9 Market St',
        phone: '+987654',
        tin: 'TIN987654321',
      },
    }),
    prisma.client.upsert({
      where: { id: 'c3' },
      update: {},
      create: {
        id: 'c3',
        name: 'TechStart Inc',
        address: '456 Innovation Ave',
        phone: '+555123',
        tin: 'TIN555123456',
      },
    }),
    prisma.client.upsert({
      where: { id: 'c4' },
      update: {},
      create: {
        id: 'c4',
        name: 'Global Solutions',
        address: '789 Business Blvd',
        phone: '+555456',
        tin: 'TIN789456123',
      },
    }),
    prisma.client.upsert({
      where: { id: 'c5' },
      update: {},
      create: {
        id: 'c5',
        name: 'Creative Agency',
        address: '321 Design St',
        phone: '+555789',
        tin: 'TIN321789654',
      },
    }),
  ]);

  console.log('✅ Created clients');

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
  const jobs = await Promise.all([
    prisma.logisticsJob.upsert({
      where: { jobNumber: 'AF-2024-001' },
      update: {},
      create: {
        id: 'j1',
        jobNumber: 'AF-2024-001',
        title: 'Electronics Shipment to Dubai',
        clientId: 'c1',
        status: 'DELIVERED',
        jobType: 'AIR_FREIGHT',
        portOfLoading: 'JFK - New York',
        portOfDischarge: 'DXB - Dubai',
        grossWeight: 450.5,
        chargeableWeight: 520.0,
        shipper: 'Acme Electronics Inc',
        consignee: 'Dubai Tech Solutions',
        package: '15 Boxes',
        goodDescription: 'Computer Equipment and Electronics',
        masterAirWaybill: 'MAWB-176-12345678',
        houseAirWaybill: 'HAWB-176-87654321',
        userId: 'u3',
      },
    }),
    prisma.logisticsJob.upsert({
      where: { jobNumber: 'SF-2024-002' },
      update: {},
      create: {
        id: 'j2',
        jobNumber: 'SF-2024-002',
        title: 'Machinery Import from Germany',
        clientId: 'c2',
        status: 'IN_PROGRESS',
        jobType: 'SEA_FREIGHT',
        portOfLoading: 'HAM - Hamburg',
        portOfDischarge: 'NYC - New York',
        grossWeight: 12500.0,
        chargeableWeight: 12500.0,
        shipper: 'German Manufacturing GmbH',
        consignee: 'Beta Industrial LLC',
        package: '1 x 40ft Container',
        goodDescription: 'Industrial Machinery and Parts',
        masterBL: 'MBL-MAEU-9876543210',
        houseBL: 'HBL-BETA-1234567890',
        userId: 'u3',
      },
    }),
    prisma.logisticsJob.upsert({
      where: { jobNumber: 'RF-2024-003' },
      update: {},
      create: {
        id: 'j3',
        jobNumber: 'RF-2024-003',
        title: 'Local Delivery to Warehouse',
        clientId: 'c3',
        status: 'OPEN',
        jobType: 'ROAD_FREIGHT',
        portOfLoading: 'Distribution Center A',
        portOfDischarge: 'TechStart Warehouse',
        grossWeight: 2800.0,
        chargeableWeight: 2800.0,
        shipper: 'Central Distribution Hub',
        consignee: 'TechStart Inc',
        package: '50 Pallets',
        goodDescription: 'Office Equipment and Supplies',
        plateNumber: 'TRK-456-ABC',
        containerNumber: 'CONT-789-XYZ',
        userId: 'u3',
      },
    }),
  ]);

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
