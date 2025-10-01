import React, { useState } from 'react';
import {
  LogisticsJob,
  JobType,
  AirFreightJob,
  SeaFreightJob,
  RoadFreightJob,
} from '../types/logistics';
import { X } from 'lucide-react';

interface LogisticsJobFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: Partial<LogisticsJob>) => void;
  initialData?: Partial<LogisticsJob>;
  clients: Array<{ id: string; name: string }>;
}

export const LogisticsJobForm: React.FC<LogisticsJobFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  clients,
}) => {
  const [jobType, setJobType] = useState<JobType>(
    initialData?.jobType || JobType.AIR_FREIGHT_IMPORT
  );

  const [formData, setFormData] = useState({
    // Basic fields - jobNumber will be auto-generated
    title: initialData?.title || '',
    clientId: initialData?.clientId || '',
    clientName: initialData?.clientName || '',
    status: initialData?.status || 'open',

    // Common logistics fields
    portOfLoading: initialData?.portOfLoading || '',
    portOfDischarge: initialData?.portOfDischarge || '',
    grossWeight: initialData?.grossWeight || 0,
    chargeableWeight: initialData?.chargeableWeight || 0,
    shipper: initialData?.shipper || '',
    consignee: initialData?.consignee || '',
    package: initialData?.package || '',
    goodDescription: initialData?.goodDescription || '',

    // Air Freight specific
    masterAirWaybill:
      (initialData as AirFreightJob)?.awb?.masterAirWaybill || '',
    houseAirWaybill: (initialData as AirFreightJob)?.awb?.houseAirWaybill || '',

    // Sea Freight specific
    masterBL: (initialData as SeaFreightJob)?.billOfLading?.masterBL || '',
    houseBL: (initialData as SeaFreightJob)?.billOfLading?.houseBL || '',

    // Road Freight specific
    plateNumber: (initialData as RoadFreightJob)?.plateNumber || '',
    containerNumber: (initialData as RoadFreightJob)?.containerNumber || '',
  });

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find((c) => c.id === clientId);
    setFormData({
      ...formData,
      clientId,
      clientName: selectedClient?.name || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const baseJobData = {
      jobType,
      title: formData.title,
      clientId: formData.clientId,
      clientName: formData.clientName,
      status: formData.status,
      portOfLoading: formData.portOfLoading,
      portOfDischarge: formData.portOfDischarge,
      grossWeight: formData.grossWeight,
      chargeableWeight: formData.chargeableWeight,
      shipper: formData.shipper,
      consignee: formData.consignee,
      package: formData.package,
      goodDescription: formData.goodDescription,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    let jobData: Partial<LogisticsJob>;

    if (jobType === JobType.AIR_FREIGHT_IMPORT || jobType === JobType.AIR_FREIGHT_EXPORT) {
      jobData = {
        ...baseJobData,
        awb: {
          masterAirWaybill: formData.masterAirWaybill,
          houseAirWaybill: formData.houseAirWaybill || undefined,
        },
      } as Partial<AirFreightJob>;
    } else if (jobType === JobType.SEA_FREIGHT_IMPORT || jobType === JobType.SEA_FREIGHT_EXPORT) {
      jobData = {
        ...baseJobData,
        billOfLading: {
          masterBL: formData.masterBL,
          houseBL: formData.houseBL || undefined,
        },
      } as Partial<SeaFreightJob>;
    } else if (jobType === JobType.ROAD_FREIGHT_IMPORT) {
      jobData = {
        ...baseJobData,
        plateNumber: formData.plateNumber,
        containerNumber: formData.containerNumber,
      } as Partial<RoadFreightJob>;
    } else {
      jobData = baseJobData;
    }

    onSubmit(jobData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fadein">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">
            {initialData ? 'Edit Logistics Job' : 'Create New Logistics Job'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type *
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as JobType)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                  required
                >
                  <option value={JobType.AIR_FREIGHT_IMPORT}>Air Freight Import</option>
                  <option value={JobType.AIR_FREIGHT_EXPORT}>Air Freight Export</option>
                  <option value={JobType.SEA_FREIGHT_IMPORT}>Sea Freight Import</option>
                  <option value={JobType.SEA_FREIGHT_EXPORT}>Sea Freight Export</option>
                  <option value={JobType.ROAD_FREIGHT_IMPORT}>Road Freight Import</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Number
                </label>
                <div className="w-full p-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600">
                  Auto-generated on save
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Format: AAL-{jobType === JobType.AIR_FREIGHT_IMPORT ? 'AI' : 
                              jobType === JobType.AIR_FREIGHT_EXPORT ? 'AE' :
                              jobType === JobType.SEA_FREIGHT_IMPORT ? 'SI' :
                              jobType === JobType.SEA_FREIGHT_EXPORT ? 'SE' :
                              jobType === JobType.ROAD_FREIGHT_IMPORT ? 'RI' : 'XX'}-{new Date().getFullYear().toString().slice(-2)}-001
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                  required
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                  placeholder="Job description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Route & Location
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Port of Loading *
                </label>
                <input
                  type="text"
                  value={formData.portOfLoading}
                  onChange={(e) =>
                    setFormData({ ...formData, portOfLoading: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., JFK - New York"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Port of Discharge *
                </label>
                <input
                  type="text"
                  value={formData.portOfDischarge}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      portOfDischarge: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., DXB - Dubai"
                  required
                />
              </div>
            </div>
          </div>

          {/* Party Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Party Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipper *
                </label>
                <input
                  type="text"
                  value={formData.shipper}
                  onChange={(e) =>
                    setFormData({ ...formData, shipper: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                  placeholder="Shipper company name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consignee *
                </label>
                <input
                  type="text"
                  value={formData.consignee}
                  onChange={(e) =>
                    setFormData({ ...formData, consignee: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                  placeholder="Consignee company name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Cargo Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Cargo Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gross Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.grossWeight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      grossWeight: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chargeable Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.chargeableWeight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      chargeableWeight: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package *
                </label>
                <input
                  type="text"
                  value={formData.package}
                  onChange={(e) =>
                    setFormData({ ...formData, package: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., 15 Boxes, 1 x 40ft Container"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Good Description *
                </label>
                <input
                  type="text"
                  value={formData.goodDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      goodDescription: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                  placeholder="Description of goods"
                  required
                />
              </div>
            </div>
          </div>

          {/* Job Type Specific Fields */}
          {(jobType === JobType.AIR_FREIGHT_IMPORT || jobType === JobType.AIR_FREIGHT_EXPORT) && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-lg font-medium text-blue-900 mb-4">
                Air Waybill Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Master Air Waybill (MAWB) *
                  </label>
                  <input
                    type="text"
                    value={formData.masterAirWaybill}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        masterAirWaybill: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., MAWB-176-12345678"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    House Air Waybill (HAWB)
                  </label>
                  <input
                    type="text"
                    value={formData.houseAirWaybill}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        houseAirWaybill: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., HAWB-176-87654321"
                  />
                </div>
              </div>
            </div>
          )}

          {(jobType === JobType.SEA_FREIGHT_IMPORT || jobType === JobType.SEA_FREIGHT_EXPORT) && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-lg font-medium text-green-900 mb-4">
                Bill of Lading Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Master Bill of Lading (MBL) *
                  </label>
                  <input
                    type="text"
                    value={formData.masterBL}
                    onChange={(e) =>
                      setFormData({ ...formData, masterBL: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., MBL-MAEU-9876543210"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    House Bill of Lading (HBL)
                  </label>
                  <input
                    type="text"
                    value={formData.houseBL}
                    onChange={(e) =>
                      setFormData({ ...formData, houseBL: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., HBL-BETA-1234567890"
                  />
                </div>
              </div>
            </div>
          )}

          {jobType === JobType.ROAD_FREIGHT_IMPORT && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="text-lg font-medium text-orange-900 mb-4">
                Road Freight Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plate Number *
                  </label>
                  <input
                    type="text"
                    value={formData.plateNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, plateNumber: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., TRK-456-ABC"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Container Number *
                  </label>
                  <input
                    type="text"
                    value={formData.containerNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        containerNumber: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., CONT-789-XYZ"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition"
            >
              {initialData ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
