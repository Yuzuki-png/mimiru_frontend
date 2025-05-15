"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AnimatedContainer, AnimatedElement } from "../../components/animations";
import RegisterForm from "../../components/RegisterForm";

export default function Signup() {
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
      <div className="container mx-auto py-12 px-6">
        <div className="max-w-md mx-auto">
          <AnimatedContainer className="bg-black/50 backdrop-blur-md p-8 rounded-xl border border-white/10">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">新規登録</h1>
              <p className="text-gray-400">Mimiruへようこそ</p>
            </div>

            <RegisterForm />

            <AnimatedElement direction="left" delay={0.6} className="text-center mt-6">
              <p className="text-gray-400">
                すでにアカウントをお持ちの場合は{" "}
                <Link href="/login" className="text-blue-400 hover:text-blue-300">
                  ログイン
                </Link>
              </p>
            </AnimatedElement>
          </AnimatedContainer>
        </div>
      </div>
    </motion.div>
  );
} 