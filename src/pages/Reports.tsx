import React, { useState, useMemo } from 'react';
import { StorageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { Download, Printer, BarChart3, Building, GitBranch, Calendar, FileText, FileCheck } from 'lucide-react';
import { DatePicker } from '../components/common/DatePicker';
import { Select } from '../components/common/Select';

export const Reports: React.FC = () => {
  const { brands, branches } = useAuth();

  const [reportType, setReportType] = useState<'quotation' | 'receipt'>('receipt');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('this_month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const allQuotations = useMemo(() => StorageService.getQuotations(), []);
  const allReceipts = useMemo(() => StorageService.getReceipts(), []);

  const availableBranches = useMemo(() => {
    if (selectedBrandId === 'all') return branches;
    return branches.filter(
      b => (b.supported_brand_ids && b.supported_brand_ids.includes(selectedBrandId)) || b.brand_id === selectedBrandId
    );
  }, [branches, selectedBrandId]);

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

  const reportData = useMemo(() => {
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

  const totalSum = reportData.reduce((acc, row) => acc + row.amount, 0);

  const exportToCSV = () => {
    const headers = ['Document No', 'Brand', 'Branch', 'Customer Name', 'Phone', 'Vehicle', 'Amount ($)', 'Created By', 'Date'];
    const rows = reportData.map(r => [
      `"${r.doc_no}"`,
      `"${r.brand}"`,
      `"${r.branch}"`,
      `"${r.customer}"`,
      `"${r.phone}"`,
      `"${r.vehicle}"`,
      r.amount.toFixed(2),
      `"${r.created_by}"`,
      `"${r.date}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-heading flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              Service Reports & Analytics
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Export comprehensive financial and operational reports across BYD & DENZA branches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600" />
              Export CSV / Excel
            </button>
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          {/* Report Type Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl font-bold">
            <button
              onClick={() => setReportType('receipt')}
              className={`px-3 py-1.5 rounded-lg transition ${reportType === 'receipt' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Receipt Report
            </button>
            <button
              onClick={() => setReportType('quotation')}
              className={`px-3 py-1.5 rounded-lg transition ${reportType === 'quotation' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Quotation Report
            </button>
          </div>

          {/* Brand Filter */}
          <div className="w-44">
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
          <div className="w-44">
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
          <div className="w-44">
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
            <div className="flex items-center gap-2">
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Start Date"
                className="w-36"
              />
              <span className="text-slate-400 font-bold">-</span>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="End Date"
                className="w-36"
              />
            </div>
          )}
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 no-print">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Documents</span>
            <div className="text-3xl font-black text-slate-900 font-heading mt-1">{reportData.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            {reportType === 'receipt' ? <FileCheck className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Report Total Amount</span>
            <div className="text-3xl font-black text-emerald-700 font-heading mt-1">
              ${totalSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            $
          </div>
        </div>
      </div>

      {/* Data Table Printable Area */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="mb-4 hidden print:block">
          <h1 className="text-xl font-black text-slate-900">
            BYD & DENZA{reportType.toUpperCase()} REPORT
          </h1>
          <p className="text-xs text-slate-600">Generated Date: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Document No.</th>
                <th className="py-3 px-3">Brand</th>
                <th className="py-3 px-3">Branch</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Vehicle Details</th>
                <th className="py-3 px-3 text-right">Amount ($)</th>
                <th className="py-3 px-3">Created By</th>
                <th className="py-3 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                    No records found for selected report criteria.
                  </td>
                </tr>
              ) : (
                reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-[11px]">
                        {row.doc_no}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-slate-900">{row.brand}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{row.branch}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{row.customer}</td>
                    <td className="py-2.5 px-3 text-slate-600">{row.phone}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{row.vehicle}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ${row.amount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{row.created_by}</td>
                    <td className="py-2.5 px-3 text-slate-500">{row.date}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300 text-xs">
                <td colSpan={7} className="py-3 px-3 text-right text-slate-900 uppercase">Grand Total:</td>
                <td className="py-3 px-3 text-right font-mono text-sm text-emerald-800 font-black">
                  ${totalSum.toFixed(2)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
