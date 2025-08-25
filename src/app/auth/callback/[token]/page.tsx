'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { setAuthToken } from '@/src/lib/api';

export default function AuthCallbackTokenPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const token = params.token as string;

    if (token) {
      // トークンを保存
      localStorage.setItem('token', token);
      setAuthToken(token);
      
      // 完全にページをリロードしてダッシュボードへ移動
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