/**
 * 統一されたボタンコンポーネント
 */

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  animated?: boolean;
  fullWidth?: boolean;
}

interface ButtonAsButtonProps extends BaseButtonProps, ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button';
  href?: never;
}

interface ButtonAsLinkProps extends BaseButtonProps {
  as: 'link';
  href: string;
  onClick?: never;
  type?: never;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const getVariantStyles = (variant: ButtonVariant): string => {
  const styles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-700',
    outline: 'bg-transparent hover:bg-blue-50 text-blue-600 border-blue-600 hover:border-blue-700',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700'
  };
  return styles[variant];
};

const getSizeStyles = (size: ButtonSize): string => {
  const styles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  return styles[size];
};

const baseStyles = 'inline-flex items-center justify-center rounded-md border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  animated = true,
  fullWidth = false,
  as = 'button',
  ...props
}) => {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);
  const widthStyle = fullWidth ? 'w-full' : '';
  
  const combinedClassName = `${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyle} ${className}`;

  const content = (
    <>
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </>
  );

  if (as === 'link') {
    const { href } = props as ButtonAsLinkProps;
    
    if (animated) {
      return (
        <motion.div
          variants={buttonVariants}
          initial="initial"
          whileHover={disabled ? undefined : "hover"}
          whileTap={disabled ? undefined : "tap"}
        >
          <Link href={href} className={combinedClassName}>
            {content}
          </Link>
        </motion.div>
      );
    }

    return (
      <Link href={href} className={combinedClassName}>
        {content}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButtonProps;

  if (animated) {
    return (
      <motion.button
        variants={buttonVariants}
        initial="initial"
        whileHover={disabled ? undefined : "hover"}
        whileTap={disabled ? undefined : "tap"}
        className={combinedClassName}
        disabled={disabled || loading}
        {...(Object.fromEntries(
          Object.entries(buttonProps).filter(([key]) => 
            !['onDrag', 'onDragStart', 'onDragEnd', 'onAnimationStart', 'onAnimationEnd', 'onTransitionEnd'].includes(key)
          )
        ) as Record<string, unknown>)}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <button
      className={combinedClassName}
      disabled={disabled || loading}
      {...buttonProps}
    >
      {content}
    </button>
  );
};

export default Button;
export type { ButtonProps, ButtonVariant, ButtonSize };