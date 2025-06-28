"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  MicrophoneIcon, 
  CloudArrowUpIcon, 
  XMarkIcon,
  StopIcon
} from "@heroicons/react/24/outline";

interface AudioUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (audioData: AudioSubmissionData) => void;
}

interface AudioSubmissionData {
  title: string;
  description: string;
  category: string;
  audioFile: File | null;
  duration: number;
}

export default function AudioUpload({ isOpen, onClose, onSubmit }: AudioUploadProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("ビジネス");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const categories = ["ビジネス", "ライフスタイル", "テクノロジー", "教育", "健康"];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        setAudioFile(file);
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch {
      alert('マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setRecordingTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !audioFile) {
      alert('すべての必須項目を入力してください。');
      return;
    }

    const audioData: AudioSubmissionData = {
      title,
      description,
      category,
      audioFile,
      duration: Math.floor(recordingTime || 0)
    };

    onSubmit(audioData);
    
    setTitle("");
    setDescription("");
    setCategory("ビジネス");
    setAudioFile(null);
    setRecordingTime(0);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">音声コンテンツを投稿</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              タイトル *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              placeholder="コンテンツのタイトルを入力"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              説明 *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              placeholder="コンテンツの内容を簡潔に説明してください"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              カテゴリ
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              音声ファイル *
            </label>
            
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">直接録音</h3>
                <div className="flex items-center space-x-4">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
                    >
                      <MicrophoneIcon className="h-5 w-5" />
                      <span>録音開始</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-200"
                      >
                        <StopIcon className="h-5 w-5" />
                        <span>録音停止</span>
                      </button>
                      <div className="flex items-center space-x-2 text-red-400">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span>{formatTime(recordingTime)}</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  最大15分まで録音可能です
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">ファイルアップロード</h3>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="cursor-pointer text-blue-400 hover:text-blue-300 transition duration-200"
                  >
                    音声ファイルを選択
                  </label>
                  <p className="text-gray-400 text-sm mt-2">
                    MP3, WAV, M4A形式をサポート
                  </p>
                </div>
              </div>

              {audioFile && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-300 font-medium">{audioFile.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAudioFile(null)}
                      className="text-red-400 hover:text-red-300 transition duration-200"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
            >
              投稿する
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 