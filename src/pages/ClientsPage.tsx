import React, { useState, useMemo, useEffect } from 'react';
import { useClients } from '../hooks/useApi';
import {
  isUsingFallback,
  testApiConnection,
  resetApiAvailability,
} from '../services/api';
import FallbackBanner from '../components/FallbackBanner';
import { Client as BaseClient } from '../services/mockData';

// Extended client type that includes related data from Prisma
interface Client extends BaseClient {
  _count?: {
    jobs?: number;
    invoices?: number;
  };
}
import {
  Search,
  X,
  Edit2,
  Trash2,
  Filter,
  ArrowUpDown,
  Loader,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

function genId() {
  return (
    'id_' +
    Math.random().toString(36).slice(2, 9) +
    Date.now().toString(36).slice(-4)
  );
}

export default function ClientsPage() {
  const {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    refetch,
  } = useClients();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Function to handle retry when API connection fails
  const handleRetryConnection = async () => {
    setIsRetrying(true);
    try {
      resetApiAvailability();
      await testApiConnection();
      await refetch();
    } finally {
      setIsRetrying(false);
    }
  };

  const filteredClients = useMemo(() => {
    const clientsList = (clients as Client[]) || [];

    // Apply search filter
    let filtered = clientsList;
    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.address?.toLowerCase() || '').includes(
            searchTerm.toLowerCase()
          ) ||
          (client.phone?.toLowerCase() || '').includes(
            searchTerm.toLowerCase()
          ) ||
          (client.tin?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue = '';
      let bValue = '';

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'address':
          aValue = (a.address || '').toLowerCase();
          bValue = (b.address || '').toLowerCase();
          break;
        case 'phone':
          aValue = (a.phone || '').toLowerCase();
          bValue = (b.phone || '').toLowerCase();
          break;
        case 'tin':
          aValue = (a.tin || '').toLowerCase();
          bValue = (b.tin || '').toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [clients, searchTerm, sortBy, sortOrder]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="page-title">Clients</h2>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            disabled={loading || isRetrying}
            className="px-3 py-2 rounded border text-gray-600 text-sm hover:bg-gray-50 transition flex items-center gap-1"
            title="Refresh clients data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <NewClientButton onAdd={createClient} onSuccess={refetch} />
        </div>
      </div>

      <FallbackBanner show={isUsingFallback()} />

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Error loading clients:</p>
            <p>{error}</p>
            <button
              onClick={handleRetryConnection}
              disabled={isRetrying}
              className="mt-2 px-3 py-1 bg-white border border-red-400 rounded text-red-700 text-sm hover:bg-red-50 transition flex items-center gap-1"
            >
              {isRetrying ? (
                <>
                  <Loader className="w-3 h-3 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  Retry Connection
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader className="w-8 h-8 animate-spin text-sky-600 mr-2" />
          <span className="text-lg text-gray-700">Loading clients...</span>
        </div>
      ) : (
        <>
          <div className="mb-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
              />
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="address">Sort by Address</option>
                  <option value="phone">Sort by Phone</option>
                  <option value="tin">Sort by TIN</option>
                </select>
              </div>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
                className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}{' '}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredClients.length > 0 ? (
              filteredClients.map((c: Client) => (
                <div
                  key={c.id}
                  className="card flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="muted">
                      {c.address || 'No address'} • {c.phone || 'No phone'}
                      {c.tin && <span> • TIN: {c.tin}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingClient(c)}
                      className="px-3 py-1 border rounded text-sm hover:bg-gray-50 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setEditingClient(c)}
                      className="px-3 py-1 border rounded text-sm hover:bg-blue-50 text-blue-600 transition flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeletingClient(c);
                        setDeleteError(null);
                      }}
                      className="px-3 py-1 border rounded text-sm hover:bg-red-50 text-red-600 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm
                  ? `No clients found matching "${searchTerm}"`
                  : 'No clients available. Create your first client by clicking "New Client" button.'}
              </div>
            )}
          </div>

          {/* View Client Modal */}
          {viewingClient && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Client Details</h3>
                  <button
                    onClick={() => setViewingClient(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client ID
                    </label>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {viewingClient.id}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <div className="text-sm font-medium p-2 border rounded">
                      {viewingClient.name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <div className="text-sm p-2 border rounded">
                      {viewingClient.address || 'No address provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <div className="text-sm p-2 border rounded">
                      {viewingClient.phone || 'No phone number provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      TIN Number
                    </label>
                    <div className="text-sm p-2 border rounded">
                      {viewingClient.tin || 'No TIN number provided'}
                    </div>
                  </div>

                  {viewingClient._count && (
                    <div className="flex gap-4 mt-4">
                      <div className="flex-1 bg-sky-50 rounded-lg p-3 text-center">
                        <div className="text-sm text-sky-700">Jobs</div>
                        <div className="text-xl font-semibold text-sky-800">
                          {viewingClient._count.jobs || 0}
                        </div>
                      </div>
                      <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-sm text-green-700">Invoices</div>
                        <div className="text-xl font-semibold text-green-800">
                          {viewingClient._count.invoices || 0}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setViewingClient(null)}
                    className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Client Modal */}
          {editingClient && (
            <EditClientModal
              client={editingClient}
              onClose={() => setEditingClient(null)}
              onSave={async (updates) => {
                await updateClient(editingClient.id, updates);
                setEditingClient(null);
              }}
            />
          )}

          {/* Delete Client Modal */}
          {deletingClient && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-red-600">
                    Delete Client
                  </h3>
                  <button
                    onClick={() => setDeletingClient(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700">
                    Are you sure you want to delete{' '}
                    <strong>{deletingClient.name}</strong>? This action cannot
                    be undone.
                  </p>
                  {deleteError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                      <strong>Error:</strong> {deleteError}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeletingClient(null)}
                    className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
                    disabled={isRetrying}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setIsRetrying(true);
                      try {
                        await deleteClient(deletingClient.id);
                        setDeletingClient(null);
                      } catch (err) {
                        setDeleteError(
                          err instanceof Error
                            ? err.message
                            : 'Failed to delete client'
                        );
                      } finally {
                        setIsRetrying(false);
                      }
                    }}
                    disabled={isRetrying}
                    className="px-4 py-2 rounded bg-red-600 text-white shadow hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isRetrying ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EditClientModal({
  client,
  onClose,
  onSave,
}: {
  client: Client;
  onClose: () => void;
  onSave: (updates: any) => void;
}) {
  const [name, setName] = useState(client.name);
  const [address, setAddress] = useState(client.address || '');
  const [phone, setPhone] = useState(client.phone || '');
  const [tin, setTin] = useState(client.tin || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave({ name, address, phone, tin });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Client</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
              placeholder="Client name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
              placeholder="Client address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
              placeholder="Phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TIN Number
            </label>
            <input
              value={tin}
              onChange={(e) => setTin(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
              placeholder="Tax Identification Number"
            />
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
            disabled={isSubmitting || !name.trim()}
            className="px-4 py-2 rounded bg-sky-600 text-white shadow hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewClientButton({
  onAdd,
  onSuccess,
}: {
  onAdd: (clientData: any) => Promise<any>;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [tin, setTin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onAdd({ name, address, phone, tin });
      setName('');
      setAddress('');
      setPhone('');
      setTin('');
      setOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 rounded bg-sky-600 text-white text-sm shadow hover:bg-sky-700 transition"
      >
        New Client
      </button>
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
            <div className="mb-4 text-lg font-semibold">New Client</div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                <strong>Error:</strong> {error}
              </div>
            )}

            <div className="flex gap-2 mb-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="border px-2 py-1 rounded flex-1 focus:ring focus:ring-sky-200"
                autoFocus
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="border px-2 py-1 rounded w-32 focus:ring focus:ring-sky-200"
              />
            </div>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="border px-2 py-1 rounded w-full mb-2 focus:ring focus:ring-sky-200"
            />
            <input
              value={tin}
              onChange={(e) => setTin(e.target.value)}
              placeholder="TIN Number (optional)"
              className="border px-2 py-1 rounded w-full mb-4 focus:ring focus:ring-sky-200"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={submit}
                disabled={isSubmitting || !name.trim()}
                className="px-4 py-2 rounded bg-sky-600 text-white shadow hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
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
