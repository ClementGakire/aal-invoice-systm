// Import edge-compatible Prisma client
import prisma from '../lib/prisma-edge.js';

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
    console.log('📝 Services API Request:', request.method, request.url);
    console.log('🔗 Database URL present:', !!process.env.DATABASE_URL);

    switch (request.method) {
      case 'GET':
        const { id } = request.query;

        if (id) {
          console.log('🔍 Finding service with ID:', id);
          const service = await prisma.serviceItem.findUnique({
            where: { id: id },
          });

          if (!service) {
            return response.status(404).json({ error: 'Service not found' });
          }
          return response.status(200).json(service);
        }

        console.log('📋 Getting all services...');
        const services = await prisma.serviceItem.findMany({
          orderBy: {
            name: 'asc',
          },
        });

        console.log('✅ Found services:', services.length);
        return response.status(200).json({
          services,
          total: services.length,
          success: true,
        });

      case 'POST':
        const { name, price, currency, vat } = request.body;

        if (!name || price === undefined) {
          return response.status(400).json({
            error: 'Missing required fields: name and price are required',
          });
        }

        const newService = await prisma.serviceItem.create({
          data: {
            name,
            price: parseFloat(price),
            currency: currency || 'USD',
            vat: vat || false,
          },
        });

        return response.status(201).json({
          message: 'Service created successfully',
          service: newService,
        });

      case 'PUT':
        const updateId = request.query.id;
        const updateData = request.body;

        if (!updateId) {
          return response.status(400).json({ error: 'Service ID is required' });
        }

        // Prepare update data, converting price to float if provided
        const dataToUpdate = { ...updateData };
        if (dataToUpdate.price !== undefined) {
          dataToUpdate.price = parseFloat(dataToUpdate.price);
        }

        const updatedService = await prisma.serviceItem.update({
          where: { id: updateId },
          data: dataToUpdate,
        });

        return response.status(200).json({
          message: 'Service updated successfully',
          service: updatedService,
        });

      case 'DELETE':
        const deleteId = request.query.id;

        console.log('🗑️ DELETE request - query:', request.query);
        console.log('🗑️ DELETE request - deleteId:', deleteId);
        console.log('🗑️ DELETE request - URL:', request.url);

        if (!deleteId) {
          return response.status(400).json({ error: 'Service ID is required' });
        }

        const deletedService = await prisma.serviceItem.delete({
          where: { id: deleteId },
        });

        return response.status(200).json({
          message: 'Service deleted successfully',
          service: deletedService,
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
    console.error('🚨 Services API Error:', error);
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
