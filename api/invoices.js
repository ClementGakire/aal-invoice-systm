// Import edge-compatible Prisma client
import prisma from '../lib/prisma-edge.js';

// Generate automatic invoice number with format AAL-AR-YY-XXXX
async function generateInvoiceNumber() {
  const year = new Date().getFullYear().toString().slice(-2);
  const invoiceNumberPrefix = `AAL-AR-${year}-`;

  // Find the latest invoice number with this prefix to determine the next sequence
  const latestInvoice = await prisma.invoice.findFirst({
    where: {
      number: {
        startsWith: invoiceNumberPrefix,
      },
    },
    orderBy: {
      number: 'desc',
    },
  });

  let sequenceNumber = 1;
  if (latestInvoice && latestInvoice.number) {
    // Extract sequence number from existing invoice number
    const parts = latestInvoice.number.split('-');
    if (parts.length === 4) {
      const lastSequence = parseInt(parts[3], 10);
      if (!isNaN(lastSequence)) {
        sequenceNumber = lastSequence + 1;
      }
    }
  }

  const sequence = sequenceNumber.toString().padStart(4, '0');
  return `${invoiceNumberPrefix}${sequence}`;
}

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
        const { id, clientId, status } = request.query;

        if (id) {
          console.log('🔍 Finding invoice with ID:', id);
          const invoice = await prisma.invoice.findUnique({
            where: { id: id },
            include: {
              client: {
                select: { id: true, name: true, email: true, address: true },
              },
              job: {
                select: { id: true, jobNumber: true, title: true },
              },
              user: {
                select: { id: true, name: true, email: true },
              },
              lineItems: {
                orderBy: { id: 'asc' },
              },
            },
          });

          if (!invoice) {
            return response.status(404).json({ error: 'Invoice not found' });
          }
          return response.status(200).json(invoice);
        }

        console.log('📋 Getting all invoices with filters...');

        // Build where clause for filters
        const where = {};
        if (clientId) where.clientId = clientId;
        if (status) where.status = status;

        const invoices = await prisma.invoice.findMany({
          where,
          include: {
            client: {
              select: { id: true, name: true, email: true },
            },
            job: {
              select: { id: true, jobNumber: true, title: true },
            },
            user: {
              select: { id: true, name: true, email: true },
            },
            lineItems: {
              orderBy: { id: 'asc' },
            },
            _count: {
              select: { lineItems: true },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        console.log('✅ Found invoices:', invoices.length);
        return response.status(200).json({
          invoices,
          total: invoices.length,
          filters: { clientId, status },
          success: true,
        });

      case 'POST':
        const {
          clientId: postClientId,
          jobId,
          jobNumber,
          bookingNumber,
          invoiceDate,
          dueDate,
          subTotal,
          total,
          currency = 'USD',
          amountInWords,
          remarks,
          userId,
          lineItems = [],
        } = request.body;

        if (!postClientId || !invoiceDate || !subTotal || !total) {
          return response.status(400).json({
            error:
              'Missing required fields: clientId, invoiceDate, subTotal, and total are required',
          });
        }

        // Generate unique invoice number
        const invoiceNumber = await generateInvoiceNumber();

        const newInvoice = await prisma.invoice.create({
          data: {
            number: invoiceNumber,
            clientId: postClientId,
            jobId: jobId || null,
            jobNumber: jobNumber || null,
            bookingNumber: bookingNumber || null,
            invoiceDate: new Date(invoiceDate),
            dueDate: dueDate ? new Date(dueDate) : null,
            subTotal,
            total,
            currency,
            amountInWords: amountInWords || null,
            remarks: remarks || null,
            userId: userId || null,
            lineItems: {
              create: lineItems.map((item) => ({
                description: item.description,
                basedOn: item.basedOn,
                rate: item.rate,
                currency: item.currency || currency,
                amount: item.amount,
                taxPercent: item.taxPercent || null,
                taxAmount: item.taxAmount || null,
                billingAmount: item.billingAmount,
              })),
            },
          },
          include: {
            client: {
              select: { id: true, name: true, email: true },
            },
            job: {
              select: { id: true, jobNumber: true, title: true },
            },
            user: {
              select: { id: true, name: true, email: true },
            },
            lineItems: true,
            _count: {
              select: { lineItems: true },
            },
          },
        });

        return response.status(201).json({
          message: 'Invoice created successfully',
          invoice: newInvoice,
        });

      case 'PUT':
        const updateId = request.query.id;
        const updateData = request.body;

        if (!updateId) {
          return response.status(400).json({ error: 'Invoice ID is required' });
        }

        // Handle line items separately if provided
        const { lineItems: updateLineItems, ...invoiceData } = updateData;

        // Remove fields that shouldn't be updated directly
        const {
          id: _,
          number: __,
          createdAt: ___,
          updatedAt: ____,
          ...fieldsToUpdate
        } = invoiceData;

        // Convert date fields if present
        if (fieldsToUpdate.invoiceDate) {
          fieldsToUpdate.invoiceDate = new Date(fieldsToUpdate.invoiceDate);
        }
        if (fieldsToUpdate.dueDate) {
          fieldsToUpdate.dueDate = new Date(fieldsToUpdate.dueDate);
        }

        const updateOperation = {
          where: { id: updateId },
          data: fieldsToUpdate,
          include: {
            client: {
              select: { id: true, name: true, email: true },
            },
            job: {
              select: { id: true, jobNumber: true, title: true },
            },
            user: {
              select: { id: true, name: true, email: true },
            },
            lineItems: true,
            _count: {
              select: { lineItems: true },
            },
          },
        };

        // If line items are provided, update them too
        if (updateLineItems && Array.isArray(updateLineItems)) {
          updateOperation.data.lineItems = {
            deleteMany: {}, // Delete all existing line items
            create: updateLineItems.map((item) => ({
              description: item.description,
              basedOn: item.basedOn,
              rate: item.rate,
              currency: item.currency || fieldsToUpdate.currency || 'USD',
              amount: item.amount,
              taxPercent: item.taxPercent || null,
              taxAmount: item.taxAmount || null,
              billingAmount: item.billingAmount,
            })),
          };
        }

        const updatedInvoice = await prisma.invoice.update(updateOperation);

        return response.status(200).json({
          message: 'Invoice updated successfully',
          invoice: updatedInvoice,
        });

      case 'DELETE':
        const deleteId = request.query.id;

        if (!deleteId) {
          return response.status(400).json({ error: 'Invoice ID is required' });
        }

        const deletedInvoice = await prisma.invoice.delete({
          where: { id: deleteId },
          include: {
            client: {
              select: { id: true, name: true, email: true },
            },
            job: {
              select: { id: true, jobNumber: true, title: true },
            },
            lineItems: true,
          },
        });

        return response.status(200).json({
          message: 'Invoice deleted successfully',
          invoice: deletedInvoice,
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
