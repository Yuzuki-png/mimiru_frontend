'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface ConditionalMainProps {
  children: ReactNode;
}

export default function ConditionalMain({ children }: ConditionalMainProps) {
  const pathname = usePathname();
  
  if (pathname.startsWith('/dashboard')) {
    return <main>{children}</main>;
  }
  
  return <main className="pt-16">{children}</main>;
} 