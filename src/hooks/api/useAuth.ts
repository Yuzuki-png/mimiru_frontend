import useAppSWR from '../useAppSWR';
import useSWRMutation from 'swr/mutation';
import useAxios from '../useAxios';
import { AuthUser } from '../../types';
import { StorageManager } from '../../lib/storage';
import { mutate } from 'swr';

// ユーザープロフィール取得
export function useProfile() {
  const token = StorageManager.getToken();
  const key = token ? '/auth/profile' : null;
  
  return useAppSWR<AuthUser>(key);
}

// ログイン
export function useLogin() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'login',
    async (_key: string, { arg }: { 
      arg: { email: string; password: string } 
    }) => {
      const response = await axiosClient<{ 
        access_token: string; 
        refresh_token?: string;
        user: AuthUser; 
      }>('/auth/login', {
        method: 'POST',
        data: arg,
      });
      
      const result = response.data;
      
      // トークン保存
      if (result.access_token) {
        StorageManager.setToken(result.access_token);
        if (result.refresh_token) {
          StorageManager.setRefreshToken(result.refresh_token);
        }
        
        // ユーザー情報をキャッシュ
        mutate('/auth/profile', result.user, false);
      }
      
      return result;
    }
  );
}

// ユーザー登録
export function useRegister() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'register',
    async (_key: string, { arg }: { 
      arg: { email: string; password: string; name?: string } 
    }) => {
      const response = await axiosClient<{ 
        access_token: string; 
        refresh_token?: string;
        user: AuthUser; 
      }>('/auth/register', {
        method: 'POST',
        data: arg,
      });
      
      const result = response.data;
      
      // トークン保存
      if (result.access_token) {
        StorageManager.setToken(result.access_token);
        if (result.refresh_token) {
          StorageManager.setRefreshToken(result.refresh_token);
        }
        
        // ユーザー情報をキャッシュ
        mutate('/auth/profile', result.user, false);
      }
      
      return result;
    }
  );
}

// プロフィール更新
export function useUpdateProfile() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'update-profile',
    async (_key: string, { arg }: { 
      arg: Partial<AuthUser> 
    }) => {
      const response = await axiosClient<AuthUser>('/auth/profile', {
        method: 'PUT',
        data: arg,
      });
      
      // プロフィール情報を更新
      mutate('/auth/profile', response.data, false);
      
      return response.data;
    }
  );
}

// ログアウト
export function useLogout() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'logout',
    async () => {
      try {
        await axiosClient('/auth/logout', { method: 'POST' });
      } finally {
        StorageManager.clearAuth();
        // 全キャッシュクリア
        mutate(() => true, undefined, false);
      }
    }
  );
}

// パスワード変更
export function useChangePassword() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'change-password',
    async (_key: string, { arg }: { 
      arg: { currentPassword: string; newPassword: string } 
    }) => {
      const response = await axiosClient('/auth/password-change', {
        method: 'POST',
        data: {
          current_password: arg.currentPassword,
          new_password: arg.newPassword,
        },
      });
      
      return response.data;
    }
  );
}

// パスワードリセット要求
export function useRequestPasswordReset() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'request-password-reset',
    async (_key: string, { arg }: { arg: { email: string } }) => {
      const response = await axiosClient('/auth/password-reset', {
        method: 'POST',
        data: arg,
      });
      
      return response.data;
    }
  );
}

// パスワードリセット実行
export function useResetPassword() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'reset-password',
    async (_key: string, { arg }: { 
      arg: { token: string; newPassword: string } 
    }) => {
      const response = await axiosClient('/auth/password-reset/confirm', {
        method: 'POST',
        data: {
          token: arg.token,
          password: arg.newPassword,
        },
      });
      
      return response.data;
    }
  );
}

// メールアドレス確認
export function useVerifyEmail() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'verify-email',
    async (_key: string, { arg }: { arg: { token: string } }) => {
      const response = await axiosClient('/auth/verify-email', {
        method: 'POST',
        data: arg,
      });
      
      return response.data;
    }
  );
}

// メール確認の再送信
export function useResendVerificationEmail() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'resend-verification-email',
    async () => {
      const response = await axiosClient('/auth/verify-email/resend', {
        method: 'POST',
      });
      
      return response.data;
    }
  );
}