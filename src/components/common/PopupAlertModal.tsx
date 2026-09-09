import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface PopupAlertOptions {
  title: string;
  message: string;
  type?: 'warning' | 'error' | 'info' | 'success';
  confirmText?: string;
  details?: React.ReactNode;
}

interface PopupAlertModalProps {
  isOpen: boolean;
  options: PopupAlertOptions | null;
  onClose: () => void;
}

export const PopupAlertModal: React.FC<PopupAlertModalProps> = ({
  isOpen,
  options,
  onClose
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !options) return null;

  const type = options.type || 'warning';
  const confirmText = options.confirmText || 'Understood';

  const icons = {
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    error: <AlertCircle className="w-6 h-6 text-red-600" />,
    info: <Info className="w-6 h-6 text-blue-600" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-600" />
  };

  const badgeStyles = {
    warning: 'bg-amber-50 border-amber-200 text-amber-600 ring-4 ring-amber-500/10',
    error: 'bg-red-50 border-red-200 text-red-600 ring-4 ring-red-500/10',
    info: 'bg-blue-50 border-blue-200 text-blue-600 ring-4 ring-blue-500/10',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-600 ring-4 ring-emerald-500/10'
  };

  const btnStyles = {
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/25 focus:ring-amber-500',
    error: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/25 focus:ring-red-500',
    info: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 focus:ring-blue-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 focus:ring-emerald-500'
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto no-print animate-fade-in"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-md p-6 overflow-hidden z-10 animate-pop-scale"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border shrink-0 ${badgeStyles[type]}`}>
            {icons[type]}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading tracking-tight leading-snug">
              {options.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 leading-relaxed whitespace-pre-line">
              {options.message}
            </p>

            {options.details && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 font-mono font-bold break-all">
                {options.details}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${btnStyles[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
