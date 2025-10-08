/**
 * JWT Token verification middleware for API routes
 */
import jwt from 'jsonwebtoken';

/**
 * Verifies JWT token and returns decoded payload
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
export function verifyJwtToken(token) {
  const jwtSecret = process.env.JWT_SECRET || 'your-default-secret-change-in-production';
  
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

/**
 * Middleware function to authenticate API requests
 * @param {Object} request - HTTP request object
 * @returns {Object} - User info from token or throws error
 */
export function authenticateRequest(request) {
  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    throw new Error('Authorization header missing');
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    throw new Error('Token missing from authorization header');
  }

  return verifyJwtToken(token);
}

/**
 * Express middleware wrapper for authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function authMiddleware(req, res, next) {
  try {
    const user = authenticateRequest(req);
    req.user = user; // Attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message,
    });
  }
}