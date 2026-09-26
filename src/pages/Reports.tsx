import React, { useState, useMemo, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import {
  Printer,
  BarChart3,
  Building,
  GitBranch,
  Calendar,
  FileText,
  FileCheck,
  Phone,
  Car,
  FileSpreadsheet,
  FileDown,
  Loader2
} from 'lucide-react';
import { DatePicker } from '../components/common/DatePicker';
import { Select } from '../components/common/Select';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { exportReportToExcel, type ReportRowData } from '../utils/excelExport';
import { exportToPDF, printDocumentElement } from '../utils/pdfExport';
import { ReportPDF } from '../components/pdf/ReportPDF';
import type { SystemSettings } from '../types';

export const Reports: React.FC = () => {
  const { brands, branches, currentUser } = useAuth();

  const [reportType, setReportType] = useState<'quotation' | 'receipt'>('receipt');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('this_month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [settings, setSettings] = useState<SystemSettings>(() => StorageService.getSettings());

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  useEffect(() => {
    StorageService.fetchSettings().then(s => setSettings(s)).catch(() => {});
  }, []);

  const allQuotations = useMemo(() => StorageService.getQuotations(), []);
  const allReceipts = useMemo(() => StorageService.getReceipts(), []);

  const availableBranches = useMemo(() => {
    if (selectedBrandId === 'all') return branches;
    return branches.filter(
      b => (b.supported_brand_ids && b.supported_brand_ids.includes(selectedBrandId)) || b.brand_id === selectedBrandId
    );
  }, [branches, selectedBrandId]);

  const selectedBrand = useMemo(() => {
    if (selectedBrandId === 'all') return undefined;
    return brands.find(b => b.id === selectedBrandId);
  }, [brands, selectedBrandId]);

  const selectedBranch = useMemo(() => {
    if (selectedBranchId === 'all') return undefined;
    return branches.find(b => b.id === selectedBranchId);
  }, [branches, selectedBranchId]);

  const dateFilterLabel = useMemo(() => {
    switch (dateFilter) {
      case 'today':
        return 'Today';
      case 'this_month':
        return 'This Month';
      case 'last_month':
        return 'Last Month';
      case 'custom':
        return 'Custom Date Range';
      default:
        return 'All Time';
    }
  }, [dateFilter]);

  const getDateRangeText = (): string => {
    const today = new Date();
    if (dateFilter === 'today') {
      return today.toISOString().slice(0, 10);
    }
    if (dateFilter === 'this_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
      return `${firstDay} to ${lastDay}`;
    }
    if (dateFilter === 'last_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 10);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().slice(0, 10);
      return `${firstDay} to ${lastDay}`;
    }
    if (dateFilter === 'custom') {
      return `${startDate || 'Start Date'} to ${endDate || 'End Date'}`;
    }
    return 'All Records';
  };

  const isDateInFilter = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const docDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case 'today': {
        const docDay = new Date(docDate);
        docDay.setHours(0, 0, 0, 0);
        return docDay.getTime() === today.getTime();
      }
      case 'this_month': {
        return docDate.getMonth() === today.getMonth() && docDate.getFullYear() === today.getFullYear();
      }
      case 'last_month': {
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        return docDate.getMonth() === lastMonth.getMonth() && docDate.getFullYear() === lastMonth.getFullYear();
      }
      case 'custom': {
        if (!startDate || !endDate) return true;
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return docDate >= start && docDate <= end;
      }
      default:
        return true;
    }
  };

  const reportData: ReportRowData[] = useMemo(() => {
    if (reportType === 'quotation') {
      return allQuotations.filter(q => {
        if (selectedBrandId !== 'all' && q.brand_id !== selectedBrandId) return false;
        if (selectedBranchId !== 'all' && q.branch_id !== selectedBranchId) return false;
        if (!isDateInFilter(q.created_date)) return false;
        return true;
      }).map(q => ({
        doc_no: q.quotation_no,
        brand: brands.find(b => b.id === q.brand_id)?.brand_code || q.brand_name || 'BYD',
        branch: branches.find(br => br.id === q.branch_id)?.branch_name || q.branch_name || 'Main Branch',
        customer: q.customer_name,
        phone: q.phone,
        vehicle: `${q.vehicle_model} (${q.plate_no})`,
        amount: q.total_amount,
        created_by: q.created_by_name,
        date: q.created_date
      }));
    } else {
      return allReceipts.filter(r => {
        if (selectedBrandId !== 'all' && r.brand_id !== selectedBrandId) return false;
        if (selectedBranchId !== 'all' && r.branch_id !== selectedBranchId) return false;
        if (!isDateInFilter(r.created_date)) return false;
        return true;
      }).map(r => ({
        doc_no: r.receipt_no,
        brand: brands.find(b => b.id === r.brand_id)?.brand_code || r.brand_name || 'BYD',
        branch: branches.find(br => br.id === r.branch_id)?.branch_name || r.branch_name || 'Main Branch',
        customer: r.customer_name,
        phone: r.phone,
        vehicle: `${r.vehicle_model} (${r.plate_no})`,
        amount: r.total_amount,
        created_by: r.created_by_name,
        date: r.created_date
      }));
    }
  }, [reportType, allQuotations, allReceipts, selectedBrandId, selectedBranchId, dateFilter, startDate, endDate, brands, branches]);

  const totalSum = reportData.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);

  // 1. Export Excel (.xlsx) with Logo Header, styled headers, and text-formatted phone numbers
  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      await exportReportToExcel({
        reportType,
        brandFilterName: selectedBrand ? selectedBrand.brand_name : 'All Brands',
        branchFilterName: selectedBranch ? selectedBranch.branch_name : 'All Branches',
        dateFilterName: dateFilterLabel,
        dateRangeText: getDateRangeText(),
        totalSum,
        reportData,
        brand: selectedBrand,
        branch: selectedBranch,
        settings,
        generatedBy: currentUser?.name || 'Administrator'
      });
    } catch (error) {
      console.error('Failed to export Excel report:', error);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // 2. Export High-Resolution PDF with official logo header format
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const filename = `${reportType}_report_${new Date().toISOString().slice(0, 10)}`;
      await exportToPDF('report-pdf-document', filename, 'landscape');
    } catch (error) {
      console.error('Failed to export PDF report:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // 3. Print Report with official logo header format
  const handlePrintReport = () => {
    printDocumentElement('report-pdf-document', 'landscape');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header & Filter Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-slate-200/90 space-y-4 no-print">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center justify-center shadow-xs shrink-0">
              <BarChart3 className="w-6 h-6 text-red-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading tracking-tight truncate">
                Service Reports & Analytics
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Export comprehensive financial and operational reports across BYD & DENZA branches with official logo header.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
            {/* Export Excel (.xlsx) */}
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel || reportData.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs hover:shadow-sm active:scale-[0.98] cursor-pointer"
              title="Download formatted Excel spreadsheet (.xlsx) with official logo header and number formatting"
            >
              {isExportingExcel ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              )}
              <span>{isExportingExcel ? 'Exporting...' : 'Export Excel'}</span>
            </button>

            {/* Export PDF */}
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF || reportData.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
              title="Download official PDF report with logo header, summary KPI, and authorization blocks"
            >
              {isExportingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <FileDown className="w-4 h-4 text-blue-600" />
              )}
              <span>{isExportingPDF ? 'Generating...' : 'Export PDF'}</span>
            </button>

            {/* Print Report */}
            <button
              onClick={handlePrintReport}
              disabled={reportData.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs hover:shadow-sm active:scale-[0.98] cursor-pointer"
              title="Print official report layout with logo and executive signature blocks"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="pt-3.5 border-t border-slate-100 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 text-xs">
          {/* Report Type Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl font-bold w-full sm:w-auto shrink-0">
            <button
              onClick={() => setReportType('receipt')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition text-xs font-bold ${
                reportType === 'receipt' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Receipt Report
            </button>
            <button
              onClick={() => setReportType('quotation')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition text-xs font-bold ${
                reportType === 'quotation' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Quotation Report
            </button>
          </div>

          {/* Filter Dropdowns and Custom Date Range */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full xl:w-auto">
            {/* Brand Filter */}
            <div className="w-full sm:flex-1 xl:w-44 xl:flex-none">
              <Select
                icon={<Building className="w-3.5 h-3.5" />}
                value={selectedBrandId}
                onChange={val => {
                  setSelectedBrandId(val);
                  setSelectedBranchId('all');
                }}
                options={[
                  { value: 'all', label: 'All Brands' },
                  ...brands.map(b => ({ value: b.id, label: b.brand_name }))
                ]}
                size="sm"
              />
            </div>

            {/* Branch Filter */}
            <div className="w-full sm:flex-1 xl:w-44 xl:flex-none">
              <Select
                icon={<GitBranch className="w-3.5 h-3.5" />}
                value={selectedBranchId}
                onChange={setSelectedBranchId}
                options={[
                  { value: 'all', label: 'All Branches' },
                  ...availableBranches.map(br => ({ value: br.id, label: br.branch_name }))
                ]}
                size="sm"
              />
            </div>

            {/* Date Filter */}
            <div className="w-full sm:flex-1 xl:w-44 xl:flex-none">
              <Select
                icon={<Calendar className="w-3.5 h-3.5" />}
                value={dateFilter}
                onChange={setDateFilter}
                options={[
                  { value: 'today', label: 'Today' },
                  { value: 'this_month', label: 'This Month' },
                  { value: 'last_month', label: 'Last Month' },
                  { value: 'custom', label: 'Custom Date Range' }
                ]}
                size="sm"
              />
            </div>

            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Start Date"
                  className="flex-1 sm:w-36"
                />
                <span className="text-slate-400 font-bold shrink-0">-</span>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="End Date"
                  className="flex-1 sm:w-36"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 no-print">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Documents</span>
            <div className="text-3xl font-black text-slate-900 font-heading mt-1">
              <AnimatedCounter value={reportData.length} />
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
              {reportType === 'receipt' ? 'Official Receipts' : 'Customer Quotations'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            {reportType === 'receipt' ? <FileCheck className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Report Total Amount</span>
            <div className="text-3xl font-black text-emerald-700 font-heading mt-1">
              <AnimatedCounter value={totalSum} prefix="$" decimals={2} />
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
              Period: {dateFilterLabel}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            $
          </div>
        </div>
      </div>

      {/* Data Table Area */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden no-print">
        {/* Mobile Card View (< lg) */}
        <div className="lg:hidden divide-y divide-slate-100">
          {reportData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                {reportType === 'receipt' ? <FileCheck className="w-6 h-6 stroke-[1.5]" /> : <FileText className="w-6 h-6 stroke-[1.5]" />}
              </div>
              <p className="text-sm font-bold text-slate-800 font-heading">No report records found</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Try changing the date range or branch filter.</p>
            </div>
          ) : (
            <>
              {reportData.map((row, idx) => (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 transaction-card space-y-3 animate-slide-up stagger-${Math.min(idx + 1, 5)}`}
                >
                  {/* Top: Doc No, Date & Amount */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200/90 text-slate-800 font-mono font-bold text-xs shadow-2xs">
                        {reportType === 'receipt' ? <FileCheck className="w-3.5 h-3.5 text-red-600 shrink-0" /> : <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        <span>{row.doc_no}</span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-400">
                        {row.date} • {row.created_by}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Amount</span>
                      <div className="font-mono font-black text-slate-900 text-base">
                        ${Number(row.amount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Customer, Phone, Vehicle, Brand & Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <div className="font-heading font-extrabold text-sm text-slate-900">{row.customer}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">{row.phone}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{row.vehicle}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">
                        <span className="font-bold text-slate-700">{row.brand}</span> • {row.branch}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Mobile Grand Total Summary Footer */}
              <div className="p-4 sm:p-5 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-700">Grand Total ({reportData.length} records):</span>
                <span className="font-mono text-base font-black text-emerald-800">
                  ${Number(totalSum || 0).toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Desktop Table View (>= lg) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead className="bg-[#002060] text-white font-heading font-extrabold uppercase text-[11px] tracking-wider border-b border-[#002060] sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 text-center w-[4%]">S/n</th>
                <th className="py-3 px-3 text-center">Document No.</th>
                <th className="py-3 px-3 text-center">Brand</th>
                <th className="py-3 px-3">Branch</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3 text-center">Phone</th>
                <th className="py-3 px-3">Vehicle Details</th>
                <th className="py-3 px-3">Created By</th>
                <th className="py-3 px-3 text-center">Date</th>
                <th className="py-3 px-3 text-right">Total Amount ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800 bg-white">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                        {reportType === 'receipt' ? <FileCheck className="w-6 h-6 stroke-[1.5]" /> : <FileText className="w-6 h-6 stroke-[1.5]" />}
                      </div>
                      <p className="text-sm font-bold text-slate-800 font-heading">No report records found</p>
                      <p className="text-xs text-slate-400 font-medium">Try changing the date range or branch filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reportData.map((row, idx) => (
                  <tr key={idx} className={`transaction-row hover:bg-slate-50/70 transition-colors animate-slide-up stagger-${Math.min(idx + 1, 5)}`}>
                    <td className="py-3 px-3 text-center font-bold text-slate-900">{idx + 1}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900 font-mono font-bold text-xs">
                        {row.doc_no}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900">{row.brand}</td>
                    <td className="py-3 px-3 font-medium text-slate-700">{row.branch}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 font-heading text-sm">{row.customer}</td>
                    <td className="py-3 px-3 text-center text-slate-600 font-mono">{row.phone}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{row.vehicle}</td>
                    <td className="py-3 px-3 text-slate-600">{row.created_by}</td>
                    <td className="py-3 px-3 text-center text-slate-500 font-mono">{row.date}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ${Number(row.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-[#002060] text-white font-bold text-xs border-t border-slate-900">
                <td colSpan={9} className="py-3 px-4 text-center uppercase font-black tracking-wider text-white">
                  TOTAL ({reportData.length} records):
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm text-white font-black">
                  ${Number(totalSum || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Off-screen Document for High-Definition PDF Generation & Isolated Clean Printing */}
      <div className="contents" aria-hidden="true">
        <ReportPDF
          documentId="report-pdf-document"
          className="fixed left-[-10000px] top-0 pointer-events-none"
          reportType={reportType}
          brandFilterName={selectedBrand ? selectedBrand.brand_name : 'All Brands'}
          branchFilterName={selectedBranch ? selectedBranch.branch_name : 'All Branches'}
          dateFilterName={dateFilterLabel}
          dateRangeText={getDateRangeText()}
          totalSum={totalSum}
          reportData={reportData}
          brand={selectedBrand}
          branch={selectedBranch}
          settings={settings}
          generatedBy={currentUser?.name || 'Administrator'}
        />
      </div>
    </div>
  );
};
