"use client";

import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import { AnimatedContainer, AnimatedElement } from "../../components/animations";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <motion.div
        className="min-h-screen bg-black py-12 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto max-w-5xl">
          <AnimatedContainer className="bg-black/50 backdrop-blur-md p-8 rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <AnimatedElement direction="left">
                <h1 className="text-3xl font-bold text-white">ダッシュボード</h1>
              </AnimatedElement>
              <AnimatedElement direction="right">
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
                >
                  ログアウト
                </button>
              </AnimatedElement>
            </div>

            <AnimatedElement direction="left" delay={0.1}>
              <div className="bg-gray-800/50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">プロフィール情報</h2>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-400 mr-2">ID:</span>
                    <span className="text-white">{user?.id}</span>
                  </p>
                  <p>
                    <span className="text-gray-400 mr-2">メールアドレス:</span>
                    <span className="text-white">{user?.email}</span>
                  </p>
                  {user?.name && (
                    <p>
                      <span className="text-gray-400 mr-2">名前:</span>
                      <span className="text-white">{user.name}</span>
                    </p>
                  )}
                </div>
              </div>
            </AnimatedElement>

            <AnimatedElement direction="right" delay={0.2}>
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-white mb-4">最近のアクティビティ</h2>
                <p className="text-gray-400">
                  まだアクティビティはありません。コンテンツの視聴や投稿を始めましょう。
                </p>
              </div>
            </AnimatedElement>
          </AnimatedContainer>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
} 