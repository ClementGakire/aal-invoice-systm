// Script to seed sample services for testing
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleServices = [
  {
    name: 'Customs Warehouse Rent',
    price: 53100.0,
    currency: 'RWF',
    vat: false,
  },
  {
    name: 'Agency Fees',
    price: 100000.0,
    currency: 'RWF',
    vat: true,
  },
  {
    name: 'Delivery Charges',
    price: 50000.0,
    currency: 'RWF',
    vat: false,
  },
  {
    name: 'Consolidation Fee',
    price: 30000.0,
    currency: 'RWF',
    vat: false,
  },
  {
    name: 'Air Freight Import',
    price: 2500.0,
    currency: 'USD',
    vat: true,
  },
  {
    name: 'Sea Freight Import',
    price: 1800.0,
    currency: 'USD',
    vat: true,
  },
  {
    name: 'Road Freight',
    price: 800.0,
    currency: 'USD',
    vat: false,
  },
  {
    name: 'Documentation Fee',
    price: 150.0,
    currency: 'USD',
    vat: false,
  },
  {
    name: 'Storage Fee',
    price: 25000.0,
    currency: 'RWF',
    vat: false,
  },
  {
    name: 'Handling Fee',
    price: 15000.0,
    currency: 'RWF',
    vat: true,
  },
];

async function seedServices() {
  try {
    console.log('🌱 Starting to seed services...');

    for (const service of sampleServices) {
      const created = await prisma.serviceItem.create({
        data: service,
      });
      console.log(
        `✅ Created service: ${created.name} - ${created.currency} ${created.price}`
      );
    }

    console.log('🎉 Successfully seeded all services!');
  } catch (error) {
    console.error('❌ Error seeding services:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedServices();
