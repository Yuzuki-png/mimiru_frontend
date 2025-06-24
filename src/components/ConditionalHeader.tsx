'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/terms-of-service') || pathname.startsWith('/privacy-policy')) {
    return null;
  }
  
  return <Header />;
} 