"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { 
  useAudioContents, 
  useTrendingAudioContents, 
  useLatestAudioContents
} from "../../../hooks/api/useAudioContent";
import { usePlaylists, useAddPlaylistItem } from "../../../hooks/api/usePlaylist";
import { useSuggestedUsers } from "../../../hooks/api/useUser";
import { useToast } from "../../../hooks/useToast";
import { useAudioPlayer } from "../../../contexts/AudioPlayerContext";
import { useLike } from "../../../contexts/LikeContext";
import UserCard from "../../../components/UserCard";
import {
  UserIcon,
  FireIcon,
  SparklesIcon,
  XMarkIcon,
  ListBulletIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon,
  HeartIcon,
  ShareIcon,
  PlusIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

import { AudioContent } from "../../../types";

export default function DiscoverPage() {
  const router = useRouter();
  const { state: audioPlayerState, playAudio, pauseAudio } = useAudioPlayer();
  const { toggleLike, initializeLikedContents } = useLike();
  const { showSuccess, showError } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<AudioContent | null>(null);
  const [likeLoading, setLikeLoading] = useState<number | null>(null);
  
  const params = selectedCategory !== "all" ? { category: selectedCategory } : {};
  const { data: audioContentsData, error: audioError, isLoading: audioLoading } = useAudioContents(params);
  const { data: trendingData } = useTrendingAudioContents(5);
  const { data: latestData } = useLatestAudioContents(6);
  const { data: playlistsData } = usePlaylists();
  const { data: suggestedUsersData } = useSuggestedUsers(3);
  
  const { trigger: addToPlaylistTrigger } = useAddPlaylistItem();

  const categories = [
    "all",
    "ビジネス",
    "教育",
    "エンターテイメント",
    "ニュース",
    "健康",
    "テクノロジー",
  ];


  const audioContents = useMemo(() => audioContentsData?.data || [], [audioContentsData?.data]);
  const trendingContents = useMemo(() => trendingData?.data || [], [trendingData?.data]);
  const newContents = useMemo(() => latestData?.data || [], [latestData?.data]);
  const playlists = useMemo(() => playlistsData?.data || [], [playlistsData?.data]);
  const suggestedUsers = useMemo(() => suggestedUsersData?.data || [], [suggestedUsersData?.data]);
  const filteredContents = useMemo(() => audioContents, [audioContents]);
  const loading = audioLoading;
  const error = audioError ? 'コンテンツの取得に失敗しました' : null;

  useEffect(() => {
    const allContents = [...trendingContents, ...newContents, ...audioContents];
    const likedContentIds = allContents
      .filter(content => content.isLiked)
      .map(content => content.id);
    
    if (likedContentIds.length > 0) {
      initializeLikedContents(likedContentIds);
    }
  }, [trendingContents, newContents, audioContents, initializeLikedContents]);



  const togglePlay = useCallback(
    async (content: AudioContent) => {
      const isCurrentlyPlaying =
        audioPlayerState.currentAudio?.id === content.id.toString() &&
        audioPlayerState.isPlaying;

      if (isCurrentlyPlaying) {
        await pauseAudio();
      } else {
        const audioUrl = content.audioUrl;
        if (!audioUrl || !audioUrl.startsWith("http")) {
          return;
        }

        const audioContent = {
          id: content.id.toString(),
          title: content.title,
          description: content.description,
          audioUrl: audioUrl,
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
      
      try {
        const result = await toggleLike(contentId);
        showSuccess(result.isLiked ? 'いいねしました' : 'いいねを解除しました');
      } catch {
        showError('いいねの更新に失敗しました');
      } finally {
        setLikeLoading(null);
      }
    },
    [toggleLike, showSuccess, showError]
  );

  const handleAddToPlaylist = useCallback(
    async (playlistId: number, audioContent: AudioContent) => {
      try {
        await addToPlaylistTrigger({ 
          playlistId, 
          audioContentId: audioContent.id 
        });
        showSuccess(`「${audioContent.title}」をプレイリストに追加しました！`);
        setShowAddToPlaylist(null);
      } catch {
        showError("プレイリストへの追加に失敗しました");
      }
    },
    [addToPlaylistTrigger, showSuccess, showError]
  );

  const ContentCard = ({ content }: { content: AudioContent }) => {
    const { isLiked } = useLike();
    const contentIsLiked = isLiked(content.id);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
            {content.category.name}
          </span>
          <div className="flex items-center space-x-2">
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
            </div>
          </div>
        </div>

        <h4 
          className="text-gray-900 dark:text-white text-lg font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-blue-500 transition-colors"
          onClick={() => router.push(`/content/${content.id}`)}
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
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {audioPlayerState.isLoading &&
            audioPlayerState.currentAudio?.id === content.id.toString() ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : audioPlayerState.currentAudio?.id === content.id.toString() &&
              audioPlayerState.isPlaying ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
            <span>
              {audioPlayerState.currentAudio?.id === content.id.toString() &&
              audioPlayerState.isPlaying
                ? "一時停止"
                : "再生"}
            </span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleToggleLike(content.id)}
              disabled={likeLoading === content.id}
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              {likeLoading === content.id ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
              ) : contentIsLiked ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              )}
              <span className={`text-sm ${contentIsLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                {content._count.likes}
              </span>
            </button>

            <button 
              onClick={() => {
                const url = `${window.location.origin}/content/${content.id}`;
                navigator.clipboard.writeText(url);
                showSuccess('URLをコピーしました');
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
              title="URLをコピー"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingContents.map((content) => (
            <ContentCard key={content.id} content={content} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newContents.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      </div>

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
          {suggestedUsers.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                おすすめユーザーを読み込み中...
              </p>
            </div>
          ) : (
            suggestedUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                variant="compact"
                showBio={false}
                showStats={true}
                showFollowButton={true}
              />
            ))
          )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </div>

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
