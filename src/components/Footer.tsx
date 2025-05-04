import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-6 bg-black border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-6">
            <Link
              href="/terms-of-service"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              利用規約
            </Link>
            <Link
              href="/privacy-policy"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              プライバシーポリシー
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/mimiru-project"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
          </div>
          
          <p className="text-xs text-gray-500">© 2024 Mimiru</p>
        </div>
      </div>
    </footer>
  );
} 