"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatedContainer, AnimatedElement } from "../../components/animations";
import Modal from "../../components/Modal";
import LoginForm from "../../components/LoginForm";

export default function Login() {
  const [showRegisteredModal, setShowRegisteredModal] = useState(false);
  const searchParams = useSearchParams();

  // 新規登録後のリダイレクトチェック
  useEffect(() => {
    if (searchParams?.get("registered") === "true") {
      setShowRegisteredModal(true);
    }
  }, [searchParams]);

  return (
    <motion.div 
      className="min-h-screen bg-black"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/login_background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto py-16 px-6">
        <div className="max-w-md mx-auto">
          <AnimatedContainer className="bg-black/50 backdrop-blur-md p-8 rounded-xl border border-white/10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">ログイン</h1>
              <p className="text-gray-400">Mimiruアカウントにログイン</p>
            </div>

            <LoginForm />

            <AnimatedElement direction="left" delay={0.4} className="mt-6 text-center">
              <p className="text-gray-400">
                アカウントをお持ちでない場合は{" "}
                <Link href="/signup" className="text-blue-400 hover:text-blue-300">
                  新規登録
                </Link>
              </p>
            </AnimatedElement>
          </AnimatedContainer>
        </div>
      </div>

      {/* 新規登録完了モーダル */}
      <Modal
        isOpen={showRegisteredModal}
        onClose={() => setShowRegisteredModal(false)}
        title="アカウント登録完了"
      >
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-green-500/20 text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">アカウント登録が完了しました！</h3>
          <p className="text-gray-400">新しいアカウントでログインしてください。</p>
        </div>
      </Modal>
    </motion.div>
  );
} 