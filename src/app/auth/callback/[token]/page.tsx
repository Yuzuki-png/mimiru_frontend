'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { StorageManager } from '@/src/lib/storage';

export default function AuthCallbackTokenPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const tokenFromParams = params.token as string;
      const tokenFromQuery = searchParams.get('token');
      const error = searchParams.get('error');
      
      const token = tokenFromParams || tokenFromQuery;

      if (token) {
        StorageManager.setToken(token);
        
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003'}/auth/me`, {
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
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
        
      } else if (error) {
        router.push(`/login?error=${error}`);
      } else {
        router.push('/login?error=no_token');
      }
    };

    handleCallback();
  }, [params, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">認証中...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
      </div>
    </div>
  );
}