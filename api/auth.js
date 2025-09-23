// Import edge-compatible Prisma client
import prisma from '../lib/prisma-edge.js';

export default async function handler(request, response) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  response.setHeader('Content-Type', 'application/json');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    console.log('🔐 Auth Request:', request.method, request.url);

    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        error: 'Email and password are required',
      });
    }

    console.log('🔍 Looking for user with email:', email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      include: {
        _count: {
          select: { jobs: true, invoices: true },
        },
      },
    });

    if (!user) {
      console.log('❌ User not found');
      return response.status(401).json({
        error: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      console.log('❌ User is inactive');
      return response.status(401).json({
        error: 'Account is inactive',
      });
    }

    // For now, accept any password for demonstration
    // In a real system, you would hash and compare passwords
    const validPasswords = {
      'musoni@aal.rw': 'musoni123',
      'tito@aal.rw': 'tito123',
      'jimmy@aal.rw': 'jimmy123',
      'steven@aal.rw': 'steven123',
      'shamuso@aal.rw': 'shamuso123',
      'danny.sales@aal.rw': 'danny123',
      'test@example.com': 'test123',
    };

    const expectedPassword = validPasswords[email] || 'default123';

    if (password !== expectedPassword) {
      console.log('❌ Invalid password');
      return response.status(401).json({
        error: 'Invalid credentials',
      });
    }

    console.log('✅ Authentication successful for:', user.name);

    // Return user data (excluding sensitive information)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(), // Convert to lowercase for frontend compatibility
      department: user.department,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      _count: user._count,
    };

    return response.status(200).json({
      message: 'Authentication successful',
      user: userResponse,
      token: `mock_token_${user.id}`, // In a real system, generate a JWT token
    });
  } catch (error) {
    console.error('🚨 Auth Error:', error);
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
