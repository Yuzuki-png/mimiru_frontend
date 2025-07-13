"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { AnimatedElement } from "./animations";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error: authError } = useAuth();
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    
    if (!email || !password) {
      setClientError("メールアドレスとパスワードを入力してくださaa");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email, password);
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

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <AnimatedElement direction="right" className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-70"
              placeholder="your@email.com"
            />
          </AnimatedElement>

          <AnimatedElement direction="right" delay={0.1} className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-70"
              placeholder="••••••••"
            />
          </AnimatedElement>

          <AnimatedElement direction="left" delay={0.3}>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-70 disabled:hover:bg-blue-600"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? "ログイン中..." : "ログイン"}
            </motion.button>
          </AnimatedElement>
        </div>
      </form>
    </div>
  );
} 