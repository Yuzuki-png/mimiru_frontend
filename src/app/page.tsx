import Link from "next/link";

export default function Home() {
  return (
    <div 
      className="min-h-screen bg-black"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/login_background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="container mx-auto py-20 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
          <div className="text-white">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight">Mimiru</h1>
            <p className="text-xl sm:text-2xl font-light mb-6 text-gray-300">
              短時間で&quot;気づき&quot;や&quot;知識&quot;を得られる音声ラーニングメディア
            </p>
            <p className="text-gray-400 mb-6 text-lg">
              忙しい日常の中でも、質の高い学びをあなたに。
              誰でも知識を共有でき、厳選されたコンテンツで知的好奇心を満たします。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link 
                href="/login" 
                className="border border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-colors text-center"
              >
                ログイン
              </Link>
              <Link 
                href="/signup" 
                className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-white/90 transition-colors text-center"
              >
                新規登録
              </Link>
            </div>
          </div>
          
          <div className="bg-black/50 backdrop-blur-md p-8 rounded-xl border border-white/10">
            <div className="grid grid-cols-1 gap-5">
              {[
                {
                  icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                  title: "短時間で学ぶ",
                  description: "5〜15分の音声コンテンツで効率的に知識を獲得"
                },
                {
                  icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
                  title: "誰でも投稿可能",
                  description: "あなたの知識や経験を音声で簡単に共有"
                },
                {
                  icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                  title: "いつでもどこでも",
                  description: "通勤中や家事の合間に隙間時間で学習"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 text-white p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="rounded-full bg-white/10 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
