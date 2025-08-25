'use client';

import { useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { setAuthToken } from '@/src/lib/api';

function AuthCallbackTokenContent() {
  const params = useParams();

  useEffect(() => {
    const token = params.token as string;

    if (token) {
      localStorage.setItem('token', token);
      setAuthToken(token);
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login?error=no_token';
    }
  }, [params.token]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">認証中...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
      </div>
    </div>
  );
}

export default function AuthCallbackTokenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">認証中...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
      </div>
    </div>}>
      <AuthCallbackTokenContent />
    </Suspense>
  );
}