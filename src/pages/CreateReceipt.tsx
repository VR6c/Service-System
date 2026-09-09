import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import { sendTelegramReminder } from '../services/telegramService';
import type { Receipt, ReceiptStatus, Quotation } from '../types';
import { useFeeItems } from '../hooks/useFeeItems';
import { useDocumentForm } from '../hooks/useDocumentForm';
import { BrandBranchSelector } from '../components/common/BrandBranchSelector';
import { CustomerVehicleForm } from '../components/common/CustomerVehicleForm';
import { FeeItemsTable } from '../components/common/FeeItemsTable';
import { DocumentPreviewModal } from '../components/common/DocumentPreviewModal';
import { TimePicker } from '../components/common/TimePicker';
import { DatePicker } from '../components/common/DatePicker';
import { Select } from '../components/common/Select';
import {
  FileCheck,
  Save,
  Eye,
  Bell,
  Clock,
  Wrench
} from 'lucide-react';

interface CreateReceiptProps {
  initialQuotation?: Quotation | null;
  editingReceipt?: Receipt | null;
  onSaved?: (receipt: Receipt) => void;
}

export const CreateReceipt: React.FC<CreateReceiptProps> = ({
  initialQuotation,
  editingReceipt,
  onSaved
}) => {
  const { currentUser } = useAuth();
  const settings = StorageService.getSettings();

  const docForm = useDocumentForm({
    initialBrandId: editingReceipt?.brand_id || initialQuotation?.brand_id,
    initialBranchId: editingReceipt?.branch_id || initialQuotation?.branch_id,
    initialCustomerName: editingReceipt?.customer_name || initialQuotation?.customer_name || '',
    initialPhone: editingReceipt?.phone || initialQuotation?.phone || '',
    initialPlateNo: editingReceipt?.plate_no || initialQuotation?.plate_no || '',
    initialVehicleModel: editingReceipt?.vehicle_model || initialQuotation?.vehicle_model || '',
    initialColor: editingReceipt?.color || initialQuotation?.color || '',
    initialVin: editingReceipt?.vin || initialQuotation?.vin || '',
    initialMileage: editingReceipt?.mileage ?? initialQuotation?.mileage ?? 0,
    initialBattery: editingReceipt?.battery || initialQuotation?.battery || 'SoC 85%',
    initialDescription: editingReceipt?.description || initialQuotation?.description || ''
  });

  const feeState = useFeeItems({
    initialItems: editingReceipt?.fee_items || initialQuotation?.fee_items,
    defaultVatRate: settings.vat_rate || 0
  });

  // Receipt specific states
  const [receiptNo, setReceiptNo] = useState<string>(editingReceipt?.receipt_no || '');
  const [status, setStatus] = useState<ReceiptStatus>(editingReceipt?.status || 'Completed');
  const [saName, setSaName] = useState<string>(
    editingReceipt?.sa_name || currentUser?.default_sa || currentUser?.name || 'Service Advisor'
  );

  const [inTime, setInTime] = useState<string>(editingReceipt?.in_time || '08:30 AM');
  const [outTime, setOutTime] = useState<string>(editingReceipt?.out_time || '04:30 PM');
  const [isOwner, setIsOwner] = useState<boolean>(editingReceipt?.is_owner ?? true);
  const [isSender, setIsSender] = useState<boolean>(editingReceipt?.is_sender ?? false);

  const [buyTime, setBuyTime] = useState<string>(
    editingReceipt?.buy_time || new Date().toISOString().split('T')[0]
  );
  const [remindDate, setRemindDate] = useState<string>(
    editingReceipt?.remind_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [warehouseKeeper, setWarehouseKeeper] = useState<string>(editingReceipt?.warehouse_keeper || '');
  const [estimatedRepairDate, setEstimatedRepairDate] = useState<string>(
    editingReceipt?.estimated_repaired_date || new Date().toISOString().split('T')[0]
  );
  const [serviceReminder, setServiceReminder] = useState<string>(
    editingReceipt?.service_reminder || 'Next scheduled EV service at 30,000 km.'
  );
  const [oldPartsAction, setOldPartsAction] = useState<'Take away' | 'Give up'>(
    editingReceipt?.old_parts_action || 'Take away'
  );
  const [repairConfirmCustomer, setRepairConfirmCustomer] = useState<string>(
    editingReceipt?.repair_confirm_customer || ''
  );

  const [savedReceipt, setSavedReceipt] = useState<Receipt | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  useEffect(() => {
    if (editingReceipt) return;
    setReceiptNo(StorageService.generateReceiptNo(docForm.selectedBrandId, docForm.selectedBranchId));
  }, [docForm.selectedBrandId, docForm.selectedBranchId, editingReceipt]);

  const handleSendTelegramNow = async () => {
    if (!docForm.customerName || !docForm.vehicleModel || !docForm.plateNo) {
      alert('Please fill in Customer Name, Vehicle Model, and Plate Number first.');
      return;
    }
    const res = await sendTelegramReminder({
      customer_name: docForm.customerName,
      vehicle_model: docForm.vehicleModel,
      plate_no: docForm.plateNo,
      remind_date: remindDate,
      phone: docForm.phone
    });

    if (res.success) {
      alert(`✅ Telegram Reminder Sent!\n\nCustomer: ${docForm.customerName}\nVehicle: ${docForm.vehicleModel}\nPlate: ${docForm.plateNo}\nRemind Date: ${remindDate}`);
    } else {
      alert(`⚠️ Telegram Notification Error:\n${res.message}`);
    }
  };

  const handleSave = async () => {
    if (!docForm.customerName || !docForm.phone || !docForm.plateNo) {
      alert('Please fill in Customer Name, Phone Number, and Plate Number.');
      return;
    }

    const savedRecord: Receipt = {
      id: editingReceipt?.id || `r-${Date.now()}`,
      receipt_no: receiptNo,
      brand_id: docForm.selectedBrandId,
      branch_id: docForm.selectedBranchId,
      brand_name: docForm.currentBrand?.brand_name,
      branch_name: docForm.currentBranch?.branch_name,
      quotation_id: initialQuotation?.id,
      customer_name: docForm.customerName,
      phone: docForm.phone,
      plate_no: docForm.plateNo,
      battery: docForm.battery,
      vehicle_model: docForm.vehicleModel,
      color: docForm.color,
      mileage: Number(docForm.mileage) || 0,
      vin: docForm.vin,
      buy_time: buyTime,
      description: docForm.description,
      fee_items: feeState.feeItems,
      subtotal: feeState.subtotal,
      vat: feeState.vat,
      total_amount: feeState.totalAmount,
      status: status,
      created_by: editingReceipt?.created_by || currentUser?.id || 'u-1',
      created_by_name: editingReceipt?.created_by_name || currentUser?.name || 'Service Advisor',
      created_date: editingReceipt?.created_date || new Date().toISOString().split('T')[0],
      remind_date: remindDate,
      sa_name: saName,
      in_time: inTime,
      out_time: outTime,
      estimated_repaired_date: estimatedRepairDate,
      is_owner: isOwner,
      is_sender: isSender,
      warehouse_keeper: warehouseKeeper,
      service_reminder: serviceReminder,
      old_parts_action: oldPartsAction,
      repair_confirm_customer: repairConfirmCustomer,
      updated_at: editingReceipt ? new Date().toISOString() : undefined
    };

    await StorageService.saveReceipt(savedRecord);
    setSavedReceipt(savedRecord);
    setIsPreviewOpen(true);
    if (onSaved) onSaved(savedRecord);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200/90">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shrink-0">
            <FileCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
              {editingReceipt ? 'Edit Service Receipt' : 'Create Service Receipt'}
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Receipt No: <span className="font-mono font-extrabold text-emerald-600">{receiptNo}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSendTelegramNow}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition border border-sky-200"
          >
            <Bell className="w-4 h-4 text-sky-600" />
            Send Telegram
          </button>

          {savedReceipt && (
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition shadow-2xs"
            >
              <Eye className="w-4 h-4" />
              Preview Receipt
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Receipt
          </button>
        </div>
      </div>

      {/* Brand & Branch Selector Component */}
      <BrandBranchSelector
        brands={docForm.brands}
        branches={docForm.branches}
        selectedBrandId={docForm.selectedBrandId}
        selectedBranchId={docForm.selectedBranchId}
        onBrandChange={docForm.setSelectedBrandId}
        onBranchChange={docForm.setSelectedBranchId}
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
        isOwner={isOwner}
        onIsOwnerChange={setIsOwner}
        isSender={isSender}
        onIsSenderChange={setIsSender}
      />

      {/* Service Advisor & Workshop Reception Timings */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          Service Advisor & Reception Timings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Select
              label="Receipt Status"
              value={status}
              onChange={val => setStatus(val as ReceiptStatus)}
              options={['Pending', 'Completed', 'Delivered', 'Cancelled']}
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Service Advisor (SA)
            </label>
            <input
              type="text"
              value={saName}
              onChange={e => setSaName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Time In
            </label>
            <TimePicker value={inTime} onChange={setInTime} placeholder="Select In Time" />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Estimated Delivery Time
            </label>
            <TimePicker value={outTime} onChange={setOutTime} placeholder="Select Out Time" />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Est. Repair Date
            </label>
            <DatePicker value={estimatedRepairDate} onChange={setEstimatedRepairDate} placeholder="Est. repair date" />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Customer Confirmation
            </label>
            <input
              type="text"
              value={repairConfirmCustomer}
              onChange={e => setRepairConfirmCustomer(e.target.value)}
              placeholder="e.g. Confirmed by Phone / App"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
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

      {/* Additional Service Details */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-600" />
          Warehouse & Parts Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Warehouse Keeper
            </label>
            <input
              type="text"
              value={warehouseKeeper}
              onChange={e => setWarehouseKeeper(e.target.value)}
              placeholder="e.g. Mengly Ly"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <Select
              label="Old Parts Handling"
              value={oldPartsAction}
              onChange={val => setOldPartsAction(val as 'Take away' | 'Give up')}
              options={[
                { value: 'Take away', label: 'Take away by customer' },
                { value: 'Give up', label: 'Disposed / Give up' }
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Next Service Reminder Date
            </label>
            <DatePicker value={remindDate} onChange={setRemindDate} placeholder="Select date" />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Vehicle Purchase Date
            </label>
            <DatePicker value={buyTime} onChange={setBuyTime} placeholder="Buy date" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Service Reminder Note
            </label>
            <input
              type="text"
              value={serviceReminder}
              onChange={e => setServiceReminder(e.target.value)}
              placeholder="e.g. Next scheduled EV service at 30,000 km."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Action Bar */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition shadow-md cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save & View Receipt PDF
        </button>
      </div>

      {/* Unified Preview Modal */}
      {savedReceipt && (
        <DocumentPreviewModal
          type="receipt"
          receipt={savedReceipt}
          brand={docForm.currentBrand}
          branch={docForm.currentBranch}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
          }}
        />
      )}
    </div>
  );
};
