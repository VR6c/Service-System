import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const duration = toast.duration ?? 4000;
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />
  };

  const borderThemes = {
    success: 'border-emerald-200/90 bg-white/95 text-emerald-900 shadow-emerald-500/10',
    error: 'border-red-200/90 bg-white/95 text-red-900 shadow-red-500/10',
    warning: 'border-amber-200/90 bg-white/95 text-amber-900 shadow-amber-500/10',
    info: 'border-blue-200/90 bg-white/95 text-blue-900 shadow-blue-500/10'
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in-right ${borderThemes[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="text-xs font-bold text-slate-900 leading-snug font-heading">{toast.title}</h4>
        {toast.message && (
          <p className="text-[11px] font-medium text-slate-600 mt-0.5 leading-relaxed whitespace-pre-line">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[10001] flex flex-col gap-2.5 max-w-sm w-full no-print pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
};
