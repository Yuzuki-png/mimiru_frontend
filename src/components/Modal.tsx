"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  closeButton?: boolean;
}

const Modal = ({ isOpen, onClose, title, children, closeButton = true }: ModalProps) => {
  const [isMounted, setIsMounted] = useState(false);

  // hydration対策
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  // モーダル外クリックで閉じる
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isMounted) return null;

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
            className="flex min-h-screen items-center justify-center p-4 text-center"
            onClick={handleBackdropClick}
          >
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative w-full max-w-lg transform overflow-hidden rounded-xl bg-black/80 border border-white/10 p-6 text-left shadow-xl transition-all"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                {closeButton && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white focus:outline-none"
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

              <div className="mt-2 text-gray-300">{children}</div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                >
                  閉じる
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal; 