import React from 'react';
import {
  clientsMock,
  invoicesMock,
  jobsMock,
  expensesMock,
} from '../services/mockData';
import { Charts } from '../components/Charts';
import { Users, FileText, Briefcase, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const openInvoices = invoicesMock.filter((i) => i.status !== 'paid').length;
  const activeJobs = jobsMock.filter((j) => j.status !== 'delivered').length;
  const totalRevenue = invoicesMock
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0);
  const totalExpenses = expensesMock.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="page-title">Dashboard</h2>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded bg-sky-50 text-sky-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Clients</div>
            <div className="text-2xl font-semibold">{clientsMock.length}</div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded bg-amber-50 text-amber-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Open Invoices</div>
            <div className="text-2xl font-semibold">{openInvoices}</div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded bg-emerald-50 text-emerald-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Active Jobs</div>
            <div className="text-2xl font-semibold">{activeJobs}</div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded bg-purple-50 text-purple-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Revenue</div>
            <div className="text-2xl font-semibold">
              ${totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>
      </section>

      <Charts />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Recent Jobs</h3>
          <div className="space-y-3">
            {jobsMock.slice(0, 4).map((j) => (
              <div key={j.id} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{j.title}</div>
                  <div className="text-sm text-gray-600">{j.clientName}</div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    j.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : j.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {j.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Recent Invoices</h3>
          <div className="space-y-3">
            {invoicesMock.slice(0, 4).map((i) => (
              <div key={i.id} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{i.number}</div>
                  <div className="text-sm text-gray-600">{i.clientName}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${i.total.toLocaleString()}</div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      i.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {i.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
