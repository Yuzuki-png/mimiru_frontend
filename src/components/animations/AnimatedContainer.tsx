import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { containerVariants } from './AnimationVariants';

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({ 
  children, 
  className = '',
  delay = 0
}) => {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContainer; 