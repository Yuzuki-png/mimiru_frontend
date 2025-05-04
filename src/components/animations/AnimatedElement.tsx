import React, { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';
import { slideInLeft, slideInRight } from './AnimationVariants';

type AnimationDirection = 'left' | 'right' | 'none';

interface AnimatedElementProps {
  children: ReactNode;
  className?: string;
  direction?: AnimationDirection;
  customVariants?: Variants;
  delay?: number;
}

const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  className = '',
  direction = 'none',
  customVariants,
  delay = 0
}) => {
  // 方向に基づいてバリアントを選択
  let variants = customVariants;
  
  if (!variants) {
    if (direction === 'left') {
      variants = slideInLeft;
    } else if (direction === 'right') {
      variants = slideInRight;
    }
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial={variants ? "hidden" : { opacity: 0 }}
      animate={variants ? "visible" : { opacity: 1 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedElement; 