/**
 * 統一された入力コンポーネント
 */

import React, { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode } from 'react';

type InputVariant = 'default' | 'filled' | 'underlined';
type InputSize = 'sm' | 'md' | 'lg';

interface BaseInputProps {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
  required?: boolean;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
}

interface InputProps extends BaseInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  as?: 'input';
}

interface TextareaProps extends BaseInputProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  as: 'textarea';
  rows?: number;
}

type FormInputProps = InputProps | TextareaProps;

// スタイル定義
const getVariantStyles = (variant: InputVariant, hasError: boolean): string => {
  if (hasError) {
    return 'border-red-500 focus:border-red-500 focus:ring-red-500';
  }
  
  const styles = {
    default: 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800',
    filled: 'border-transparent bg-gray-100 dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500',
    underlined: 'border-0 border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-0 bg-transparent rounded-none'
  };
  return styles[variant];
};

const getSizeStyles = (size: InputSize): string => {
  const styles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg'
  };
  return styles[size];
};

const baseStyles = 'block w-full rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white';

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormInputProps>(({
  label,
  helperText,
  error,
  variant = 'default',
  size = 'md',
  required = false,
  fullWidth = true,
  startIcon,
  endIcon,
  className = '',
  as = 'input',
  ...props
}, ref) => {
  const hasError = !!error;
  const variantStyles = getVariantStyles(variant, hasError);
  const sizeStyles = getSizeStyles(size);
  const widthStyle = fullWidth ? 'w-full' : '';
  
  const inputClassName = `${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyle} ${startIcon ? 'pl-10' : ''} ${endIcon ? 'pr-10' : ''} ${className}`;

  const inputElement = as === 'textarea' ? (
    <textarea
      ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
      className={inputClassName}
      {...(props as TextareaProps)}
    />
  ) : (
    <input
      ref={ref as React.ForwardedRef<HTMLInputElement>}
      className={inputClassName}
      {...(props as InputProps)}
    />
  );

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {startIcon}
            </div>
          </div>
        )}
        
        {inputElement}
        
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="h-5 w-5 text-gray-400">
              {endIcon}
            </div>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`mt-2 text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
export type { FormInputProps, InputVariant, InputSize };