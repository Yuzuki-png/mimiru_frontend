'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header 
      className="fixed top-0 left-0 right-0 w-full z-50 bg-black/90 backdrop-blur-md py-4"
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tight text-white">
          Mimiru
        </Link>
        
        <div className="flex gap-4">
          <Link 
            href="/login"
            className="text-white text-sm font-medium px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
          >
            ログイン
          </Link>
          <Link 
            href="/signup"
            className="bg-white text-black text-sm font-bold px-6 py-2 rounded-full hover:bg-white/90 transition-colors"
          >
            新規登録
          </Link>
        </div>
      </div>
    </header>
  );
} 