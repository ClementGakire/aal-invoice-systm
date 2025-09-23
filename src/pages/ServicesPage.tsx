import React, { useState, useMemo } from 'react';
import { useServices } from '../hooks/useApi';
import {
  isUsingFallback,
  testApiConnection,
  resetApiAvailability,
} from '../services/api';
import FallbackBanner from '../components/FallbackBanner';
import { ServiceItem } from '../services/mockData';
import { useRole } from '../contexts/RoleContext';
import {
  Search,
  X,
  Edit2,
  Trash2,
  RefreshCw,
  Loader,
  AlertCircle,
} from 'lucide-react';

export default function ServicesPage() {
  const {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    refetch,
  } = useServices();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewingService, setViewingService] = useState<ServiceItem | null>(
    null
  );
  const [editingService, setEditingService] = useState<ServiceItem | null>(
    null
  );
  const [deletingService, setDeletingService] = useState<ServiceItem | null>(
    null
  );
  const [isRetrying, setIsRetrying] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { role } = useRole();

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

  const filteredServices = useMemo(() => {
    const servicesList = (services as ServiceItem[]) || [];

    if (!searchTerm) return servicesList;

    return servicesList.filter(
      (service: ServiceItem) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.price.toString().includes(searchTerm)
    );
  }, [services, searchTerm]);

  const toggleVat = async (id: string) => {
    const service = (services as ServiceItem[]).find((s) => s.id === id);
    if (service) {
      try {
        await updateService(id, { vat: !service.vat });
      } catch (error) {
        console.error('Failed to toggle VAT:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="page-title">Services (Revenue streams)</h2>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            disabled={loading || isRetrying}
            className="px-3 py-2 rounded border text-gray-600 text-sm hover:bg-gray-50 transition flex items-center gap-1"
            title="Refresh services data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <NewServiceButton onAdd={createService} onSuccess={refetch} />
        </div>
      </div>

      <FallbackBanner show={isUsingFallback()} />

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Error loading services:</p>
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
          <span className="text-lg text-gray-700">Loading services...</span>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredServices.map((s: ServiceItem) => (
              <div
                key={s.id}
                className="p-3 bg-white rounded shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">
                    {s.name} - {s.currency} {s.price}
                  </div>
                  <div className="text-sm text-gray-600">
                    VAT: {s.vat ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingService(s)}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-50 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setEditingService(s)}
                    className="px-3 py-1 border rounded text-sm hover:bg-blue-50 text-blue-600 transition flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeletingService(s);
                      setDeleteError(null);
                    }}
                    className="px-3 py-1 border rounded text-sm hover:bg-red-50 text-red-600 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                  {role !== 'client' && (
                    <button
                      onClick={() => toggleVat(s.id)}
                      className="text-sm px-3 py-1 border rounded"
                    >
                      Toggle VAT
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredServices.length === 0 && searchTerm && (
              <div className="text-center py-8 text-gray-500">
                No services found matching "{searchTerm}"
              </div>
            )}
            {filteredServices.length === 0 && !searchTerm && !loading && (
              <div className="text-center py-8 text-gray-500">
                No services available. Create your first service by clicking
                "New Service" button.
              </div>
            )}
          </div>

          {/* View Service Modal */}
          {viewingService && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Service Details</h3>
                  <button
                    onClick={() => setViewingService(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service ID
                    </label>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {viewingService.id}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Name
                    </label>
                    <div className="text-sm font-medium p-2 border rounded">
                      {viewingService.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <div className="text-sm font-bold text-green-700 p-2 border rounded">
                        {viewingService.currency} {viewingService.price}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <div className="text-sm p-2 border rounded">
                        {viewingService.currency}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      VAT Included
                    </label>
                    <div
                      className={`text-sm p-2 border rounded font-medium ${
                        viewingService.vat
                          ? 'text-green-700 bg-green-50'
                          : 'text-red-700 bg-red-50'
                      }`}
                    >
                      {viewingService.vat ? 'YES' : 'NO'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setViewingService(null)}
                    className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Service Modal */}
          {editingService && (
            <EditServiceModal
              service={editingService}
              onClose={() => setEditingService(null)}
              onSave={async (updates) => {
                await updateService(editingService.id, updates);
                setEditingService(null);
              }}
            />
          )}

          {/* Delete Service Modal */}
          {deletingService && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-red-600">
                    Delete Service
                  </h3>
                  <button
                    onClick={() => setDeletingService(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700">
                    Are you sure you want to delete{' '}
                    <strong>{deletingService.name}</strong>? This action cannot
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
                    onClick={() => setDeletingService(null)}
                    className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
                    disabled={isRetrying}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setIsRetrying(true);
                      try {
                        await deleteService(deletingService.id);
                        setDeletingService(null);
                      } catch (err) {
                        setDeleteError(
                          err instanceof Error
                            ? err.message
                            : 'Failed to delete service'
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

function NewServiceButton({
  onAdd,
  onSuccess,
}: {
  onAdd: (serviceData: any) => Promise<any>;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [vat, setVat] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onAdd({
        name,
        price: Number(price) || 0,
        currency,
        vat,
      });
      setName('');
      setPrice('');
      setCurrency('USD');
      setVat(false);
      setOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service');
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
        New Service
      </button>
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
            <div className="mb-4 text-lg font-semibold">New Service</div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                <strong>Error:</strong> {error}
              </div>
            )}

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="border px-2 py-1 rounded w-full mb-3 focus:ring focus:ring-sky-200"
              autoFocus
            />
            <div className="flex gap-2 mb-3">
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                className="border px-2 py-1 rounded w-32 focus:ring focus:ring-sky-200"
              />
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="Currency"
                className="border px-2 py-1 rounded w-24 focus:ring focus:ring-sky-200"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={vat}
                  onChange={(e) => setVat(e.target.checked)}
                />{' '}
                VAT
              </label>
            </div>
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

function EditServiceModal({
  service,
  onClose,
  onSave,
}: {
  service: ServiceItem;
  onClose: () => void;
  onSave: (updates: Partial<ServiceItem>) => void;
}) {
  const [name, setName] = useState(service.name);
  const [price, setPrice] = useState(service.price.toString());
  const [currency, setCurrency] = useState(service.currency);
  const [vat, setVat] = useState(service.vat || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave({
        name,
        price: Number(price) || 0,
        currency,
        vat,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Service</h3>
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
              Service Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
              placeholder="Service name"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
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
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={vat}
                onChange={(e) => setVat(e.target.checked)}
                className="rounded focus:ring focus:ring-sky-200"
              />
              <span className="text-sm font-medium text-gray-700">
                VAT included
              </span>
            </label>
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
// ...existing code...
