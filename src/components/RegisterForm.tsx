"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { AnimatedElement } from "./animations";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, error: authError, clearError } = useAuth();
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
  }, [clearError]);

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
      </form>
    </div>
  );
} 