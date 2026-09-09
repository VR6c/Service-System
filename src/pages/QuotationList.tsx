import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfirm, useAlert, useToast } from '../context/DialogContext';
import { Modal } from '../components/common/Modal';
import { StorageService } from '../services/storageService';
import { sendTelegramReminder } from '../services/telegramService';
import type { Quotation } from '../types';
import { QuotationPDF } from '../components/pdf/QuotationPDF';
import { exportToPDF, printDocument } from '../utils/pdfExport';
import { Select } from '../components/common/Select';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/common/Pagination';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  Printer,
  ArrowRight,
  Plus,
  X,
  Car,
  Pencil,
  Trash2,
  Send,
  Building,
  GitBranch,
  Phone
} from 'lucide-react';

interface QuotationListProps {
  filterType: 'my' | 'all';
  onCreateNew: () => void;
  onEdit: (quotation: Quotation) => void;
  onConvertToReceipt: (quotation: Quotation) => void;
}

export const QuotationList: React.FC<QuotationListProps> = ({ filterType, onCreateNew, onEdit, onConvertToReceipt }) => {
  const { currentUser, brands, branches } = useAuth();
  const confirm = useConfirm();
  const showAlert = useAlert();
  const showToast = useToast();
  const settings = StorageService.getSettings();

  const isSA = currentUser?.role === 'Service Advisor';
  const defaultBranch = isSA ? (currentUser?.branch_id || currentUser?.default_branch_id || 'ALL') : 'ALL';

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(defaultBranch);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

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
    const loadQuotations = async () => {
      let list = await StorageService.fetchQuotations();
      if (filterType === 'my' && currentUser) {
        list = list.filter(q => q.created_by === currentUser.id);
      }
      setQuotations(list);
    };
    loadQuotations();
  }, [filterType, currentUser]);

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch =
      q.quotation_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.plate_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.vehicle_model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    const matchesBrand = selectedBrandFilter === 'ALL' || q.brand_id === selectedBrandFilter;
    const matchesBranch = selectedBranchFilter === 'ALL' || q.branch_id === selectedBranchFilter;
    return matchesSearch && matchesStatus && matchesBrand && matchesBranch;
  });

  const totalAmountSum = useMemo(() => {
    return filteredQuotations.reduce((sum, q) => sum + (Number(q.total_amount) || 0), 0);
  }, [filteredQuotations]);

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    startIndex,
    endIndex,
    paginatedData: paginatedQuotations
  } = usePagination({
    data: filteredQuotations,
    initialPageSize: 15,
    resetDeps: [searchQuery, statusFilter, selectedBrandFilter, selectedBranchFilter, filterType]
  });

  const handleSendTelegramReminder = async (q: Quotation) => {
    const res = await sendTelegramReminder({
      customer_name: q.customer_name,
      vehicle_model: q.vehicle_model,
      plate_no: q.plate_no,
      remind_date: q.remind_date || q.created_date,
      phone: q.phone
    });

    if (res.success) {
      showToast({
        type: 'success',
        title: 'Telegram Reminder Sent',
        message: `${q.customer_name} • ${q.vehicle_model} • Plate: ${q.plate_no}`
      });
    } else {
      await showAlert({
        title: 'Telegram Notification Failed',
        message: res.message || 'Could not send reminder to Telegram group.',
        type: 'error'
      });
    }
  };

  const handleDelete = async (quotation: Quotation) => {
    const isConfirmed = await confirm({
      title: 'Delete Quotation',
      message: `Are you sure you want to delete quotation ${quotation.quotation_no}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!isConfirmed) return;

    StorageService.deleteQuotation(quotation.id);
    setQuotations(prev => prev.filter(q => q.id !== quotation.id));
    if (selectedQuotation?.id === quotation.id) setSelectedQuotation(null);
    showToast({
      type: 'success',
      title: 'Quotation Deleted',
      message: `Quotation ${quotation.quotation_no} has been deleted successfully.`
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Scoped Branch & Brand Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 px-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 text-xs flex-wrap min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Building className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <span className="font-bold text-slate-700">Workshop Scope:</span>
          {isSA ? (
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 font-extrabold text-[11px] truncate max-w-[260px]">
              {currentUser.branch || 'Assigned Branch'} (Scoped)
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] truncate max-w-[260px]">
              {selectedBranchFilter === 'ALL' ? 'All Workshop Branches' : (branches.find(b => b.id === selectedBranchFilter)?.branch_name || 'Selected Branch')}
            </span>
          )}
        </div>

        {/* Top Brand Filter Tabs: [ All Brands ] | [ BYD ] | [ DENZA ] */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto no-scrollbar self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setSelectedBrandFilter('ALL')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap text-center ${
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
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap text-center ${
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
      
      {/* Header Controls */}
      <div className="bg-white text-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 no-print">
        {/* Top Section: Title, Stats & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shadow-2xs shrink-0 font-bold border border-amber-200">
              <FileText className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading tracking-tight truncate">
                  {filterType === 'my' ? 'My Created Quotations' : 'All Service Quotations'}
                </h2>
                <span className="bg-amber-50 text-amber-700 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-amber-200 shrink-0">
                  <AnimatedCounter value={filteredQuotations.length} suffix=" Documents" duration={650} />
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Total Estimated Value: <span className="font-mono font-bold text-amber-600">
                  <AnimatedCounter value={totalAmountSum} prefix="$" decimals={2} duration={750} />
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onCreateNew}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 rounded-xl text-xs font-black transition shadow-xs hover:shadow-sm active:scale-[0.98] cursor-pointer shrink-0 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Create Quotation</span>
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="pt-3.5 border-t border-slate-100 flex flex-col xl:flex-row items-stretch xl:items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Quotation No, Customer, Plate..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-8 text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full xl:w-auto">
            {/* Status Filter */}
            <div className="w-full sm:flex-1 xl:w-44 xl:flex-none">
              <Select
                icon={<Filter className="w-3.5 h-3.5" />}
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Sent', label: 'Sent' },
                  { value: 'Accepted', label: 'Accepted' },
                  { value: 'Converted', label: 'Converted to Receipt' },
                  { value: 'Cancelled', label: 'Cancelled' }
                ]}
                size="sm"
              />
            </div>

            {/* Brand Filter */}
            <div className="w-full sm:flex-1 xl:w-48 xl:flex-none">
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
              <div className="w-full sm:flex-1 xl:w-48 xl:flex-none px-3 py-2 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 truncate">
                <GitBranch className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{currentUser?.branch || 'Branch Floor'}</span>
              </div>
            ) : (
              <div className="w-full sm:flex-1 xl:w-44 xl:flex-none">
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
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden no-print">
        {/* Mobile & Tablet Card View (< lg) */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredQuotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-sm font-bold text-slate-800 font-heading">No quotations found</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Try adjusting your search query or filter options.</p>
            </div>
          ) : (
            paginatedQuotations.map((q, idx) => (
              <div
                key={q.id}
                className={`transaction-card p-4 sm:p-5 space-y-3.5 animate-slide-up stagger-${Math.min(idx + 1, 5)}`}
              >
                {/* Top: Doc No, Date, Status & Amount */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200/90 text-slate-800 font-mono font-bold text-xs shadow-2xs">
                      <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{q.quotation_no}</span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-400">
                      {q.created_date}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="font-mono font-black text-slate-900 text-base">
                      ${Number(q.total_amount || 0).toFixed(2)}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      q.status === 'Converted'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : q.status === 'Accepted'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : q.status === 'Sent'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {q.status}
                    </span>
                  </div>
                </div>

                {/* Customer, Phone, Vehicle, Plate & Creator */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <div className="font-heading font-extrabold text-sm text-slate-900">{q.customer_name}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span className="font-mono">{q.phone}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{q.vehicle_model}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-300 font-mono text-[11px] font-black text-slate-900 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                        <span>{q.plate_no}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                        By {q.created_by_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setSelectedQuotation(q)}
                      className="action-btn-hover px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl shadow-2xs font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                      title="View Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => handleSendTelegramReminder(q)}
                      className="action-btn-hover p-1.5 bg-sky-50 hover:bg-sky-600 text-sky-600 hover:text-white rounded-xl shadow-2xs cursor-pointer active:scale-95"
                      title="Send Telegram Reminder to Group"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedQuotation(q);
                        setTimeout(() => {
                          printDocument();
                        }, 150);
                      }}
                      className="action-btn-hover p-1.5 bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white rounded-xl shadow-2xs cursor-pointer active:scale-95"
                      title="Print Document"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedQuotation(q);
                        setTimeout(() => {
                          exportToPDF('quotation-pdf-document', q.quotation_no);
                        }, 150);
                      }}
                      className="action-btn-hover p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl shadow-2xs cursor-pointer active:scale-95"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onConvertToReceipt(q)}
                      className="action-btn-hover p-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl shadow-2xs cursor-pointer active:scale-95"
                      title="Convert to Official Receipt"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onEdit(q)}
                      className="action-btn-hover p-1.5 bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white rounded-xl shadow-2xs cursor-pointer active:scale-95"
                      title="Edit Quotation"
                      aria-label={`Edit quotation ${q.quotation_no}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {currentUser?.role === 'Admin' && (
                    <button
                      onClick={() => handleDelete(q)}
                      className="action-btn-hover p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl shadow-2xs cursor-pointer ml-auto active:scale-95"
                      title="Delete Quotation"
                      aria-label={`Delete quotation ${q.quotation_no}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View (>= lg) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/90 text-slate-600 font-heading font-extrabold uppercase text-[11px] tracking-wider border-b border-slate-200/80 sticky top-0 z-10 backdrop-blur-xs">
              <tr>
                <th className="py-3.5 px-5">Quotation No</th>
                <th className="py-3.5 px-5">Customer Name</th>
                <th className="py-3.5 px-5">Phone</th>
                <th className="py-3.5 px-5">Plate No</th>
                <th className="py-3.5 px-5">Vehicle Model</th>
                <th className="py-3.5 px-5 text-right">Total Amount</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5">Created By</th>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-semibold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                        <FileText className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 font-heading">No service quotation records found</p>
                      <p className="text-xs text-slate-400 font-medium">Try adjusting your search query or filter options.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedQuotations.map((q, idx) => (
                  <tr key={q.id} className={`transaction-row animate-slide-up stagger-${Math.min(idx + 1, 5)} group`}>
                    <td className="py-3.5 px-5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100/90 border border-slate-200/90 text-slate-800 font-mono font-bold text-xs shadow-2xs">
                        <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{q.quotation_no}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 font-heading text-sm">{q.customer_name}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-600 font-mono">{q.phone}</td>
                    <td className="py-3.5 px-5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-300 font-mono text-xs font-black text-slate-900 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                        <span>{q.plate_no}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 font-semibold flex items-center gap-2">
                      <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{q.vehicle_model}</span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-black text-slate-900 text-sm">
                      ${Number(q.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        q.status === 'Converted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : q.status === 'Accepted'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : q.status === 'Sent'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">{q.created_by_name}</td>
                    <td className="py-3.5 px-5 text-slate-500 font-medium">{q.created_date}</td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedQuotation(q)}
                          className="action-btn-hover p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl shadow-2xs cursor-pointer active:scale-95"
                          title="View Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleSendTelegramReminder(q)}
                          className="action-btn-hover p-2 bg-sky-50 hover:bg-sky-600 text-sky-600 hover:text-white rounded-xl shadow-2xs cursor-pointer active:scale-95"
                          title="Send Telegram Reminder to Group"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedQuotation(q);
                            setTimeout(() => {
                              printDocument();
                            }, 150);
                          }}
                          className="action-btn-hover p-2 bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white rounded-xl shadow-2xs cursor-pointer active:scale-95"
                          title="Print Document"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedQuotation(q);
                            setTimeout(() => {
                              exportToPDF('quotation-pdf-document', q.quotation_no);
                            }, 150);
                          }}
                          className="action-btn-hover p-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl shadow-2xs cursor-pointer active:scale-95"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onConvertToReceipt(q)}
                          className="action-btn-hover p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl shadow-2xs cursor-pointer active:scale-95"
                          title="Convert to Official Receipt"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onEdit(q)}
                          className="action-btn-hover p-2 bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white rounded-xl shadow-2xs cursor-pointer active:scale-95"
                          title="Edit Quotation"
                          aria-label={`Edit quotation ${q.quotation_no}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {currentUser?.role === 'Admin' && (
                          <button
                            onClick={() => handleDelete(q)}
                            className="action-btn-hover p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl shadow-2xs cursor-pointer active:scale-95"
                            title="Delete Quotation"
                            aria-label={`Delete quotation ${q.quotation_no}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredQuotations.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="quotations"
        />
      </div>

      {/* Modal */}
      {selectedQuotation && (
        <Modal
          isOpen={Boolean(selectedQuotation)}
          onClose={() => setSelectedQuotation(null)}
          maxWidth="4xl"
          title={
            <span className="font-black text-sm sm:text-base text-slate-900 font-heading">
              Quotation Viewer — <span className="font-mono text-amber-600">{selectedQuotation.quotation_no}</span>
            </span>
          }
          headerRight={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSendTelegramReminder(selectedQuotation)}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-xs transition-all hover:bg-sky-700 active:scale-[0.98] cursor-pointer"
                title="Send Telegram Reminder to Group"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Send Telegram</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const qToEdit = selectedQuotation;
                  setSelectedQuotation(null);
                  onEdit(qToEdit);
                }}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-extrabold text-slate-950 shadow-xs hover:bg-amber-600 active:scale-[0.98] cursor-pointer border border-amber-600"
                title="Edit Quotation Details"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden sm:inline text-slate-950 font-extrabold">Edit Quotation</span>
              </button>
              <button
                type="button"
                onClick={() => exportToPDF('quotation-pdf-document', selectedQuotation.quotation_no)}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#E31B23] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs hover:bg-red-700 active:scale-[0.98] cursor-pointer border border-red-600"
                title="Download Quotation as PDF"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span className="text-white font-extrabold">PDF</span>
              </button>
              <button
                type="button"
                onClick={printDocument}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#081525] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs hover:bg-slate-900 active:scale-[0.98] cursor-pointer border border-slate-700"
                title="Print Quotation Document"
              >
                <Printer className="w-3.5 h-3.5 text-white" />
                <span className="text-white font-extrabold">Print</span>
              </button>
            </div>
          }
          bodyClassName="p-4 sm:p-6 bg-slate-100"
        >
          <ErrorBoundary
            fallbackTitle="Unable to preview quotation"
            fallbackMessage="An unexpected error occurred while rendering the quotation document."
            onReset={() => setSelectedQuotation(null)}
          >
            <QuotationPDF quotation={selectedQuotation} settings={settings} />
          </ErrorBoundary>
        </Modal>
      )}
    </div>
  );
};
