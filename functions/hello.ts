import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { name = 'World' } = request.query;

  return response.status(200).json({
    message: `Hello ${name}!`,
    timestamp: new Date().toISOString(),
    method: request.method,
  });
}
