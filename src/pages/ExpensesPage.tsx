import React, { useState, useMemo } from 'react';
import {
  expensesMock,
  addExpense,
  updateExpense,
  deleteExpense,
  type Expense,
} from '../services/mockData';
import { Search, X, Edit2, Trash2 } from 'lucide-react';

export default function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const filteredExpenses = useMemo(() => {
    if (!searchTerm) return expensesMock;

    return expensesMock.filter(
      (expense) =>
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.amount.toString().includes(searchTerm) ||
        expense.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="page-title">Expenses</h2>
        <NewExpenseButton />
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredExpenses.map((e) => (
          <div key={e.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{e.title}</div>
                <div className="muted">
                  {e.currency} {e.amount} • Job: {e.jobNumber || 'N/A'}
                </div>
                <div className="muted">Supplier: {e.supplierName || 'N/A'}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingExpense(e)}
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-50 transition"
                >
                  View
                </button>
                <button
                  onClick={() => setEditingExpense(e)}
                  className="px-3 py-1 border rounded text-sm hover:bg-blue-50 text-blue-600 transition flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => setDeletingExpense(e)}
                  className="px-3 py-1 border rounded text-sm hover:bg-red-50 text-red-600 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredExpenses.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            No expenses found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* View Expense Modal */}
      {viewingExpense && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Expense Details</h3>
              <button
                onClick={() => setViewingExpense(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expense ID
                </label>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {viewingExpense.id}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <div className="text-sm font-medium p-2 border rounded">
                  {viewingExpense.title}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <div className="text-sm font-bold text-green-700 p-2 border rounded">
                    {viewingExpense.currency} {viewingExpense.amount}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <div className="text-sm p-2 border rounded">
                    {viewingExpense.currency}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Number
                </label>
                <div className="text-sm p-2 border rounded">
                  {viewingExpense.jobNumber || 'Not assigned to a job'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <div className="text-sm p-2 border rounded">
                  {viewingExpense.supplierName || 'No supplier specified'}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingExpense(null)}
                className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSave={(updates) => {
            updateExpense(editingExpense.id, updates);
            setEditingExpense(null);
            window.location.reload();
          }}
        />
      )}

      {/* Delete Expense Modal */}
      {deletingExpense && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">
                Delete Expense
              </h3>
              <button
                onClick={() => setDeletingExpense(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete expense{' '}
                <strong>{deletingExpense.title}</strong>? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingExpense(null)}
                className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteExpense(deletingExpense.id);
                  setDeletingExpense(null);
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
    </div>
  );
}

function EditExpenseModal({
  expense,
  onClose,
  onSave,
}: {
  expense: Expense;
  onClose: () => void;
  onSave: (updates: Partial<Expense>) => void;
}) {
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [currency, setCurrency] = useState(expense.currency);
  const [jobNumber, setJobNumber] = useState(expense.jobNumber || '');
  const [supplierName, setSupplierName] = useState(expense.supplierName || '');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title,
      amount: Number(amount) || 0,
      currency,
      jobNumber: jobNumber || undefined,
      supplierName: supplierName || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Expense</h3>
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
              Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
              placeholder="Expense title"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
              Job Number
            </label>
            <input
              value={jobNumber}
              onChange={(e) => setJobNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
              placeholder="Associated job number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier Name
            </label>
            <input
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
              placeholder="Supplier name"
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
            className="px-4 py-2 rounded bg-sky-600 text-white shadow hover:bg-sky-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function NewExpenseButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [supplier, setSupplier] = useState('');
  const submit = () => {
    if (!title) return;
    addExpense({
      id: 'e_' + Date.now(),
      title,
      amount: Number(amount) || 0,
      currency: 'USD',
      jobNumber: '',
      supplierName: supplier,
    });
    setTitle('');
    setAmount('');
    setSupplier('');
    setOpen(false);
    window.location.reload();
  };
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 rounded bg-sky-600 text-white text-sm shadow hover:bg-sky-700 transition"
      >
        Record Expense
      </button>
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
            <div className="mb-4 text-lg font-semibold">Record Expense</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="border px-2 py-1 rounded w-full mb-3 focus:ring focus:ring-sky-200"
              autoFocus
            />
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="border px-2 py-1 rounded w-full mb-3 focus:ring focus:ring-sky-200"
            />
            <input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Supplier"
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
