import { useState } from 'react';
import { Plus, Package, FileText } from 'lucide-react';
import { jobsMock } from '../services/mockData';
import {
  generateInvoiceLineItems,
  getJobTypeDisplayName,
  isAirFreightJob,
  isSeaFreightJob,
  isRoadFreightJob,
} from '../types/logistics';
import type { LogisticsJob } from '../types/logistics';

interface CreateInvoiceFromJobButtonProps {
  onInvoiceCreated: (invoice: any) => void;
}

export default function CreateInvoiceFromJobButton({
  onInvoiceCreated,
}: CreateInvoiceFromJobButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  const availableJobs = jobsMock;

  const getBookingNumber = (job: LogisticsJob): string | undefined => {
    if (isSeaFreightJob(job)) {
      return job.billOfLading.masterBL;
    } else if (isAirFreightJob(job)) {
      return job.awb.masterAirWaybill;
    } else if (isRoadFreightJob(job)) {
      return job.plateNumber;
    }
    return undefined;
  };

  const handleCreateInvoice = () => {
    if (!selectedJobId || !invoiceNumber) return;

    const selectedJob = jobsMock.find(
      (job) => job.id === selectedJobId
    ) as LogisticsJob;
    if (!selectedJob) return;

    // Generate line items based on the job
    const lineItems = generateInvoiceLineItems(selectedJob);
    const subTotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const total = lineItems.reduce((sum, item) => sum + item.billingAmount, 0);

    const newInvoice = {
      id: 'inv_' + Date.now(),
      number: invoiceNumber,
      clientId: selectedJob.clientId,
      clientName: selectedJob.clientName,
      jobId: selectedJob.id,
      jobNumber: selectedJob.jobNumber,
      bookingNumber: getBookingNumber(selectedJob),
      status: 'unpaid' as const,
      currency: 'USD',
      invoiceDate: new Date(),
      lineItems,
      subTotal,
      total,
    };

    onInvoiceCreated(newInvoice);
    setIsOpen(false);
    setSelectedJobId('');
    setInvoiceNumber('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <Package className="w-4 h-4" />
        Create from Job
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Create Invoice from Job</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Job
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Choose a job...</option>
                  {availableJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.jobNumber} - {job.clientName} (
                      {getJobTypeDisplayName(job.jobType)})
                    </option>
                  ))}
                </select>
                {availableJobs.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No jobs available for invoicing
                  </p>
                )}
              </div>

              {selectedJobId &&
                (() => {
                  const job = jobsMock.find(
                    (j) => j.id === selectedJobId
                  ) as LogisticsJob;
                  const lineItems = generateInvoiceLineItems(job);
                  const total = lineItems.reduce(
                    (sum, item) => sum + item.billingAmount,
                    0
                  );

                  return (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        Invoice Preview
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Client:</span>
                          <span>{job.clientName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service:</span>
                          <span>{getJobTypeDisplayName(job.jobType)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Line Items:</span>
                          <span>{lineItems.length} items</span>
                        </div>
                        <div className="flex justify-between font-medium pt-1 border-t">
                          <span>Total:</span>
                          <span>USD {total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInvoice}
                disabled={!selectedJobId || !invoiceNumber}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
