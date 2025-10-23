import React from 'react';
import { type Invoice, type LogisticsJob } from '../services/mockData';
import { useJobs, useClients } from '../hooks/useApi';
import {
  getJobTypeDisplayName,
  getPrimaryDocument,
  isAirFreightJob,
  isSeaFreightJob,
  isRoadFreightJob,
} from '../types/logistics';

// Helper function to convert number to words
function numberToWords(num: number): string {
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
  ];
  const teens = [
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

  if (num === 0) return 'Zero';

  function convertHundreds(n: number): string {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n >= 10) {
      result += teens[n - 10] + ' ';
    } else if (n > 0) {
      result += ones[n] + ' ';
    }
    return result;
  }

  let result = '';
  let thousandCounter = 0;

  while (num > 0) {
    if (num % 1000 !== 0) {
      result =
        convertHundreds(num % 1000) + thousands[thousandCounter] + ' ' + result;
    }
    num = Math.floor(num / 1000);
    thousandCounter++;
  }

  return result.trim();
}

// Company configuration
const companyConfig = {
  name: 'Aviation Africa Logistics',
  regNumber: 'R.C: Bba RJ7J',
  address: {
    line1: 'EAR Building, 2nd Floor, No 1 Giporoso',
    line2: 'Kigali, RWANDA',
  },
  email: 'info@aal.rw',
  phone: '+250 783 456 789',
  logo: '/logo.jpeg',
  watermark: '/watermark.jpeg',
  bankDetails: {
    bank: 'Access Bank Rwanda',
    accountName: 'Aviation Africa Logistics Ltd',
    accountNumber: '7002100201786701',
    swiftCode: 'BKORRWRWXXX',
    branch: 'Head Office',
  },
  paymentTerms: [
    'Payment is prepaid on export',
    'Late payment attracts 2% monthly interest',
    'All payments should be made in USD',
    'Bank charges to be borne by client',
    'Quote invoice number on payment',
    'Quotation valid for 10 days',
  ],
};

interface PrintableInvoiceProps {
  invoice: Invoice;
  onClose: () => void;
}

export default function PrintableInvoice({
  invoice,
  onClose,
}: PrintableInvoiceProps) {
  const { jobs } = useJobs();
  const { clients } = useClients();

  const handlePrint = () => {
    // Apply dynamic scaling before printing
    const printContainer = document.querySelector(
      '.invoice-container'
    ) as HTMLElement;
    if (printContainer) {
      // Calculate optimal scale to fit content on one page
      const maxPrintHeight = 11 * 72 - 20; // 11 inches minus margins in points
      const currentHeight = printContainer.scrollHeight;
      const scale = Math.min(0.95, maxPrintHeight / currentHeight);

      // Apply the calculated scale
      printContainer.style.setProperty('--print-scale', scale.toString());

      // Add dynamic scaling CSS if not already present
      let dynamicStyle = document.getElementById('dynamic-print-scale');
      if (!dynamicStyle) {
        dynamicStyle = document.createElement('style');
        dynamicStyle.id = 'dynamic-print-scale';
        document.head.appendChild(dynamicStyle);
      }

      dynamicStyle.textContent = `
        @media print {
          .invoice-container {
            transform: scale(var(--print-scale, 0.95)) !important;
            width: ${100 / scale}% !important;
          }
        }
      `;
    }

    // Small delay to ensure styles are applied
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Get associated job details
  const associatedJob = invoice.jobId
    ? (jobs.find(
        (job: LogisticsJob) => job.id === invoice.jobId
      ) as LogisticsJob)
    : null;

  // Get associated client details
  const associatedClient = invoice.clientId
    ? clients.find((client: any) => client.id === invoice.clientId)
    : null;

  // Set up auto-scaling for print
  React.useEffect(() => {
    const setupAutoScale = () => {
      const printContainer = document.querySelector(
        '.invoice-container'
      ) as HTMLElement;
      if (printContainer) {
        // Set initial scale variable
        printContainer.style.setProperty('--print-scale', '0.95');
      }
    };

    // Setup after a short delay to ensure DOM is ready
    setTimeout(setupAutoScale, 100);
  }, []);

  // Debug logging
  React.useEffect(() => {
    if (invoice.jobId && jobs.length > 0) {
      console.log(
        'PrintableInvoice - Job IDs available:',
        jobs.map((j) => j.id)
      );
    }
    if (invoice.clientId && clients.length > 0) {
      console.log(
        'PrintableInvoice - Client IDs available:',
        clients.map((c) => c.id)
      );
    }
  }, [invoice, jobs, clients, associatedJob, associatedClient]);

  const formatDate = (date: Date | string) => {
    // Ensure we have a valid Date object
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="print:hidden bg-gray-100 p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold">Invoice Preview</h3>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Print Invoice
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50">
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 0.1in;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 0;
              font-size: 10px;
              line-height: 1.2;
              zoom: 1;
            }
            .invoice-container {
              width: 100% !important;
              max-width: none !important;
              transform: scale(0.98) !important;
              transform-origin: top left !important;
              padding: 0 !important;
              margin: 0 !important;
              font-size: 12px !important;
              line-height: 1.2 !important;
              box-shadow: none !important;
              height: fit-content !important;
              position: relative !important;
            }
            .invoice-container > div {
              max-width: none !important;
              width: 100% !important;
              padding: 16px !important;
              margin: 0 !important;
            }
            /* Header adjustments */
            .invoice-header {
              font-size: 10px !important;
              line-height: 1.3 !important;
            }
            .invoice-title {
              font-size: 18px !important;
              margin-bottom: 12px !important;
            }
            /* Table optimizations */
            .invoice-table {
              font-size: 10px !important;
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 0 !important;
            }
            .invoice-table th,
            .invoice-table td {
              padding: 4px 6px !important;
              font-size: 10px !important;
              line-height: 1.3 !important;
              border: 1px solid #000 !important;
            }
            .invoice-table th {
              background-color: #f3f4f6 !important;
              font-weight: bold !important;
            }
            /* Job details section */
            .job-details-section {
              font-size: 10px !important;
              margin-bottom: 10px !important;
            }
            .job-details-section .grid {
              gap: 6px !important;
            }
            .job-details-section .text-xs,
            .job-details-section .text-sm {
              font-size: 9px !important;
              line-height: 1.3 !important;
            }
            .job-details-section .bg-gray-50 {
              background-color: #f9fafb !important;
              padding: 4px !important;
            }
            /* Spacing optimizations */
            .mb-3, .mb-4 {
              margin-bottom: 6px !important;
            }
            .mb-2 {
              margin-bottom: 4px !important;
            }
            .mb-1 {
              margin-bottom: 2px !important;
            }
            .p-1 {
              padding: 2px !important;
            }
            .p-2 {
              padding: 4px !important;
            }
            .p-3 {
              padding: 4px !important;
            }
            .space-y-1 > * + * {
              margin-top: 2px !important;
            }
            .space-y-2 > * + * {
              margin-top: 4px !important;
            }
            /* Font size adjustments */
            .text-xs {
              font-size: 9px !important;
            }
            .text-sm {
              font-size: 10px !important;
            }
            .text-base {
              font-size: 12px !important;
            }
            .text-lg {
              font-size: 14px !important;
            }
            .text-xl, .text-2xl {
              font-size: 18px !important;
            }
            
            /* Logo adjustments */
            .w-10, .h-10 {
              width: 24px !important;
              height: 24px !important;
            }
            
            .print\\:w-16 {
              width: 64px !important;
            }
            
            .print\\:h-16 {
              height: 64px !important;
            }
            
            /* Watermark */
            .watermark {
              opacity: 0.05 !important;
              background-size: 25% !important;
            }
            
            /* Hide print controls */
            .print\\:hidden {
              display: none !important;
            }
            
            /* Grid adjustments */
            .grid {
              gap: 2px !important;
            }
            
            /* Border adjustments */
            .border-b {
              border-bottom-width: 1px !important;
            }
            
            .border {
              border-width: 1px !important;
            }
            
            /* Ensure tables fit */
            table {
              table-layout: fixed !important;
              width: 100% !important;
            }
            
            /* Prevent page breaks */
            .job-details-section,
            .invoice-table,
            .bank-details {
              page-break-inside: avoid !important;
            }
            
            /* Ensure content doesn't overflow */
            .invoice-container {
              overflow: visible !important;
            }
          }
          
          @media screen {
            .invoice-container {
              transform: scale(0.85);
              transform-origin: top center;
              width: 117.6%;
              margin: 0 auto;
              position: relative;
            }
            .watermark {
              opacity: 0.15;
              background-size: 30%;
            }
          }
        `}</style>

        <div className="invoice-container p-6 print:p-0 relative min-h-full">
          {/* Watermark */}
          <div
            className="watermark absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `url(${companyConfig.watermark})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              backgroundSize: '30%',
              opacity: 0.15,
            }}
          />

          <div className="max-w-4xl mx-auto print:max-w-none relative z-10 shadow-lg print:shadow-none p-6 print:p-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-3 print:mb-1">
              <div className="flex items-center gap-3 print:gap-1">
                <div className="w-32 h-32 print:w-32 print:h-32">
                  <img
                    src={companyConfig.logo}
                    alt={`${companyConfig.name} Logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="invoice-header text-xs print:text-[6px] print:leading-tight">
                  <div className="font-bold text-base print:text-[8px]">
                    {companyConfig.name}
                  </div>
                  <div>{companyConfig.regNumber}</div>
                  <div>
                    {companyConfig.address.line1}
                    <br /> {companyConfig.address.line2}
                  </div>
                  <div>Email: {companyConfig.email}</div>
                  <div>Phone: {companyConfig.phone}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="border border-black p-1 print:p-0.5 font-mono text-xs print:text-[6px]">
                  {invoice.number}
                </div>
              </div>
            </div>

            {/* Invoice Title */}
            <div className="text-center mb-4 print:mb-1">
              <h1 className="invoice-title text-2xl font-bold print:text-[12px]">
                Invoice
              </h1>
            </div>

            {/* Client and Invoice Details */}
            <div className="flex justify-between mb-4 print:mb-2">
              <div className="w-1/2">
                <div className="font-semibold mb-1 print:mb-0.5 print:text-[6px]">
                  To,
                </div>
                <div className="font-bold">
                  {associatedClient?.name || invoice.clientName}
                </div>
                {associatedClient ? (
                  <div className="space-y-1">
                    {associatedClient.address && (
                      <div className="text-sm">{associatedClient.address}</div>
                    )}
                    {associatedClient.phone && (
                      <div className="text-sm">
                        Ph: {associatedClient.phone}
                      </div>
                    )}
                    {associatedClient.email && (
                      <div className="text-sm">
                        Email: {associatedClient.email}
                      </div>
                    )}
                    {associatedClient.tin && (
                      <div className="text-sm">TIN: {associatedClient.tin}</div>
                    )}
                    {!associatedClient.address &&
                      !associatedClient.phone &&
                      !associatedClient.email && (
                        <div className="text-sm text-gray-400 italic">
                          No additional contact information available
                        </div>
                      )}
                  </div>
                ) : invoice.clientId ? (
                  <div className="space-y-1">
                    <div className="text-sm text-orange-600">
                      Client details not found
                    </div>
                    <div className="text-xs text-gray-500">
                      Client ID: {invoice.clientId}
                    </div>
                    <div className="text-xs text-gray-500">
                      Available clients: {clients.length}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">
                    No client information available
                  </div>
                )}
              </div>
              <div className="w-1/2 text-right text-sm print:text-[6px]">
                <div className="grid grid-cols-2 gap-1 print:gap-0.5">
                  <div className="font-semibold">Invoice No:</div>
                  <span>{invoice.number}</span>
                  <div className="font-semibold">Invoice Status:</div>
                  <span className="capitalize">{invoice.status}</span>
                  <div className="font-semibold">Invoice Due Date:</div>
                  <span>{formatDate(invoice.invoiceDate)}</span>
                  <div className="font-semibold">Job Code:</div>
                  <span>{invoice.jobNumber || '-'}</span>
                  <div className="font-semibold">Job Date:</div>
                  <span>
                    {associatedJob?.createdAt
                      ? formatDate(associatedJob.createdAt)
                      : '01/03/2024'}
                  </span>
                  <div className="font-semibold">Currency Code:</div>
                  <span>{invoice.currency}</span>
                </div>
              </div>
            </div>

            {/* Shipment Details */}
            {associatedJob ? (
              <div className="job-details-section mb-4 print:mb-2">
                <div className="font-semibold mb-3 print:mb-1 text-base print:text-[7px] border-b border-gray-300 pb-1 print:pb-0.5">
                  Shipment Details
                </div>

                {/* Traditional Shipment Information Grid */}
                <div className="mb-4 print:mb-2">
                  <div className="grid grid-cols-3 gap-4 print:gap-2 text-xs print:text-[5px]">
                    {/* Column 1 - Origin & Shipper */}
                    <div className="space-y-2">
                      <div className="font-semibold text-sm text-blue-600 mb-2">
                        Origin & Shipper
                      </div>
                      <div>
                        <span className="font-medium">Port of Loading:</span>
                        <br />
                        <span className="text-gray-600 text-sm">
                          {associatedJob.portOfLoading || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-sm">Shipper:</span>
                        <br />
                        <span className="text-gray-600 text-sm">
                          {associatedJob.shipper || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-sm">Job Number:</span>
                        <br />
                        <span className="text-gray-600 text-sm">
                          {associatedJob.jobNumber}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-sm">
                          Service Type:
                        </span>
                        <br />
                        <span className="text-blue-600 font-medium">
                          {getJobTypeDisplayName(associatedJob.jobType)}
                        </span>
                      </div>
                    </div>

                    {/* Column 2 - Destination & Consignee */}
                    <div className="space-y-2">
                      <div className="font-semibold text-sm text-blue-600 mb-2">
                        Destination & Consignee
                      </div>
                      <div>
                        <span className="font-medium text-sm">
                          Port of Discharge:
                        </span>
                        <br />
                        <span className="text-gray-600 text-sm">
                          {associatedJob.portOfDischarge || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-sm">Consignee:</span>
                        <br />
                        <span className="text-gray-600 text-sm">
                          {associatedJob.consignee || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-sm">Client:</span>
                        <br />
                        <span className="text-gray-600 text-sm">
                          {associatedJob.clientName || invoice.clientName}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-sm">
                          Shipment Date:
                        </span>
                        <br />
                        <span className="text-gray-600 text-sm">
                          {associatedJob.createdAt
                            ? formatDate(associatedJob.createdAt)
                            : '-'}
                        </span>
                      </div>
                    </div>

                    {/* Column 3 - Transport Documents */}
                    <div className="space-y-2">
                      <div className="font-semibold text-sm text-blue-600 mb-2">
                        Transport Documents
                      </div>
                      {isAirFreightJob(associatedJob) && (
                        <>
                          <div>
                            <span className="font-medium text-sm">
                              Master AWB:
                            </span>
                            <br />
                            <span className="text-gray-600 text-sm">
                              {associatedJob.awb?.masterAirWaybill || '-'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-sm">
                              House AWB:
                            </span>
                            <br />
                            <span className="text-gray-600 text-sm">
                              {associatedJob.awb?.houseAirWaybill || '-'}
                            </span>
                          </div>
                        </>
                      )}
                      {isSeaFreightJob(associatedJob) && (
                        <>
                          <div>
                            <span className="font-medium text-sm">
                              Master B/L:
                            </span>
                            <br />
                            <span className="text-gray-600 text-sm">
                              {associatedJob.billOfLading?.masterBL || '-'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-sm">
                              House B/L:
                            </span>
                            <br />
                            <span className="text-gray-600 text-sm">
                              {associatedJob.billOfLading?.houseBL || '-'}
                            </span>
                          </div>
                        </>
                      )}
                      {isRoadFreightJob(associatedJob) && (
                        <>
                          <div>
                            <span className="font-medium text-sm">
                              Plate Number:
                            </span>
                            <br />
                            <span className="text-gray-600 text-sm">
                              {associatedJob.plateNumber || '-'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-sm">
                              Container No:
                            </span>
                            <br />
                            <span className="text-gray-600 text-sm">
                              {associatedJob.containerNumber || '-'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cargo Details */}
                <div className="mb-3 print:mb-1">
                  <div className="font-semibold mb-2 print:mb-1 text-sm print:text-[6px] text-gray-700">
                    Cargo Details
                  </div>
                  <div className="grid grid-cols-4 gap-2 print:gap-1 text-xs print:text-[5px] bg-gray-50 p-3 print:p-1 rounded">
                    <div>
                      <span className="font-medium text-sm">Package Type:</span>
                      <br />
                      <span className="text-gray-600 text-sm">
                        {associatedJob.package || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-sm">
                        Description of Goods:
                      </span>
                      <br />
                      <span className="text-gray-600 text-sm">
                        {associatedJob.goodDescription || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Gross Weight:</span>
                      <br />
                      <span className="text-gray-600 text-sm">
                        {associatedJob.grossWeight
                          ? `${associatedJob.grossWeight} kg`
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-sm">
                        Chargeable Weight:
                      </span>
                      <br />
                      <span className="text-gray-600 text-sm">
                        {associatedJob.chargeableWeight
                          ? `${associatedJob.chargeableWeight} kg`
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Job Information */}
                <div className="mb-3 print:mb-1">
                  <div className="font-semibold mb-2 print:mb-1 text-sm print:text-[6px] text-gray-700">
                    Additional Information
                  </div>
                  <div className="grid grid-cols-3 gap-2 print:gap-1 text-xs print:text-[5px]">
                    <div>
                      <span className="font-medium">Job ID:</span>
                      <br />
                      <span className="text-gray-600 font-mono text-xs">
                        {associatedJob.id}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <br />
                      <span className="text-gray-600 capitalize">
                        {associatedJob.status || 'OPEN'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>
                      <br />
                      <span className="text-gray-600">
                        {associatedJob.updatedAt
                          ? formatDate(associatedJob.updatedAt)
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : invoice.jobId ? (
              <div className="mb-4 print:mb-3">
                <div className="font-semibold mb-3 text-base print:text-sm border-b border-gray-300 pb-1">
                  Shipment Details
                </div>
                <div className="text-sm text-gray-500 bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="font-medium text-yellow-700 mb-1">
                    Job details not available
                  </p>
                  <p>Job ID: {invoice.jobId}</p>
                  <p>Available jobs: {jobs.length}</p>
                  <p className="text-xs mt-2">
                    The job associated with this invoice could not be found in
                    the current job list.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Charges Table */}
            <div className="mb-3 print:mb-2">
              <table className="invoice-table w-full border-collapse border border-black">
                <thead>
                  <tr className="bg-gray-100">
                    <th
                      className="border border-black p-1 text-left font-semibold"
                      style={{ width: '25%' }}
                    >
                      Charge Description
                    </th>
                    <th
                      className="border border-black p-1 text-center font-semibold"
                      style={{ width: '12%' }}
                    >
                      Based On
                      <br />
                      Qty & UOM
                    </th>
                    <th
                      className="border border-black p-1 text-center font-semibold"
                      style={{ width: '12%' }}
                    >
                      Rate & Curr
                      <br />
                      Ex Rate
                    </th>
                    <th
                      className="border border-black p-1 text-right font-semibold"
                      style={{ width: '10%' }}
                    >
                      Amount
                    </th>
                    <th
                      className="border border-black p-1 text-center font-semibold"
                      style={{ width: '8%' }}
                    >
                      Tax %<br />
                      Tax Amount
                    </th>
                    <th
                      className="border border-black p-1 text-right font-semibold"
                      style={{ width: '15%' }}
                    >
                      Billing Amount
                      <br />({invoice.currency || 'USD'})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems && invoice.lineItems.length > 0 ? (
                    invoice.lineItems.map((item: any, index: number) => (
                      <tr key={index}>
                        {/* Charge Description */}
                        <td className="border border-black p-1">
                          <div className="font-medium">{item.description}</div>
                        </td>

                        {/* Based On + Quantity */}
                        <td className="border border-black p-1 text-center">
                          <div>{item.basedOn || 'Service'}</div>
                          <div className="text-xs mt-1">1</div>
                        </td>

                        {/* Rate & Currency + Exchange Rate */}
                        <td className="border border-black p-1 text-center">
                          <div>
                            {item.rate?.toLocaleString() ||
                              item.amount?.toLocaleString()}{' '}
                            {item.currency || invoice.currency || 'USD'}
                          </div>
                          <div className="text-xs mt-1">1.00</div>
                        </td>

                        {/* Amount */}
                        <td className="border border-black p-1 text-right">
                          <div>{item.amount?.toLocaleString() || '0.00'}</div>
                        </td>

                        {/* Tax % + Tax Amount */}
                        <td className="border border-black p-1 text-center">
                          <div>
                            {item.taxPercent
                              ? `VAT @ ${item.taxPercent.toFixed(2)} %`
                              : ''}
                          </div>
                          <div className="text-xs mt-1">
                            {item.taxAmount
                              ? item.taxAmount.toLocaleString()
                              : ''}
                          </div>
                        </td>

                        {/* Billing Amount */}
                        <td className="border border-black p-1 text-right">
                          <div className="font-medium">
                            {item.billingAmount?.toLocaleString() ||
                              item.amount?.toLocaleString() ||
                              '0.00'}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="border border-black p-4 text-center text-gray-500"
                      >
                        No line items found for this invoice
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Amount in Words */}
            <div className="mb-3 print:mb-1">
              <div className="border border-black p-1 print:p-0.5 bg-gray-50 print:text-[6px]">
                <span className="font-semibold">Amount in Word</span>
                <br />
                <span className="font-semibold">
                  ({invoice.currency || 'USD'}){' '}
                </span>
                {invoice.amountInWords ||
                  `${numberToWords(invoice.total || 0)} ${
                    invoice.currency === 'RWF' ? 'Francs' : 'Dollars'
                  } And Zero ${
                    invoice.currency === 'RWF' ? 'Centimes' : 'Cents'
                  }`}
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-3 print:mb-1">
              <div className="w-1/3">
                <table className="invoice-table w-full border-collapse border border-black">
                  <tbody>
                    <tr>
                      <td className="border border-black p-1 font-semibold">
                        Sub Total
                      </td>
                      <td className="border border-black p-1 text-right">
                        {invoice.subTotal?.toLocaleString() || '0.00'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1 font-semibold">
                        VAT-18
                      </td>
                      <td className="border border-black p-1 text-right">
                        VAT @ 18.00 %
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1 text-right">
                        {(() => {
                          const totalTax =
                            invoice.lineItems?.reduce(
                              (sum: number, item: any) =>
                                sum + (item.taxAmount || 0),
                              0
                            ) || 0;
                          return totalTax.toLocaleString();
                        })()}
                      </td>
                    </tr>
                    <tr className="bg-gray-100">
                      <td className="border border-black p-1 font-bold">
                        Total &nbsp;&nbsp;&nbsp;&nbsp;
                        {invoice.currency || 'USD'}
                      </td>
                      <td className="border border-black p-1 text-right font-bold">
                        {invoice.total?.toLocaleString() || '0.00'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Remarks */}
            <div className="mb-2 print:mb-1">
              <div className="font-semibold mb-1 print:mb-0.5 print:text-[6px]">
                Remarks
              </div>
              <div className="min-h-[30px] print:min-h-[15px] print:text-[6px] border-b border-gray-300">
                {invoice.remarks || 'Thank you for your business'}
              </div>
            </div>

            {/* Bank Information and Terms */}
            <div className="mb-3 print:mb-1">
              <div className="grid grid-cols-2 gap-4 print:gap-2">
                {/* Bank Information */}
                <div className="border border-black p-2 print:p-1">
                  <div className="font-semibold mb-1 print:mb-0.5 print:text-[6px]">
                    Bank Details
                  </div>
                  <div className="space-y-1 print:space-y-0.5 text-xs print:text-[5px]">
                    <div>
                      <span className="font-medium">Bank:</span>{' '}
                      {companyConfig.bankDetails.bank}
                    </div>
                    <div>
                      <span className="font-medium">Account Name:</span>{' '}
                      {companyConfig.bankDetails.accountName}
                    </div>
                    <div>
                      <span className="font-medium">Account No:</span>{' '}
                      {companyConfig.bankDetails.accountNumber}
                    </div>
                    <div>
                      <span className="font-medium">Swift Code:</span>{' '}
                      {companyConfig.bankDetails.swiftCode}
                    </div>
                    <div>
                      <span className="font-medium">Branch:</span>{' '}
                      {companyConfig.bankDetails.branch}
                    </div>
                  </div>
                </div>

                {/* Terms of Payment */}
                <div className="border border-black p-2 print:p-1">
                  <div className="font-semibold mb-1 print:mb-0.5 print:text-[6px]">
                    Terms of Payment
                  </div>
                  <div className="space-y-1 print:space-y-0.5 text-xs print:text-[5px]">
                    {companyConfig.paymentTerms.map((term, index) => (
                      <div key={index}>• {term}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
