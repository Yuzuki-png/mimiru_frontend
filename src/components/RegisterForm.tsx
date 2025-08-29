"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { AnimatedElement } from "./animations";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, error: authError } = useAuth();
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setClientError("有効なメールアドレスを入力してください（例: user@example.com）");
      return;
    }
    
    if (password !== confirmPassword) {
      setClientError("パスワードが一致しません。");
      return;
    }
    
    if (password.length < 6) {
      setClientError("パスワードは6文字以上である必要があります");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await register(email, password, username || undefined);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {(authError || clientError) && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">
          {authError || clientError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatedElement direction="right" className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-gray-300">
            ユーザー名（任意）
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-70"
            placeholder="ユーザー名"
            disabled={isSubmitting}
          />
        </AnimatedElement>

        <AnimatedElement direction="right" delay={0.1} className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-70"
            placeholder="user@example.com"
            disabled={isSubmitting}
          />
        </AnimatedElement>

        <AnimatedElement direction="right" delay={0.2} className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-70"
            placeholder="••••••••"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-400">6文字以上、英数字と記号を含む必要があります</p>
        </AnimatedElement>

        <AnimatedElement direction="right" delay={0.3} className="space-y-2">
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">
            パスワード確認
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-70"
            placeholder="••••••••"
            disabled={isSubmitting}
          />
        </AnimatedElement>

        <AnimatedElement direction="left" delay={0.5}>
          <motion.button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 mt-4 disabled:opacity-70 disabled:hover:bg-blue-600"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? "登録中..." : "アカウント作成"}
          </motion.button>
        </AnimatedElement>

        <AnimatedElement direction="left" delay={0.6}>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">または</span>
            </div>
          </div>
        </AnimatedElement>

        <AnimatedElement direction="left" delay={0.7}>
          <motion.button
            type="button"
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
            }}
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition duration-200 disabled:opacity-70 flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Googleで新規登録
          </motion.button>
        </AnimatedElement>
      </form>
    </div>
  );
} 