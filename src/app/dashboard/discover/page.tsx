"use client";

import { useEffect, useState, useCallback } from "react";
import { audioContentApi, playlistApi, userApi } from "../../../lib/api";
import { useAudioPlayer } from "../../../contexts/AudioPlayerContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useLike } from "../../../contexts/LikeContext";
import UserCard from "../../../components/UserCard";
import {
  PlayIcon,
  PauseIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  ShareIcon,
  FireIcon,
  SparklesIcon,
  PlusIcon,
  XMarkIcon,
  ListBulletIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface AudioContent {
  id: number;
  title: string;
  description: string;
  duration: number;
  audioUrl: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
  };
  _count: {
    likes: number;
  };
  isLiked: boolean;
}

interface PaginatedResult {
  data: AudioContent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Playlist {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
  };
}

export default function DiscoverPage() {
  const { user } = useAuth();
  const { state: audioPlayerState, playAudio, pauseAudio } = useAudioPlayer();
  const { isLiked, toggleLike } = useLike();
  const [audioContents, setAudioContents] = useState<AudioContent[]>([]);
  const [trendingContents, setTrendingContents] = useState<AudioContent[]>([]);
  const [newContents, setNewContents] = useState<AudioContent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<AudioContent | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<{
    id: string;
    name: string;
    email: string;
    bio?: string;
    location?: string;
    website?: string;
    createdAt: string;
    _count: {
      followers: number;
      following: number;
      audioContents: number;
    };
  }[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState<number | null>(null);
  const [likeError, setLikeError] = useState<string | null>(null);

  const categories = [
    "all",
    "ビジネス",
    "教育",
    "エンターテイメント",
    "ニュース",
    "健康",
    "テクノロジー",
  ];

  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);

        const params =
          selectedCategory !== "all" ? { category: selectedCategory } : {};
        const result: PaginatedResult = await audioContentApi.getAll(params);

        setAudioContents(result.data);

        const [trendingResult, newResult, playlistsResult] = await Promise.all([
          audioContentApi.getAll({ ...params, limit: 20, sortBy: 'likes' }),
          audioContentApi.getAll({ ...params, limit: 6, sortBy: 'createdAt' }),
          playlistApi.getAll()
        ]);
        
        // フロントエンド側でいいね数順にソート＆5個に制限
        const sortedTrending = trendingResult.data
          .sort((a: AudioContent, b: AudioContent) => b._count.likes - a._count.likes)
          .slice(0, 5);
        
        // フロントエンド側で新しい順にソート
        const sortedNew = newResult.data
          .sort((a: AudioContent, b: AudioContent) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setTrendingContents(sortedTrending);
        setNewContents(sortedNew);
        setPlaylists(playlistsResult.data);

        // バックエンドAPIから実際のユーザーデータを取得
        try {
          const usersSearchResult = await userApi.search('', { limit: 6 });
          const usersData = usersSearchResult.data || [];
          
          // 現在のユーザーを除外
          const filteredUsers = usersData.filter((u: { id: string }) => u.id !== user?.id);
          setSuggestedUsers(filteredUsers.slice(0, 3));
        } catch {
          // APIエラーの場合のみmockデータを使用
          const mockUsers = [
            {
              id: "2",
              name: "田中太郎",
              email: "tanaka@example.com",
              bio: "教育系コンテンツを中心に投稿している教師です。わかりやすい解説を心がけています。",
              location: "東京",
              website: "tanaka-sensei.com",
              createdAt: "2024-01-15T00:00:00Z",
              _count: {
                followers: 120,
                following: 45,
                audioContents: 23
              }
            },
            {
              id: "3", 
              name: "山田花子",
              email: "yamada@example.com",
              bio: "ビジネス・自己啓発系の音声コンテンツをお届けします。",
              location: "大阪",
              createdAt: "2024-02-20T00:00:00Z",
              _count: {
                followers: 89,
                following: 67,
                audioContents: 15
              }
            },
            {
              id: "4",
              name: "佐藤一郎",
              email: "sato@example.com", 
              bio: "テクノロジーの最新トレンドを音声で解説します。",
              createdAt: "2024-03-10T00:00:00Z",
              _count: {
                followers: 156,
                following: 34,
                audioContents: 31
              }
            }
          ];
          setSuggestedUsers(mockUsers);
        }

        setError(null);
      } catch {
        setError("データの取得に失敗しました");
        setAudioContents([]);
        setTrendingContents([]);
        setNewContents([]);
        setPlaylists([]);
        setSuggestedUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [selectedCategory, user?.id]);

  // APIからのデータはすでにフィルタリング済み
  const filteredContents = audioContents;

  const togglePlay = useCallback(
    async (content: AudioContent) => {
      const isCurrentlyPlaying =
        String(audioPlayerState.currentAudio?.id) === String(content.id) &&
        audioPlayerState.isPlaying;

      if (isCurrentlyPlaying) {
        await pauseAudio();
      } else {
        // audioUrlが提供されているかチェック
        if (!content.audioUrl) {
          alert("音声ファイルのURLが取得できません。");
          return;
        }


        const audioContent = {
          id: content.id.toString(),
          title: content.title,
          description: content.description,
          audioUrl: content.audioUrl,
          duration: content.duration,
        };
        await playAudio(audioContent);
      }
    },
    [
      audioPlayerState.currentAudio,
      audioPlayerState.isPlaying,
      pauseAudio,
      playAudio,
    ],
  );

  const handleToggleLike = useCallback(
    async (contentId: number) => {
      setLikeLoading(contentId);
      setLikeError(null);
      
      try {
        const result = await toggleLike(contentId);
        
        // グローバルstateは既にLikeContextで管理されているため、
        // ローカルstateのいいね数を更新
        const updateContent = (content: AudioContent) =>
          content.id === contentId
            ? {
                ...content,
                isLiked: result.isLiked,
                _count: { ...content._count, likes: result.totalLikes },
              }
            : content;

        setAudioContents(prev => prev.map(updateContent));
        setTrendingContents(prev => prev.map(updateContent));
        setNewContents(prev => prev.map(updateContent));
      } catch {
        setLikeError('いいねの更新に失敗しました。もう一度お試しください。');
        setTimeout(() => setLikeError(null), 5000);
      } finally {
        setLikeLoading(null);
      }
    },
    [toggleLike]
  );

  const handleAddToPlaylist = async (playlistId: number, audioContent: AudioContent) => {
    try {
      await playlistApi.addItem(playlistId.toString(), audioContent.id);
      
      // プレイリストのアイテム数を更新
      setPlaylists(prev => prev.map(playlist => 
        playlist.id === playlistId
          ? { ...playlist, _count: { items: playlist._count.items + 1 } }
          : playlist
      ));
      
      setSuccessMessage(`「${audioContent.title}」をプレイリストに追加しました！`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowAddToPlaylist(null);
    } catch {
      setError("プレイリストへの追加に失敗しました");
    }
  };

  const handleShareContent = async (content: AudioContent) => {
    try {
      const contentUrl = `${window.location.origin}/content/${content.id}`;
      await navigator.clipboard.writeText(contentUrl);
      setSuccessMessage("コンテンツのURLをクリップボードにコピーしました！");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setError("URLのコピーに失敗しました");
    }
  };

  const handleDelete = async (content: AudioContent) => {
    if (window.confirm("このコンテンツを削除しますか？")) {
      try {
        await audioContentApi.delete(content.id.toString());
        setAudioContents(prev => prev.filter(c => c.id !== content.id));
        setTrendingContents(prev => prev.filter(c => c.id !== content.id));
        setNewContents(prev => prev.filter(c => c.id !== content.id));
        setSuccessMessage(`「${content.title}」を削除しました`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch {
        setError("コンテンツの削除に失敗しました");
      }
    }
  };

  const ContentCard = ({
    content,
  }: {
    content: AudioContent;
    index?: number;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-5 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 space-y-2 sm:space-y-0">
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
          {content.category.name}
        </span>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {Math.floor(content.duration / 60)}:
            {(content.duration % 60).toString().padStart(2, "0")}
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowAddToPlaylist(content)}
              className="p-1 text-gray-400 hover:text-green-500 transition-colors"
              title="プレイリストに追加"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
            {/* 投稿者本人のみに編集・削除ボタンを表示 */}
            {user && user.id === content.author.id.toString() && (
              <>
                <button
                  onClick={() => {}}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  title="編集"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(content)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="削除"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <h4 
        className="text-gray-900 dark:text-white text-lg font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-blue-500 transition-colors"
        onClick={() => window.location.href = `/content/${content.id}`}
      >
        {content.title}
      </h4>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {content.description}
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <UserIcon className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {content.author.name}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <EyeIcon className="h-4 w-4" />
            <span className="text-sm">0</span>
          </div>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            {new Date(content.createdAt).toLocaleDateString("ja-JP")}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => togglePlay(content)}
          disabled={audioPlayerState.isLoading}
          className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full transition-colors shadow-lg"
        >
          {audioPlayerState.isLoading &&
          String(audioPlayerState.currentAudio?.id) === String(content.id) ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : String(audioPlayerState.currentAudio?.id) === String(content.id) &&
            audioPlayerState.isPlaying ? (
            <PauseIcon className="h-5 w-5" />
          ) : (
            <PlayIcon className="h-5 w-5 ml-0.5" />
          )}
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleToggleLike(content.id)}
            disabled={likeLoading === content.id}
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            {likeLoading === content.id ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
            ) : content.isLiked ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
            <span className={`text-sm ${content.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {content._count.likes}
            </span>
          </button>

          <button 
            onClick={() => handleShareContent(content)}
            className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          読み込み中...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 成功メッセージ */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* エラーメッセージ */}
      {likeError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">{likeError}</span>
          <button 
            onClick={() => setLikeError(null)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}


      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          カテゴリ
        </h3>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {category === "all" ? "すべて" : category}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FireIcon className="h-5 w-5 text-orange-500 mr-2" />
            トレンド
          </h3>
          <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            すべて見る
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {trendingContents.map((content, index) => (
            <ContentCard key={content.id} content={content} index={index} />
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <SparklesIcon className="h-5 w-5 text-green-500 mr-2" />
            新着
          </h3>
          <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            すべて見る
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {newContents.map((content, index) => (
            <ContentCard key={content.id} content={content} index={index} />
          ))}
        </div>
      </div>

      {/* おすすめユーザーセクション */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <UserIcon className="h-5 w-5 text-purple-500 mr-2" />
            おすすめユーザー
          </h3>
          <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            もっと見る
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestedUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              variant="compact"
              showBio={false}
              showStats={true}
              showFollowButton={true}
            />
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            すべてのコンテンツ
          </h3>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {filteredContents.length}件
          </span>
        </div>
        {filteredContents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {selectedCategory === "all" 
                ? "コンテンツがありません" 
                : `「${selectedCategory}」カテゴリのコンテンツがありません`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredContents.map((content, index) => (
              <ContentCard key={content.id} content={content} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* プレイリスト選択モーダル */}
      {showAddToPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                プレイリストに追加
              </h3>
              <button
                onClick={() => setShowAddToPlaylist(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                「{showAddToPlaylist.title}」を追加するプレイリストを選択してください
              </p>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id, showAddToPlaylist)}
                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <ListBulletIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{playlist.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{playlist._count.items}アイテム</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {playlists.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                プレイリストがありません
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
