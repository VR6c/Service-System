import React, { createContext, useContext, useState, useCallback } from 'react';
import { PopupConfirmModal, type PopupConfirmOptions } from '../components/common/PopupConfirmModal';
import { PopupAlertModal, type PopupAlertOptions } from '../components/common/PopupAlertModal';
import { ToastContainer, type ToastMessage } from '../components/common/Toast';

interface DialogContextType {
  confirm: (options: PopupConfirmOptions | string) => Promise<boolean>;
  showAlert: (options: PopupAlertOptions | string) => Promise<void>;
  showToast: (options: { title: string; message?: string; type?: 'success' | 'error' | 'warning' | 'info'; duration?: number } | string) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Confirm Modal State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: PopupConfirmOptions | null;
    resolve?: (value: boolean) => void;
  }>({
    isOpen: false,
    options: null
  });

  // Alert Modal State
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    options: PopupAlertOptions | null;
    resolve?: () => void;
  }>({
    isOpen: false,
    options: null
  });

  // Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const confirm = useCallback((options: PopupConfirmOptions | string): Promise<boolean> => {
    const normalizedOptions: PopupConfirmOptions =
      typeof options === 'string'
        ? {
            title: 'Confirm Action',
            message: options,
            type: 'danger',
            confirmText: 'Confirm'
          }
        : options;

    return new Promise<boolean>(resolve => {
      setConfirmState({
        isOpen: true,
        options: normalizedOptions,
        resolve
      });
    });
  }, []);

  const handleConfirmAction = useCallback(() => {
    confirmState.resolve?.(true);
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  }, [confirmState]);

  const handleCancelAction = useCallback(() => {
    confirmState.resolve?.(false);
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  }, [confirmState]);

  const showAlert = useCallback((options: PopupAlertOptions | string): Promise<void> => {
    const normalizedOptions: PopupAlertOptions =
      typeof options === 'string'
        ? {
            title: 'Notice',
            message: options,
            type: 'warning',
            confirmText: 'OK'
          }
        : options;

    return new Promise<void>(resolve => {
      setAlertState({
        isOpen: true,
        options: normalizedOptions,
        resolve
      });
    });
  }, []);

  const handleCloseAlert = useCallback(() => {
    alertState.resolve?.();
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, [alertState]);

  const showToast = useCallback((options: { title: string; message?: string; type?: 'success' | 'error' | 'warning' | 'info'; duration?: number } | string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage =
      typeof options === 'string'
        ? { id, title: options, type: 'info' }
        : {
            id,
            title: options.title,
            message: options.message,
            type: options.type || 'info',
            duration: options.duration
          };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <DialogContext.Provider value={{ confirm, showAlert, showToast }}>
      {children}

      {/* Global Confirmation Modal */}
      <PopupConfirmModal
        isOpen={confirmState.isOpen}
        options={confirmState.options}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />

      {/* Global Alert Modal */}
      <PopupAlertModal
        isOpen={alertState.isOpen}
        options={alertState.options}
        onClose={handleCloseAlert}
      />

      {/* Global Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const useConfirm = () => {
  const { confirm } = useDialog();
  return confirm;
};

export const useAlert = () => {
  const { showAlert } = useDialog();
  return showAlert;
};

export const useToast = () => {
  const { showToast } = useDialog();
  return showToast;
};
