import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock invoice data - in a real app, this would come from a database
const mockInvoices = [
  {
    id: '1',
    number: 'INV-001',
    clientName: 'Acme Corp',
    total: 1500.0,
    status: 'paid',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    number: 'INV-002',
    clientName: 'Tech Solutions Ltd',
    total: 2750.5,
    status: 'pending',
    createdAt: '2024-01-20',
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
        // Get all invoices or specific invoice by ID
        const { id } = request.query;

        if (id) {
          const invoice = mockInvoices.find((inv) => inv.id === id);
          if (!invoice) {
            return response.status(404).json({ error: 'Invoice not found' });
          }
          return response.status(200).json(invoice);
        }

        return response.status(200).json({
          invoices: mockInvoices,
          total: mockInvoices.length,
        });

      case 'POST':
        // Create new invoice
        const newInvoice = {
          id: String(mockInvoices.length + 1),
          number: `INV-${String(mockInvoices.length + 1).padStart(3, '0')}`,
          ...request.body,
          createdAt: new Date().toISOString().split('T')[0],
        };

        mockInvoices.push(newInvoice);
        return response.status(201).json(newInvoice);

      default:
        response.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
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
