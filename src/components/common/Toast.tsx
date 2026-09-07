import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-200 bg-white/95',
    error: 'border-red-200 bg-white/95',
    info: 'border-blue-200 bg-white/95'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full no-print animate-fade-in">
      <div className={`flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md ${borders[toast.type]}`}>
        {icons[toast.type]}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-900 leading-snug">{toast.title}</h4>
          {toast.message && (
            <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
