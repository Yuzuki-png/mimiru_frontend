"use client";

import { useAuth } from "../../../contexts/AuthContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  UserIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import DeleteAccountModal from "../../../components/DeleteAccountModal";
import ChangePasswordModal from "../../../components/ChangePasswordModal";
import AvatarUploadModal from "../../../components/AvatarUploadModal";
import UserAvatar from "../../../components/UserAvatar";
import { userApi } from "../../../lib/api";

interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  bio: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [editedBio, setEditedBio] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await userApi.getProfile();
      setUserProfile(profile);
      setEditedName(profile.name || "");
      setEditedBio(profile.bio || "");
    } catch {
      // エラーの場合は、既存のユーザー情報をフォールバックとして使用
      if (user) {
        const fallbackProfile: UserProfile = {
          id: 0,
          email: user.email,
          name: user.name || null,
          avatar: null,
          bio: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUserProfile(fallbackProfile);
        setEditedName(user.name || "");
        setEditedBio("");
      }
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await userApi.updateProfile({
        name: editedName,
        bio: editedBio,
      });
      
      // 更新後にプロフィールを再読み込み
      await loadUserProfile();
      setIsEditing(false);
    } catch (error) {
      // 認証エラーの場合はログインページにリダイレクト
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          // トークンをクリア
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userId');
          
          // ログインページにリダイレクト
          router.push('/login');
          return;
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedName(userProfile?.name || user?.name || "");
    setEditedBio(userProfile?.bio || "");
    setIsEditing(false);
  };

  const handleAvatarChange = (newAvatarUrl: string | null) => {
    setUserProfile(prev => prev ? {
      ...prev,
      avatar: newAvatarUrl
    } : null);
  };


  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center space-x-3 mb-4">
          <UserIcon className="h-8 w-8" />
          <h2 className="text-3xl font-bold">プロフィール</h2>
        </div>
        <p className="text-indigo-100 text-lg">
          あなたのプロフィール情報と設定を管理できます
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">基本情報</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>編集</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>{isLoading ? "保存中..." : "保存"}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>キャンセル</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                <UserAvatar 
                  avatar={userProfile?.avatar} 
                  name={userProfile?.name || user?.name}
                  size="xl" 
                />
                <button 
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <CameraIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {userProfile?.name || user?.name || user?.email?.split('@')[0]}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">メンバー</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  表示名
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{userProfile?.name || user?.name || "未設定"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  メールアドレス
                </label>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <p className="text-gray-900 dark:text-white">{user?.email}</p>
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  自己紹介
                </label>
                {isEditing ? (
                  <textarea
                    id="bio"
                    name="bio"
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="あなたについて教えてください..."
                    autoComplete="off"
                    aria-describedby="bio-help"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {userProfile?.bio || "自己紹介が設定されていません"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  登録日
                </label>
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                  <p className="text-gray-900 dark:text-white">
                    {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('ja-JP') : '2024年6月14日'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        <div className="space-y-6">


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">プライバシーとセキュリティ</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">パスワード変更</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">アカウントのパスワードを変更</p>
                  </div>
                </div>
                <span className="text-gray-400">›</span>
              </button>


              <button 
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <div className="text-left">
                    <p className="font-medium text-red-600 dark:text-red-400">アカウント削除</p>
                    <p className="text-sm text-red-500 dark:text-red-400">アカウントを完全に削除</p>
                  </div>
                </div>
                <span className="text-red-400">›</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <DeleteAccountModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

      <ChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <AvatarUploadModal 
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatar={userProfile?.avatar}
        userName={userProfile?.name || user?.name}
        onAvatarChange={handleAvatarChange}
      />
    </div>
  );
} 