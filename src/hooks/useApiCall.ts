import { useCallback } from 'react';
import { useAuth } from 'react-oidc-context';
import { withTokenRefresh } from '@/utils/tokenManager';

/**
 * 带有自动token刷新功能的API调用hook
 */
export const useApiCall = () => {
  const auth = useAuth();

  const apiCall = useCallback(async <T>(
    apiFunction: (token: string) => Promise<T>
  ): Promise<T> => {
    return withTokenRefresh(apiFunction, auth);
  }, [auth]);

  return { apiCall };
};

/**
 * 专门用于GET请求的hook
 */
export const useApiGet = () => {
  const { apiCall } = useApiCall();
  
  const get = useCallback(async <T>(
    url: string,
    options?: RequestInit
  ): Promise<T> => {
    return apiCall(async (token: string) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    });
  }, [apiCall]);

  return { get };
};

/**
 * 专门用于POST请求的hook
 */
export const useApiPost = () => {
  const { apiCall } = useApiCall();
  
  const post = useCallback(async <T, R>(
    url: string,
    data: T,
    options?: RequestInit
  ): Promise<R> => {
    return apiCall(async (token: string) => {
      const response = await fetch(url, {
        method: 'POST',
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    });
  }, [apiCall]);

  return { post };
}; 