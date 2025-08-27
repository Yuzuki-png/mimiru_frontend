/**
 * トースト通知管理フック
 */

"use client";

import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '../components/ui/Toast';

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((
    title: string,
    type: ToastType = 'info',
    options?: {
      message?: string;
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    }
  ) => {
    const id = `toast-${++toastId}`;
    const toast: ToastMessage = {
      id,
      type,
      title,
      message: options?.message,
      duration: options?.duration,
      action: options?.action,
    };

    setToasts((prevToasts) => [...prevToasts, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    return addToast(title, 'success', { message, duration });
  }, [addToast]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    return addToast(title, 'error', { message, duration });
  }, [addToast]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    return addToast(title, 'warning', { message, duration });
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    return addToast(title, 'info', { message, duration });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};