import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { StorageService } from '../services/storageService';
import { sendTelegramReminder } from '../services/telegramService';
import type { Receipt, ReceiptStatus, FeeItem, Quotation } from '../types';
import { ReceiptPreviewModal } from '../components/pdf/ReceiptPreviewModal';
import { TimePicker } from '../components/common/TimePicker';
import { DatePicker } from '../components/common/DatePicker';
import {
  FileCheck,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  RotateCcw,
  Send,
  Bell
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
  const { currentUser, brands, branches } = useAuth();
  const { t } = useLanguage();

  // Helper to resolve user's assigned branch for a brand
  const getPreferredBranchId = (targetBrandId: string) => {
    const brandBranches = branches.filter(br => br.brand_id === targetBrandId);
    const userAssignedBranchId = currentUser?.default_branch_id || currentUser?.brand_id;
    const userMatch = brandBranches.find(br => br.id === userAssignedBranchId);
    if (userMatch) {
      return userMatch.id;
    }
    return brandBranches[0]?.id || '';
  };

  // Brand and Branch selections
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    editingReceipt?.brand_id || currentUser?.default_brand_id || currentUser?.brand_id || brands[0]?.id || 'brand-byd'
  );

  const availableBranches = branches.filter(b => b.brand_id === selectedBrandId);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    editingReceipt?.branch_id || getPreferredBranchId(selectedBrandId) || availableBranches[0]?.id || ''
  );

  // Document Number & Status
  const [receiptNo, setReceiptNo] = useState<string>(editingReceipt?.receipt_no || '');
  const [status, setStatus] = useState<ReceiptStatus>(editingReceipt?.status || 'Completed');

  // SA & Time
  const [saName, setSaName] = useState<string>(editingReceipt?.sa_name || currentUser?.default_sa || currentUser?.name || 'Sarah Jenkins');
  const [inTime, setInTime] = useState<string>(editingReceipt?.in_time || '08:30 AM');
  const [outTime, setOutTime] = useState<string>(editingReceipt?.out_time || '04:30 PM');

  // Sync organization and service advisor defaults from the current user profile.
  useEffect(() => {
    if (editingReceipt) return;
    if (currentUser) {
      setSaName(currentUser.default_sa || currentUser.name || 'Alex Mercer');
      
      const targetBrandId = currentUser.default_brand_id || currentUser.brand_id || brands[0]?.id || 'brand-byd';
      if (brands.some(b => b.id === targetBrandId)) {
        setSelectedBrandId(targetBrandId);
        const preferredBranch = getPreferredBranchId(targetBrandId);
        if (preferredBranch) {
          setSelectedBranchId(preferredBranch);
        }
      }
    }
  }, [currentUser, brands, branches, editingReceipt]);

  // Customer & Vehicle
  const [isOwner, setIsOwner] = useState<boolean>(editingReceipt?.is_owner ?? true);
  const [isSender, setIsSender] = useState<boolean>(editingReceipt?.is_sender ?? false);
  const [customerName, setCustomerName] = useState<string>(editingReceipt?.customer_name || '');
  const [phone, setPhone] = useState<string>(editingReceipt?.phone || '');
  const [plateNo, setPlateNo] = useState<string>(editingReceipt?.plate_no || '');
  const [battery, setBattery] = useState<string>(editingReceipt?.battery || 'SoC 85%');
  const [vehicleModel, setVehicleModel] = useState<string>(editingReceipt?.vehicle_model || '');
  const [color, setColor] = useState<string>(editingReceipt?.color || '');
  const [mileage, setMileage] = useState<number>(editingReceipt?.mileage ?? 0);
  const [vin, setVin] = useState<string>(editingReceipt?.vin || '');
  const [buyTime, setBuyTime] = useState<string>(editingReceipt?.buy_time || new Date().toISOString().split('T')[0]);
  const [remindDate, setRemindDate] = useState<string>(
    editingReceipt?.remind_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [description, setDescription] = useState<string>(editingReceipt?.description || '');

  const setPresetRemindDate = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setRemindDate(d.toISOString().split('T')[0]);
  };

  const handleSendTelegramNow = async () => {
    if (!customerName || !vehicleModel || !plateNo) {
      alert('Please fill in Customer Name, Vehicle Model, and Plate Number first.');
      return;
    }
    const res = await sendTelegramReminder({
      customer_name: customerName,
      vehicle_model: vehicleModel,
      plate_no: plateNo,
      remind_date: remindDate,
      phone: phone
    });

    if (res.success) {
      alert(`✅ Telegram Reminder Sent to Group!\n\n- Customer Name : ${customerName}\n- Car Model : ${vehicleModel}\n- Plate Number : ${plateNo}\n- Date : ${remindDate}\n- Phone Number : ${phone}`);
    } else {
      alert(`⚠️ Telegram Notification Error:\n${res.message}`);
    }
  };

  // Repair & Charge Fee Items
  const [feeItems, setFeeItems] = useState<FeeItem[]>(editingReceipt?.fee_items.map(item => ({ ...item })) || [
    {
      id: 'rf-1',
      description: 'Scheduled EV Service & Inspection',
      quantity: 1,
      unit_price: 120,
      amount: 120,
      sap_no: 'BYD-1001',
      stock_yes_no: 'YES',
      warranty_yes_no: 'YES'
    }
  ]);

  // Repair / Service Details
  const [warehouseKeeper, setWarehouseKeeper] = useState<string>(editingReceipt?.warehouse_keeper || '');
  const [estimatedRepairDate, setEstimatedRepairDate] = useState<string>(
    editingReceipt?.estimated_repaired_date || new Date().toISOString().split('T')[0]
  );
  const [serviceReminder, setServiceReminder] = useState<string>(
    editingReceipt?.service_reminder || 'Next scheduled EV service at 30,000 km or August 2027.'
  );
  const [oldPartsAction, setOldPartsAction] = useState<'Take away' | 'Give up'>(editingReceipt?.old_parts_action || 'Take away');
  const [repairConfirmCustomer, setRepairConfirmCustomer] = useState<string>(editingReceipt?.repair_confirm_customer || '');

  // Complete & Delivery Section
  const [technician, setTechnician] = useState<string>(editingReceipt?.completion?.technician || '');
  const [finishedDate] = useState<string>(editingReceipt?.completion?.finished_date || new Date().toISOString().split('T')[0]);
  const [qa, setQa] = useState<string>(editingReceipt?.completion?.qa || '');
  const [assManagerConfirm, setAssManagerConfirm] = useState<string>(editingReceipt?.completion?.ass_manager_confirm || '');
  const [deliveryDate] = useState<string>(editingReceipt?.completion?.delivery_date || new Date().toISOString().split('T')[0]);
  const [deliveryPerson, setDeliveryPerson] = useState<string>(editingReceipt?.completion?.delivery_person || '');
  const [accounting, setAccounting] = useState<string>(editingReceipt?.completion?.accounting || '');
  const [customerConfirm, setCustomerConfirm] = useState<string>(editingReceipt?.completion?.customer_confirm || '');

  // Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Update receipt number when brand or branch changes
  useEffect(() => {
    if (editingReceipt) return;
    const nextNo = StorageService.generateReceiptNo(selectedBrandId, selectedBranchId);
    setReceiptNo(nextNo);
  }, [selectedBrandId, selectedBranchId, editingReceipt]);

  // Load from converted quotation if passed
  useEffect(() => {
    if (initialQuotation && !editingReceipt) {
      if (initialQuotation.brand_id) setSelectedBrandId(initialQuotation.brand_id);
      if (initialQuotation.branch_id) setSelectedBranchId(initialQuotation.branch_id);
      setCustomerName(initialQuotation.customer_name);
      setPhone(initialQuotation.phone);
      setPlateNo(initialQuotation.plate_no);
      setVehicleModel(initialQuotation.vehicle_model);
      setColor(initialQuotation.color);
      setVin(initialQuotation.vin);
      setMileage(initialQuotation.mileage);
      setBattery(initialQuotation.battery);
      setDescription(initialQuotation.description);
      setRepairConfirmCustomer(initialQuotation.customer_name);
      setCustomerConfirm(initialQuotation.customer_name);

      if (initialQuotation.fee_items && initialQuotation.fee_items.length > 0) {
        setFeeItems(
          initialQuotation.fee_items.map((item, idx) => ({
            ...item,
            sap_no: item.sap_no || `BYD-${1001 + idx}`,
            stock_yes_no: 'YES',
            warranty_yes_no: 'YES'
          }))
        );
      }
    }
  }, [initialQuotation, editingReceipt]);

  // Fee calculation helpers
  const handleItemChange = (id: string, field: keyof FeeItem, value: any) => {
    setFeeItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          const q = field === 'quantity' ? Number(value) : item.quantity;
          const p = field === 'unit_price' ? Number(value) : item.unit_price;
          updated.amount = (isNaN(q) ? 0 : q) * (isNaN(p) ? 0 : p);
        }
        return updated;
      })
    );
  };

  const addFeeItem = () => {
    const newItem: FeeItem = {
      id: `rf-${Date.now()}`,
      description: '',
      quantity: 1,
      unit_price: 0,
      amount: 0,
      sap_no: `BYD-${1000 + feeItems.length + 1}`,
      stock_yes_no: 'YES',
      warranty_yes_no: 'YES'
    };
    setFeeItems([...feeItems, newItem]);
  };

  const removeFeeItem = (id: string) => {
    if (feeItems.length === 1) return;
    setFeeItems(feeItems.filter(item => item.id !== id));
  };

  const subtotal = feeItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const vat = subtotal * 0.10;
  const totalAmount = subtotal + vat;

  // Selected Brand and Branch objects for previewing
  const activeBrandObj = brands.find(b => b.id === selectedBrandId) || brands[0];
  const activeBranchObj = branches.find(b => b.id === selectedBranchId) || branches[0];

  // Build temporary receipt data object
  const currentReceiptObject: Receipt = {
    id: editingReceipt?.id || `r-${Date.now()}`,
    receipt_no: receiptNo,
    brand_id: selectedBrandId,
    branch_id: selectedBranchId,
    brand_name: activeBrandObj?.brand_name,
    branch_name: activeBranchObj?.branch_name,
    quotation_id: editingReceipt?.quotation_id || initialQuotation?.id,
    customer_name: customerName || 'Valued Customer',
    phone: phone || '+855 12 000 000',
    plate_no: plateNo || '2C-0000',
    battery: battery || 'SoC 85%',
    vehicle_model: vehicleModel || 'BYD Vehicle',
    color: color || 'Standard',
    mileage: mileage || 0,
    vin: vin || 'VIN-00000000000000',
    buy_time: buyTime,
    remind_date: remindDate,
    description: description || 'Vehicle Service',
    fee_items: feeItems,
    subtotal: subtotal,
    vat: vat,
    total_amount: totalAmount,
    sa_name: saName,
    in_time: inTime,
    out_time: outTime,
    is_owner: isOwner,
    is_sender: isSender,
    warehouse_keeper: warehouseKeeper,
    estimated_repaired_date: estimatedRepairDate,
    service_reminder: serviceReminder,
    old_parts_action: oldPartsAction,
    repair_confirm_customer: repairConfirmCustomer || customerName,
    completion: {
      technician: technician,
      finished_date: finishedDate,
      qa: qa,
      ass_manager_confirm: assManagerConfirm,
      delivery_date: deliveryDate,
      delivery_person: deliveryPerson,
      accounting: accounting,
      customer_confirm: customerConfirm || customerName
    },
    status: status,
    created_by: editingReceipt?.created_by || currentUser?.id || 'u-1',
    created_by_name: editingReceipt?.created_by_name || currentUser?.name || 'Service Advisor',
    created_date: editingReceipt?.created_date || new Date().toISOString().split('T')[0],
    updated_at: editingReceipt ? new Date().toISOString() : undefined
  };

  const handleSave = () => {
    if (!customerName || !vehicleModel || !plateNo) {
      alert('Please fill in required fields: Customer Name, Vehicle Model, and Plate Number.');
      return;
    }

    const receipts = StorageService.getReceipts();
    const completedReceipt = { ...currentReceiptObject, status: status };
    const updatedReceipts = editingReceipt
      ? receipts.map(receipt => receipt.id === editingReceipt.id ? completedReceipt : receipt)
      : [completedReceipt, ...receipts];
    StorageService.saveReceipts(updatedReceipts);

    if (onSaved) {
      onSaved(completedReceipt);
    } else {
      alert(`Receipt ${receiptNo} saved successfully!`);
    }
  };

  const handleSaveDraft = () => {
    if (!customerName || !vehicleModel || !plateNo) {
      alert('Please fill in required fields: Customer Name, Vehicle Model, and Plate Number.');
      return;
    }

    const draftReceipt: Receipt = {
      ...currentReceiptObject,
      status: 'Pending'
    };

    const receipts = StorageService.getReceipts();
    const updatedReceipts = editingReceipt
      ? receipts.map(receipt => receipt.id === editingReceipt.id ? draftReceipt : receipt)
      : [draftReceipt, ...receipts];
    StorageService.saveReceipts(updatedReceipts);

    if (onSaved) {
      onSaved(draftReceipt);
    } else {
      alert(`Receipt Draft ${receiptNo} saved!`);
    }
  };

  const handleReset = () => {
    setCustomerName('');
    setPhone('');
    setPlateNo('');
    setVehicleModel('');
    setColor('');
    setVin('');
    setMileage(0);
    setDescription('');
    setFeeItems([
      {
        id: `rf-${Date.now()}`,
        description: '',
        quantity: 1,
        unit_price: 0,
        amount: 0,
        sap_no: 'BYD-1001',
        stock_yes_no: 'YES',
        warranty_yes_no: 'YES'
      }
    ]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl p-5 text-slate-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/90">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-50 text-red-600 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-widest font-heading border border-red-200 shadow-2xs">
              Official Master Template
            </span>
            <span className="text-xs text-slate-500 font-mono font-bold">Form Code: BYD60M-R</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight font-heading mt-1 text-slate-900">
            {editingReceipt ? 'Edit Receipt' : 'Create Receipt'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Digital data entry auto-converts to the exact A4 BYD / DENZA company paper receipt layout.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="btn-navy"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>Preview A4</span>
          </button>
          <button
            onClick={handleSave}
            className="btn-crimson"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{editingReceipt ? 'Save Receipt Changes' : 'Save Receipt'}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Area: Digital Form (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. RECEIPT INFORMATION */}
          <div className="pro-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 font-heading uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-red-600" />
                1. Receipt Information
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ✓ Auto-filled from User Profile
              </span>
            </div>

            {/* Prominent Vehicle Brand Selector for Service Advisors (BYD vs DENZA) */}
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 space-y-3">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
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
                      className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer ${
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

            {/* Read-only / Auto-filled Profile Header Bar */}
            <div className="bg-slate-50/90 rounded-xl p-4 text-slate-900 shadow-2xs border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl text-white font-black flex items-center justify-center text-base shadow-2xs shrink-0 font-heading border ${
                  activeBrandObj?.brand_code === 'DENZA'
                    ? 'bg-gradient-to-br from-blue-700 to-blue-950 border-blue-500/30'
                    : 'bg-gradient-to-br from-red-600 to-red-800 border-red-500/30'
                }`}>
                  {saName?.charAt(0) || 'A'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 font-heading text-sm">{activeBrandObj?.brand_name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      activeBrandObj?.brand_code === 'DENZA'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {activeBranchObj?.branch_code || '6A'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    SA: <strong className="text-slate-900 font-bold">{saName}</strong> • Date: <span className="font-mono text-slate-600 font-semibold">{new Date().toISOString().split('T')[0]}</span>
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Receipt No</span>
                <span className={`text-sm font-black font-mono ${
                  activeBrandObj?.brand_code === 'DENZA' ? 'text-blue-800' : 'text-red-600'
                }`}>{receiptNo}</span>
              </div>
            </div>

            {/* In / Out Time, Status & Service Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
              <div>
                <TimePicker
                  label="In Time"
                  value={inTime}
                  onChange={setInTime}
                  placeholder="08:30 AM"
                />
              </div>

              <div>
                <TimePicker
                  label="Out Time"
                  value={outTime}
                  onChange={setOutTime}
                  placeholder="04:30 PM"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ReceiptStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Branch Center</label>
                <select
                  value={selectedBranchId}
                  onChange={e => setSelectedBranchId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                >
                  {availableBranches.map(br => (
                    <option key={br.id} value={br.id}>{br.branch_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. CUSTOMER & VEHICLE */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
            <h3 className="text-sm font-black text-slate-900 font-heading uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              2. Customer & Vehicle Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 py-1 col-span-full">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOwner}
                    onChange={e => setIsOwner(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  Owner
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSender}
                    onChange={e => setIsSender(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  Sender
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Enter customer full name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+855 12 345 678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plate Number <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={plateNo}
                  onChange={e => setPlateNo(e.target.value)}
                  placeholder="e.g. 2C-9988"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-red-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Model <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={e => setVehicleModel(e.target.value)}
                  placeholder="e.g. BYD Seal AWD / DENZA D9"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Color</label>
                <input
                  type="text"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  placeholder="e.g. Aurora White"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Battery Condition</label>
                <input
                  type="text"
                  value={battery}
                  onChange={e => setBattery(e.target.value)}
                  placeholder="e.g. SoC 85% / SOH 99%"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mileage (km)</label>
                <input
                  type="number"
                  value={mileage || ''}
                  onChange={e => setMileage(Number(e.target.value))}
                  placeholder="12500"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">VIN Number</label>
                <input
                  type="text"
                  value={vin}
                  onChange={e => setVin(e.target.value)}
                  placeholder="LC0BYDSEAL..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Buy Time</label>
                <DatePicker
                  value={buyTime}
                  onChange={setBuyTime}
                  placeholder="Select Buy Date"
                />
              </div>

              {/* Service Repair Remind Date & Telegram Bot Sender */}
              <div className="col-span-full bg-sky-50/70 p-4 rounded-2xl border border-sky-200/80 space-y-3 mt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-black text-slate-900 flex items-center gap-1.5 font-heading uppercase">
                      <Bell className="w-4 h-4 text-sky-600" />
                      Next Service Repair Remind Date
                    </label>
                    <p className="text-[11px] text-slate-500">Set the next scheduled service date for customer reminder notifications.</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPresetRemindDate(3)}
                      className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-800 text-[10px] font-bold rounded-lg border border-sky-200 cursor-pointer transition shadow-2xs"
                    >
                      +3 Months
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetRemindDate(6)}
                      className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-800 text-[10px] font-bold rounded-lg border border-sky-200 cursor-pointer transition shadow-2xs"
                    >
                      +6 Months
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetRemindDate(12)}
                      className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-800 text-[10px] font-bold rounded-lg border border-sky-200 cursor-pointer transition shadow-2xs"
                    >
                      +1 Year
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <DatePicker
                      value={remindDate}
                      onChange={setRemindDate}
                      placeholder="Select Remind Date"
                    />
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={handleSendTelegramNow}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Telegram Reminder to Group</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. SERVICE REQUEST */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
            <h3 className="text-sm font-black text-slate-900 font-heading uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
              3. Service Request / Customer Complaints
            </h3>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe service requests, vehicle diagnostics, or customer complaints..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* 4. REPAIR & CHARGE FEE */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-slate-900 font-heading uppercase tracking-wider">
                4. Repair and Charge Fee
              </h3>
              <button
                type="button"
                onClick={addFeeItem}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                + Add Service
              </button>
            </div>

            <div className="space-y-3">
              {feeItems.map((item, idx) => (
                <div key={item.id} className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Description / Service #{idx + 1}</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="Item description"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">SAP No.</label>
                      <input
                        type="text"
                        value={item.sap_no || ''}
                        onChange={e => handleItemChange(item.id, 'sap_no', e.target.value)}
                        placeholder="SAP #"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={e => handleItemChange(item.id, 'unit_price', Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Amount ($)</label>
                      <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-black text-slate-900">
                        ${item.amount.toFixed(2)}
                      </div>
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeFeeItem(item.id)}
                        disabled={feeItems.length === 1}
                        className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stock & Warranty Selectors */}
                  <div className="flex items-center gap-6 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-600">Stock:</span>
                      <select
                        value={item.stock_yes_no || 'YES'}
                        onChange={e => handleItemChange(item.id, 'stock_yes_no', e.target.value)}
                        className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-bold"
                      >
                        <option value="YES">YES</option>
                        <option value="NO">NO</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-600">Warranty:</span>
                      <select
                        value={item.warranty_yes_no || 'YES'}
                        onChange={e => handleItemChange(item.id, 'warranty_yes_no', e.target.value)}
                        className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-bold"
                      >
                        <option value="YES">YES</option>
                        <option value="NO">NO</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. ADDITIONAL RECEIPT DETAILS */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
            <h3 className="text-sm font-black text-slate-900 font-heading uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              5. Additional Service Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Repaired Date</label>
                <DatePicker
                  value={estimatedRepairDate}
                  onChange={setEstimatedRepairDate}
                  placeholder="Select Estimated Date"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Old Parts Processing</label>
                <select
                  value={oldPartsAction}
                  onChange={e => setOldPartsAction(e.target.value as 'Take away' | 'Give up')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="Take away">Take away</option>
                  <option value="Give up">Give up</option>
                </select>
              </div>

              <div className="col-span-full">
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Reminder</label>
                <input
                  type="text"
                  value={serviceReminder}
                  onChange={e => setServiceReminder(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="col-span-full sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Repair Confirm by Customer</label>
                <input
                  type="text"
                  value={repairConfirmCustomer}
                  onChange={e => setRepairConfirmCustomer(e.target.value)}
                  placeholder="Customer signature name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* 6. COMPLETE & DELIVERY */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 font-heading uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                6. Complete & Delivery Signatures
              </h3>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                Optional — no user account required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Technician</label>
                <input
                  type="text"
                  value={technician}
                  onChange={e => setTechnician(e.target.value)}
                  placeholder="Enter technician name (optional)"
                  className="w-full rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">QA Inspector</label>
                <input
                  type="text"
                  value={qa}
                  onChange={e => setQa(e.target.value)}
                  placeholder="Enter QA inspector (optional)"
                  className="w-full rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ASS-Manager Confirm</label>
                <input
                  type="text"
                  value={assManagerConfirm}
                  onChange={e => setAssManagerConfirm(e.target.value)}
                  placeholder="Enter manager name (optional)"
                  className="w-full rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Warehouse Keeper</label>
                <input
                  type="text"
                  value={warehouseKeeper}
                  onChange={e => setWarehouseKeeper(e.target.value)}
                  placeholder="Enter warehouse keeper (optional)"
                  className="w-full rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Delivery Person</label>
                <input
                  type="text"
                  value={deliveryPerson}
                  onChange={e => setDeliveryPerson(e.target.value)}
                  placeholder="Enter delivery person (optional)"
                  className="w-full rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Accounting Status</label>
                <input
                  type="text"
                  value={accounting}
                  onChange={e => setAccounting(e.target.value)}
                  placeholder="Enter accounting status (optional)"
                  className="w-full rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 bg-slate-50 border border-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Summary & Actions Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 sticky top-24 space-y-4">
            <h3 className="text-sm font-black text-slate-900 font-heading uppercase tracking-wider border-b border-slate-100 pb-2">
              Receipt Live Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-mono font-bold text-slate-900">{receiptNo}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Brand & Branch:</span>
                <span className="font-bold text-slate-900">{activeBrandObj?.brand_code} - {activeBranchObj?.branch_name}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{customerName || 'N/A'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-semibold text-slate-800">{vehicleModel || 'N/A'} ({plateNo || 'N/A'})</span>
              </div>

              {/* Automatic Calculation Breakdown */}
              <div className="pt-2 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VAT (10%):</span>
                  <span className="font-mono font-semibold">${vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-200 pt-1.5">
                  <span>Total (USD):</span>
                  <span className="font-mono text-red-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition cursor-pointer border border-slate-200"
              >
                {editingReceipt ? 'Save as Pending' : t.saveDraft}
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-bold text-xs transition cursor-pointer border border-slate-200 shadow-2xs"
              >
                <Eye className="w-4 h-4 text-slate-600" />
                {t.previewA4}
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs transition cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                {editingReceipt ? 'Save Receipt Changes' : t.saveGenerate}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-slate-700 font-semibold text-[11px] transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t.resetForm}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* A4 Master Receipt Preview Modal */}
      <ReceiptPreviewModal
        receipt={currentReceiptObject}
        brand={activeBrandObj}
        branch={activeBranchObj}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
};
