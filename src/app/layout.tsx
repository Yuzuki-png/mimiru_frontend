import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalFooter from "../components/ConditionalFooter";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../components/ThemeProvider";
import ConditionalHeader from "../components/ConditionalHeader";
import ConditionalMain from "../components/ConditionalMain";

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
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black text-gray-900 dark:text-white min-h-screen overscroll-y-none`}
      >
        <AuthProvider>
          <ThemeProvider>
            <ConditionalHeader />
            <ConditionalMain>
              {children}
            </ConditionalMain>
            <ConditionalFooter />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
