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
  branch,
  settings,
  generatedBy = 'Administrator',
  className = ''
}) => {
  const isDenza = brand?.brand_code === 'DENZA' || brandFilterName.toUpperCase().includes('DENZA');
  const customLogoUrl = brand?.logo_url || (isDenza ? settings?.denza_logo_url : settings?.byd_logo_url) || settings?.header_logo_url || '';
  const centerTitle = brand?.service_center_name || (isDenza ? 'DENZA EXECUTIVE SERVICE CENTER' : (settings?.receipt_header_english_title || 'BYD SALES & SERVICE CENTER'));
  const localTitle = brand?.local_company_name || (isDenza ? 'មជ្ឈមណ្ឌលសេវាកម្មរថយន្តអគ្គិសនីដេនហ្សា' : (settings?.receipt_header_khmer_title || 'មិនអាចយកទៅប្រកាសពន្ធឬប្រកាសជាប់ពន្ធ'));
  const phoneText = branch?.telephone || brand?.telephone || settings?.phone || (isDenza ? '+855 23 999 777' : '+855 23 888 999');
  const addressText = branch?.address || brand?.address || settings?.address || (isDenza ? 'No. 100 Hun Sen Blvd, Chak Angre Krom, Phnom Penh' : 'No. 888 Monivong Blvd, Tonle Bassac, Phnom Penh');
  const emailText = branch?.email || brand?.email || settings?.email || 'service@automotive.com.kh';

  const brandDisplayName = brandFilterName === 'All Brands' ? 'BYD & DENZA' : brandFilterName;
  const reportTitleName = `${brandDisplayName} ${reportType.toUpperCase()} FINANCIAL & OPERATIONS REPORT`;

  return (
    <div
      id={documentId}
      className={`report-print-page bg-white text-slate-900 mx-auto font-sans leading-tight select-none box-border shadow-md print:shadow-none border border-slate-200 print:border-none p-5 sm:p-6 ${className}`}
      style={{ minHeight: '210mm', width: '297mm' }}
    >
      <div className="report-content space-y-3">
        {/* Master Header Box */}
        <div className="border border-slate-900 bg-white">
          <div className="grid grid-cols-12 border-b border-slate-900">
            {/* Header Left: Logo + Center Titles + Contact */}
            <div className="col-span-9 p-3 border-r border-slate-900 flex flex-col justify-between">
              <div className="flex items-start gap-4">
                {/* Logo Box */}
                <div className="shrink-0 max-w-[130px] pt-1">
                  {customLogoUrl && customLogoUrl.trim() !== '' ? (
                    <img src={customLogoUrl} alt={isDenza ? 'DENZA Custom Logo' : 'BYD Custom Logo'} className="h-10 max-w-[125px] object-contain" />
                  ) : isDenza ? (
                    <img src="https://tse2.mm.bing.net/th/id/OIP.R4IlkQVbbsQoWUDuVQb2vAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" alt="DENZA Custom Logo" className="h-10 max-w-[125px] object-contain" />
                  ) : (
                    <img src="https://1000logos.net/wp-content/uploads/2020/07/BYD-Logo.png" alt="BYD Custom Logo" className="h-10 max-w-[125px] object-contain" />
                  )}
                </div>

                {/* Company Title */}
                <div className="flex-1">
                  <h1 className="text-[12pt] font-black text-slate-900 uppercase tracking-tight font-sans">
                    {centerTitle}
                  </h1>
                  <p className="text-[10.5pt] font-bold text-slate-800 font-muol mt-0.5">
                    {localTitle}
                  </p>
                  <p className="text-[8.5pt] text-slate-600 mt-1">
                    <span className="font-semibold text-slate-700">Add:</span> {addressText}
                  </p>
                  <p className="text-[8.5pt] text-slate-600">
                    <span className="font-semibold text-slate-700">Tel:</span> {phoneText} &nbsp;•&nbsp; <span className="font-semibold text-slate-700">Email:</span> {emailText}
                  </p>
                </div>
              </div>
            </div>

            {/* Header Right: Document Type Badge */}
            <div className="col-span-3 p-3 flex flex-col items-center justify-center text-center bg-slate-50">
              <span className="text-[9pt] font-extrabold uppercase text-slate-500 tracking-wider">
                Official Report
              </span>
              <span className="text-[12pt] font-black text-slate-900 uppercase font-heading tracking-tight mt-0.5">
                {reportType} SUMMARY
              </span>
              <span className="text-[8pt] text-slate-500 font-medium mt-1">
                Ref: {new Date().toISOString().slice(0, 10).replace(/-/g, '')}
              </span>
            </div>
          </div>

          {/* Subheader Title Banner */}
          <div className="bg-slate-100/80 px-3 py-1.5 border-b border-slate-900 text-center">
            <h2 className="text-[10pt] font-black uppercase text-slate-900 tracking-wider">
              {reportTitleName}
            </h2>
          </div>

          {/* Metadata & Filter Bar */}
          <div className="grid grid-cols-12 text-[8.5pt] p-2 bg-white">
            <div className="col-span-8 space-y-0.5">
              <div>
                <span className="font-bold text-slate-700">Filter Period: </span>
                <span className="text-slate-900 font-semibold">{dateFilterName} ({dateRangeText})</span>
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="font-bold text-slate-700">Brand Scope: </span>
                  <span className="text-slate-900">{brandFilterName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Branch Scope: </span>
                  <span className="text-slate-900">{branchFilterName}</span>
                </div>
              </div>
            </div>

            <div className="col-span-4 text-right space-y-0.5">
              <div>
                <span className="font-bold text-slate-700">Generated: </span>
                <span className="font-mono text-slate-900">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Prepared By: </span>
                <span className="text-slate-900 font-medium">{generatedBy}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick KPI Badges */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2 border border-slate-300 rounded bg-slate-50 flex items-center justify-between">
            <span className="font-extrabold text-slate-600 uppercase text-[9pt]">Total Records</span>
            <span className="font-black font-mono text-[11pt] text-slate-900">{reportData.length} Documents</span>
          </div>
          <div className="p-2 border border-emerald-300 rounded bg-emerald-50/50 flex items-center justify-between">
            <span className="font-extrabold text-emerald-800 uppercase text-[9pt]">Total Revenue Amount</span>
            <span className="font-black font-mono text-[11pt] text-emerald-800">
              ${Number(totalSum || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="border border-slate-900">
          <table className="w-full text-left text-[8.5pt] border-collapse table-fixed">
            <thead className="bg-slate-900 text-white font-heading font-extrabold uppercase text-[8pt] tracking-wider">
              <tr>
                <th className="py-2 px-1.5 text-center w-[3%] border-r border-slate-800">#</th>
                <th className="py-2 px-2 text-center w-[12%] border-r border-slate-800">Document No.</th>
                <th className="py-2 px-1.5 text-center w-[7%] border-r border-slate-800">Brand</th>
                <th className="py-2 px-2 w-[16%] border-r border-slate-800">Branch</th>
                <th className="py-2 px-2 w-[14%] border-r border-slate-800">Customer Name</th>
                <th className="py-2 px-2 text-center w-[11%] border-r border-slate-800">Phone</th>
                <th className="py-2 px-2 w-[15%] border-r border-slate-800">Vehicle Details</th>
                <th className="py-2 px-2 text-right w-[9%] border-r border-slate-800">Amount ($)</th>
                <th className="py-2 px-2 w-[8%] border-r border-slate-800">Created By</th>
                <th className="py-2 px-1.5 text-center w-[8%]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-medium text-slate-800">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                    No report records found for the selected criteria.
                  </td>
                </tr>
              ) : (
                reportData.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                    <td className="py-1.5 px-1.5 text-center text-slate-400 font-mono text-[8pt] border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-900 text-[8.5pt] border-r border-slate-200 truncate">
                      {row.doc_no}
                    </td>
                    <td className="py-1.5 px-1.5 text-center font-bold text-slate-900 border-r border-slate-200 truncate">
                      {row.brand}
                    </td>
                    <td className="py-1.5 px-2 text-slate-700 border-r border-slate-200 truncate">
                      {row.branch}
                    </td>
                    <td className="py-1.5 px-2 font-bold text-slate-900 border-r border-slate-200 truncate">
                      {row.customer}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-800 border-r border-slate-200 truncate">
                      {row.phone}
                    </td>
                    <td className="py-1.5 px-2 text-slate-700 border-r border-slate-200 truncate">
                      {row.vehicle}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                      ${Number(row.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-1.5 px-2 text-slate-600 border-r border-slate-200 truncate">
                      {row.created_by}
                    </td>
                    <td className="py-1.5 px-1.5 text-center text-slate-600 font-mono text-[8pt]">
                      {row.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-[9pt]">
                <td colSpan={7} className="py-2 px-3 text-right uppercase text-slate-900 font-extrabold border-r border-slate-300">
                  GRAND TOTAL ({reportData.length} records):
                </td>
                <td className="py-2 px-2 text-right font-mono text-[10pt] text-red-700 font-black border-r border-slate-300">
                  ${Number(totalSum || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td colSpan={2} className="py-2 px-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Executive Authorization & Signatures */}
        <div className="border border-slate-900 bg-white p-3.5 mt-2">
          <div className="grid grid-cols-3 gap-6 text-[8.5pt]">
            <div className="text-center space-y-7">
              <span className="font-extrabold uppercase text-slate-800 block">Prepared By (SA / Staff)</span>
              <div className="border-t border-dashed border-slate-400 pt-1 text-[8pt] text-slate-500">
                Signature & Name / Date
              </div>
            </div>

            <div className="text-center space-y-7">
              <span className="font-extrabold uppercase text-slate-800 block">Verified By (Accounting)</span>
              <div className="border-t border-dashed border-slate-400 pt-1 text-[8pt] text-slate-500">
                Signature & Name / Date
              </div>
            </div>

            <div className="text-center space-y-7">
              <span className="font-extrabold uppercase text-slate-800 block">Approved By (Branch Manager)</span>
              <div className="border-t border-dashed border-slate-400 pt-1 text-[8pt] text-slate-500">
                Signature & Name / Date
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-3 pt-2 text-[7.5pt] text-slate-400 flex justify-between items-center">
            <span>Confidential • For Internal Management & Financial Reporting Only</span>
            <span>BYD & DENZA Service Operations System</span>
          </div>
        </div>
      </div>
    </div>
  );
};
