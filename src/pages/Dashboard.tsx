import React, { useState, useEffect } from 'react';
import {
  clientsMock,
  invoicesMock,
  jobsMock,
  expensesMock,
} from '../services/mockData';
import { api, isUsingFallback, testApiConnection } from '../services/api';
import { Charts } from '../components/Charts';
import {
  Users,
  FileText,
  Briefcase,
  DollarSign,
  Database,
  TrendingUp,
} from 'lucide-react';
import ApiDebugger from '../components/ApiDebugger';
import ApiExplorer from '../components/ApiExplorer';

interface DashboardData {
  metrics: {
    totalClients: number;
    totalInvoices: number;
    openInvoices: number;
    activeJobs: number;
    totalRevenue: number;
    totalExpenses: number;
    netRevenue: number;
  };
  recentJobs: any[];
  recentInvoices: any[];
  charts: {
    salesLast7Days: any[];
    salesLast6Months: any[];
    expensesByCategory: any[];
  };
  generatedAt: string;
  success: boolean;
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [clients, setClients] = useState<any[]>([]);
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [showDebugger, setShowDebugger] = useState<boolean>(false);
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(true);

  // Test API connection on component mount
  useEffect(() => {
    testApiConnection().then((available) => {
      setApiStatus(available ? 'success' : 'error');
      if (available) {
        loadRealData();
      } else {
        setLoadingDashboard(false);
      }
    });
  }, []);

  // Function to load data from the real API
  const loadRealData = async () => {
    try {
      setLoadingDashboard(true);

      // Load dashboard analytics and clients data in parallel
      const [dashboardResult, clientsResult] = await Promise.all([
        api.dashboard.getAnalytics(),
        api.clients.getAll(),
      ]);

      console.log('📊 Dashboard data loaded:', dashboardResult);

      if (dashboardResult && dashboardResult.success) {
        setDashboardData(dashboardResult);
      }

      if (clientsResult.clients && clientsResult.clients.length > 0) {
        setClients(clientsResult.clients);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setApiStatus('error');
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Only use real data, don't show mock data initially
  const getMetrics = () => {
    if (dashboardData && dashboardData.success) {
      return dashboardData.metrics;
    }

    // Return null if no real data is available yet
    return null;
  };

  const getRecentData = () => {
    if (dashboardData && dashboardData.success) {
      return {
        recentJobs: dashboardData.recentJobs,
        recentInvoices: dashboardData.recentInvoices,
      };
    }

    // Return empty arrays if no real data is available yet
    return {
      recentJobs: [],
      recentInvoices: [],
    };
  };

  const metrics = getMetrics();
  const { recentJobs, recentInvoices } = getRecentData();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="page-title">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {/* {isUsingFallback() ? (
            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-sm flex items-center">
              <Database className="w-4 h-4 mr-1" /> Using Mock Data
            </span>
          ) : (
            <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-sm flex items-center">
              <Database className="w-4 h-4 mr-1" /> Using Real Database
            </span>
          )} */}
          {loadingDashboard && (
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-sm">
              Loading Analytics...
            </span>
          )}
          {/* <button
            className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-sm"
            onClick={() => setShowDebugger(!showDebugger)}
          >
            {showDebugger ? 'Hide Debugger' : 'Debug API'}
          </button> */}
          <button
            className="px-2 py-1 rounded bg-blue-100 text-blue-600 text-sm"
            onClick={loadRealData}
            disabled={loadingDashboard}
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {showDebugger && (
        <div className="mb-6">
          <ApiDebugger />
          <div className="mt-4">
            <ApiExplorer endpoint="/api/dashboard" />
          </div>
        </div>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded bg-sky-50 text-sky-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Clients</div>
            <div className="text-2xl font-semibold">
              {loadingDashboard ? (
                <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
              ) : metrics ? (
                metrics.totalClients
              ) : (
                '---'
              )}
            </div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded bg-amber-50 text-amber-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Open Invoices</div>
            <div className="text-2xl font-semibold">
              {loadingDashboard ? (
                <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
              ) : metrics ? (
                metrics.openInvoices
              ) : (
                '---'
              )}
            </div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded bg-emerald-50 text-emerald-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Active Jobs</div>
            <div className="text-2xl font-semibold">
              {loadingDashboard ? (
                <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
              ) : metrics ? (
                metrics.activeJobs
              ) : (
                '---'
              )}
            </div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded bg-purple-50 text-purple-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-2xl font-semibold">
              {loadingDashboard ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              ) : metrics ? (
                `$${metrics.totalRevenue.toLocaleString()}`
              ) : (
                '---'
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Add new revenue metrics row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded bg-green-50 text-green-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Net Revenue</div>
            <div
              className={`text-2xl font-semibold ${
                loadingDashboard
                  ? ''
                  : metrics && metrics.netRevenue >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {loadingDashboard ? (
                <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
              ) : metrics ? (
                `$${metrics.netRevenue.toLocaleString()}`
              ) : (
                '---'
              )}
            </div>
            <div className="text-xs text-gray-500">Revenue - Expenses</div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded bg-blue-50 text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Invoices</div>
            <div className="text-2xl font-semibold">
              {loadingDashboard ? (
                <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
              ) : metrics ? (
                metrics.totalInvoices
              ) : (
                '---'
              )}
            </div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded bg-red-50 text-red-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Expenses</div>
            <div className="text-2xl font-semibold">
              {loadingDashboard ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              ) : metrics ? (
                `$${metrics.totalExpenses.toLocaleString()}`
              ) : (
                '---'
              )}
            </div>
          </div>
        </div>
      </section>

      <Charts dashboardData={dashboardData} />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Recent Jobs</h3>
          <div className="space-y-3">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div key={job.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-gray-600">
                      {job.clientName}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">
                No recent jobs found
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Recent Invoices</h3>
          <div className="space-y-3">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{invoice.number}</div>
                    <div className="text-sm text-gray-600">
                      {invoice.clientName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${invoice.total.toLocaleString()}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">
                No recent invoices found
              </div>
            )}
          </div>
        </div>
      </section>

      {dashboardData && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Last updated: {new Date(dashboardData.generatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
