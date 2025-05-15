import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { AuthProvider } from "../contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mimiru - 短時間で気づきや知識を得られる音声ラーニングメディア",
  description: "誰でも投稿できる音声ラーニングプラットフォーム。忙しい日常の中でも、質の高い学びをあなたに。あなたの知識や経験を共有し、新たな気づきを得ましょう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen overscroll-y-none`}
      >
        <AuthProvider>
          <Header />
          <main className="pt-16">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
