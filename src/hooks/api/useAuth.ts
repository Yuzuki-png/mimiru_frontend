import useAppSWR from '../useAppSWR';
import useSWRMutation from 'swr/mutation';
import useAxios from '../useAxios';
import { AuthUser } from '../../types';
import { StorageManager } from '../../lib/storage';
import { mutate } from 'swr';

export function useProfile() {
  const token = StorageManager.getToken();
  const key = token ? '/auth/profile' : null;
  
  return useAppSWR<AuthUser>(key);
}

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
      
      if (result.access_token) {
        StorageManager.setToken(result.access_token);
        if (result.refresh_token) {
          StorageManager.setRefreshToken(result.refresh_token);
        }
        
        mutate('/auth/profile', result.user, false);
      }
      
      return result;
    }
  );
}

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
      
      if (result.access_token) {
        StorageManager.setToken(result.access_token);
        if (result.refresh_token) {
          StorageManager.setRefreshToken(result.refresh_token);
        }
        
        mutate('/auth/profile', result.user, false);
      }
      
      return result;
    }
  );
}

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
      
      mutate('/auth/profile', response.data, false);
      
      return response.data;
    }
  );
}

export function useLogout() {
  const axiosClient = useAxios();
  
  return useSWRMutation(
    'logout',
    async () => {
      try {
        await axiosClient('/auth/logout', { method: 'POST' });
      } finally {
        StorageManager.clearAuth();
        mutate(() => true, undefined, false);
      }
    }
  );
}

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