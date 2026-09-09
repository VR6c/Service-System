import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, Info, Check, X } from 'lucide-react';

export interface PopupConfirmOptions {
  title: string;
  message: string;
  details?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  confirmButtonVariant?: 'danger' | 'warning' | 'primary';
}

interface PopupConfirmModalProps {
  isOpen: boolean;
  options: PopupConfirmOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PopupConfirmModal: React.FC<PopupConfirmModalProps> = ({
  isOpen,
  options,
  onConfirm,
  onCancel
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || !options) return null;

  const type = options.type || 'danger';
  const confirmText = options.confirmText || (type === 'danger' ? 'Delete' : 'Confirm');
  const cancelText = options.cancelText || 'Cancel';

  const icons = {
    danger: <Trash2 className="w-6 h-6 text-red-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    info: <Info className="w-6 h-6 text-blue-600" />
  };

  const badgeStyles = {
    danger: 'bg-red-50 border-red-200 text-red-600 ring-4 ring-red-500/10',
    warning: 'bg-amber-50 border-amber-200 text-amber-600 ring-4 ring-amber-500/10',
    info: 'bg-blue-50 border-blue-200 text-blue-600 ring-4 ring-blue-500/10'
  };

  const confirmBtnStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/25 focus:ring-red-500',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/25 focus:ring-amber-500',
    info: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 focus:ring-blue-500'
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto no-print animate-fade-in"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog Card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-md p-6 overflow-hidden z-10 animate-pop-scale"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
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
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 leading-relaxed">
              {options.message}
            </p>

            {options.details && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 font-mono font-bold break-all">
                {options.details}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4.5 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmBtnStyles[type]}`}
          >
            {type === 'danger' ? <Trash2 className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
