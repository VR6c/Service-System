import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { StorageService } from '../services/storageService';
import type { Quotation, Receipt, Brand, Branch } from '../types';
import { DocumentPreviewModal } from '../components/common/DocumentPreviewModal';
import {
  Users,
  Search,
  Phone,
  Filter,
  Eye,
  X,
  Car,
  Calendar,
  Building2,
  FileCheck,
  FileText,
  Copy,
  Check,
  Plus,
  BatteryCharging,
  Gauge,
  ExternalLink
} from 'lucide-react';

export interface HistoryItem {
  type: 'Quotation' | 'Receipt';
  no: string;
  date: string;
  amount: number;
  description: string;
  status: string;
}

export interface CustomerVehicleRecord {
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

interface CustomerVehicleProps {
  onCreateQuotation?: (customer: CustomerVehicleRecord) => void;
  onCreateReceipt?: (customer: CustomerVehicleRecord) => void;
  onViewQuotation?: (quotationNo: string) => void;
  onViewReceipt?: (receiptNo: string) => void;
}

export const CustomerVehicle: React.FC<CustomerVehicleProps> = ({
  onCreateQuotation,
  onCreateReceipt,
  onViewQuotation,
  onViewReceipt
}) => {
  const [records, setRecords] = useState<CustomerVehicleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerVehicleRecord | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Document preview state
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    type: 'quotation' | 'receipt';
    quotation?: Quotation | null;
    receipt?: Receipt | null;
    brand?: Brand;
    branch?: Branch;
  }>({
    isOpen: false,
    type: 'quotation'
  });

  useEffect(() => {
    const data = StorageService.getCustomerVehicles();
    setRecords(data);
  }, []);

  // Lock body scroll and listen for ESC key when modal is open
  useEffect(() => {
    if (!selectedCustomer) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCustomer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCustomer]);

  const handleCopy = (text: string, fieldName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const getBrandBadge = (vehicleModel: string, branchName?: string) => {
    const isDenza =
      vehicleModel.toUpperCase().includes('DENZA') ||
      (branchName && branchName.toUpperCase().includes('DENZA'));

    if (isDenza) {
      return {
        brand: 'DENZA',
        label: 'DENZA',
        badgeClass: 'bg-[#082F49] text-sky-300 border-sky-700/60',
        accentColor: '#0284C7'
      };
    }

    return {
      brand: 'BYD',
      label: 'BYD',
      badgeClass: 'bg-red-50 text-[#E31B23] border-red-200',
      accentColor: '#E31B23'
    };
  };

  const getColorHex = (colorName: string): string => {
    const c = (colorName || '').toLowerCase();
    if (c.includes('grey') || c.includes('gray')) return '#64748B';
    if (c.includes('white') || c.includes('ski')) return '#F8FAFC';
    if (c.includes('black') || c.includes('cosmos')) return '#0F172A';
    if (c.includes('red') || c.includes('emperor')) return '#DC2626';
    if (c.includes('pink') || c.includes('coral')) return '#F472B6';
    if (c.includes('blue') || c.includes('ocean')) return '#0284C7';
    if (c.includes('green')) return '#059669';
    if (c.includes('silver')) return '#94A3B8';
    return '#64748B';
  };

  const handleOpenDocPreview = (h: HistoryItem) => {
    const brands = StorageService.getBrands();
    const branches = StorageService.getBranches();

    if (h.type === 'Quotation') {
      const quotations = StorageService.getQuotations();
      const match = quotations.find((q) => q.quotation_no === h.no);
      if (match) {
        const brand = brands.find((b) => b.id === match.brand_id);
        const branch = branches.find((b) => b.id === match.branch_id);
        setPreviewModal({
          isOpen: true,
          type: 'quotation',
          quotation: match,
          brand,
          branch
        });
        return;
      }
    } else {
      const receipts = StorageService.getReceipts();
      const match = receipts.find((r) => r.receipt_no === h.no);
      if (match) {
        const brand = brands.find((b) => b.id === match.brand_id);
        const branch = branches.find((b) => b.id === match.branch_id);
        setPreviewModal({
          isOpen: true,
          type: 'receipt',
          receipt: match,
          brand,
          branch
        });
        return;
      }
    }

    // Fallback: construct lightweight document from customer record & history item
    if (!selectedCustomer) return;
    const isQuotation = h.type === 'Quotation';
    const fallbackBrand = brands.find(b =>
      b.brand_name.toLowerCase().includes(selectedCustomer.vehicleModel.toLowerCase().includes('denza') ? 'denza' : 'byd')
    ) || brands[0];
    const fallbackBranch = branches.find(b => b.branch_name.includes(selectedCustomer.branch)) || branches[0];

    const fallbackDoc: any = {
      id: h.no,
      [isQuotation ? 'quotation_no' : 'receipt_no']: h.no,
      customer_name: selectedCustomer.name,
      phone: selectedCustomer.phone,
      vehicle_model: selectedCustomer.vehicleModel,
      plate_no: selectedCustomer.plateNumber,
      color: selectedCustomer.color,
      vin: selectedCustomer.vin || 'N/A',
      mileage: selectedCustomer.mileage || 0,
      battery: selectedCustomer.battery || 'SoC 90%',
      created_date: h.date,
      status: h.status,
      total_amount: h.amount,
      subtotal: h.amount,
      vat: 0,
      vat_amount: 0,
      description: h.description,
      fee_items: [
        {
          id: 'item-1',
          description: h.description,
          type: 'Labor',
          unit_price: h.amount,
          qty: 1,
          amount: h.amount
        }
      ]
    };

    setPreviewModal({
      isOpen: true,
      type: isQuotation ? 'quotation' : 'receipt',
      quotation: isQuotation ? fallbackDoc : null,
      receipt: !isQuotation ? fallbackDoc : null,
      brand: fallbackBrand,
      branch: fallbackBranch
    });
  };

  const filteredRecords = records.filter((r) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      r.name.toLowerCase().includes(term) ||
      r.phone.includes(term) ||
      r.plateNumber.toLowerCase().includes(term) ||
      r.customerId.toLowerCase().includes(term) ||
      r.vehicleModel.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countAll = records.length;
  const countInService = records.filter((r) => r.status === 'In Service').length;
  const countActive = records.filter((r) => r.status === 'Active').length;
  const countInactive = records.filter((r) => r.status === 'Inactive').length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-white rounded-2xl p-6 shadow-2xs border border-slate-200/90 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 bg-red-50 text-[#E31B23] rounded-2xl border border-red-100 flex items-center justify-center shadow-xs shrink-0">
            <Users className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 font-heading tracking-tight">
                Customer & Fleet Registry
              </h1>
              <span className="px-2 py-0.5 bg-red-50 text-[#E31B23] text-[10px] font-black uppercase rounded-full border border-red-100">
                Live Data
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Automotive customer profiles, vehicle telemetry, and linked quotation & receipt history
            </p>
          </div>
        </div>

        {/* Telemetry Metric Badges */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center min-w-[100px] shrink-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Total Fleet</span>
            <span className="text-base font-black text-slate-900 font-mono">{countAll}</span>
          </div>
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl px-4 py-2 text-center min-w-[110px] shrink-0">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">In Service</span>
            </div>
            <span className="text-base font-black text-amber-900 font-mono">{countInService}</span>
          </div>
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl px-4 py-2 text-center min-w-[100px] shrink-0">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Active</span>
            </div>
            <span className="text-base font-black text-emerald-900 font-mono">{countActive}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search customer, phone, plate number, VIN, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-9 text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills with Counts */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { label: 'All', count: countAll },
            { label: 'In Service', count: countInService },
            { label: 'Active', count: countActive },
            { label: 'Inactive', count: countInactive }
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.label)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${statusFilter === tab.label
                ? 'bg-[#081525] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${statusFilter === tab.label
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
                  }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Customer Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 font-extrabold uppercase border-b border-slate-200/80 text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4">Vehicle Model</th>
                <th className="py-3.5 px-4">License Plate</th>
                <th className="py-3.5 px-4">Mileage & Last Visit</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                      <p>No matching customer or vehicle records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const brandInfo = getBrandBadge(r.vehicleModel, r.branch);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedCustomer(r)}
                      className="hover:bg-slate-50/90 transition cursor-pointer group"
                    >
                      {/* Customer ID & Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white font-black flex items-center justify-center text-xs shadow-xs border border-slate-700/50 shrink-0">
                            {r.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 group-hover:text-red-600 transition-colors">
                              {r.name}
                            </p>
                            <span className="font-mono text-[10px] font-bold text-slate-400">
                              {r.customerId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono">{r.phone}</span>
                          <button
                            onClick={(e) => handleCopy(r.phone, `phone-${r.id}`, e)}
                            className="p-1 rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition opacity-0 group-hover:opacity-100"
                            title="Copy Phone"
                          >
                            {copiedField === `phone-${r.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Vehicle Model & Brand */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.2 text-[9px] font-black rounded border tracking-wider uppercase ${brandInfo.badgeClass}`}
                            >
                              {brandInfo.brand}
                            </span>
                            <span className="font-bold text-slate-900">{r.vehicleModel}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <span
                                className="w-2 h-2 rounded-full border border-slate-300 shrink-0"
                                style={{ backgroundColor: getColorHex(r.color) }}
                              ></span>
                              <span>{r.color || 'Standard'}</span>
                            </span>
                            <span>•</span>
                            <span className="truncate max-w-[130px]">{r.branch}</span>
                          </div>
                        </div>
                      </td>

                      {/* Cambodian Style License Plate */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-300 font-mono text-xs font-black text-slate-900 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          <span>{r.plateNumber}</span>
                        </div>
                      </td>

                      {/* Mileage & Last Service */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-mono font-bold text-slate-800 text-[11px]">
                            <Gauge className="w-3 h-3 text-slate-400" />
                            <span>{r.mileage ? `${Number(r.mileage).toLocaleString()} km` : 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{r.lastService}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${r.status === 'In Service'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : r.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                        >
                          {r.status === 'In Service' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          )}
                          {r.status === 'Active' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          )}
                          <span>{r.status}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {onCreateQuotation && (
                            <button
                              onClick={() => onCreateQuotation(r)}
                              className="px-2.5 py-1 rounded-lg text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition cursor-pointer font-bold text-[11px] flex items-center gap-1"
                              title="Create Quotation for Customer"
                            >
                              <Plus className="w-3 h-3" />
                              <span className="hidden sm:inline">Quote</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedCustomer(r)}
                            className="px-2.5 py-1 rounded-lg text-slate-700 hover:text-white bg-slate-100 hover:bg-slate-900 border border-slate-200 transition cursor-pointer font-bold text-[11px] flex items-center gap-1"
                            title="View Full Profile"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flagship Customer & Vehicle Profile Modal */}
      {selectedCustomer && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto no-print animate-fade-in"
        >
          {/* Full-screen Backdrop Blur Overlay (covers sidebar, header & entire window) */}
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-all cursor-pointer"
            onClick={() => setSelectedCustomer(null)}
            aria-hidden="true"
          />

          {/* Modal Dialog Card */}
          <div
            className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/90 ring-1 ring-black/5 animate-pop-scale max-h-[92vh] flex flex-col overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white font-black flex items-center justify-center text-lg shadow-md border border-slate-700/50 shrink-0">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 font-heading tracking-tight">
                      {selectedCustomer.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedCustomer.status === 'In Service'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : selectedCustomer.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                    >
                      {selectedCustomer.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-red-600">
                      {selectedCustomer.customerId}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {(selectedCustomer.history?.length || 0)} Service Records
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Close Window"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Contact Information Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Customer Phone Number
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {selectedCustomer.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(selectedCustomer.phone, 'modal-phone')}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                  >
                    {copiedField === 'modal-phone' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Phone</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`tel:${selectedCustomer.phone}`}
                    className="px-3 py-1.5 rounded-lg bg-[#081525] hover:bg-[#0f253e] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Direct</span>
                  </a>
                </div>
              </div>

              {/* Automotive Vehicle Showcase Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-red-600" />
                    <span>Vehicle Telemetry & Specifications</span>
                  </h4>
                  {selectedCustomer.vin && (
                    <button
                      onClick={() => handleCopy(selectedCustomer.vin || '', 'modal-vin')}
                      className="text-[11px] font-mono font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      title="Copy VIN"
                    >
                      <span>VIN: {selectedCustomer.vin}</span>
                      {copiedField === 'modal-vin' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 shadow-2xs space-y-4">
                  {/* Vehicle Header: Model + Cambodian Plate */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                    <div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const brandInfo = getBrandBadge(selectedCustomer.vehicleModel, selectedCustomer.branch);
                          return (
                            <span
                              className={`px-2 py-0.5 text-[9px] font-black rounded border tracking-wider uppercase ${brandInfo.badgeClass}`}
                            >
                              {brandInfo.label}
                            </span>
                          );
                        })()}
                        <h5 className="font-black text-slate-900 text-sm">
                          {selectedCustomer.vehicleModel}
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>Registered at {selectedCustomer.branch}</span>
                      </p>
                    </div>

                    {/* Realistic Cambodian Automotive Plate */}
                    <div className="inline-flex flex-col items-center bg-white border-2 border-slate-800 rounded-lg px-3.5 py-1 shadow-sm font-mono self-start sm:self-auto">
                      <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">
                        CAMBODIA
                      </span>
                      <span className="text-sm font-black text-slate-900 tracking-wider leading-tight">
                        {selectedCustomer.plateNumber}
                      </span>
                    </div>
                  </div>

                  {/* 4-Column Telemetry Specs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Odometer */}
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Gauge className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Odometer</span>
                      </div>
                      <span className="font-mono font-black text-slate-900 text-xs">
                        {selectedCustomer.mileage ? `${Number(selectedCustomer.mileage).toLocaleString()} km` : 'N/A'}
                      </span>
                    </div>

                    {/* Color Swatch */}
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                          style={{ backgroundColor: getColorHex(selectedCustomer.color) }}
                        ></span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Color</span>
                      </div>
                      <span className="font-bold text-slate-900 text-xs truncate block">
                        {selectedCustomer.color || 'Standard'}
                      </span>
                    </div>

                    {/* Battery / Energy */}
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Battery State</span>
                      </div>
                      <span className="font-mono font-black text-slate-900 text-xs">
                        {selectedCustomer.battery || 'Blade EV'}
                      </span>
                    </div>

                    {/* Last Service */}
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Last Service</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {selectedCustomer.lastService}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Document History Timeline */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Service Document History</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-400">
                    {selectedCustomer.history?.length || 0} total records
                  </span>
                </div>

                {selectedCustomer.history && selectedCustomer.history.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedCustomer.history.map((h, i) => {
                      const isReceipt = h.type === 'Receipt';
                      return (
                        <div
                          key={i}
                          className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 transition group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${isReceipt
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-amber-50 text-amber-600 border-amber-200'
                                }`}
                            >
                              {isReceipt ? (
                                <FileCheck className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-slate-900 text-xs">
                                  {h.no}
                                </span>
                                <span
                                  className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider ${isReceipt
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                    }`}
                                >
                                  {h.type}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate max-w-[240px] sm:max-w-xs mt-0.5">
                                {h.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <p className="font-mono font-black text-slate-900 text-xs">
                                ${Number(h.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">{h.date}</p>
                            </div>

                            {/* View Document Actions */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenDocPreview(h)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                                title="Preview Document & Print"
                              >
                                <Eye className="w-3 h-3" />
                                <span className="hidden sm:inline">Preview</span>
                              </button>
                              {((h.type === 'Quotation' && onViewQuotation) || (h.type === 'Receipt' && onViewReceipt)) && (
                                <button
                                  onClick={() => {
                                    setSelectedCustomer(null);
                                    if (h.type === 'Quotation' && onViewQuotation) onViewQuotation(h.no);
                                    if (h.type === 'Receipt' && onViewReceipt) onViewReceipt(h.no);
                                  }}
                                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                                  title="Open in Document Manager"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                    No service quotations or receipts on file for this vehicle.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="px-6 py-4 bg-slate-50/90 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>

              {/* Action Shortcuts */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {onCreateQuotation && (
                  <button
                    onClick={() => {
                      const cust = selectedCustomer;
                      setSelectedCustomer(null);
                      onCreateQuotation(cust);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-[#E31B23] hover:bg-[#c9151c] text-white rounded-xl text-xs font-bold transition shadow-sm shadow-red-500/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Quotation</span>
                  </button>
                )}

                {onCreateReceipt && (
                  <button
                    onClick={() => {
                      const cust = selectedCustomer;
                      setSelectedCustomer(null);
                      onCreateReceipt(cust);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-[#081525] hover:bg-[#0f243c] text-white rounded-xl text-xs font-bold transition shadow-sm shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>+ New Receipt</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Linked Document Preview Modal */}
      {previewModal.isOpen && (
        <DocumentPreviewModal
          isOpen={previewModal.isOpen}
          type={previewModal.type}
          quotation={previewModal.quotation}
          receipt={previewModal.receipt}
          brand={previewModal.brand}
          branch={previewModal.branch}
          onClose={() =>
            setPreviewModal({
              isOpen: false,
              type: 'quotation'
            })
          }
        />
      )}
    </div>
  );
};
