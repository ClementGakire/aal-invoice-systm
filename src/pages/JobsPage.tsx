import React, { useState, useMemo } from 'react';
import { useJobs, useClients, useJobExpenses } from '../hooks/useApi';
import { isUsingFallback, api } from '../services/api';
import FallbackBanner from '../components/FallbackBanner';
import {
  getJobTypeDisplayName,
  getPrimaryDocument,
  isAirFreightJob,
  isSeaFreightJob,
  isRoadFreightJob,
} from '../types/logistics';
import { LogisticsJobForm } from '../components/LogisticsJobForm';
import {
  Search,
  X,
  Edit2,
  Trash2,
  ArrowUpDown,
  Filter,
  Package,
  Plane,
  Ship,
  Truck,
  Loader,
  AlertCircle,
} from 'lucide-react';

export default function JobsPage() {
  const { jobs, loading, error, createJob, updateJob, deleteJob } = useJobs();
  const { clients } = useClients();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('jobNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [viewingJob, setViewingJob] = useState<any | null>(null);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [loadingJobDetails, setLoadingJobDetails] = useState(false);
  const [creatingExpenseForJob, setCreatingExpenseForJob] = useState<any | null>(null);

  const handleEditJob = async (job: any) => {
    try {
      setLoadingJobDetails(true);
      // Fetch full job details for editing
      const fullJobDetails = await api.jobs.getById(job.id);
      setEditingJob(fullJobDetails);
    } catch (error) {
      console.error('Failed to fetch job details for editing:', error);
      // Fallback to using the job from the list
      setEditingJob(job);
    } finally {
      setLoadingJobDetails(false);
    }
  };
  const [deletingJob, setDeletingJob] = useState<any | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);

  const filteredJobs = useMemo(() => {
    let filtered = jobs || [];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (job: any) =>
          job.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.shipper?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.consignee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getPrimaryDocument(job)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          getJobTypeDisplayName(job.jobType)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (job: any) => job.status === statusFilter.toUpperCase()
      );
    }

    // Apply job type filter
    if (jobTypeFilter !== 'all') {
      filtered = filtered.filter((job: any) => job.jobType === jobTypeFilter);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue = '';
      let bValue = '';

      switch (sortBy) {
        case 'jobNumber':
          aValue = a.jobNumber.toLowerCase();
          bValue = b.jobNumber.toLowerCase();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'client':
          aValue = a.clientName.toLowerCase();
          bValue = b.clientName.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'jobType':
          aValue = getJobTypeDisplayName(a.jobType).toLowerCase();
          bValue = getJobTypeDisplayName(b.jobType).toLowerCase();
          break;
        default:
          aValue = a.jobNumber.toLowerCase();
          bValue = b.jobNumber.toLowerCase();
      }

      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    return filtered;
  }, [jobs, searchTerm, sortBy, sortOrder, statusFilter, jobTypeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading jobs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="w-8 h-8 text-red-600" />
        <span className="ml-2 text-red-600">Error loading jobs: {error}</span>
      </div>
    );
  }

  return (
    <div>
      <FallbackBanner show={isUsingFallback()} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="page-title">Logistics Jobs</h2>
        <button
          onClick={() => setShowJobForm(true)}
          className="px-4 py-2 rounded bg-sky-600 text-white text-sm shadow hover:bg-sky-700 transition flex items-center gap-2"
        >
          <Package className="w-4 h-4" />
          New Logistics Job
        </button>
      </div>

      <div className="mb-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search jobs, clients, documents, shipper, consignee..."
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
              <option value="jobNumber">Sort by Job #</option>
              <option value="title">Sort by Title</option>
              <option value="client">Sort by Client</option>
              <option value="status">Sort by Status</option>
              <option value="jobType">Sort by Type</option>
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
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500"
            >
              <option value="all">All Types</option>
              <option value="AIR_FREIGHT_IMPORT">Air Freight Import</option>
              <option value="AIR_FREIGHT_EXPORT">Air Freight Export</option>
              <option value="SEA_FREIGHT_IMPORT">Sea Freight Import</option>
              <option value="SEA_FREIGHT_EXPORT">Sea Freight Export</option>
              <option value="ROAD_FREIGHT_IMPORT">Road Freight Import</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredJobs.map((j) => (
          <div key={j.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {(j.jobType === 'AIR_FREIGHT_IMPORT' ||
                      j.jobType === 'AIR_FREIGHT_EXPORT') && (
                      <Plane className="w-4 h-4 text-blue-600" />
                    )}
                    {(j.jobType === 'SEA_FREIGHT_IMPORT' ||
                      j.jobType === 'SEA_FREIGHT_EXPORT') && (
                      <Ship className="w-4 h-4 text-green-600" />
                    )}
                    {j.jobType === 'ROAD_FREIGHT_IMPORT' && (
                      <Truck className="w-4 h-4 text-orange-600" />
                    )}
                    <span className="font-medium">
                      Job #{j.jobNumber} - {j.title}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      j.jobType === 'AIR_FREIGHT_IMPORT' ||
                      j.jobType === 'AIR_FREIGHT_EXPORT'
                        ? 'bg-blue-100 text-blue-700'
                        : j.jobType === 'SEA_FREIGHT_IMPORT' ||
                          j.jobType === 'SEA_FREIGHT_EXPORT'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {getJobTypeDisplayName(j.jobType)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-600">
                  <div>Client: {j.clientName}</div>
                  <div>
                    Route: {j.portOfLoading} → {j.portOfDischarge}
                  </div>
                  <div>Document: {getPrimaryDocument(j)}</div>
                  <div className="font-medium text-green-700">
                    Expenses: ${j.totalExpenses?.toFixed(2) || '0.00'} ({j.expenseCount || 0} items)
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`text-sm px-2 py-1 rounded ${
                    j.status === 'delivered'
                      ? 'bg-green-100 text-green-700'
                      : j.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {j.status}
                </div>
                <button
                  onClick={() => setViewingJob(j)}
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-50 transition"
                >
                  View
                </button>
                <button
                  onClick={() => setCreatingExpenseForJob(j)}
                  className="px-3 py-1 border rounded text-sm hover:bg-green-50 text-green-600 transition"
                  title="Create expense for this job"
                >
                  + Expense
                </button>
                <button
                  onClick={() => handleEditJob(j)}
                  disabled={loadingJobDetails}
                  className="px-3 py-1 border rounded text-sm hover:bg-blue-50 text-blue-600 transition flex items-center gap-1 disabled:opacity-50"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => setDeletingJob(j)}
                  className="px-3 py-1 border rounded text-sm hover:bg-red-50 text-red-600 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredJobs.length === 0 && !searchTerm && jobs.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No jobs yet</p>
            <p className="text-gray-400 text-sm">
              Click "New Logistics Job" to create your first job
            </p>
          </div>
        )}
        {filteredJobs.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            No jobs found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Logistics Job Form */}
      {showJobForm && (
        <LogisticsJobForm
          isOpen={showJobForm}
          onClose={() => setShowJobForm(false)}
          onSubmit={async (jobData) => {
            try {
              await createJob(jobData);
              setShowJobForm(false);
            } catch (error) {
              console.error('Failed to create job:', error);
              alert('Failed to create job. Please try again.');
            }
          }}
          clients={clients || []}
        />
      )}

      {/* View Job Modal */}
      {viewingJob && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fadein">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {(viewingJob.jobType === 'AIR_FREIGHT_IMPORT' ||
                  viewingJob.jobType === 'AIR_FREIGHT_EXPORT') && (
                  <Plane className="w-6 h-6 text-blue-600" />
                )}
                {(viewingJob.jobType === 'SEA_FREIGHT_IMPORT' ||
                  viewingJob.jobType === 'SEA_FREIGHT_EXPORT') && (
                  <Ship className="w-6 h-6 text-green-600" />
                )}
                {viewingJob.jobType === 'ROAD_FREIGHT_IMPORT' && (
                  <Truck className="w-6 h-6 text-orange-600" />
                )}
                <h3 className="text-xl font-semibold">Job Details</h3>
              </div>
              <button
                onClick={() => setViewingJob(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Basic Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Job ID:
                      </span>
                      <div className="text-sm text-gray-600 font-mono">
                        {viewingJob.id}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Job Number:
                      </span>
                      <div className="text-sm font-medium">
                        {viewingJob.jobNumber}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Title:
                      </span>
                      <div className="text-sm">{viewingJob.title}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Job Type:
                      </span>
                      <div
                        className={`text-sm px-2 py-1 rounded inline-block ${
                          viewingJob.jobType === 'AIR_FREIGHT_IMPORT' ||
                          viewingJob.jobType === 'AIR_FREIGHT_EXPORT'
                            ? 'bg-blue-100 text-blue-700'
                            : viewingJob.jobType === 'SEA_FREIGHT_IMPORT' ||
                              viewingJob.jobType === 'SEA_FREIGHT_EXPORT'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {getJobTypeDisplayName(viewingJob.jobType)}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Status:
                      </span>
                      <div
                        className={`text-sm px-2 py-1 rounded inline-block ${
                          viewingJob.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : viewingJob.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {viewingJob.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Route Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Route & Locations
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Port of Loading:
                      </span>
                      <div className="text-sm">{viewingJob.portOfLoading}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Port of Discharge:
                      </span>
                      <div className="text-sm">
                        {viewingJob.portOfDischarge}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Party Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Party Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Client:
                      </span>
                      <div className="text-sm">{viewingJob.clientName}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Shipper:
                      </span>
                      <div className="text-sm">{viewingJob.shipper}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Consignee:
                      </span>
                      <div className="text-sm">{viewingJob.consignee}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Cargo Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Cargo Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Package:
                      </span>
                      <div className="text-sm">{viewingJob.package}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Good Description:
                      </span>
                      <div className="text-sm">
                        {viewingJob.goodDescription}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Gross Weight:
                      </span>
                      <div className="text-sm">{viewingJob.grossWeight} kg</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Chargeable Weight:
                      </span>
                      <div className="text-sm">
                        {viewingJob.chargeableWeight} kg
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Type Specific Information */}
                {isAirFreightJob(viewingJob) && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3">
                      Air Waybill Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Master Air Waybill (MAWB):
                        </span>
                        <div className="text-sm font-mono">
                          {viewingJob.awb.masterAirWaybill}
                        </div>
                      </div>
                      {viewingJob.awb.houseAirWaybill && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            House Air Waybill (HAWB):
                          </span>
                          <div className="text-sm font-mono">
                            {viewingJob.awb.houseAirWaybill}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isSeaFreightJob(viewingJob) && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-3">
                      Bill of Lading Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Master Bill of Lading (MBL):
                        </span>
                        <div className="text-sm font-mono">
                          {viewingJob.billOfLading.masterBL}
                        </div>
                      </div>
                      {viewingJob.billOfLading.houseBL && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            House Bill of Lading (HBL):
                          </span>
                          <div className="text-sm font-mono">
                            {viewingJob.billOfLading.houseBL}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isRoadFreightJob(viewingJob) && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-orange-900 mb-3">
                      Road Freight Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Plate Number:
                        </span>
                        <div className="text-sm font-mono">
                          {viewingJob.plateNumber}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Container Number:
                        </span>
                        <div className="text-sm font-mono">
                          {viewingJob.containerNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expenses Summary */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-3">Expenses</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Total Expenses:
                      </span>
                      <div className="text-sm font-bold text-green-700">
                        ${viewingJob.totalExpenses?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Number of Expenses:
                      </span>
                      <div className="text-sm">
                        {viewingJob.expenseCount || 0} items
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setViewingJob(null);
                        setCreatingExpenseForJob(viewingJob);
                      }}
                      className="w-full mt-2 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                    >
                      Add Expense
                    </button>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Timestamps</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Created:
                      </span>
                      <div className="text-sm">
                        {new Date(viewingJob.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Last Updated:
                      </span>
                      <div className="text-sm">
                        {new Date(viewingJob.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingJob(null)}
                className="px-6 py-2 rounded border shadow hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <LogisticsJobForm
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          onSubmit={async (updates) => {
            try {
              await updateJob(editingJob.id, updates);
              setEditingJob(null);
            } catch (error) {
              console.error('Failed to update job:', error);
              alert('Failed to update job. Please try again.');
            }
          }}
          initialData={editingJob}
          clients={clients || []}
        />
      )}

      {/* Delete Job Modal */}
      {deletingJob && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Delete Job</h3>
              <button
                onClick={() => setDeletingJob(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete job{' '}
                <strong>
                  #{deletingJob.jobNumber} - {deletingJob.title}
                </strong>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingJob(null)}
                className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteJob(deletingJob.id);
                    setDeletingJob(null);
                  } catch (error) {
                    console.error('Failed to delete job:', error);
                    alert('Failed to delete job. Please try again.');
                  }
                }}
                className="px-4 py-2 rounded bg-red-600 text-white shadow hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Expense for Job Modal */}
      {creatingExpenseForJob && (
        <CreateExpenseForJobModal
          job={creatingExpenseForJob}
          onClose={() => setCreatingExpenseForJob(null)}
          onSuccess={() => {
            setCreatingExpenseForJob(null);
            // Refresh jobs to update expense totals
            window.location.reload(); // Simple refresh for now
          }}
        />
      )}
    </div>
  );
}

// Create Expense for Job Modal Component
function CreateExpenseForJobModal({
  job,
  onClose,
  onSuccess,
}: {
  job: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { createJobExpense } = useJobExpenses(job.id);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [supplierName, setSupplierName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title || !amount) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      await createJobExpense({
        title,
        amount: parseFloat(amount),
        currency,
        supplierName: supplierName || undefined,
      });
      onSuccess();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Failed to create expense'
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fadein">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Expense</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isCreating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm">
            <div className="font-medium text-blue-900">Job: {job.jobNumber}</div>
            <div className="text-blue-700">{job.title}</div>
            <div className="text-blue-600">Client: {job.clientName}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-green-200 focus:border-green-500"
              placeholder="Expense description"
              autoFocus
              disabled={isCreating}
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
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-green-200 focus:border-green-500"
                placeholder="0.00"
                disabled={isCreating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-green-200 focus:border-green-500"
                disabled={isCreating}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="RWF">RWF</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier Name
            </label>
            <input
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-green-200 focus:border-green-500"
              placeholder="Optional supplier name"
              disabled={isCreating}
            />
          </div>
        </div>

        {createError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
            <strong>Error:</strong> {createError}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border shadow hover:bg-gray-100 transition"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title || !amount || isCreating}
            className="px-4 py-2 rounded bg-green-600 text-white shadow hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isCreating ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create Expense'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
