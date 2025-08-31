/**
 * トーストコンテナ 複数のトーストを管理
 */

"use client";

import React from 'react';
import Toast, { ToastMessage, ToastPosition } from './Toast';

interface ToastContainerProps {
  toasts: ToastMessage[];
  position?: ToastPosition;
  onClose: (id: string) => void;
}

const getPositionStyles = (position: ToastPosition): string => {
  const styles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };
  return styles[position];
};

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right',
  onClose
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className={`fixed z-50 ${getPositionStyles(position)}`}>
      <div className="space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            position={position}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;