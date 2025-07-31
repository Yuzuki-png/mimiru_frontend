"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";

interface SearchBarProps {
  initialQuery?: string;
  className?: string;
  placeholder?: string;
  showHistory?: boolean;
  onSearch?: (query: string) => void;
}

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export default function SearchBar({ 
  initialQuery = "", 
  className = "", 
  placeholder = "音声コンテンツを検索...",
  showHistory = true,
  onSearch
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 検索履歴をローカルストレージから読み込み
  useEffect(() => {
    if (showHistory && typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('searchHistory');
      if (savedHistory) {
        try {
          const history = JSON.parse(savedHistory);
          setSearchHistory(history.slice(0, 5)); // 最大5件表示
        } catch (error) {
          console.error('検索履歴の読み込みに失敗しました:', error);
        }
      }
    }
  }, [showHistory]);

  // 検索パラメータから初期値を設定
  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery && searchQuery !== query) {
      setQuery(searchQuery);
    }
  }, [searchParams, query]);

  // 外部クリックで候補を非表示
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveToHistory = (searchQuery: string) => {
    if (!showHistory || !searchQuery.trim()) return;

    const newItem: SearchHistoryItem = {
      query: searchQuery.trim(),
      timestamp: Date.now()
    };

    const updatedHistory = [
      newItem,
      ...searchHistory.filter(item => item.query !== newItem.query)
    ].slice(0, 10); // 最大10件保存

    setSearchHistory(updatedHistory);
    
    try {
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('検索履歴の保存に失敗しました:', error);
    }
  };

  const handleSearch = (searchQuery: string = query) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    saveToHistory(trimmedQuery);
    setShowSuggestions(false);

    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      // デフォルトの検索ページに遷移
      router.push(`/dashboard/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (showHistory && searchHistory.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // 少し遅延させて候補選択を可能にする
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    setShowSuggestions(false);
  };

  const filteredHistory = searchHistory.filter(item =>
    item.query.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all ${
            isFocused ? 'ring-2 ring-blue-500' : ''
          }`}
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 検索候補・履歴ドロップダウン */}
      <AnimatePresence>
        {showSuggestions && showHistory && filteredHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                最近の検索
              </span>
              <button
                onClick={clearHistory}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                履歴を削除
              </button>
            </div>
            
            {filteredHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSearch(item.query)}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ClockIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white flex-1">
                  {item.query}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}