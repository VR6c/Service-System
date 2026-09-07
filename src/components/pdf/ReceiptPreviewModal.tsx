import React, { useRef } from 'react';
import type { Receipt, Brand, Branch } from '../../types';
import { ReceiptPDF } from './ReceiptPDF';
import { useLanguage } from '../../context/LanguageContext';
import { exportToPDF, printDocument } from '../../utils/pdfExport';
import { Printer, Download, X } from 'lucide-react';

interface ReceiptPreviewModalProps {
  receipt: Receipt;
  brand?: Brand;
  branch?: Branch;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  receipt,
  brand,
  branch,
  isOpen,
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handlePrint = () => {
    printDocument();
  };

  const handleDownloadPDF = async () => {
    await exportToPDF('receipt-pdf-document', receipt.receipt_no);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden print:shadow-none print:max-w-none print:max-h-none print:w-full">
        {/* Modal Toolbar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Receipt Document Preview
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              {receipt.receipt_no} • {receipt.customer_name} ({receipt.vehicle_model})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium text-xs transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              {t.print}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-xs transition shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {t.downloadPdf}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable A4 Document */}
        <div ref={containerRef} className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center print:bg-white print:p-0">
          <ReceiptPDF receipt={receipt} brand={brand} branch={branch} />
        </div>
      </div>
    </div>
  );
};
