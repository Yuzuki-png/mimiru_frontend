import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const useSidebarState = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  // Responsive behavior: collapse on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Only apply to dashboard pages
    if (isDashboard) {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isDashboard]);

  return { isCollapsed, isDashboard };
};