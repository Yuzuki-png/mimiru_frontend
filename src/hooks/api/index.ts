/**
 * API フック統一エクスポート
 */

export { default as useAppSWR } from '../useAppSWR';
export { default as useAxios } from '../useAxios';

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