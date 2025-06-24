'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/terms-of-service') || pathname.startsWith('/privacy-policy')) {
    return null;
  }
  
  return <Footer />;
} 