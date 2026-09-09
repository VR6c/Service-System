import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import {
  Users,
  Search,
  Phone,
  Filter,
  Eye,
  Info,
  X,
  Car,
  Calendar,
  Building2,
  ShieldCheck,
  FileCheck,
  FileText
} from 'lucide-react';

interface HistoryItem {
  type: 'Quotation' | 'Receipt';
  no: string;
  date: string;
  amount: number;
  description: string;
  status: string;
}

interface CustomerVehicleRecord {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  vehicleModel: string;
  plateNumber: string;
  color: string;
  status: 'Active' | 'In Service' | 'Inactive';
  lastService: string;
  branch: string;
  vin?: string;
  mileage?: number;
  battery?: string;
  history?: HistoryItem[];
}

export const CustomerVehicle: React.FC = () => {
  const [records, setRecords] = useState<CustomerVehicleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerVehicleRecord | null>(null);

  useEffect(() => {
    const data = StorageService.getCustomerVehicles();
    setRecords(data);
  }, []);

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm) ||
      r.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans">
      {/* Top Banner & Title */}
      <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-red-50 text-[#E31B23] rounded-2xl border border-red-100 shadow-2xs shrink-0 font-bold">
            <Users className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 font-heading">Customer Management</h1>
            <p className="text-xs text-slate-500 font-medium">View, search, and filter registered customer profiles & vehicle records ({records.length} records)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100/90 px-3.5 py-2 rounded-xl border border-slate-200 shrink-0">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Auto-created from receipts & quotations</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by customer name, phone, plate no, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-8 text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-red-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['All', 'Active', 'In Service', 'Inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                statusFilter === status
                  ? 'bg-[#081525] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-200/80 text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Customer ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Vehicle Model</th>
                <th className="py-3.5 px-4">Plate Number</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No matching customer records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#E31B23] text-xs">
                      {r.customerId}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center text-[10px] border border-slate-200">
                          {r.name.charAt(0)}
                        </div>
                        <span>{r.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{r.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{r.vehicleModel}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{r.color} • {r.branch}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900">
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-900">
                        {r.plateNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        r.status === 'In Service'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : r.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedCustomer(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 hover:text-[#E31B23] bg-slate-100 hover:bg-red-50 transition cursor-pointer font-bold text-xs"
                        title="View Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Customer Details & History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 text-[#E31B23] font-black flex items-center justify-center text-sm border border-red-100">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-heading">{selectedCustomer.name}</h3>
                  <p className="text-xs font-mono font-bold text-[#E31B23]">{selectedCustomer.customerId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Account Status</span>
                  <div className="mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      selectedCustomer.status === 'In Service'
                        ? 'bg-amber-100 text-amber-800'
                        : selectedCustomer.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {selectedCustomer.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-500">Vehicle Specifications</h4>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Model:</span>
                    <span className="font-extrabold text-slate-900 flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-red-600" />
                      {selectedCustomer.vehicleModel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Plate Number:</span>
                    <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {selectedCustomer.plateNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Color:</span>
                    <span className="font-bold text-slate-800">{selectedCustomer.color || 'Standard'}</span>
                  </div>
                  {selectedCustomer.vin && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">VIN:</span>
                      <span className="font-mono text-slate-700 font-bold">{selectedCustomer.vin}</span>
                    </div>
                  )}
                  {selectedCustomer.mileage ? (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Odometer Mileage:</span>
                      <span className="font-bold text-slate-900">{selectedCustomer.mileage.toLocaleString()} km</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Registered Branch:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {selectedCustomer.branch}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">Last Service Date:</span>
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {selectedCustomer.lastService}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Document History Timeline */}
              {selectedCustomer.history && selectedCustomer.history.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-500">Service Document History</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedCustomer.history.map((h, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          {h.type === 'Receipt' ? (
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <div>
                            <p className="font-bold text-slate-900 font-mono">{h.no}</p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{h.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-black text-slate-900">${h.amount.toFixed(2)}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{h.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 flex items-start gap-2 text-[11px] text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Customer records and vehicle service history update live when quotations or receipts are created.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

