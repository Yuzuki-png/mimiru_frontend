/**
 * 統一されたモーダルコンポーネント 既存のModalを拡張
 */

"use client";

import { useEffect, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ModalVariant = 'default' | 'centered' | 'drawer';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  variant?: ModalVariant;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  showDefaultFooter?: boolean;
  className?: string;
  footer?: ReactNode;
  header?: ReactNode;
}

interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

// サイズスタイル定義
const getSizeStyles = (size: ModalSize): string => {
  const styles = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-none w-full h-full m-0'
  };
  return styles[size];
};

// バリアントスタイル定義
const getVariantStyles = (variant: ModalVariant): string => {
  const styles = {
    default: 'items-center justify-center',
    centered: 'items-center justify-center',
    drawer: 'items-end justify-center sm:items-center'
  };
  return styles[variant];
};

const Modal: React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
} = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  showDefaultFooter = false,
  className = '',
  footer,
  header
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  if (!isMounted) return null;

  const sizeStyles = getSizeStyles(size);
  const variantStyles = getVariantStyles(variant);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className={`flex min-h-screen p-4 text-center ${variantStyles}`}
            onClick={handleBackdropClick}
          >
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className={`relative w-full ${sizeStyles} transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-left shadow-xl transition-all ${className}`}
              initial={{ scale: 0.9, opacity: 0, y: variant === 'drawer' ? 50 : 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: variant === 'drawer' ? 50 : 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {/* ヘッダー */}
              {header || title || showCloseButton ? (
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  {header || (
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {title}
                    </h3>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                      aria-label="閉じる"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ) : null}

              {/* ボディ */}
              <div className="p-6 text-gray-700 dark:text-gray-300">
                {children}
              </div>

              {/* フッター */}
              {footer || showDefaultFooter ? (
                <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                  {footer || (
                    <Button onClick={onClose} variant="primary">
                      閉じる
                    </Button>
                  )}
                </div>
              ) : null}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// サブコンポーネント
const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  className = '',
  onClose,
  showCloseButton = false
}) => {
  return (
    <div className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
          aria-label="閉じる"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`p-6 text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </div>
  );
};

const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

// サブコンポーネントを Modal に割り当て
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
export type { ModalProps, ModalSize, ModalVariant };