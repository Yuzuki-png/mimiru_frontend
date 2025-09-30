'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { StorageManager } from '@/src/lib/storage';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (token) {
        StorageManager.setToken(token);
        
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (userData.email) {
              localStorage.setItem('userEmail', userData.email);
            }
            if (userData.name) {
              localStorage.setItem('userName', userData.name);
            }
          }
        } catch {
        }
        
        // 直接 /dashboard/discover にリダイレクト
        setTimeout(() => {
          window.location.href = '/dashboard/discover';
        }, 500);
        
      } else if (error) {
        router.push(`/login?error=${error}`);
      } else {
        router.push('/login?error=no_token');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">認証中...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">認証中...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
      </div>
    </div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}