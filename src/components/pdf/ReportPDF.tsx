import React from 'react';
import type { Brand, Branch, SystemSettings } from '../../types';
import type { ReportRowData } from '../../utils/excelExport';

interface ReportPDFProps {
  documentId?: string;
  reportType: 'receipt' | 'quotation';
  brandFilterName: string;
  branchFilterName: string;
  dateFilterName: string;
  dateRangeText: string;
  totalSum: number;
  reportData: ReportRowData[];
  brand?: Brand;
  branch?: Branch;
  settings?: SystemSettings;
  generatedBy?: string;
  className?: string;
}

function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  const trimmed = String(phone).trim();
  const cleaned = trimmed.replace(/\s+/g, '');
  if (/^\d{9}$/.test(cleaned) || /^\d{10}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return trimmed;
}

export const ReportPDF: React.FC<ReportPDFProps> = ({
  documentId = 'report-pdf-document',
  reportType,
  brandFilterName,
  branchFilterName,
  dateFilterName,
  dateRangeText,
  totalSum,
  reportData,
  brand,
  settings,
  generatedBy = 'Administrator',
  className = ''
}) => {
  const isDenza = brand?.brand_code === 'DENZA' || brandFilterName.toUpperCase().includes('DENZA');
  const centerTitle = brand?.service_center_name || (isDenza ? 'DENZA EXECUTIVE SERVICE CENTER' : (settings?.receipt_header_english_title || 'BYD SALES & SERVICE CENTER'));

  const nowStr = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <div
      id={documentId}
      className={`report-print-page bg-white text-black mx-auto font-sans leading-tight select-none box-border shadow-md print:shadow-none border border-slate-200 print:border-none p-6 ${className}`}
      style={{ minHeight: '210mm', width: '297mm' }}
    >
      <div className="report-content space-y-3">
        {/* Top Header Block matching Reference Image */}
        <div className="text-center pt-1 pb-2">
          <h1 className="text-xl font-black uppercase text-black tracking-tight font-sans">
            {centerTitle}
          </h1>
          <h2 className="text-[13pt] font-bold uppercase text-black tracking-wide mt-0.5">
            {reportType.toUpperCase()} DATA REPORT
          </h2>
          <p className="text-[10pt] font-bold italic text-black mt-0.5">
            For the Period of {dateFilterName} ({dateRangeText})
            {brandFilterName !== 'All Brands' && `  •  Brand: ${brandFilterName}`}
            {branchFilterName !== 'All Branches' && `  •  Branch: ${branchFilterName}`}
          </p>
        </div>

        {/* Subtle Scope & Generation Bar */}
        <div className="flex justify-between items-center text-[7.5pt] text-slate-500 pt-1 border-b border-slate-300 pb-1">
          <span>Scope: {brandFilterName} • {branchFilterName}</span>
          <span>Generated: {nowStr} • Prepared By: {generatedBy}</span>
        </div>

        {/* Data Table */}
        <div className="border border-black">
          <table className="w-full text-left text-[8.5pt] border-collapse table-fixed">
            <thead className="bg-[#002060] text-white font-heading font-extrabold uppercase text-[8pt] tracking-wider">
              <tr>
                <th className="py-2.5 px-1.5 text-center w-[4%] border-r border-slate-600">S/n</th>
                <th className="py-2.5 px-2 text-center w-[12%] border-r border-slate-600">Document No.</th>
                <th className="py-2.5 px-1.5 text-center w-[7%] border-r border-slate-600">Brand</th>
                <th className="py-2.5 px-2 w-[14%] border-r border-slate-600">Branch</th>
                <th className="py-2.5 px-2 w-[15%] border-r border-slate-600">Customer Name</th>
                <th className="py-2.5 px-2 text-center w-[11%] border-r border-slate-600">Phone Number</th>
                <th className="py-2.5 px-2 w-[14%] border-r border-slate-600">Vehicle Details</th>
                <th className="py-2.5 px-2 w-[8%] border-r border-slate-600">Created By</th>
                <th className="py-2.5 px-1.5 text-center w-[7%] border-r border-slate-600">Date</th>
                <th className="py-2.5 px-2 text-right w-[8%]">Total Amount ($)</th>
              </tr>
            </thead>
            <tbody className="bg-white font-medium text-black">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                    No report records found for the selected criteria.
                  </td>
                </tr>
              ) : (
                reportData.map((row, idx) => (
                  <tr key={idx} className="bg-white hover:bg-slate-50/50">
                    {/* S/n - Centered & BOLD like reference image */}
                    <td className="py-1.5 px-1.5 text-center font-bold text-black text-[8.5pt] border border-black">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono text-black text-[8.5pt] border border-black truncate">
                      {row.doc_no}
                    </td>
                    <td className="py-1.5 px-1.5 text-center text-black border border-black truncate">
                      {row.brand}
                    </td>
                    <td className="py-1.5 px-2 text-black border border-black truncate">
                      {row.branch}
                    </td>
                    <td className="py-1.5 px-2 text-black border border-black truncate">
                      {row.customer}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono text-black border border-black truncate">
                      {formatPhoneDisplay(row.phone)}
                    </td>
                    <td className="py-1.5 px-2 text-black border border-black truncate">
                      {row.vehicle}
                    </td>
                    <td className="py-1.5 px-2 text-black border border-black truncate">
                      {row.created_by}
                    </td>
                    <td className="py-1.5 px-1.5 text-center text-black font-mono text-[8pt] border border-black">
                      {row.date}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-black border border-black">
                      ${Number(row.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Total Row with matching Dark Navy #002060 and White Bold Font */}
            <tfoot>
              <tr className="bg-[#002060] text-white font-bold text-[9pt]">
                <td colSpan={9} className="py-2.5 px-3 text-center uppercase tracking-wider font-extrabold border border-black">
                  TOTAL
                </td>
                <td className="py-2.5 px-2 text-right font-mono text-[9.5pt] font-black text-white border border-black">
                  ${Number(totalSum || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Executive Authorization & Signatures */}
        <div className="pt-6">
          <div className="grid grid-cols-3 gap-8 text-[8.5pt]">
            <div className="text-center space-y-8">
              <span className="font-bold uppercase text-black block">PREPARED BY (SA / STAFF)</span>
              <div className="border-t border-black pt-1.5 text-[8pt] text-slate-600">
                Signature & Name / Date
              </div>
            </div>

            <div className="text-center space-y-8">
              <span className="font-bold uppercase text-black block">VERIFIED BY (ACCOUNTING)</span>
              <div className="border-t border-black pt-1.5 text-[8pt] text-slate-600">
                Signature & Name / Date
              </div>
            </div>

            <div className="text-center space-y-8">
              <span className="font-bold uppercase text-black block">APPROVED BY (BRANCH MANAGER)</span>
              <div className="border-t border-black pt-1.5 text-[8pt] text-slate-600">
                Signature & Name / Date
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

