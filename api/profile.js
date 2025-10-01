// User profile management API
import prisma from '../lib/prisma-edge.js';

export default async function handler(request, response) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  response.setHeader('Content-Type', 'application/json');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    console.log('👤 Profile API Request:', request.method, request.url);

    switch (request.method) {
      case 'GET':
        // Get current user profile
        const { userId } = request.query;

        if (!userId) {
          return response.status(400).json({ error: 'User ID is required' });
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            role: true,
            department: true,
            phone: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user) {
          return response.status(404).json({ error: 'User not found' });
        }

        return response.status(200).json({ user });

      case 'PUT':
        // Update user profile
        const updateUserId = request.query.userId;
        const { name, phone, profilePicture, currentPassword, newPassword } =
          request.body;

        if (!updateUserId) {
          return response.status(400).json({ error: 'User ID is required' });
        }

        // Get current user data
        const currentUser = await prisma.user.findUnique({
          where: { id: updateUserId },
        });

        if (!currentUser) {
          return response.status(404).json({ error: 'User not found' });
        }

        const updateData = {};

        // Update basic profile fields
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (profilePicture !== undefined)
          updateData.profilePicture = profilePicture;

        // Handle password update
        if (newPassword) {
          if (!currentPassword) {
            return response.status(400).json({
              error: 'Current password is required to set new password',
            });
          }

          // Dynamic import bcrypt for serverless compatibility
          const bcrypt = await import('bcryptjs');

          // If user has existing password, verify current password
          if (currentUser.password) {
            const isCurrentPasswordValid = await bcrypt.compare(
              currentPassword,
              currentUser.password
            );

            if (!isCurrentPasswordValid) {
              return response.status(400).json({
                error: 'Current password is incorrect',
              });
            }
          }

          // Hash new password
          const hashedPassword = await bcrypt.hash(newPassword, 12);
          updateData.password = hashedPassword;
        }

        // Update user
        const updatedUser = await prisma.user.update({
          where: { id: updateUserId },
          data: updateData,
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            role: true,
            department: true,
            phone: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return response.status(200).json({
          message: 'Profile updated successfully',
          user: updatedUser,
        });

      case 'POST':
        // Upload profile picture endpoint
        const { userId: uploadUserId, imageData } = request.body;

        if (!uploadUserId || !imageData) {
          return response.status(400).json({
            error: 'User ID and image data are required',
          });
        }

        // Validate image data
        if (!imageData.startsWith('data:image/')) {
          return response.status(400).json({
            error: 'Invalid image format. Please provide a valid base64 image.',
          });
        }

        // For now, we'll store the base64 data directly
        // In production, you should:
        // 1. Extract the base64 data
        // 2. Upload to cloud storage (AWS S3, Cloudinary, etc.)
        // 3. Store the public URL instead
        
        // Validate base64 data size (limit to ~1MB base64 = ~750KB actual image)
        if (imageData.length > 1400000) { // ~1MB base64
          return response.status(400).json({
            error: 'Image too large. Please choose a smaller image (max 1MB).',
          });
        }

        try {
          const updatedUserWithImage = await prisma.user.update({
            where: { id: uploadUserId },
            data: {
              profilePicture: imageData,
            },
            select: {
              id: true,
              name: true,
              email: true,
              profilePicture: true,
              role: true,
              department: true,
              phone: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          });

          return response.status(200).json({
            message: 'Profile picture updated successfully',
            user: updatedUserWithImage,
          });
        } catch (dbError) {
          console.error('Database error updating profile picture:', dbError);
          return response.status(500).json({
            error: 'Failed to save profile picture. Please try a smaller image.',
          });
        }

      default:
        response.setHeader('Allow', ['GET', 'PUT', 'POST', 'OPTIONS']);
        return response
          .status(405)
          .json({ error: `Method ${request.method} not allowed` });
    }
  } catch (error) {
    console.error('🚨 Profile API Error:', error);

    return response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
