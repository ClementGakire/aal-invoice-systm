import React, { useState, useMemo } from 'react';
import {
  invoicesMock,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  jobsMock,
  clientsMock,
  type Invoice,
  type LogisticsJob,
} from '../services/mockData';
import {
  generateInvoiceLineItems,
  generateInvoiceNumber,
  generateBookingNumber,
  numberToWords,
  getJobTypeDisplayName,
} from '../types/logistics';
import CreateInvoiceFromJobButton from '../components/CreateInvoiceFromJobButton';
import {
  Search,
  X,
  Edit2,
  Trash2,
  Printer,
  ArrowUpDown,
  Filter,
  Plus,
  FileText,
} from 'lucide-react';
import PrintableInvoice from '../components/PrintableInvoice';

function downloadCSV(content: string, filename = 'invoices.csv') {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = useMemo(() => {
    let filtered = invoicesMock;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.total.toString().includes(searchTerm) ||
          invoice.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (invoice.jobNumber &&
            invoice.jobNumber
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (invoice.bookingNumber &&
            invoice.bookingNumber
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortBy) {
        case 'number':
          aValue = a.number.toLowerCase();
          bValue = b.number.toLowerCase();
          break;
        case 'client':
          aValue = a.clientName.toLowerCase();
          bValue = b.clientName.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'date':
          aValue = new Date(a.invoiceDate).getTime();
          bValue = new Date(b.invoiceDate).getTime();
          break;
        default:
          aValue = a.number.toLowerCase();
          bValue = b.number.toLowerCase();
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        return sortOrder === 'asc'
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      }
    });

    return filtered;
  }, [searchTerm, sortBy, sortOrder, statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="page-title">Invoices</h2>
        <div className="flex gap-2">
          <CreateInvoiceFromJobButton onInvoiceCreated={addInvoice} />
          <NewInvoiceButton />
          <button
            onClick={() => {
              const rows = [
                'Number,Client,Job Number,Status,Total,Currency,Invoice Date',
                ...filteredInvoices.map(
                  (i) =>
                    `${i.number},"${i.clientName}",${i.jobNumber || ''},${
                      i.status
                    },${i.total},${
                      i.currency
                    },${i.invoiceDate.toLocaleDateString()}`
                ),
              ];
              downloadCSV(rows.join('\n'));
            }}
            className="px-3 py-2 rounded border text-sm shadow hover:bg-gray-50 transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
          />
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
            >
              <option value="number">Sort by Invoice #</option>
              <option value="client">Sort by Client</option>
              <option value="status">Sort by Status</option>
              <option value="total">Sort by Total</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}{' '}
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </button>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredInvoices.map((i) => {
          const associatedJob = i.jobId
            ? jobsMock.find((job) => job.id === i.jobId)
            : null;
          return (
            <div key={i.id} className="card flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className="font-medium text-lg">Invoice {i.number}</div>
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      i.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : i.status === 'unpaid'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {i.status.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Client:</span> {i.clientName}
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span> {i.currency}{' '}
                    {i.total.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>{' '}
                    {i.invoiceDate.toLocaleDateString()}
                  </div>
                </div>

                {(i.jobNumber || i.bookingNumber || associatedJob) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-500 mt-1">
                    <div>
                      {i.jobNumber && (
                        <span>
                          <span className="font-medium">Job:</span>{' '}
                          {i.jobNumber}
                        </span>
                      )}
                    </div>
                    <div>
                      {i.bookingNumber && (
                        <span>
                          <span className="font-medium">Booking:</span>{' '}
                          {i.bookingNumber}
                        </span>
                      )}
                    </div>
                    <div>
                      {associatedJob && (
                        <span>
                          <span className="font-medium">Service:</span>{' '}
                          {getJobTypeDisplayName(associatedJob.jobType)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingInvoice(i)}
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-50 transition"
                >
                  View
                </button>
                <button
                  onClick={() => setPrintingInvoice(i)}
                  className="px-3 py-1 border rounded text-sm hover:bg-blue-50 text-blue-600 transition flex items-center gap-1"
                >
                  <Printer className="w-3 h-3" />
                  Print
                </button>
                <button
                  onClick={() => setEditingInvoice(i)}
                  className="px-3 py-1 border rounded text-sm hover:bg-blue-50 text-blue-600 transition flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => setDeletingInvoice(i)}
                  className="px-3 py-1 border rounded text-sm hover:bg-red-50 text-red-600 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {filteredInvoices.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            No invoices found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* View Invoice Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg animate-fadein">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Invoice Details</h3>
              <button
                onClick={() => setViewingInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Number
                  </label>
                  <div className="text-sm font-medium p-2 border rounded">
                    {viewingInvoice.number}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div
                    className={`text-sm p-2 border rounded font-medium ${
                      viewingInvoice.status === 'paid'
                        ? 'text-green-700 bg-green-50'
                        : 'text-red-700 bg-red-50'
                    }`}
                  >
                    {viewingInvoice.status.toUpperCase()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <div className="text-sm p-2 border rounded">
                  {viewingInvoice.clientName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <div className="text-lg font-semibold p-2 border rounded">
                    {viewingInvoice.currency}{' '}
                    {viewingInvoice.total.toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job ID
                  </label>
                  <div className="text-sm p-2 border rounded">
                    {viewingInvoice.jobId || 'No job assigned'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice ID
                </label>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {viewingInvoice.id}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setPrintingInvoice(viewingInvoice)}
                className="px-4 py-2 rounded bg-blue-600 text-white shadow hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </button>
              <button
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {editingInvoice && (
        <EditInvoiceModal
          invoice={editingInvoice}
          onClose={() => setEditingInvoice(null)}
          onSave={(updates) => {
            updateInvoice(editingInvoice.id, updates);
            setEditingInvoice(null);
            window.location.reload();
          }}
        />
      )}

      {/* Delete Invoice Modal */}
      {deletingInvoice && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">
                Delete Invoice
              </h3>
              <button
                onClick={() => setDeletingInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete invoice{' '}
                <strong>{deletingInvoice.number}</strong>? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingInvoice(null)}
                className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteInvoice(deletingInvoice.id);
                  setDeletingInvoice(null);
                  window.location.reload();
                }}
                className="px-4 py-2 rounded bg-red-600 text-white shadow hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice */}
      {printingInvoice && (
        <PrintableInvoice
          invoice={printingInvoice}
          onClose={() => setPrintingInvoice(null)}
        />
      )}
    </div>
  );
}

function EditInvoiceModal({
  invoice,
  onClose,
  onSave,
}: {
  invoice: Invoice;
  onClose: () => void;
  onSave: (updates: Partial<Invoice>) => void;
}) {
  const [number, setNumber] = useState(invoice.number);
  const [clientName, setClientName] = useState(invoice.clientName);
  const [status, setStatus] = useState(invoice.status);
  const [total, setTotal] = useState(invoice.total.toString());
  const [currency, setCurrency] = useState(invoice.currency);

  const handleSave = () => {
    if (!number.trim() || !clientName.trim()) return;
    onSave({
      number,
      clientName,
      status,
      total: Number(total) || 0,
      currency,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Invoice</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number *
            </label>
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
              placeholder="INV-001"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name *
            </label>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
              placeholder="Client name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total *
              </label>
              <input
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
                placeholder="USD"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-sky-600 text-white shadow hover:bg-sky-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function NewInvoiceButton() {
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [total, setTotal] = useState('');
  const submit = () => {
    if (!number || !clientName) return;
    addInvoice({
      id: 'i_' + Date.now(),
      number,
      clientName,
      clientId: '',
      jobId: undefined,
      status: 'unpaid',
      total: Number(total) || 0,
      currency: 'USD',
      invoiceDate: new Date(),
      lineItems: [
        {
          id: '1',
          description: 'Service charge',
          basedOn: 'Service',
          rate: Number(total) || 0,
          currency: 'USD',
          amount: Number(total) || 0,
          billingAmount: Number(total) || 0,
        },
      ],
      subTotal: Number(total) || 0,
    });
    setNumber('');
    setClientName('');
    setTotal('');
    setOpen(false);
    window.location.reload();
  };
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 rounded bg-sky-600 text-white text-sm shadow hover:bg-sky-700 transition"
      >
        New Invoice
      </button>
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
            <div className="mb-4 text-lg font-semibold">New Invoice</div>
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Invoice number"
              className="border px-2 py-1 rounded w-full mb-3 focus:ring focus:ring-sky-200"
              autoFocus
            />
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client name"
              className="border px-2 py-1 rounded w-full mb-3 focus:ring focus:ring-sky-200"
            />
            <input
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="Total"
              className="border px-2 py-1 rounded w-full mb-4 focus:ring focus:ring-sky-200"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={submit}
                className="px-4 py-2 rounded bg-sky-600 text-white shadow hover:bg-sky-700 transition"
              >
                Create
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
