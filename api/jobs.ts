import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock logistics jobs data
const mockJobs = [
  {
    id: '1',
    type: 'air_freight',
    client: 'Global Shipping Inc',
    origin: 'New York, USA',
    destination: 'London, UK',
    status: 'in_transit',
    weight: 1200,
    value: 15000,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    type: 'sea_freight',
    client: 'Maritime Solutions Ltd',
    origin: 'Shanghai, China',
    destination: 'Los Angeles, USA',
    status: 'delivered',
    weight: 25000,
    value: 45000,
    createdAt: '2024-01-10T08:30:00Z',
  },
];

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
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

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    switch (request.method) {
      case 'GET':
        const { id, type, status } = request.query;

        let filteredJobs = [...mockJobs];

        // Filter by ID
        if (id) {
          const job = filteredJobs.find((j) => j.id === id);
          if (!job) {
            return response.status(404).json({ error: 'Job not found' });
          }
          return response.status(200).json(job);
        }

        // Filter by type
        if (type) {
          filteredJobs = filteredJobs.filter((j) => j.type === type);
        }

        // Filter by status
        if (status) {
          filteredJobs = filteredJobs.filter((j) => j.status === status);
        }

        return response.status(200).json({
          jobs: filteredJobs,
          total: filteredJobs.length,
          filters: { type, status },
        });

      case 'POST':
        const newJob = {
          id: String(mockJobs.length + 1),
          ...request.body,
          createdAt: new Date().toISOString(),
        };

        // Basic validation
        if (
          !newJob.type ||
          !newJob.client ||
          !newJob.origin ||
          !newJob.destination
        ) {
          return response.status(400).json({
            error: 'Missing required fields: type, client, origin, destination',
          });
        }

        mockJobs.push(newJob);
        return response.status(201).json(newJob);

      case 'PUT':
        const { id: updateId } = request.query;
        if (!updateId) {
          return response
            .status(400)
            .json({ error: 'Job ID is required for updates' });
        }

        const jobIndex = mockJobs.findIndex((j) => j.id === updateId);
        if (jobIndex === -1) {
          return response.status(404).json({ error: 'Job not found' });
        }

        mockJobs[jobIndex] = { ...mockJobs[jobIndex], ...request.body };
        return response.status(200).json(mockJobs[jobIndex]);

      case 'DELETE':
        const { id: deleteId } = request.query;
        if (!deleteId) {
          return response
            .status(400)
            .json({ error: 'Job ID is required for deletion' });
        }

        const deleteIndex = mockJobs.findIndex((j) => j.id === deleteId);
        if (deleteIndex === -1) {
          return response.status(404).json({ error: 'Job not found' });
        }

        const deletedJob = mockJobs.splice(deleteIndex, 1)[0];
        return response
          .status(200)
          .json({ message: 'Job deleted', job: deletedJob });

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
    console.error('API Error:', error);
    return response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
