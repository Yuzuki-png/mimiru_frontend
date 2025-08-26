/**
 * 統一されたカードコンポーネント
 */

import React, { ReactNode, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

type CardVariant = 'default' | 'bordered' | 'elevated' | 'flat';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  animated?: boolean;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

// スタイル定義
const getVariantStyles = (variant: CardVariant): string => {
  const styles = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
    bordered: 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700',
    flat: 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
  };
  return styles[variant];
};

const getPaddingStyles = (padding: CardProps['padding']): string => {
  const styles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  return styles[padding || 'md'];
};

// アニメーションバリアント
const cardVariants = {
  initial: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -2 },
  tap: { scale: 0.98 }
};

const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
  Footer: React.FC<CardFooterProps>;
} = ({
  children,
  variant = 'default',
  className = '',
  animated = false,
  hoverable = false,
  padding = 'md',
  ...props
}) => {
  const variantStyles = getVariantStyles(variant);
  const paddingStyles = getPaddingStyles(padding);
  const hoverStyles = hoverable ? 'cursor-pointer transition-all duration-200' : '';
  
  const combinedClassName = `rounded-lg ${variantStyles} ${paddingStyles} ${hoverStyles} ${className}`;

  if (animated) {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        whileHover={hoverable ? "hover" : undefined}
        whileTap={hoverable ? "tap" : undefined}
        className={combinedClassName}
        {...(Object.fromEntries(
          Object.entries(props).filter(([key]) => 
            !['onDrag', 'onDragStart', 'onDragEnd', 'onAnimationStart', 'onAnimationEnd', 'onTransitionEnd'].includes(key)
          )
        ) as Record<string, unknown>)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

// サブコンポーネント
const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`border-b border-gray-200 dark:border-gray-700 pb-3 mb-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex-1 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// サブコンポーネントを Card に割り当て
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
export type { CardProps, CardVariant };