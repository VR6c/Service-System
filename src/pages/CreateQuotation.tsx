import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlert, useToast } from '../context/DialogContext';
import { StorageService } from '../services/storageService';
import type { Quotation } from '../types';
import { useFeeItems } from '../hooks/useFeeItems';
import { useDocumentForm } from '../hooks/useDocumentForm';
import { BrandBranchSelector } from '../components/common/BrandBranchSelector';
import { CustomerVehicleForm } from '../components/common/CustomerVehicleForm';
import { FeeItemsTable } from '../components/common/FeeItemsTable';
import { DocumentPreviewModal } from '../components/common/DocumentPreviewModal';
import { Select } from '../components/common/Select';
import {
  FileText,
  Save,
  Eye,
  ArrowRight,
  Sparkles,
  Building2
} from 'lucide-react';

interface CreateQuotationProps {
  onSaved: () => void;
  onConvertToReceipt?: (quotation: Quotation) => void;
  editingQuotation?: Quotation | null;
}

export const CreateQuotation: React.FC<CreateQuotationProps> = ({
  onSaved,
  onConvertToReceipt,
  editingQuotation
}) => {
  const { currentUser, switchActiveBrand } = useAuth();
  const showAlert = useAlert();
  const showToast = useToast();
  const settings = StorageService.getSettings();

  const docForm = useDocumentForm({
    initialBrandId: editingQuotation?.brand_id,
    initialBranchId: editingQuotation?.branch_id,
    initialCustomerName: editingQuotation?.customer_name || '',
    initialPhone: editingQuotation?.phone || '',
    initialPlateNo: editingQuotation?.plate_no || '',
    initialVehicleModel: editingQuotation?.vehicle_model || 'BYD SEAL',
    initialColor: editingQuotation?.color || 'Ski White',
    initialVin: editingQuotation?.vin || 'LC0BYDSEAL2026',
    initialMileage: editingQuotation?.mileage ?? 15000,
    initialBattery: editingQuotation?.battery || 'SoC 85%',
    initialDescription: editingQuotation?.description || 'Scheduled EV Maintenance & Diagnostic Check'
  });

  const handleBrandChange = (brandId: string) => {
    docForm.setSelectedBrandId(brandId);
    switchActiveBrand(brandId);
  };

  const feeState = useFeeItems({
    initialItems: editingQuotation?.fee_items,
    defaultVatRate: settings.vat_rate || 0
  });

  const [quotationNo, setQuotationNo] = useState<string>(editingQuotation?.quotation_no || '');
  const [status, setStatus] = useState<Quotation['status']>(editingQuotation?.status || 'Quotation');
  const [repairRecommendation, setRepairRecommendation] = useState<string>(
    editingQuotation?.repair_recommendation || 'Air filter check & battery diagnostics'
  );

  const [savedQuotation, setSavedQuotation] = useState<Quotation | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  useEffect(() => {
    if (editingQuotation) return;
    setQuotationNo(StorageService.generateQuotationNo(docForm.selectedBrandId, docForm.selectedBranchId));
  }, [docForm.selectedBrandId, docForm.selectedBranchId, editingQuotation]);

  const handleSave = async () => {
    if (!docForm.customerName.trim() || !docForm.phone.trim() || !docForm.plateNo.trim()) {
      await showAlert({
        title: 'Customer & Vehicle Details Required',
        message: 'Please fill in Customer Name, Phone Number, and Plate Number before proceeding with the quotation.',
        type: 'warning',
        confirmText: 'Understood'
      });
      return;
    }

    const savedRecord: Quotation = {
      id: editingQuotation?.id || `q-${Date.now()}`,
      quotation_no: quotationNo,
      brand_id: docForm.selectedBrandId,
      branch_id: docForm.selectedBranchId,
      brand_name: docForm.currentBrand?.brand_name,
      branch_name: docForm.currentBranch?.branch_name,
      customer_name: docForm.customerName,
      phone: docForm.phone,
      plate_no: docForm.plateNo,
      vehicle_model: docForm.vehicleModel,
      color: docForm.color,
      vin: docForm.vin,
      mileage: Number(docForm.mileage) || 0,
      battery: docForm.battery,
      description: docForm.description,
      repair_recommendation: repairRecommendation,
      fee_items: feeState.feeItems,
      subtotal: feeState.subtotal,
      vat: feeState.vat,
      total_amount: feeState.totalAmount,
      status: status,
      created_by: editingQuotation?.created_by || currentUser?.id || 'u-1',
      created_by_name: editingQuotation?.created_by_name || currentUser?.name || 'Service Advisor',
      created_date: editingQuotation?.created_date || new Date().toISOString().split('T')[0],
      updated_at: editingQuotation ? new Date().toISOString() : undefined
    };

    await StorageService.saveQuotation(savedRecord);
    showToast({
      type: 'success',
      title: 'Quotation Saved',
      message: `Quotation #${quotationNo} has been saved successfully.`
    });
    setSavedQuotation(savedRecord);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans animate-fade-in pb-12">
      {/* Prominent Active Brand Context Toggle at the very top (Dynamic Scope) */}
      {(docForm.isDualBrandSA || (currentUser?.role === 'Admin' && docForm.brands.length > 1)) && (
        <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-200/80 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Active Brand Context:</span>
                <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {currentUser?.role === 'Service Advisor' ? currentUser.branch : docForm.currentBranch?.branch_name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Switching context dynamically recalculates document sequence: <span className="font-mono font-extrabold text-slate-900">{quotationNo}</span>
              </p>
            </div>
          </div>

          {/* Prominent [ BYD ] | [ DENZA ] Toggle Buttons */}
          <div className="flex items-center p-1.5 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto">
            {docForm.brands
              .filter(b => currentUser?.role === 'Admin' || docForm.saAssignedBrands.includes(b.id))
              .map(brand => {
                const isSelected = docForm.selectedBrandId === brand.id;
                const isByd = brand.brand_code === 'BYD';
                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => handleBrandChange(brand.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black tracking-wider transition-all cursor-pointer ${isSelected
                        ? isByd
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                  >
                    <span>{isByd ? 'BYD' : 'DENZA'}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Single-Brand SA Scope Locked Notice */}
      {docForm.isSingleBrandLocked && (
        <div className="bg-white rounded-2xl p-3.5 px-5 shadow-2xs border border-slate-200/90 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 font-bold text-slate-700">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Assigned Workshop Floor: <span className="font-extrabold text-slate-900">{currentUser?.branch}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Locked Brand Scope:</span>
            <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
              {docForm.currentBrand?.brand_name}
            </span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200/90">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/80 shrink-0">
            <FileText className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
              {editingQuotation ? 'Edit Quotation' : 'Create Service Quotation'}
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Ref: <span className="font-mono font-extrabold text-blue-600">{quotationNo}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedQuotation && (
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition shadow-2xs"
            >
              <Eye className="w-4 h-4" />
              Preview PDF
            </button>
          )}

          {editingQuotation && onConvertToReceipt && (
            <button
              type="button"
              onClick={() => onConvertToReceipt(editingQuotation)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition shadow-2xs"
            >
              <ArrowRight className="w-4 h-4" />
              Convert to Receipt
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Quotation
          </button>
        </div>
      </div>

      {/* Brand & Branch Selector Component */}
      <BrandBranchSelector
        brands={docForm.brands}
        branches={docForm.branches}
        selectedBrandId={docForm.selectedBrandId}
        selectedBranchId={docForm.selectedBranchId}
        onBrandChange={handleBrandChange}
        onBranchChange={docForm.setSelectedBranchId}
        isBranchLocked={docForm.isBranchLocked}
        isBrandLocked={docForm.isSingleBrandLocked}
      />

      {/* Customer & Vehicle Form Component */}
      <CustomerVehicleForm
        customerName={docForm.customerName}
        onCustomerNameChange={docForm.setCustomerName}
        phone={docForm.phone}
        onPhoneChange={docForm.setPhone}
        plateNo={docForm.plateNo}
        onPlateNoChange={docForm.setPlateNo}
        vehicleModel={docForm.vehicleModel}
        onVehicleModelChange={docForm.setVehicleModel}
        color={docForm.color}
        onColorChange={docForm.setColor}
        vin={docForm.vin}
        onVinChange={docForm.setVin}
        mileage={docForm.mileage}
        onMileageChange={docForm.setMileage}
        battery={docForm.battery}
        onBatteryChange={docForm.setBattery}
        description={docForm.description}
        onDescriptionChange={docForm.setDescription}
      />

      {/* Quotation Status & Technical Repair Recommendation Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <Select
            label="Quotation Status"
            value={status}
            onChange={val => setStatus(val as Quotation['status'])}
            options={[
              { value: 'Draft', label: 'Draft' },
              { value: 'Sent', label: 'Sent' },
              { value: 'Accepted', label: 'Accepted' },
              { value: 'Quotation', label: 'Quotation (Default)' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Converted', label: 'Converted' },
              { value: 'Expired', label: 'Expired' }
            ]}
          />
        </div>
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
            Technical Repair Recommendations
          </label>
          <textarea
            rows={2}
            value={repairRecommendation}
            onChange={e => setRepairRecommendation(e.target.value)}
            placeholder="Specify technical advice or recommended repairs..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
          />
        </div>
      </div>

      {/* Reusable Fee Items Table Component */}
      <FeeItemsTable
        feeItems={feeState.feeItems}
        onAddItem={feeState.addItem}
        onRemoveItem={feeState.removeItem}
        onUpdateItem={feeState.updateItem}
        subtotal={feeState.subtotal}
        vat={feeState.vat}
        totalAmount={feeState.totalAmount}
        currencySymbol={settings.currency_symbol}
        showSapAndStock={true}
      />

      {/* Bottom Save Action Bar */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onSaved}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition shadow-md"
        >
          <Save className="w-4 h-4" />
          Save & View Preview
        </button>
      </div>

      {/* Unified Preview Modal */}
      {savedQuotation && (
        <DocumentPreviewModal
          type="quotation"
          quotation={savedQuotation}
          brand={docForm.currentBrand}
          branch={docForm.currentBranch}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            onSaved();
          }}
        />
      )}
    </div>
  );
};
