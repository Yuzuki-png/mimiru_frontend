"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MicrophoneIcon, 
  CloudArrowUpIcon, 
  XMarkIcon,
  StopIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import { audioContentApi } from "../../../lib/api";
import { useAuth } from "../../../contexts/AuthContext";

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("教育");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["教育", "ライフスタイル", "テクノロジー", "健康", "エンターテイメント"];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
        setAudioFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecording(false);
          clearInterval(timer);
        }
      }, 15 * 60 * 1000);

    } catch {
      alert('録音を開始できませんでした。マイクの許可を確認してください。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('ログインが必要です。');
      router.push('/login');
      return;
    }
    
    if (!title || !description || !audioFile) {
      alert('すべての必須項目を入力してください。');
      return;
    }

    setIsSubmitting(true);

    try {
      const audioData: {
        title: string;
        description: string;
        category: string;
        audioFile: File;
        duration?: number;
      } = {
        title,
        description,
        category,
        audioFile,
      };
      
      // 録音時間が有効な場合のみdurationを追加（正の整数として）
      if (recordingTime > 0 && !isNaN(recordingTime) && isFinite(recordingTime)) {
        const validDuration = Math.max(1, Math.floor(recordingTime));
        if (validDuration > 0) {
          audioData.duration = validDuration;
        }
      }
      
      await audioContentApi.create(audioData);

      alert('音声が正常に投稿されました！');
      setTitle('');
      setDescription('');
      setCategory('教育');
      setAudioFile(null);
      router.push('/dashboard');
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof Error) {
        // カテゴリエラーの場合は具体的な案内を表示
        if (error.message.includes('カテゴリ') && error.message.includes('見つかりません')) {
          alert(`選択されたカテゴリが無効です。利用可能なカテゴリから選択してください。`);
        } else {
          alert(`投稿に失敗しました: ${error.message}`);
        }
      } else {
        alert('投稿に失敗しました。もう一度お試しください。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>ダッシュボードに戻る</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                音声コンテンツを投稿
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                あなたの知識や経験を音声で共有しましょう
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  タイトル *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-colors"
                  placeholder="コンテンツのタイトルを入力"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  説明 *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-colors"
                  placeholder="コンテンツの内容を簡潔に説明してください"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  カテゴリ
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  音声ファイル *
                </label>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-gray-900 dark:text-white font-medium mb-4 flex items-center">
                      <MicrophoneIcon className="h-5 w-5 mr-2" />
                      直接録音
                    </h3>
                    <div className="space-y-4">
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
                        >
                          <MicrophoneIcon className="h-5 w-5" />
                          <span>録音開始</span>
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-200"
                          >
                            <StopIcon className="h-5 w-5" />
                            <span>録音停止</span>
                          </button>
                          <div className="flex items-center justify-center space-x-2 text-red-500 dark:text-red-400">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                          </div>
                        </div>
                      )}
                      <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                        最大15分まで録音可能です
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-gray-900 dark:text-white font-medium mb-4 flex items-center">
                      <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                      ファイルアップロード
                    </h3>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                      <CloudArrowUpIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="audio-upload"
                      />
                      <label
                        htmlFor="audio-upload"
                        className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition duration-200 font-medium"
                      >
                        音声ファイルを選択
                      </label>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                        MP3, WAV, M4A形式をサポート
                      </p>
                    </div>
                  </div>
                </div>

                {audioFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-700 dark:text-green-300 font-medium">{audioFile.name}</p>
                        <p className="text-green-600 dark:text-green-400 text-sm">
                          {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAudioFile(null)}
                        className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition duration-200"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition duration-200"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition duration-200 flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>投稿中...</span>
                    </>
                  ) : (
                    <span>投稿する</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
    );
} 