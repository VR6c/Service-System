import React from 'react';
import { User, Car, Battery, Phone, Gauge, FileText, Check } from 'lucide-react';

interface CustomerVehicleFormProps {
  customerName: string;
  onCustomerNameChange: (val: string) => void;
  phone: string;
  onPhoneChange: (val: string) => void;
  plateNo: string;
  onPlateNoChange: (val: string) => void;
  vehicleModel: string;
  onVehicleModelChange: (val: string) => void;
  color: string;
  onColorChange: (val: string) => void;
  vin: string;
  onVinChange: (val: string) => void;
  mileage: number;
  onMileageChange: (val: number) => void;
  battery: string;
  onBatteryChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  isOwner?: boolean;
  onIsOwnerChange?: (val: boolean) => void;
  isSender?: boolean;
  onIsSenderChange?: (val: boolean) => void;
  readOnly?: boolean;
}

export const CustomerVehicleForm: React.FC<CustomerVehicleFormProps> = ({
  customerName,
  onCustomerNameChange,
  phone,
  onPhoneChange,
  plateNo,
  onPlateNoChange,
  vehicleModel,
  onVehicleModelChange,
  color,
  onColorChange,
  vin,
  onVinChange,
  mileage,
  onMileageChange,
  battery,
  onBatteryChange,
  description,
  onDescriptionChange,
  isOwner,
  onIsOwnerChange,
  isSender,
  onIsSenderChange,
  readOnly = false
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-5 font-sans">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Customer & Vehicle Information
        </h3>
        {onIsOwnerChange && (
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={isOwner ?? true}
                onChange={e => onIsOwnerChange(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Is Owner</span>
            </label>
            {onIsSenderChange && (
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={readOnly}
                  checked={isSender ?? false}
                  onChange={e => onIsSenderChange(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>Is Sender</span>
              </label>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer Name */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              disabled={readOnly}
              value={customerName}
              onChange={e => onCustomerNameChange(e.target.value)}
              placeholder="e.g. Chan Ponlok"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Telephone */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              disabled={readOnly}
              value={phone}
              onChange={e => onPhoneChange(e.target.value)}
              placeholder="e.g. +855 12 111 222"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Plate Number */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            Plate Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Car className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              disabled={readOnly}
              value={plateNo}
              onChange={e => onPlateNoChange(e.target.value)}
              placeholder="e.g. 2BX-1234"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-bold font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Vehicle Model */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            Vehicle Model <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={readOnly}
            value={vehicleModel}
            onChange={e => onVehicleModelChange(e.target.value)}
            placeholder="e.g. BYD SEAL / DENZA D9"
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            Color
          </label>
          <input
            type="text"
            disabled={readOnly}
            value={color}
            onChange={e => onColorChange(e.target.value)}
            placeholder="e.g. Atlantis Grey"
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        {/* VIN */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            VIN (Chassis No)
          </label>
          <input
            type="text"
            disabled={readOnly}
            value={vin}
            onChange={e => onVinChange(e.target.value)}
            placeholder="e.g. LC0BYDSEAL2026..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Mileage */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            Mileage (KM)
          </label>
          <div className="relative">
            <Gauge className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="number"
              min="0"
              disabled={readOnly}
              value={mileage}
              onChange={e => onMileageChange(Number(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Battery Level */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            Battery / SoC
          </label>
          <div className="relative">
            <Battery className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
            <input
              type="text"
              disabled={readOnly}
              value={battery}
              onChange={e => onBatteryChange(e.target.value)}
              placeholder="e.g. SoC 85%"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Description / Remark */}
      <div>
        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
          Service Request / Complaint Description
        </label>
        <div className="relative">
          <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <textarea
            rows={2}
            disabled={readOnly}
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
            placeholder="Describe customer reported symptoms, requested maintenance, or notes..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
          />
        </div>
      </div>
    </div>
  );
};
