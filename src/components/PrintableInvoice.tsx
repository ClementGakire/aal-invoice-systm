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
    bank: 'Bank of Kigali',
    accountName: 'Aviation Africa Logistics',
    accountNumber: '9030020478362',
    swiftCode: 'BKIGRWRW',
    branch: 'Head Office',
  },
  paymentTerms: [
    'Payment due within 30 days of invoice date',
    'Late payment attracts 2% monthly interest',
    'All payments should be made in USD',
    'Bank charges to be borne by client',
    'Quote invoice number on payment',
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
    window.print();
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

  // Debug logging
  React.useEffect(() => {
    console.log('PrintableInvoice - Invoice:', invoice);
    console.log('PrintableInvoice - Jobs available:', jobs.length);
    console.log('PrintableInvoice - Clients available:', clients.length);
    console.log('PrintableInvoice - Looking for job ID:', invoice.jobId);
    console.log('PrintableInvoice - Looking for client ID:', invoice.clientId);
    console.log('PrintableInvoice - Associated job found:', !!associatedJob);
    console.log(
      'PrintableInvoice - Associated client found:',
      !!associatedClient
    );
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
              margin: 0.3in;
            }
            body {
              margin: 0;
              font-size: 10px;
              zoom: 1;
            }
            .invoice-container {
              width: 100% !important;
              max-width: 100% !important;
              font-size: 9px !important;
              line-height: 1.1 !important;
              transform: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .invoice-table {
              font-size: 8px !important;
              width: 100% !important;
            }
            .invoice-table th,
            .invoice-table td {
              padding: 1px 2px !important;
              font-size: 7px !important;
            }
            .shipment-details {
              font-size: 7px !important;
            }
            .job-details-section {
              font-size: 7px !important;
              margin-bottom: 8px !important;
            }
            .job-details-section .grid {
              gap: 4px !important;
            }
            .job-details-section .text-xs {
              font-size: 6px !important;
              line-height: 1.2 !important;
            }
            .job-details-section .bg-blue-50 {
              background-color: #f8fafc !important;
              border: 1px solid #e2e8f0 !important;
            }
            .invoice-header {
              font-size: 8px !important;
            }
            .invoice-title {
              font-size: 14px !important;
            }
            .watermark {
              opacity: 0.08 !important;
              background-size: 40% !important;
            }
            .print-controls {
              display: none !important;
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
            <div className="flex items-start justify-between mb-3 print:mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 print:w-8 print:h-8">
                  <img
                    src={companyConfig.logo}
                    alt={`${companyConfig.name} Logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="invoice-header text-xs print:text-[8px]">
                  <div className="font-bold text-base print:text-sm">
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
                <div className="border border-black p-1 font-mono text-xs print:text-[8px]">
                  {invoice.number}
                </div>
              </div>
            </div>

            {/* Invoice Title */}
            <div className="text-center mb-4 print:mb-3">
              <h1 className="invoice-title text-2xl font-bold print:text-lg">
                Invoice
              </h1>
            </div>

            {/* Client and Invoice Details */}
            <div className="flex justify-between mb-4 print:mb-3">
              <div className="w-1/2">
                <div className="font-semibold mb-1">To,</div>
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
              <div className="w-1/2 text-right text-sm">
                <div className="grid grid-cols-2 gap-1">
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
              <div className="job-details-section mb-4 print:mb-3">
                <div className="font-semibold mb-3 text-base print:text-sm border-b border-gray-300 pb-1">
                  Shipment Details
                </div>

                {/* Traditional Shipment Information Grid */}
                <div className="mb-4 print:mb-3">
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    {/* Column 1 - Origin & Shipper */}
                    <div className="space-y-2">
                      <div className="font-semibold text-sm text-blue-600 mb-2">
                        Origin & Shipper
                      </div>
                      <div>
                        <span className="font-medium">Port of Loading:</span>
                        <br />
                        <span className="text-gray-600">
                          {associatedJob.portOfLoading || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Shipper:</span>
                        <br />
                        <span className="text-gray-600">
                          {associatedJob.shipper || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Job Number:</span>
                        <br />
                        <span className="text-gray-600">
                          {associatedJob.jobNumber}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Service Type:</span>
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
                        <span className="font-medium">Port of Discharge:</span>
                        <br />
                        <span className="text-gray-600">
                          {associatedJob.portOfDischarge || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Consignee:</span>
                        <br />
                        <span className="text-gray-600">
                          {associatedJob.consignee || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Client:</span>
                        <br />
                        <span className="text-gray-600">
                          {associatedJob.clientName || invoice.clientName}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Shipment Date:</span>
                        <br />
                        <span className="text-gray-600">
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
                            <span className="font-medium">Master AWB:</span>
                            <br />
                            <span className="text-gray-600">
                              {associatedJob.awb?.masterAirWaybill || '-'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">House AWB:</span>
                            <br />
                            <span className="text-gray-600">
                              {associatedJob.awb?.houseAirWaybill || '-'}
                            </span>
                          </div>
                        </>
                      )}
                      {isSeaFreightJob(associatedJob) && (
                        <>
                          <div>
                            <span className="font-medium">Master B/L:</span>
                            <br />
                            <span className="text-gray-600">
                              {associatedJob.billOfLading?.masterBL || '-'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">House B/L:</span>
                            <br />
                            <span className="text-gray-600">
                              {associatedJob.billOfLading?.houseBL || '-'}
                            </span>
                          </div>
                        </>
                      )}
                      {isRoadFreightJob(associatedJob) && (
                        <>
                          <div>
                            <span className="font-medium">Plate Number:</span>
                            <br />
                            <span className="text-gray-600">
                              {associatedJob.plateNumber || '-'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Container No:</span>
                            <br />
                            <span className="text-gray-600">
                              {associatedJob.containerNumber || '-'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cargo Details */}
                <div className="mb-3 print:mb-2">
                  <div className="font-semibold mb-2 text-sm text-gray-700">
                    Cargo Details
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs bg-gray-50 p-3 rounded">
                    <div>
                      <span className="font-medium">Package Type:</span>
                      <br />
                      <span className="text-gray-600">
                        {associatedJob.package || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Description of Goods:</span>
                      <br />
                      <span className="text-gray-600">
                        {associatedJob.goodDescription || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Gross Weight:</span>
                      <br />
                      <span className="text-gray-600">
                        {associatedJob.grossWeight
                          ? `${associatedJob.grossWeight} kg`
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Chargeable Weight:</span>
                      <br />
                      <span className="text-gray-600">
                        {associatedJob.chargeableWeight
                          ? `${associatedJob.chargeableWeight} kg`
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Job Information */}
                <div className="mb-3 print:mb-2">
                  <div className="font-semibold mb-2 text-sm text-gray-700">
                    Additional Information
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
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
                    </th>
                    <th
                      className="border border-black p-1 text-center font-semibold"
                      style={{ width: '12%' }}
                    >
                      Rate & Curr
                    </th>
                    <th
                      className="border border-black p-1 text-center font-semibold"
                      style={{ width: '8%' }}
                    >
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
                      Tax %
                    </th>
                    <th
                      className="border border-black p-1 text-right font-semibold"
                      style={{ width: '10%' }}
                    >
                      Tax Amount
                    </th>
                    <th
                      className="border border-black p-1 text-right font-semibold"
                      style={{ width: '15%' }}
                    >
                      Billing Amount (USD)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems?.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-black p-1">
                        {item.description}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {item.basedOn || 'Flat'}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {item.rate?.toFixed(2)} {item.currency || 'USD'}
                      </td>
                      <td className="border border-black p-1 text-center">
                        1.00
                      </td>
                      <td className="border border-black p-1 text-right">
                        {item.amount?.toFixed(2)}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {item.taxPercent || ''}
                      </td>
                      <td className="border border-black p-1 text-right">
                        {item.taxAmount ? item.taxAmount.toFixed(2) : ''}
                      </td>
                      <td className="border border-black p-1 text-right">
                        {(item.amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Amount in Words */}
            <div className="mb-3 print:mb-2">
              <div className="border border-black p-1 bg-gray-50">
                <span className="font-semibold">Amount in Words: </span>
                USD {numberToWords(invoice.total || 0)} only
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-3 print:mb-2">
              <div className="w-1/3">
                <table className="invoice-table w-full border-collapse border border-black">
                  <tbody>
                    <tr>
                      <td className="border border-black p-1 font-semibold">
                        Sub Total (USD)
                      </td>
                      <td className="border border-black p-1 text-right">
                        {invoice.subTotal?.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1 font-semibold">
                        Total Tax
                      </td>
                      <td className="border border-black p-1 text-right">
                        0.00
                      </td>
                    </tr>
                    <tr className="bg-gray-100">
                      <td className="border border-black p-1 font-bold">
                        Total (USD)
                      </td>
                      <td className="border border-black p-1 text-right font-bold">
                        {invoice.total?.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Remarks */}
            <div className="mb-2 print:mb-1">
              <div className="font-semibold mb-1">Remarks</div>
              <div className="min-h-[30px] border-b border-gray-300">
                {invoice.remarks || 'Thank you for your business'}
              </div>
            </div>

            {/* Bank Information and Terms */}
            <div className="mb-3 print:mb-2">
              <div className="grid grid-cols-2 gap-4">
                {/* Bank Information */}
                <div className="border border-black p-2">
                  <div className="font-semibold mb-1">Bank Details</div>
                  <div className="space-y-1 text-xs">
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
                <div className="border border-black p-2">
                  <div className="font-semibold mb-1">Terms of Payment</div>
                  <div className="space-y-1 text-xs">
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
