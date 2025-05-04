import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { buttonVariants, whiteButtonVariants } from './AnimationVariants';

interface AnimatedButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'default' | 'white';
  className?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  href, 
  children, 
  variant = 'default',
  className = ''
}) => {
  const variants = variant === 'white' ? whiteButtonVariants : buttonVariants;
  
  const baseClasses = variant === 'white' 
    ? 'bg-white text-black font-bold px-8 py-3 rounded-full transition-colors text-center block'
    : 'border border-white text-white font-bold px-8 py-3 rounded-full transition-colors text-center block';
  
  return (
    <motion.div
      variants={variants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
    >
      <Link 
        href={href}
        className={`${baseClasses} ${className}`}
      >
        {children}
      </Link>
    </motion.div>
  );
};

export default AnimatedButton; 