import React from 'react';
import {
  type Invoice,
  type LogisticsJob,
  jobsMock,
} from '../services/mockData';
import {
  getJobTypeDisplayName,
  getPrimaryDocument,
  isAirFreightJob,
  isSeaFreightJob,
  isRoadFreigh      `}</style>

        {/* Invoice content */}
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

          <div className="max-w-4xl mx-auto bg-white print:max-w-none relative z-10 shadow-lg print:shadow-none p-6 print:p-0">{/* Header */}/types/logistics';

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

interface PrintableInvoiceProps {
  invoice: Invoice;
  onClose: () => void;
}

// Company configuration - can be made dynamic by fetching from API/settings
const companyConfig = {
  name: 'Aviation Africa Logistics Ltd',

  address: {
    line1: 'EAR Building, 2nd Floor, Kimihurura',
    line2: 'Kigali, Rwanda',
  },
  email: 'info@aal.rw',
  phone: '+250 783 456 789',
  logo: '/logo.jpeg',
  watermark: '/watermark.jpeg',
  bankDetails: {
    bank: 'Bank of Kigali',
    accountName: 'Aviation Africa Logistics Ltd',
    accountNumber: '9030020478362',
    swiftCode: 'BIKIRWRW',
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

export default function PrintableInvoice({
  invoice,
  onClose,
}: PrintableInvoiceProps) {
  const handlePrint = () => {
    window.print();
  };

  // Get associated job details
  const associatedJob = invoice.jobId
    ? (jobsMock.find((job) => job.id === invoice.jobId) as LogisticsJob)
    : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Print controls */}
      <div className="print:hidden bg-gray-100 p-4 border-b flex items-center justify-between flex-shrink-0">
        <h3 className="text-lg font-semibold">Invoice Preview</h3>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Print Invoice
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-auto bg-gray-50">{/* Print styles */}
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
        }
        
        @media screen {
          .invoice-container {
            transform: scale(0.85);
            transform-origin: top center;
            width: 117.6%;
            margin: 0 auto;
          }
          .watermark {
            opacity: 0.15;
            background-size: 30%;
          }
        }
      `}</style>

      {/* Invoice content */}
      <div className="invoice-container p-6 print:p-0 overflow-auto relative">
        {/* Watermark */}
        <div
          className="watermark absolute inset-0 opacity-10 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${companyConfig.watermark})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
          }}
        />

        <div className="max-w-4xl mx-auto bg-white print:max-w-none relative z-10">
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

          {/* Title */}
          <div className="text-center invoice-title text-xl font-bold mb-3 print:mb-2">
            Invoice
          </div>

          {/* Client and Invoice Details */}
          <div className="grid grid-cols-2 gap-4 print:gap-2 mb-3 print:mb-2">
            <div>
              <div className="text-xs print:text-[8px] space-y-1 print:space-y-0">
                <div className="font-semibold">To,</div>
                <div className="font-bold">{invoice.clientName}</div>
                <div>GIKONDO, NAEB STREET NO KK06</div>
                <div>KIGALI</div>
                <div>KGL</div>
                <div>RWANDA</div>
                <div>PIN: 101478942</div>
              </div>
            </div>
            <div className="text-xs print:text-[8px] space-y-1 print:space-y-0">
              <div className="flex justify-between">
                <span className="font-semibold">Invoice No:</span>
                <span>{invoice.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Invoice Status:</span>
                <span className="capitalize">{invoice.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Invoice Due Date:</span>
                <span>{formatDate(invoice.invoiceDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Job Code:</span>
                <span>{invoice.jobNumber || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Job Date:</span>
                <span>
                  {associatedJob ? formatDate(associatedJob.createdAt) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Currency Code:</span>
                <span>{invoice.currency}</span>
              </div>
            </div>
          </div>

          {/* Shipment Details */}
          {associatedJob && (
            <div className="mb-3 print:mb-2">
              <div className="font-bold text-sm print:text-xs mb-2 print:mb-1 border-b border-black pb-1">
                Shipment Details
              </div>

              <div className="grid grid-cols-2 gap-3 print:gap-1 shipment-details text-xs print:text-[7px]">
                {/* Left Column */}
                <div className="space-y-1 print:space-y-0">
                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Shipper</div>
                    <div>:</div>
                    <div>{associatedJob.shipper}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Shipper Ref</div>
                    <div>:</div>
                    <div>-</div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Port Of Loading</div>
                    <div>:</div>
                    <div>{associatedJob.portOfLoading}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Port Of Discharge</div>
                    <div>:</div>
                    <div>{associatedJob.portOfDischarge}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Place of Delivery</div>
                    <div>:</div>
                    <div>{associatedJob.portOfDischarge}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Container</div>
                    <div>:</div>
                    <div>
                      {isRoadFreightJob(associatedJob)
                        ? associatedJob.containerNumber
                        : isSeaFreightJob(associatedJob)
                        ? '2 X 20ft Containers'
                        : '-'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Vehicle</div>
                    <div>:</div>
                    <div>
                      {isRoadFreightJob(associatedJob)
                        ? associatedJob.plateNumber
                        : '-'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Package</div>
                    <div>:</div>
                    <div>{associatedJob.package}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Volume</div>
                    <div>:</div>
                    <div>-</div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Goods Description</div>
                    <div>:</div>
                    <div>{associatedJob.goodDescription}</div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-1 print:space-y-0">
                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Consignee</div>
                    <div>:</div>
                    <div>{associatedJob.consignee}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Consignee Ref</div>
                    <div>:</div>
                    <div>-</div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Service/Movement</div>
                    <div>:</div>
                    <div>{getJobTypeDisplayName(associatedJob.jobType)}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Master No</div>
                    <div>:</div>
                    <div>{getPrimaryDocument(associatedJob)}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">House No</div>
                    <div>:</div>
                    <div>
                      {isAirFreightJob(associatedJob) &&
                      associatedJob.awb.houseAirWaybill
                        ? associatedJob.awb.houseAirWaybill
                        : isSeaFreightJob(associatedJob) &&
                          associatedJob.billOfLading.houseBL
                        ? associatedJob.billOfLading.houseBL
                        : '-'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Vessel & Voyage</div>
                    <div>:</div>
                    <div>
                      {isSeaFreightJob(associatedJob)
                        ? 'Vessel No & Date'
                        : '-'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Flight No & Date</div>
                    <div>:</div>
                    <div>
                      {isAirFreightJob(associatedJob)
                        ? 'Flight No & Date'
                        : '-'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Gross Weight</div>
                    <div>:</div>
                    <div>{associatedJob.grossWeight.toFixed(2)} KGS</div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-semibold">Chargeable Weight</div>
                    <div>:</div>
                    <div>{associatedJob.chargeableWeight.toFixed(2)} KGS</div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                      {item.basedOn}
                    </td>
                    <td className="border border-black p-1 text-center">
                      {item.rate?.toFixed(2)} {item.currency}
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
                      {item.billingAmount?.toFixed(2)}
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
                    <td className="border border-black p-1 text-right">0.00</td>
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
                <div className="space-y-1">
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
                <div className="space-y-1">
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
