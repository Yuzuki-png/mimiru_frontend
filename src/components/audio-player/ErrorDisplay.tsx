"use client";

import React, { memo } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorDisplayProps {
  error: string;
  onClearError: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = memo(({
  error,
  onClearError
}) => {
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: "auto" }}
      className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800"
    >
      <div className="px-4 py-2 flex items-center justify-between">
        <p className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </p>
        <button
          onClick={onClearError}
          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
});

ErrorDisplay.displayName = 'ErrorDisplay';
export default ErrorDisplay;