/**
 * API フック統一エクスポート
 */

// 基盤フック
export { default as useAppSWR } from '../useAppSWR';
export { default as useAxios } from '../useAxios';

// 認証関連フック
export {
  useProfile,
  useLogin,
  useRegister,
  useUpdateProfile,
  useLogout,
  useChangePassword,
  useRequestPasswordReset,
  useResetPassword,
  useVerifyEmail,
  useResendVerificationEmail,
} from './useAuth';

// 音声コンテンツ関連フック
export {
  useAudioContents,
  useAudioContent,
  useCreateAudioContent,
  useUpdateAudioContent,
  useLikeAudioContent,
  useDeleteAudioContent,
  useTrendingAudioContents,
  useLatestAudioContents,
  useRecommendedAudioContents,
  useUserAudioContents,
  useLikedAudioContents,
  useSearchAudioContents,
  useRecordPlay,
  useAudioContentStats,
} from './useAudioContent';

// プレイリスト関連フック
export {
  usePlaylists,
  usePlaylist,
  useCreatePlaylist,
  useUpdatePlaylist,
  useDeletePlaylist,
  useAddPlaylistItem,
  useRemovePlaylistItem,
  usePlaylistItems,
} from './usePlaylist';