import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import { sendTelegramReminder } from '../services/telegramService';
import type { Quotation } from '../types';
import { QuotationPDF } from '../components/pdf/QuotationPDF';
import { exportToPDF, printDocument } from '../utils/pdfExport';
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
  Send
} from 'lucide-react';

interface QuotationListProps {
  filterType: 'my' | 'all';
  onCreateNew: () => void;
  onEdit: (quotation: Quotation) => void;
  onConvertToReceipt: (quotation: Quotation) => void;
}

export const QuotationList: React.FC<QuotationListProps> = ({ filterType, onCreateNew, onEdit, onConvertToReceipt }) => {
  const { currentUser, brands, branches } = useAuth();
  const settings = StorageService.getSettings();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  useEffect(() => {
    let list = StorageService.getQuotations();
    if (filterType === 'my' && currentUser) {
      list = list.filter(q => q.created_by === currentUser.id);
    }
    setQuotations(list);
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

  const handleSendTelegramReminder = async (q: Quotation) => {
    const res = await sendTelegramReminder({
      customer_name: q.customer_name,
      vehicle_model: q.vehicle_model,
      plate_no: q.plate_no,
      remind_date: q.remind_date || q.created_date,
      phone: q.phone
    });

    if (res.success) {
      alert(`✅ Telegram Reminder Sent to Group!\n\n- Customer Name : ${q.customer_name}\n- Car Model : ${q.vehicle_model}\n- Plate Number : ${q.plate_no}\n- Date : ${q.remind_date || q.created_date}\n- Phone Number : ${q.phone}`);
    } else {
      alert(`⚠️ Telegram Notification Error:\n${res.message}`);
    }
  };

  const handleDelete = (quotation: Quotation) => {
    if (currentUser?.role !== 'Admin') return;
    if (!window.confirm(`Delete quotation ${quotation.quotation_no}? Existing receipts will be kept. This action cannot be undone.`)) return;

    const updatedQuotations = StorageService.getQuotations().filter(item => item.id !== quotation.id);
    StorageService.saveQuotations(updatedQuotations);

    const now = new Date().toISOString();
    const updatedReceipts = StorageService.getReceipts().map(receipt =>
      receipt.quotation_id === quotation.id
        ? { ...receipt, quotation_id: undefined, updated_at: now }
        : receipt
    );
    StorageService.saveReceipts(updatedReceipts);

    setQuotations(current => current.filter(item => item.id !== quotation.id));
    if (selectedQuotation?.id === quotation.id) setSelectedQuotation(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Controls */}
      <div className="bg-white text-slate-900 p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shadow-2xs shrink-0 font-bold border border-amber-200">
            <FileText className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-slate-900 font-heading">
                {filterType === 'my' ? 'My Created Quotations' : 'All Service Quotations'}
              </h2>
              <span className="bg-amber-50 text-amber-700 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-amber-200">
                {filteredQuotations.length} Documents
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Manage & convert customer estimates into official receipts</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-72 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Quotation No, Customer, Plate..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-8 text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-amber-500 transition-all"
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

          {/* Status Filter */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none z-10" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pro-select pl-8 py-2 text-xs font-bold text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Converted">Converted to Receipt</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={selectedBrandFilter}
              onChange={e => {
                setSelectedBrandFilter(e.target.value);
                setSelectedBranchFilter('ALL');
              }}
              className="pro-select py-2 text-xs font-bold text-slate-800"
            >
              <option value="ALL">All Brands (BYD & DENZA)</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.brand_name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={selectedBranchFilter}
              onChange={e => setSelectedBranchFilter(e.target.value)}
              className="pro-select py-2 text-xs font-bold text-slate-800"
            >
              <option value="ALL">All Branches</option>
              {branches
                .filter(br => selectedBrandFilter === 'ALL' || br.brand_id === selectedBrandFilter)
                .map(br => (
                  <option key={br.id} value={br.id}>{br.branch_name}</option>
                ))}
            </select>
          </div>

          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Create Quotation
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-heading font-extrabold uppercase text-[11px] tracking-wider border-b border-slate-200/90">
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
            <tbody className="divide-y divide-slate-100">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-semibold">
                    No service quotation records found.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50/90 transition-colors group">
                    <td className="py-3.5 px-5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100/90 border border-slate-200/90 text-slate-800 font-mono font-bold text-[12px] shadow-2xs">
                        <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{q.quotation_no}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 font-heading text-sm">{q.customer_name}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-600">{q.phone}</td>
                    <td className="py-3.5 px-5 font-black text-slate-900">
                      <span className="bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-300 font-mono">
                        {q.plate_no}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 font-semibold flex items-center gap-2">
                      <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{q.vehicle_model}</span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-black text-slate-900 text-sm">
                      ${q.total_amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
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
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl transition-all shadow-2xs cursor-pointer"
                          title="View Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleSendTelegramReminder(q)}
                          className="p-2 bg-sky-50 hover:bg-sky-600 text-sky-600 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                          title="Send Telegram Reminder to Group"
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedQuotation(q);
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
                          onClick={() => {
                            setSelectedQuotation(q);
                            setTimeout(() => {
                              exportToPDF('quotation-pdf-document', q.quotation_no);
                            }, 150);
                          }}
                          className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onConvertToReceipt(q)}
                          className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                          title="Convert to Official Receipt"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEdit(q)}
                          className="p-2 bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                          title="Edit Quotation"
                          aria-label={`Edit quotation ${q.quotation_no}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {currentUser?.role === 'Admin' && (
                          <button
                            onClick={() => handleDelete(q)}
                            className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                            title="Delete Quotation"
                            aria-label={`Delete quotation ${q.quotation_no}`}
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-slate-100 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative space-y-4 shadow-2xl border border-slate-300">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 sticky top-0 z-10 shadow-xs">
              <span className="font-black text-sm text-slate-900 font-heading">
                Quotation Viewer — <span className="font-mono text-amber-600">{selectedQuotation.quotation_no}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendTelegramReminder(selectedQuotation)}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-sky-700 active:scale-[0.98] cursor-pointer"
                  title="Send Telegram Reminder to Group"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>Send Telegram</span>
                </button>
                <button
                  onClick={() => {
                    const qToEdit = selectedQuotation;
                    setSelectedQuotation(null);
                    onEdit(qToEdit);
                  }}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-amber-500 px-4 py-2 text-xs font-extrabold text-slate-950 shadow-md hover:bg-amber-600 active:scale-[0.98] cursor-pointer border border-amber-600"
                  title="Edit Quotation Details"
                >
                  <Pencil className="w-4 h-4 text-slate-950" />
                  <span className="text-slate-950 font-extrabold">Edit Quotation</span>
                </button>
                <button
                  onClick={() => exportToPDF('quotation-pdf-document', selectedQuotation.quotation_no)}
                  style={{ backgroundColor: '#E31B23', color: '#ffffff' }}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-red-700 active:scale-[0.98] cursor-pointer border border-red-600"
                  title="Download Quotation as PDF"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span className="text-white font-extrabold">Download PDF</span>
                </button>
                <button
                  onClick={printDocument}
                  style={{ backgroundColor: '#081525', color: '#ffffff' }}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-slate-900 active:scale-[0.98] cursor-pointer border border-slate-700"
                  title="Print Quotation Document"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span className="text-white font-extrabold">Print Document</span>
                </button>
                <button
                  onClick={() => setSelectedQuotation(null)}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-200/80 transition-colors cursor-pointer border border-slate-200"
                  title="Close Viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <QuotationPDF quotation={selectedQuotation} settings={settings} />
          </div>
        </div>
      )}
    </div>
  );
};
