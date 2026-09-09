import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Quotation, Receipt, Brand, Branch } from '../../types';
import { QuotationPDF } from '../pdf/QuotationPDF';
import { ReceiptPDF } from '../pdf/ReceiptPDF';
import { exportToPDF, printDocument } from '../../utils/pdfExport';
import { Printer, Download, X, FileText } from 'lucide-react';

interface DocumentPreviewModalProps {
  type: 'quotation' | 'receipt';
  quotation?: Quotation | null;
  receipt?: Receipt | null;
  brand?: Brand;
  branch?: Branch;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  type,
  quotation,
  receipt,
  brand,
  branch,
  isOpen,
  onClose
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const docNo = type === 'quotation' ? quotation?.quotation_no : receipt?.receipt_no;
  const customerName = type === 'quotation' ? quotation?.customer_name : receipt?.customer_name;
  const vehicleModel = type === 'quotation' ? quotation?.vehicle_model : receipt?.vehicle_model;

  const handlePrint = () => {
    printDocument();
  };

  const handleDownloadPDF = async () => {
    const elementId = type === 'quotation' ? 'quotation-pdf-document' : 'receipt-pdf-document';
    const filename = docNo || (type === 'quotation' ? 'Quotation' : 'Receipt');
    await exportToPDF(elementId, filename);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:static animate-fade-in font-sans"
    >
      {/* Full-screen Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-all cursor-pointer print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden print:shadow-none print:max-w-none print:max-h-none print:w-full border border-slate-200/90 ring-1 ring-black/5 animate-pop-scale z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/90 bg-slate-50/90 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight font-heading">
                {type === 'quotation' ? 'Quotation Document Preview' : 'Receipt Document Preview'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                <span className="font-mono font-bold text-slate-800">{docNo}</span> • {customerName} ({vehicleModel})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition shadow-2xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/70 rounded-xl transition ml-1 cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Scrollable Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/90 flex justify-center print:bg-white print:p-0">
          {type === 'quotation' && quotation && (
            <QuotationPDF quotation={quotation} brand={brand} branch={branch} />
          )}
          {type === 'receipt' && receipt && (
            <ReceiptPDF receipt={receipt} brand={brand} branch={branch} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
