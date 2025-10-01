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
    console.log('📝 API Request:', request.method, request.url);
    console.log('🔗 Database URL present:', !!process.env.DATABASE_URL);

    switch (request.method) {
      case 'GET':
        const {
          id,
          role: roleFilter,
          isActive: isActiveFilter,
        } = request.query;

        if (id) {
          console.log('🔍 Finding user with ID:', id);
          const user = await prisma.user.findUnique({
            where: { id: id },
            include: {
              jobs: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  jobNumber: true,
                },
              },
              invoices: {
                select: { id: true, number: true, status: true, total: true },
              },
            },
          });

          if (!user) {
            return response.status(404).json({ error: 'User not found' });
          }
          return response.status(200).json(user);
        }

        console.log('📋 Getting all users with filters...');

        // Build where clause for filters
        const where = {};
        if (roleFilter) where.role = roleFilter;
        if (isActiveFilter !== undefined)
          where.isActive = isActiveFilter === 'true';

        const users = await prisma.user.findMany({
          where,
          include: {
            _count: {
              select: { jobs: true, invoices: true },
            },
          },
          orderBy: {
            name: 'asc',
          },
        });

        console.log('✅ Found users:', users.length);
        return response.status(200).json({
          users,
          total: users.length,
          filters: { role: roleFilter, isActive: isActiveFilter },
          success: true,
        });

      case 'POST':
        const {
          name,
          email,
          role: userRole,
          department,
          phone,
          isActive: userIsActive,
        } = request.body;

        if (!name || !email) {
          return response.status(400).json({
            error: 'Missing required fields: name and email are required',
          });
        }

        // Check if user with email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return response.status(400).json({
            error: 'User with this email already exists',
          });
        }

        const newUser = await prisma.user.create({
          data: {
            name,
            email,
            role: userRole ? userRole.toUpperCase() : 'CLIENT',
            department: department || null,
            phone: phone || null,
            isActive: userIsActive !== undefined ? userIsActive : true,
          },
          include: {
            _count: {
              select: { jobs: true, invoices: true },
            },
          },
        });

        return response.status(201).json({
          message: 'User created successfully',
          user: newUser,
        });

      case 'PUT':
        const updateId = request.query.id;
        const updateData = request.body;

        if (!updateId) {
          return response.status(400).json({ error: 'User ID is required' });
        }

        // Check if email is being updated and if it already exists
        if (updateData.email) {
          const existingUserWithEmail = await prisma.user.findUnique({
            where: { email: updateData.email },
          });

          if (existingUserWithEmail && existingUserWithEmail.id !== updateId) {
            return response.status(400).json({
              error: 'User with this email already exists',
            });
          }
        }

        // Remove fields that shouldn't be updated directly
        const {
          id: _,
          createdAt: __,
          updatedAt: ___,
          ...fieldsToUpdate
        } = updateData;

        // Convert role to uppercase to match Prisma enum values
        if (fieldsToUpdate.role) {
          fieldsToUpdate.role = fieldsToUpdate.role.toUpperCase();
        }

        const updatedUser = await prisma.user.update({
          where: { id: updateId },
          data: fieldsToUpdate,
          include: {
            _count: {
              select: { jobs: true, invoices: true },
            },
          },
        });

        return response.status(200).json({
          message: 'User updated successfully',
          user: updatedUser,
        });

      case 'DELETE':
        const deleteId = request.query.id;

        console.log('🗑️ DELETE request - query:', request.query);
        console.log('🗑️ DELETE request - deleteId:', deleteId);
        console.log('🗑️ DELETE request - URL:', request.url);

        if (!deleteId) {
          return response.status(400).json({ error: 'User ID is required' });
        }

        // Check if user has associated jobs or invoices
        const userWithRelations = await prisma.user.findUnique({
          where: { id: deleteId },
          include: {
            _count: {
              select: { jobs: true, invoices: true },
            },
          },
        });

        if (!userWithRelations) {
          return response.status(404).json({ error: 'User not found' });
        }

        if (
          userWithRelations._count.jobs > 0 ||
          userWithRelations._count.invoices > 0
        ) {
          return response.status(400).json({
            error:
              'Cannot delete user with associated jobs or invoices. Consider deactivating instead.',
            details: {
              jobsCount: userWithRelations._count.jobs,
              invoicesCount: userWithRelations._count.invoices,
            },
          });
        }

        const deletedUser = await prisma.user.delete({
          where: { id: deleteId },
        });

        return response.status(200).json({
          message: 'User deleted successfully',
          user: deletedUser,
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
