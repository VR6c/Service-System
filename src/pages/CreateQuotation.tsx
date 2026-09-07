import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import type { Quotation, FeeItem } from '../types';
import { QuotationPDF } from '../components/pdf/QuotationPDF';
import { exportToPDF, printDocument } from '../utils/pdfExport';
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Download,
  Printer,
  CheckCircle,
  User,
  Zap,
  ArrowRight
} from 'lucide-react';

interface CreateQuotationProps {
  onSaved: () => void;
  onConvertToReceipt?: (quotation: Quotation) => void;
  editingQuotation?: Quotation | null;
}


export const CreateQuotation: React.FC<CreateQuotationProps> = ({ onSaved, onConvertToReceipt, editingQuotation }) => {
  const { currentUser, brands, branches } = useAuth();
  const settings = StorageService.getSettings();

  // Helper to resolve user's assigned branch for a brand
  const getPreferredBranchId = (targetBrandId: string) => {
    const brandBranches = branches.filter(br => br.brand_id === targetBrandId);
    const userAssignedBranchId = currentUser?.default_branch_id || currentUser?.branch_id;
    const userMatch = brandBranches.find(br => br.id === userAssignedBranchId);
    if (userMatch) {
      return userMatch.id;
    }
    return brandBranches[0]?.id || '';
  };

  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    editingQuotation?.brand_id || currentUser?.default_brand_id || currentUser?.brand_id || brands[0]?.id || 'brand-byd'
  );
  const availableBranches = branches.filter(b => b.brand_id === selectedBrandId);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    editingQuotation?.branch_id || getPreferredBranchId(selectedBrandId) || availableBranches[0]?.id || ''
  );

  const [status, setStatus] = useState<Quotation['status']>(editingQuotation?.status || 'Draft');

  const [quotationNo, setQuotationNo] = useState(editingQuotation?.quotation_no || '');

  React.useEffect(() => {
    if (editingQuotation) return;
    setQuotationNo(StorageService.generateQuotationNo(selectedBrandId, selectedBranchId));
  }, [selectedBrandId, selectedBranchId, editingQuotation]);
  const [customerName, setCustomerName] = useState(editingQuotation?.customer_name || '');
  const [phone, setPhone] = useState(editingQuotation?.phone || '');
  const [plateNo, setPlateNo] = useState(editingQuotation?.plate_no || '');
  const [vehicleModel, setVehicleModel] = useState(editingQuotation?.vehicle_model || 'BYD SEAL');
  const [color, setColor] = useState(editingQuotation?.color || 'Ski White');
  const [vin, setVin] = useState(editingQuotation?.vin || ('LC0BYD' + Math.random().toString(36).substring(2, 10).toUpperCase()));
  const [mileage, setMileage] = useState<number>(editingQuotation?.mileage ?? 15000);
  const [battery, setBattery] = useState(editingQuotation?.battery || 'SoC 85% / SOH 98%');
  const [fuelGauge, setFuelGauge] = useState(editingQuotation?.fuel_gauge || editingQuotation?.battery || 'Full / SoC 85%');
  const [afterSale, setAfterSale] = useState(editingQuotation?.after_sale || 'Standard Scheduled Maintenance');
  const [address, setAddress] = useState(editingQuotation?.address || 'Phnom Penh, Cambodia');
  const [description, setDescription] = useState(editingQuotation?.description || 'Standard Scheduled Maintenance & High Voltage Battery Diagnostic');
  const [repairRecommendation, setRepairRecommendation] = useState(editingQuotation?.repair_recommendation || 'Replace cabin air filter, flush brake fluid, rotate tires, calibrate DiPilot sensors');

  const [feeItems, setFeeItems] = useState<FeeItem[]>(editingQuotation?.fee_items.map(item => ({ ...item })) || [
    { id: 'item-1', sap_no: 'SAP-10021', description: 'Scheduled EV Diagnostic & High Voltage Inspection', quantity: 1, unit_price: 120, amount: 120, paint_check: 'Passed' },
    { id: 'item-2', sap_no: 'SAP-10045', description: 'BYD Original HEPA Cabin Air Filter', quantity: 1, unit_price: 45, amount: 45, paint_check: 'N/A' }
  ]);

  const [previewMode, setPreviewMode] = useState(false);
  const [savedQuotation, setSavedQuotation] = useState<Quotation | null>(null);

  // Auto Calculations
  const subtotal = feeItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const vat = subtotal * settings.vat_rate;
  const totalAmount = subtotal + vat;

  const handleItemChange = (id: string, field: keyof FeeItem, val: any) => {
    setFeeItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === 'quantity' || field === 'unit_price') {
          const qty = field === 'quantity' ? Number(val) || 0 : item.quantity;
          const price = field === 'unit_price' ? Number(val) || 0 : item.unit_price;
          updated.amount = qty * price;
        }
        return updated;
      })
    );
  };

  const addItem = () => {
    const newItem: FeeItem = {
      id: `item-${Date.now()}`,
      sap_no: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      amount: 0,
      paint_check: ''
    };
    setFeeItems([...feeItems, newItem]);
  };

  const removeItem = (id: string) => {
    if (feeItems.length === 1) return;
    setFeeItems(feeItems.filter(item => item.id !== id));
  };

  const activeBrandObj = brands.find(b => b.id === selectedBrandId) || brands[0];
  const activeBranchObj = branches.find(b => b.id === selectedBranchId) || branches[0];

  const handleSave = () => {
    if (!customerName || !phone || !plateNo) {
      alert('Please fill in Customer Name, Phone Number, and Plate Number.');
      return;
    }

    const savedRecord: Quotation = {
      id: editingQuotation?.id || `q-${Date.now()}`,
      quotation_no: quotationNo,
      brand_id: selectedBrandId,
      branch_id: selectedBranchId,
      brand_name: activeBrandObj?.brand_name,
      branch_name: activeBranchObj?.branch_name,
      customer_name: customerName,
      phone,
      plate_no: plateNo,
      vehicle_model: vehicleModel,
      color,
      vin,
      mileage: Number(mileage) || 0,
      battery,
      fuel_gauge: fuelGauge,
      after_sale: afterSale,
      address,
      description,
      repair_recommendation: repairRecommendation,
      fee_items: feeItems,
      subtotal,
      vat,
      total_amount: totalAmount,
      status: status,
      created_by: editingQuotation?.created_by || currentUser?.id || 'u-1',
      created_by_name: editingQuotation?.created_by_name || currentUser?.name || 'Service User',
      created_date: editingQuotation?.created_date || new Date().toISOString().split('T')[0],
      updated_at: editingQuotation ? new Date().toISOString() : undefined
    };

    const existing = StorageService.getQuotations();
    const updated = editingQuotation
      ? existing.map(quotation => quotation.id === editingQuotation.id ? savedRecord : quotation)
      : [savedRecord, ...existing];
    StorageService.saveQuotations(updated);
    setSavedQuotation(savedRecord);
    setPreviewMode(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Control Actions */}
      <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-2xs flex items-center justify-between border border-slate-200/90 no-print">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl shadow-2xs shrink-0 font-bold border border-red-200">
            <FileText className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">
              {editingQuotation ? 'Edit Service Quotation' : 'Create Service Quotation'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">Ref No: <span className="font-mono font-bold text-red-600">{quotationNo}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {previewMode ? (
            <>
              <button
                onClick={() => setPreviewMode(false)}
                className="btn-navy"
              >
                Back to Edit
              </button>
              <button
                onClick={() => exportToPDF('quotation-pdf-document', quotationNo)}
                className="btn-crimson"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={printDocument}
                className="btn-navy"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>Print Document</span>
              </button>
              {onConvertToReceipt && savedQuotation && (
                <button
                  onClick={() => onConvertToReceipt(savedQuotation)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Convert to Receipt</span>
                </button>
              )}
              <button
                onClick={onSaved}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Done / Return to List</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleSave}
              className="btn-gold"
            >
              <Save className="w-4 h-4" />
              <span>{editingQuotation ? 'Save Quotation Changes' : 'Save & Generate Document'}</span>
            </button>
          )}
        </div>
      </div>

      {previewMode && savedQuotation ? (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2.5 no-print">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Quotation {savedQuotation.quotation_no} saved successfully! Printable A4 document standard ready below.</span>
          </div>
          <QuotationPDF quotation={savedQuotation} settings={settings} />
        </div>
      ) : (
        <div className="pro-card p-6 space-y-6">
          {/* Organization & Status Options */}
          <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2 font-heading">
                Select Vehicle Brand (ម៉ាកយីហោរថយន្ត) <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {brands.map(b => {
                  const isBYD = b.brand_code === 'BYD' || b.id.includes('byd');
                  const isSelected = selectedBrandId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedBrandId(b.id);
                        const preferredBranch = getPreferredBranchId(b.id);
                        if (preferredBranch) setSelectedBranchId(preferredBranch);
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? isBYD
                            ? 'bg-red-50/90 border-red-600 shadow-xs text-red-950'
                            : 'bg-blue-50/90 border-blue-600 shadow-xs text-blue-950'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-2xs font-heading ${
                          isSelected
                            ? isBYD
                              ? 'bg-red-600 text-white'
                              : 'bg-blue-900 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {b.brand_code}
                        </div>
                        <div className="text-left">
                          <div className="font-extrabold text-xs font-heading text-slate-900">{b.brand_name}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{b.service_center_name}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold ${
                          isBYD ? 'bg-red-600' : 'bg-blue-600'
                        }`}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Branch</label>
                <select
                  value={selectedBranchId}
                  onChange={e => setSelectedBranchId(e.target.value)}
                  className="pro-input font-bold"
                >
                  {availableBranches.map(br => (
                    <option key={br.id} value={br.id}>{br.branch_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quotation Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as Quotation['status'])}
                  className="pro-input font-bold text-amber-700 bg-amber-50/50 border-amber-200"
                >
                  <option value="Draft">Draft</option>
                  <option value="Quotation">Quotation</option>
                  <option value="Pending">Pending</option>
                  <option value="Sent">Sent</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Converted">Converted</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-red-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
                Customer & Vehicle Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Mr. Sokha Chan"
                  className="pro-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +855 12 345 678"
                  className="pro-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plate Number <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={plateNo}
                  onChange={e => setPlateNo(e.target.value)}
                  placeholder="e.g. 2C-9988"
                  className="pro-input font-bold text-red-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Model</label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={e => setVehicleModel(e.target.value)}
                  placeholder="e.g. BYD SEAL, BYD ATTO 3, DENZA D9"
                  className="pro-input font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Color</label>
                <input
                  type="text"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  placeholder="e.g. Ski White"
                  className="pro-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">VIN Number (17 Chars)</label>
                <input
                  type="text"
                  value={vin}
                  onChange={e => setVin(e.target.value.toUpperCase())}
                  placeholder="LC0BYD..."
                  className="pro-input font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mileage (km)</label>
                <input
                  type="number"
                  value={mileage}
                  onChange={e => setMileage(Number(e.target.value))}
                  placeholder="15000"
                  className="pro-input font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address (អាស័យដ្ឋាន)</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Phnom Penh, Cambodia"
                  className="pro-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">After Sale Service (តំរូវការជួសជុល)</label>
                <input
                  type="text"
                  value={afterSale}
                  onChange={e => setAfterSale(e.target.value)}
                  placeholder="e.g. Routine Maintenance & Inspection"
                  className="pro-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Gauge (កម្រិតប្រេង)</label>
                <input
                  type="text"
                  value={fuelGauge}
                  onChange={e => setFuelGauge(e.target.value)}
                  placeholder="e.g. Full"
                  className="pro-input font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Battery Level / SOH</label>
                <input
                  type="text"
                  value={battery}
                  onChange={e => setBattery(e.target.value)}
                  placeholder="e.g. SoC 85% / SOH 98%"
                  className="pro-input font-bold text-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Service Description Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Service Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-white border border-slate-200/90 rounded-xl p-3 text-xs font-medium text-slate-900 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/10"
                placeholder="Enter client concern or routine diagnostic scope..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Repair Recommendation</label>
              <textarea
                rows={2}
                value={repairRecommendation}
                onChange={e => setRepairRecommendation(e.target.value)}
                className="w-full bg-amber-50/40 border border-amber-200/80 rounded-xl p-3 text-xs font-medium text-slate-900 focus:border-amber-600 focus:outline-none"
                placeholder="Recommended parts replacement or technical service..."
              />
            </div>
          </div>

          {/* Fee Table Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
                  Service Fee Table
                </h3>
              </div>
              <button
                onClick={addItem}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Fee Line</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200/90">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-heading font-extrabold uppercase text-[11px] tracking-wider border-b border-slate-200/90">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3 w-28">SAP No.</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-3 w-24 text-center">Qty</th>
                    <th className="py-3 px-3 w-32 text-right">Unit Price ($)</th>
                    <th className="py-3 px-3 w-28 text-center">Paint / Check</th>
                    <th className="py-3 px-4 w-32 text-right">Amount ($)</th>
                    <th className="py-3 px-3 w-14 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {feeItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 text-slate-400 font-bold text-center">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.sap_no || ''}
                          onChange={e => handleItemChange(item.id, 'sap_no', e.target.value)}
                          placeholder="SAP-XXXXX"
                          className="pro-input py-1.5 text-xs font-mono"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="Part or Labor description"
                          className="pro-input py-1.5"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemChange(item.id, 'quantity', e.target.value)}
                          className="pro-input py-1.5 text-center font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={e => handleItemChange(item.id, 'unit_price', e.target.value)}
                          className="pro-input py-1.5 text-right font-mono font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="text"
                          value={item.paint_check || ''}
                          onChange={e => handleItemChange(item.id, 'paint_check', e.target.value)}
                          placeholder="Check / Paint"
                          className="pro-input py-1.5 text-center"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-black text-slate-900 text-sm">
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={feeItems.length === 1}
                          className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subtotal Summary Box */}
          <div className="flex justify-end pt-2">
            <div className="w-80 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-900 font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>VAT (10%):</span>
                <span className="font-mono text-slate-900 font-bold">${vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-base border-t border-slate-200 pt-2.5">
                <span className="text-red-700 font-heading">Total Quotation Amount:</span>
                <span className="font-mono text-red-700">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
