import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useConfirm, useAlert, useToast } from '../context/DialogContext';
import { Modal } from '../components/common/Modal';
import { StorageService } from '../services/storageService';
import { sendTelegramReminder } from '../services/telegramService';
import type { Receipt } from '../types';
import { ReceiptPDF } from '../components/pdf/ReceiptPDF';
import { exportToPDF, printDocument } from '../utils/pdfExport';
import { Select } from '../components/common/Select';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import {
  FileCheck,
  Search,
  Filter,
  Eye,
  Download,
  Printer,
  Plus,
  X,
  Car,
  Pencil,
  Trash2,
  Send,
  Building,
  GitBranch
} from 'lucide-react';

interface ReceiptListProps {
  filterType: 'my' | 'all';
  onCreateNew: () => void;
  onEdit: (receipt: Receipt) => void;
}

export const ReceiptList: React.FC<ReceiptListProps> = ({ filterType, onCreateNew, onEdit }) => {
  const { currentUser, brands, branches } = useAuth();
  const confirm = useConfirm();
  const showAlert = useAlert();
  const showToast = useToast();
  const settings = StorageService.getSettings();

  const isSA = currentUser?.role === 'Service Advisor';
  const defaultBranch = isSA ? (currentUser?.branch_id || currentUser?.default_branch_id || 'ALL') : 'ALL';

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(defaultBranch);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [downloadReceipt, setDownloadReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    if (isSA && (currentUser?.branch_id || currentUser?.default_branch_id)) {
      setSelectedBranchFilter(currentUser.branch_id || currentUser.default_branch_id || 'ALL');
    }
    if (isSA && currentUser?.assigned_brand_ids?.length) {
      if (selectedBrandFilter !== 'ALL' && !currentUser.assigned_brand_ids.includes(selectedBrandFilter)) {
        setSelectedBrandFilter('ALL');
      }
    }
  }, [isSA, currentUser, selectedBrandFilter]);

  useEffect(() => {
    const loadData = async () => {
      let list = await StorageService.fetchReceipts();
      if (filterType === 'my' && currentUser) {
        list = list.filter(r => r.created_by === currentUser.id);
      }
      setReceipts(list);
    };
    loadData();
  }, [filterType, currentUser]);

  const filteredReceipts = receipts.filter(r => {
    const matchesSearch =
      r.receipt_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.plate_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicle_model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesBrand = selectedBrandFilter === 'ALL' || r.brand_id === selectedBrandFilter;
    const matchesBranch = selectedBranchFilter === 'ALL' || r.branch_id === selectedBranchFilter;
    return matchesSearch && matchesStatus && matchesBrand && matchesBranch;
  });

  const totalAmountSum = filteredReceipts.reduce((acc, r) => acc + r.total_amount, 0);

  const handleSendTelegramReminder = async (r: Receipt) => {
    const res = await sendTelegramReminder({
      customer_name: r.customer_name,
      vehicle_model: r.vehicle_model,
      plate_no: r.plate_no,
      remind_date: r.remind_date || r.created_date,
      phone: r.phone
    });

    if (res.success) {
      showToast({
        type: 'success',
        title: 'Telegram Reminder Sent',
        message: `${r.customer_name} • ${r.vehicle_model} • Plate: ${r.plate_no}`
      });
    } else {
      await showAlert({
        title: 'Telegram Notification Failed',
        message: res.message || 'Could not send reminder to Telegram group.',
        type: 'error'
      });
    }
  };

  const handleDelete = async (receipt: Receipt) => {
    if (currentUser?.role !== 'Admin') return;
    const isConfirmed = await confirm({
      title: 'Delete Service Receipt',
      message: `Are you sure you want to delete receipt "${receipt.receipt_no}"? This action cannot be undone.`,
      details: `${receipt.customer_name} • ${receipt.vehicle_model} • Plate: ${receipt.plate_no}`,
      confirmText: 'Delete Receipt',
      type: 'danger'
    });
    if (!isConfirmed) return;

    await StorageService.deleteReceipt(receipt.id);
    setReceipts(current => current.filter(item => item.id !== receipt.id));
    if (selectedReceipt?.id === receipt.id) setSelectedReceipt(null);
    showToast({
      type: 'success',
      title: 'Receipt Deleted',
      message: `Receipt ${receipt.receipt_no} has been deleted successfully.`
    });
  };

  const handleDirectDownload = async (receipt: Receipt) => {
    if (downloadReceipt) return;

    try {
      // Commit an off-screen copy first so PDF generation never needs to open the preview.
      flushSync(() => setDownloadReceipt(receipt));
      await document.fonts?.ready;
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      await exportToPDF('receipt-download-document', receipt.receipt_no);
    } finally {
      setDownloadReceipt(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans animate-fade-in">
      {/* Top Scoped Branch & Brand Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 px-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <Building className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="font-bold text-slate-700">Workshop Scope:</span>
          {isSA ? (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[11px]">
              {currentUser.branch || 'Assigned Branch'} (Scoped)
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px]">
              {selectedBranchFilter === 'ALL' ? 'All Workshop Branches' : (branches.find(b => b.id === selectedBranchFilter)?.branch_name || 'Selected Branch')}
            </span>
          )}
        </div>

        {/* Top Brand Filter Tabs: [ All Brands ] | [ BYD ] | [ DENZA ] */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedBrandFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              selectedBrandFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Brands
          </button>
          {brands
            .filter(b => !isSA || (currentUser?.assigned_brand_ids?.length ? currentUser.assigned_brand_ids.includes(b.id) : true))
            .map(b => {
              const isSelected = selectedBrandFilter === b.id;
              const isByd = b.brand_code === 'BYD';
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBrandFilter(b.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? isByd
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {b.brand_code}
                </button>
              );
            })}
        </div>
      </div>

      {/* Header & Quick Filter Banner */}
      <div className="bg-white text-slate-900 p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl shadow-2xs shrink-0 border border-red-200">
            <FileCheck className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-slate-900 font-heading">
                {filterType === 'my' ? 'My Service Receipts' : 'All Official Service Receipts'}
              </h2>
              <span className="bg-red-50 text-red-600 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-red-200">
                {filteredReceipts.length} Documents
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Total Filtered Revenue: <span className="font-mono font-bold text-emerald-600">${Number(totalAmountSum || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input with Clear Button */}
          <div className="relative flex-1 sm:w-72 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Receipt No, Owner, Plate..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-8 text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-red-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 p-0.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Select */}
          <div className="w-44">
            <Select
              icon={<Filter className="w-3.5 h-3.5" />}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Delivered', label: 'Delivered' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Cancelled', label: 'Cancelled' }
              ]}
              size="sm"
            />
          </div>

          {/* Brand Filter */}
          <div className="w-48">
            <Select
              icon={<Building className="w-3.5 h-3.5" />}
              value={selectedBrandFilter}
              onChange={val => {
                setSelectedBrandFilter(val);
                setSelectedBranchFilter('ALL');
              }}
              options={[
                { value: 'ALL', label: 'All Brands (BYD & DENZA)' },
                ...brands.map(b => ({ value: b.id, label: b.brand_name }))
              ]}
              size="sm"
            />
          </div>

          {/* Branch Filter */}
          {isSA ? (
            <div className="w-48 px-3 py-2 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 truncate">
              <GitBranch className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{currentUser?.branch || 'Branch Floor'}</span>
            </div>
          ) : (
            <div className="w-44">
              <Select
                icon={<GitBranch className="w-3.5 h-3.5" />}
                value={selectedBranchFilter}
                onChange={setSelectedBranchFilter}
                options={[
                  { value: 'ALL', label: 'All Branches' },
                  ...branches
                    .filter(br => selectedBrandFilter === 'ALL' || (br.supported_brand_ids?.includes(selectedBrandFilter) ?? br.brand_id === selectedBrandFilter))
                    .map(br => ({ value: br.id, label: br.branch_name }))
                ]}
                size="sm"
              />
            </div>
          )}

          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Receipt</span>
          </button>
        </div>
      </div>

      {/* Receipts Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-heading font-extrabold uppercase text-[11px] tracking-wider border-b border-slate-200/90">
                <th className="py-3.5 px-5">Receipt No</th>
                <th className="py-3.5 px-5">Brand & Branch</th>
                <th className="py-3.5 px-5">Owner / Sender</th>
                <th className="py-3.5 px-5">Phone</th>
                <th className="py-3.5 px-5">Plate No</th>
                <th className="py-3.5 px-5">Vehicle Model</th>
                <th className="py-3.5 px-5 text-right">Total Amount</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-semibold">
                    No service receipt records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r, idx) => {
                  const bObj = brands.find(b => b.id === r.brand_id);
                  const brObj = branches.find(br => br.id === r.branch_id);
                  return (
                    <tr key={r.id} className={`hover:bg-slate-50/90 transaction-row-hover animate-slide-up stagger-${Math.min(idx + 1, 5)} group`}>
                      <td className="py-3.5 px-5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100/90 border border-slate-200/90 text-slate-800 font-mono font-bold text-[12px] shadow-2xs">
                          <FileCheck className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>{r.receipt_no}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-700">
                        <div>{bObj?.brand_code || r.brand_name || 'BYD'}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{brObj?.branch_name || r.branch_name || 'Main Branch'}</div>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-900 font-heading text-sm">{r.customer_name}</td>
                      <td className="py-3.5 px-5 font-bold text-slate-600">{r.phone}</td>
                      <td className="py-3.5 px-5 font-black text-slate-900">
                        <span className="bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-300 font-mono">
                          {r.plate_no}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-700 font-semibold flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{r.vehicle_model}</span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-black text-slate-900 text-sm">
                        ${Number(r.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          r.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.status === 'Delivered'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            r.status === 'Completed' ? 'bg-emerald-500 animate-pulse' : r.status === 'Delivered' ? 'bg-blue-500' : 'bg-amber-500'
                          }`}></span>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 font-medium">{r.created_date}</td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedReceipt(r)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl transition-all shadow-2xs cursor-pointer"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendTelegramReminder(r)}
                            className="p-2 bg-sky-50 hover:bg-sky-600 text-sky-600 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                            title="Send Telegram Reminder to Group"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReceipt(r);
                              setTimeout(() => {
                                printDocument();
                              }, 150);
                            }}
                            className="p-2 bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                            title="Print Document"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDirectDownload(r)}
                            disabled={downloadReceipt !== null}
                            className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                            title={`Download ${r.receipt_no}.pdf`}
                            aria-label={`Download ${r.receipt_no} as PDF`}
                          >
                            <Download className={`w-4 h-4 ${downloadReceipt?.id === r.id ? 'animate-pulse' : ''}`} />
                          </button>
                          <button
                            onClick={() => onEdit(r)}
                            className="p-2 bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                            title="Edit Receipt"
                            aria-label={`Edit receipt ${r.receipt_no}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {currentUser?.role === 'Admin' && (
                            <button
                              onClick={() => handleDelete(r)}
                              className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                              title="Delete Receipt"
                              aria-label={`Delete receipt ${r.receipt_no}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          maxWidth="4xl"
          title={
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedReceipt.receipt_no.startsWith('DENZA') ? 'bg-sky-600' : 'bg-red-600'}`}></span>
              <span className="font-black text-sm sm:text-base text-slate-900 font-heading">
                Receipt Viewer — <span className="font-mono text-slate-900">{selectedReceipt.receipt_no}</span>
              </span>
            </div>
          }
          headerRight={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSendTelegramReminder(selectedReceipt)}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-xs transition-all hover:bg-sky-700 active:scale-[0.98] cursor-pointer"
                title="Send Telegram Reminder to Group"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send Telegram</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const rToEdit = selectedReceipt;
                  setSelectedReceipt(null);
                  onEdit(rToEdit);
                }}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-extrabold text-slate-950 shadow-xs transition-all hover:bg-amber-600 active:scale-[0.98] cursor-pointer border border-amber-600"
                title="Edit Receipt Details"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden sm:inline">Edit Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => exportToPDF('receipt-pdf-document', selectedReceipt.receipt_no)}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#E31B23] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs transition-all hover:bg-[#C7151C] hover:shadow-red-600/20 active:scale-[0.98] cursor-pointer"
                title="Download receipt as PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                type="button"
                onClick={printDocument}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#081525] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs transition-all hover:bg-[#142742] active:scale-[0.98] cursor-pointer"
                title="Print receipt"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          }
          bodyClassName="p-4 sm:p-6 bg-slate-100"
        >
          <ErrorBoundary
            fallbackTitle="Unable to preview receipt"
            fallbackMessage="An unexpected error occurred while rendering the receipt document."
            onReset={() => setSelectedReceipt(null)}
          >
            <ReceiptPDF
              receipt={selectedReceipt}
              brand={brands.find(b => b.id === selectedReceipt.brand_id)}
              branch={branches.find(br => br.id === selectedReceipt.branch_id)}
              settings={settings}
            />
          </ErrorBoundary>
        </Modal>
      )}

      {/* Off-screen document used by the direct table download action. */}
      {downloadReceipt && (
        <div className="contents" aria-hidden="true">
          <ErrorBoundary>
            <ReceiptPDF
              documentId="receipt-download-document"
              className="fixed left-[-10000px] top-0 pointer-events-none"
              receipt={downloadReceipt}
              brand={brands.find(b => b.id === downloadReceipt.brand_id)}
              branch={branches.find(br => br.id === downloadReceipt.branch_id)}
              settings={settings}
            />
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
};
