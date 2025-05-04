import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cardVariants, createSequentialCardVariant } from './AnimationVariants';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  index?: number;
  baseDelay?: number;
  delayIncrement?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  index = 0,
  baseDelay = 0.5,
  delayIncrement = 0.2
}) => {
  // インデックスに応じて遅延を計算
  const delay = baseDelay + (index * delayIncrement);
  const variants = index ? createSequentialCardVariant(delay) : cardVariants;

  return (
    <motion.div
      className={`flex items-center gap-4 text-white p-3 rounded-lg transition-colors ${className}`}
      variants={variants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard; 