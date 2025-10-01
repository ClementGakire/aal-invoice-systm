export enum JobType {
  AIR_FREIGHT_IMPORT = 'AIR_FREIGHT_IMPORT',
  AIR_FREIGHT_EXPORT = 'AIR_FREIGHT_EXPORT',
  SEA_FREIGHT_IMPORT = 'SEA_FREIGHT_IMPORT',
  SEA_FREIGHT_EXPORT = 'SEA_FREIGHT_EXPORT',
  ROAD_FREIGHT_IMPORT = 'ROAD_FREIGHT_IMPORT',
}

// Job type abbreviation mapping for job numbers
export const JOB_TYPE_ABBREVIATIONS: Record<JobType, string> = {
  [JobType.AIR_FREIGHT_IMPORT]: 'AI',
  [JobType.AIR_FREIGHT_EXPORT]: 'AE',
  [JobType.SEA_FREIGHT_IMPORT]: 'SI',
  [JobType.SEA_FREIGHT_EXPORT]: 'SE',
  [JobType.ROAD_FREIGHT_IMPORT]: 'RI',
};

export interface BaseJob {
  id: string;
  jobNumber: string;
  title: string;
  clientId: string;
  clientName: string;
  status: string;
  jobType: JobType;

  // Common logistics fields
  portOfLoading: string;
  portOfDischarge: string;
  grossWeight: number;
  chargeableWeight: number;
  shipper: string;
  consignee: string;
  package: string;
  goodDescription: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface AirFreightJob extends BaseJob {
  jobType: JobType.AIR_FREIGHT_IMPORT | JobType.AIR_FREIGHT_EXPORT;
  awb: {
    masterAirWaybill: string; // MAWB
    houseAirWaybill?: string; // HAWB
  };
}

export interface SeaFreightJob extends BaseJob {
  jobType: JobType.SEA_FREIGHT_IMPORT | JobType.SEA_FREIGHT_EXPORT;
  billOfLading: {
    masterBL: string; // MBL
    houseBL?: string; // HBL
  };
}

export interface RoadFreightJob extends BaseJob {
  jobType: JobType.ROAD_FREIGHT_IMPORT;
  plateNumber: string;
  containerNumber: string;
}

export type LogisticsJob = AirFreightJob | SeaFreightJob | RoadFreightJob;

// Helper function to check job type
export function isAirFreightJob(job: LogisticsJob): job is AirFreightJob {
  return (
    job.jobType === JobType.AIR_FREIGHT_IMPORT ||
    job.jobType === JobType.AIR_FREIGHT_EXPORT
  );
}

export function isSeaFreightJob(job: LogisticsJob): job is SeaFreightJob {
  return (
    job.jobType === JobType.SEA_FREIGHT_IMPORT ||
    job.jobType === JobType.SEA_FREIGHT_EXPORT
  );
}

export function isRoadFreightJob(job: LogisticsJob): job is RoadFreightJob {
  return job.jobType === JobType.ROAD_FREIGHT_IMPORT;
}

// Helper function to get job type display name
export function getJobTypeDisplayName(jobType: JobType): string {
  switch (jobType) {
    case JobType.AIR_FREIGHT_IMPORT:
      return 'Air Freight Import';
    case JobType.AIR_FREIGHT_EXPORT:
      return 'Air Freight Export';
    case JobType.SEA_FREIGHT_IMPORT:
      return 'Sea Freight Import';
    case JobType.SEA_FREIGHT_EXPORT:
      return 'Sea Freight Export';
    case JobType.ROAD_FREIGHT_IMPORT:
      return 'Road Freight Import';
    default:
      return 'Unknown';
  }
}

// Helper function to get primary document identifier
export function getPrimaryDocument(job: LogisticsJob): string {
  if (isAirFreightJob(job)) {
    return job.awb.masterAirWaybill;
  } else if (isSeaFreightJob(job)) {
    return job.billOfLading.masterBL;
  } else if (isRoadFreightJob(job)) {
    return job.plateNumber;
  }
  return '';
}

// Helper function to calculate freight charges based on job type
export function calculateFreightCharges(
  job: LogisticsJob
): { description: string; rate: number; amount: number }[] {
  const charges: { description: string; rate: number; amount: number }[] = [];

  if (isAirFreightJob(job)) {
    // Air freight typically charges per kg
    const airFreightRate = 12.5; // USD per kg
    const airFreightAmount = job.chargeableWeight * airFreightRate;
    charges.push({
      description: 'Air Freight Charges',
      rate: airFreightRate,
      amount: airFreightAmount,
    });

    // Add handling charges for air freight
    charges.push({
      description: 'Air Handling Charges',
      rate: 150.0,
      amount: 150.0,
    });
  } else if (isSeaFreightJob(job)) {
    // Sea freight typically charges per container or shipment
    let seaFreightRate = 6500.0;
    if (job.package.toLowerCase().includes('40ft')) {
      seaFreightRate = 8500.0;
    } else if (job.package.toLowerCase().includes('20ft')) {
      seaFreightRate = 6500.0;
    }

    charges.push({
      description: 'Sea Freight Charges',
      rate: seaFreightRate,
      amount: seaFreightRate,
    });

    // Add port charges
    charges.push({
      description: `Transport Charges ${job.portOfLoading.split(' - ')[1]}-${
        job.portOfDischarge.split(' - ')[1]
      }`,
      rate: 4000.0,
      amount: 4000.0,
    });
  } else if (isRoadFreightJob(job)) {
    // Road freight charges based on distance and weight
    const roadFreightRate = 2.5; // USD per kg
    const roadFreightAmount = job.grossWeight * roadFreightRate;
    charges.push({
      description: 'Road Freight Charges',
      rate: roadFreightRate,
      amount: roadFreightAmount,
    });

    // Add loading/unloading charges
    charges.push({
      description: 'Loading/Unloading Charges',
      rate: 500.0,
      amount: 500.0,
    });
  }

  return charges;
}

// Helper function to generate invoice line items from job
export function generateInvoiceLineItems(job: LogisticsJob): any[] {
  const charges = calculateFreightCharges(job);
  return charges.map((charge, index) => ({
    id: `li_${job.id}_${index + 1}`,
    description: charge.description,
    basedOn: isAirFreightJob(job) ? 'Qty & UOM' : 'Shipment',
    rate: charge.rate,
    currency: 'USD',
    amount: charge.amount,
    billingAmount: charge.amount,
  }));
}

// Helper function to convert number to words (for amount in words)
export function numberToWords(amount: number): string {
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

  if (amount === 0) return 'Zero Dollars And Zero Cents';

  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);

  function convertGroup(num: number): string {
    let result = '';
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;

    if (hundreds > 0) {
      result += ones[hundreds] + ' Hundred ';
    }

    if (remainder >= 20) {
      result += tens[Math.floor(remainder / 10)] + ' ';
      if (remainder % 10 > 0) {
        result += ones[remainder % 10] + ' ';
      }
    } else if (remainder >= 10) {
      result += teens[remainder - 10] + ' ';
    } else if (remainder > 0) {
      result += ones[remainder] + ' ';
    }

    return result.trim();
  }

  function convertNumber(num: number): string {
    if (num === 0) return '';

    let result = '';
    let groupIndex = 0;

    while (num > 0) {
      const group = num % 1000;
      if (group > 0) {
        const groupText = convertGroup(group);
        if (groupIndex > 0) {
          result = groupText + ' ' + thousands[groupIndex] + ' ' + result;
        } else {
          result = groupText + ' ' + result;
        }
      }
      num = Math.floor(num / 1000);
      groupIndex++;
    }

    return result.trim();
  }

  let dollarsText = convertNumber(dollars);
  if (dollarsText === '') dollarsText = 'Zero';

  let centsText = convertNumber(cents);
  if (centsText === '') centsText = 'Zero';

  return `${dollarsText} Dollars And ${centsText} Cents`;
}

// Helper function to generate booking number
export function generateBookingNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, '0');
  return `RW-BK-${year}-${random}`;
}

// Helper function to generate invoice number
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, '0');
  return `RW-CI-${year}-${random}`;
}

// Helper function to generate automatic job number based on job type
export function generateJobNumber(
  jobType: JobType,
  sequenceNumber: number
): string {
  const abbreviation = JOB_TYPE_ABBREVIATIONS[jobType];
  const year = new Date().getFullYear().toString().slice(-2);
  const sequence = sequenceNumber.toString().padStart(3, '0');
  return `AAL-${abbreviation}-${year}-${sequence}`;
}
