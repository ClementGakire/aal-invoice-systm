import { useState } from 'react';
import { Plus, Package, FileText, X, Trash2, Calculator } from 'lucide-react';
import { useJobs, useInvoices, useServices } from '../hooks/useApi';
import {
  generateInvoiceLineItems,
  getJobTypeDisplayName,
  isAirFreightJob,
  isSeaFreightJob,
  isRoadFreightJob,
} from '../types/logistics';
import type { LogisticsJob } from '../types/logistics';

// ServiceItem interface for type safety
interface ServiceItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  vat: boolean;
}

interface ServiceLineItem {
  id: string;
  serviceId: string;
  serviceName: string;
  amount: number;
  currency: 'USD' | 'RWF';
  vatEnabled: boolean;
  vatPercent: number;
  vatAmount: number;
  totalAmount: number;
}

interface CreateInvoiceFromJobButtonProps {
  onInvoiceCreated?: (invoice: any) => void;
}

export default function CreateInvoiceFromJobButton({
  onInvoiceCreated,
}: CreateInvoiceFromJobButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [serviceLineItems, setServiceLineItems] = useState<ServiceLineItem[]>(
    []
  );
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the API hooks
  const { jobs: availableJobs, loading: jobsLoading } = useJobs();
  const { createInvoice } = useInvoices();
  const { services, loading: servicesLoading } = useServices();

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

  // Add a new service line item
  const addServiceLineItem = () => {
    const newId = Date.now().toString();
    setServiceLineItems([
      ...serviceLineItems,
      {
        id: newId,
        serviceId: '',
        serviceName: '',
        amount: 0,
        currency: 'USD',
        vatEnabled: false,
        vatPercent: 18,
        vatAmount: 0,
        totalAmount: 0,
      },
    ]);
  };

  // Remove a service line item
  const removeServiceLineItem = (id: string) => {
    setServiceLineItems(serviceLineItems.filter((item) => item.id !== id));
  };

  // Update a service line item
  const updateServiceLineItem = (
    id: string,
    updates: Partial<ServiceLineItem>
  ) => {
    setServiceLineItems(
      serviceLineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };

          // Recalculate VAT and total when amount, VAT status, or VAT percent changes
          if (updated.vatEnabled) {
            updated.vatAmount = (updated.amount * updated.vatPercent) / 100;
            updated.totalAmount = updated.amount + updated.vatAmount;
          } else {
            updated.vatAmount = 0;
            updated.totalAmount = updated.amount;
          }

          return updated;
        }
        return item;
      })
    );
  };

  // Handle service selection
  const handleServiceSelection = (lineItemId: string, serviceId: string) => {
    const selectedService = services?.find(
      (s: ServiceItem) => s.id === serviceId
    );
    if (selectedService) {
      updateServiceLineItem(lineItemId, {
        serviceId,
        serviceName: selectedService.name,
        amount: selectedService.price,
        currency: selectedService.currency as 'USD' | 'RWF',
        vatEnabled: selectedService.vat || false,
      });
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const usdItems = serviceLineItems.filter((item) => item.currency === 'USD');
    const rwfItems = serviceLineItems.filter((item) => item.currency === 'RWF');

    const usdSubTotal = usdItems.reduce((sum, item) => sum + item.amount, 0);
    const usdVatTotal = usdItems.reduce((sum, item) => sum + item.vatAmount, 0);
    const usdTotal = usdItems.reduce((sum, item) => sum + item.totalAmount, 0);

    const rwfSubTotal = rwfItems.reduce((sum, item) => sum + item.amount, 0);
    const rwfVatTotal = rwfItems.reduce((sum, item) => sum + item.vatAmount, 0);
    const rwfTotal = rwfItems.reduce((sum, item) => sum + item.totalAmount, 0);

    return {
      usd: { subTotal: usdSubTotal, vatTotal: usdVatTotal, total: usdTotal },
      rwf: { subTotal: rwfSubTotal, vatTotal: rwfVatTotal, total: rwfTotal },
    };
  };

  // Convert amount to words (enhanced version)
  const numberToWords = (amount: number, currency: string): string => {
    const ones = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];
    const tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];
    const thousands = ['', 'Thousand', 'Million', 'Billion'];

    if (amount === 0) return `Zero ${currency}`;

    const integerPart = Math.floor(amount);
    const decimalPart = Math.round((amount - integerPart) * 100);

    function convertHundreds(num: number): string {
      let result = '';
      if (num >= 100) {
        result += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
      }
      if (num >= 20) {
        result += tens[Math.floor(num / 10)];
        if (num % 10 !== 0) result += '-' + ones[num % 10];
      } else if (num > 0) {
        result += ones[num];
      }
      return result.trim();
    }

    function convertNumber(num: number): string {
      if (num === 0) return '';

      let result = '';
      let thousandIndex = 0;

      while (num > 0) {
        const chunk = num % 1000;
        if (chunk !== 0) {
          const chunkText = convertHundreds(chunk);
          result =
            chunkText +
            (thousands[thousandIndex] ? ' ' + thousands[thousandIndex] : '') +
            (result ? ' ' + result : '');
        }
        num = Math.floor(num / 1000);
        thousandIndex++;
      }

      return result.trim();
    }

    const integerWords = convertNumber(integerPart);
    const currencyName =
      currency === 'USD' ? 'Dollars' : currency === 'RWF' ? 'Francs' : currency;
    const centName =
      currency === 'USD' ? 'Cents' : currency === 'RWF' ? 'Centimes' : 'Cents';

    let result = `${integerWords} ${currencyName}`;
    if (decimalPart > 0) {
      const decimalWords = convertNumber(decimalPart);
      result += ` And ${decimalWords} ${centName}`;
    }

    return result;
  };

  const handleCreateInvoice = async () => {
    if (!selectedJobId || !invoiceNumber || serviceLineItems.length === 0) {
      alert(
        'Please select a job, enter an invoice number, and add at least one service'
      );
      return;
    }

    const selectedJob = availableJobs.find(
      (job: LogisticsJob) => job.id === selectedJobId
    ) as LogisticsJob;
    if (!selectedJob) return;

    setIsSubmitting(true);

    try {
      const totals = calculateTotals();
      const mainCurrency = serviceLineItems[0]?.currency || 'USD';
      const mainTotal =
        mainCurrency === 'USD' ? totals.usd.total : totals.rwf.total;

      const invoiceData = {
        clientId: selectedJob.clientId,
        jobId: selectedJob.id,
        jobNumber: selectedJob.jobNumber,
        bookingNumber: getBookingNumber(selectedJob),
        status: 'PENDING',
        currency: mainCurrency,
        invoiceDate: new Date().toISOString(),
        dueDate: dueDate || null,
        subTotal:
          mainCurrency === 'USD' ? totals.usd.subTotal : totals.rwf.subTotal,
        total: mainTotal,
        amountInWords: numberToWords(mainTotal, mainCurrency),
        remarks,
        lineItems: serviceLineItems.map((item) => ({
          description: item.serviceName,
          basedOn: 'Service',
          rate: item.amount,
          currency: item.currency,
          amount: item.amount,
          taxPercent: item.vatEnabled ? item.vatPercent : null,
          taxAmount: item.vatAmount,
          billingAmount: item.totalAmount,
        })),
      };

      const newInvoice = await createInvoice(invoiceData);

      // Call the optional callback
      onInvoiceCreated?.(newInvoice);

      // Reset form
      setIsOpen(false);
      setSelectedJobId('');
      setInvoiceNumber('');
      setServiceLineItems([]);
      setDueDate('');
      setRemarks('');
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Create Invoice from Job
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Job and Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Job *
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={jobsLoading}
                  >
                    <option value="">
                      {jobsLoading ? 'Loading jobs...' : 'Choose a job...'}
                    </option>
                    {availableJobs.map((job: LogisticsJob) => (
                      <option key={job.id} value={job.id}>
                        {job.jobNumber} - {job.clientName} (
                        {getJobTypeDisplayName(job.jobType)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                    {selectedJobId
                      ? getJobTypeDisplayName(
                          availableJobs.find(
                            (j: LogisticsJob) => j.id === selectedJobId
                          )?.jobType || 'AIR_FREIGHT_IMPORT'
                        )
                      : 'Select a job first'}
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Services
                  </h3>
                  <button
                    onClick={addServiceLineItem}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Service
                  </button>
                </div>

                <div className="space-y-4">
                  {serviceLineItems.map((item) => (
                    <ServiceLineItemForm
                      key={item.id}
                      item={item}
                      services={services || []}
                      servicesLoading={servicesLoading}
                      onUpdate={(updates) =>
                        updateServiceLineItem(item.id, updates)
                      }
                      onRemove={() => removeServiceLineItem(item.id)}
                      onServiceSelect={(serviceId) =>
                        handleServiceSelection(item.id, serviceId)
                      }
                    />
                  ))}

                  {serviceLineItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      No services added yet. Click "Add Service" to get started.
                    </div>
                  )}
                </div>
              </div>

              {/* Totals Summary */}
              {serviceLineItems.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Totals Summary
                    </h3>
                  </div>

                  <TotalsSummary totals={calculateTotals()} />
                </div>
              )}

              {/* Remarks */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes or remarks..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateInvoice}
                  disabled={
                    !selectedJobId ||
                    !invoiceNumber ||
                    serviceLineItems.length === 0 ||
                    isSubmitting
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? 'Creating Invoice...' : 'Create Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Service Line Item Component
function ServiceLineItemForm({
  item,
  services,
  servicesLoading,
  onUpdate,
  onRemove,
  onServiceSelect,
}: {
  item: ServiceLineItem;
  services: ServiceItem[];
  servicesLoading: boolean;
  onUpdate: (updates: Partial<ServiceLineItem>) => void;
  onRemove: () => void;
  onServiceSelect: (serviceId: string) => void;
}) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-medium text-gray-900">Service Item</h4>
        <button onClick={onRemove} className="text-red-500 hover:text-red-700">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Service Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service *
          </label>
          <select
            value={item.serviceId}
            onChange={(e) => onServiceSelect(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={servicesLoading}
          >
            <option value="">Select service...</option>
            {services.map((service: ServiceItem) => (
              <option key={service.id} value={service.id}>
                {service.name} ({service.currency} {service.price})
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <input
            type="number"
            step="0.01"
            value={item.amount}
            onChange={(e) =>
              onUpdate({ amount: parseFloat(e.target.value) || 0 })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency *
          </label>
          <select
            value={item.currency}
            onChange={(e) =>
              onUpdate({ currency: e.target.value as 'USD' | 'RWF' })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD</option>
            <option value="RWF">RWF</option>
          </select>
        </div>

        {/* VAT Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            VAT
          </label>
          <div className="flex items-center gap-4 mt-2">
            <label className="flex items-center">
              <input
                type="radio"
                name={`vat-${item.id}`}
                checked={!item.vatEnabled}
                onChange={() => onUpdate({ vatEnabled: false })}
                className="mr-2"
              />
              No VAT
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`vat-${item.id}`}
                checked={item.vatEnabled}
                onChange={() => onUpdate({ vatEnabled: true })}
                className="mr-2"
              />
              VAT
            </label>
          </div>
        </div>
      </div>

      {/* VAT Details */}
      {item.vatEnabled && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VAT Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={item.vatPercent}
              onChange={(e) =>
                onUpdate({ vatPercent: parseFloat(e.target.value) || 18 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VAT Amount
            </label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
              {item.currency} {item.vatAmount.toFixed(2)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount
            </label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md font-bold">
              {item.currency} {item.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Non-VAT Total */}
      {!item.vatEnabled && item.amount > 0 && (
        <div className="mt-4 text-right">
          <span className="text-sm font-medium text-gray-700">Total: </span>
          <span className="font-bold">
            {item.currency} {item.amount.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}

// Totals Summary Component
function TotalsSummary({ totals }: { totals: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {totals.usd.total > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">USD Totals</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>USD {totals.usd.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT:</span>
              <span>USD {totals.usd.vatTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>USD {totals.usd.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {totals.rwf.total > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">RWF Totals</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>RWF {totals.rwf.subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT:</span>
              <span>RWF {totals.rwf.vatTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>RWF {totals.rwf.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
