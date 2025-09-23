import React, { useState, useMemo } from 'react';
import { Search, X, Edit2, Trash2 } from 'lucide-react';
import { useSuppliers } from '../hooks/useApi';

export default function SuppliersPage() {
  const {
    suppliers,
    loading,
    error,
    refetch,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  } = useSuppliers();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewingSupplier, setViewingSupplier] = useState<any>(null);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<any>(null);

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliers;

    return suppliers.filter(
      (supplier: any) =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, suppliers]);

  const handleRetry = () => {
    refetch();
  };

  const handleCreate = async (supplierData: any) => {
    try {
      await createSupplier(supplierData);
      console.log('✅ Supplier created successfully');
    } catch (error) {
      console.error('❌ Failed to create supplier:', error);
      alert('Failed to create supplier. Please try again.');
      throw error;
    }
  };

  const handleUpdate = async (id: string, supplierData: any) => {
    try {
      await updateSupplier(id, supplierData);
      console.log('✅ Supplier updated successfully');
    } catch (error) {
      console.error('❌ Failed to update supplier:', error);
      alert('Failed to update supplier. Please try again.');
      throw error;
    }
  };

  const handleDelete = async (supplier: any) => {
    try {
      await deleteSupplier(supplier.id);
      console.log('✅ Supplier deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete supplier:', error);
      alert('Failed to delete supplier. Please try again.');
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="page-title">Suppliers</h2>
        </div>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="page-title">Suppliers ({suppliers.length})</h2>
        <NewSupplierButton onCreate={handleCreate} />
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Error:</strong> Failed to load suppliers: {error}
              </p>
              <button
                onClick={handleRetry}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredSuppliers.map((s: any) => (
          <div key={s.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="muted">
                {s.contact || 'No contact information'}
              </div>
              <div className="text-xs text-gray-500">
                {s._count?.expenses || 0} expenses
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewingSupplier(s)}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50 transition"
              >
                View
              </button>
              <button
                onClick={() => setEditingSupplier(s)}
                className="px-3 py-1 border rounded text-sm hover:bg-blue-50 text-blue-600 transition flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => setDeletingSupplier(s)}
                className="px-3 py-1 border rounded text-sm hover:bg-red-50 text-red-600 transition flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredSuppliers.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            No suppliers found matching "{searchTerm}"
          </div>
        )}
        {filteredSuppliers.length === 0 && !searchTerm && (
          <div className="text-center py-8 text-gray-500">
            No suppliers found. Click "New Supplier" to create your first supplier.
          </div>
        )}
      </div>

      {/* View Supplier Modal */}
      {viewingSupplier && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Supplier Details</h3>
              <button
                onClick={() => setViewingSupplier(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier ID
                </label>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {viewingSupplier.id}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <div className="text-sm font-medium p-2 border rounded">
                  {viewingSupplier.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact
                </label>
                <div className="text-sm p-2 border rounded">
                  {viewingSupplier.contact || 'No contact information'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expenses
                </label>
                <div className="text-sm p-2 border rounded">
                  {viewingSupplier._count?.expenses || 0} expenses
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingSupplier(null)}
                className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {editingSupplier && (
        <EditSupplierModal
          supplier={editingSupplier}
          onClose={() => setEditingSupplier(null)}
          onSave={async (updates) => {
            await handleUpdate(editingSupplier.id, updates);
            setEditingSupplier(null);
          }}
        />
      )}

      {/* Delete Supplier Modal */}
      {deletingSupplier && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">
                Delete Supplier
              </h3>
              <button
                onClick={() => setDeletingSupplier(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete{' '}
                <strong>{deletingSupplier.name}</strong>? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingSupplier(null)}
                className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleDelete(deletingSupplier);
                  setDeletingSupplier(null);
                }}
                className="px-4 py-2 rounded bg-red-600 text-white shadow hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditSupplierModal({
  supplier,
  onClose,
  onSave,
}: {
  supplier: any;
  onClose: () => void;
  onSave: (updates: any) => Promise<void>;
}) {
  const [name, setName] = useState(supplier.name);
  const [contact, setContact] = useState(supplier.contact || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    
    setSaving(true);
    try {
      await onSave({ name, contact });
    } catch (error) {
      console.error('Failed to save supplier:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Supplier</h3>
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
              Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
              placeholder="Supplier name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact
            </label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
              placeholder="Email or phone"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-sky-600 text-white shadow hover:bg-sky-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewSupplierButton({ onCreate }: { onCreate: (data: any) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [creating, setCreating] = useState(false);

  const submit = async () => {
    if (!name) return;
    
    setCreating(true);
    try {
      await onCreate({ name, contact });
      setName('');
      setContact('');
      setOpen(false);
    } catch (error) {
      console.error('Failed to create supplier:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 rounded bg-sky-600 text-white text-sm shadow hover:bg-sky-700 transition"
      >
        New Supplier
      </button>
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
            <div className="mb-4 text-lg font-semibold">New Supplier</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name *"
              className="border px-2 py-1 rounded w-full mb-3 focus:ring focus:ring-sky-200"
              autoFocus
            />
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Contact"
              className="border px-2 py-1 rounded w-full mb-4 focus:ring focus:ring-sky-200"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={submit}
                disabled={creating || !name.trim()}
                className="px-4 py-2 rounded bg-sky-600 text-white shadow hover:bg-sky-700 transition disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
                disabled={creating}
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
