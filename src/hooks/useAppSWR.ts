import useSWR, { type SWRConfiguration, type SWRResponse } from 'swr';
import useAxios from './useAxios';

/**
 * `useSWR` のラッパー。Axiosベースのfetcherを使用。
 * アプリ全体で共通化したい設定をここで行なっているので、
 * 個別の画面では直接 `useSWR` を使わずにこのフックを使うこと。
 * 
 * @param key キー (URLパス、nullで無効化)
 * @param config `useSWR` の設定
 * @returns `useSWR` の戻り値
 */
const useAppSWR = <T>(
  key: string | null, 
  config: SWRConfiguration = {}
): SWRResponse<T> => {
  const axiosClient = useAxios();
  
  const fetcher = async (url: string): Promise<T> => {
    const response = await axiosClient<T>(url, { method: 'GET' });
    return response.data;
  };

  const mergedConfig: SWRConfiguration = {
    // デフォルト設定
    revalidateOnFocus: false, // フォーカス時の自動再検証を無効
    revalidateOnReconnect: false, // ネットワーク復旧時の自動再検証を無効
    shouldRetryOnError: false, // エラー時の自動リトライを無効
    dedupingInterval: 2000, // 2秒間は同一リクエストを重複実行しない
    
    // カスタム設定で上書き
    ...config,
  } satisfies SWRConfiguration;

  return useSWR<T>(key, fetcher, mergedConfig);
};

export default useAppSWR;