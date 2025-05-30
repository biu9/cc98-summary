"use client";
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from 'react-oidc-context';
import { IUser } from '@cc98/api';
import { GET } from '@/request';
import { API_ROOT } from '../../config';

interface UserInfoContextType {
  userInfo: IUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(undefined);

export const useUserInfo = () => {
  const context = useContext(UserInfoContext);
  if (context === undefined) {
    throw new Error('useUserInfo must be used within a UserInfoProvider');
  }
  return context;
};

export const UserInfoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 使用useMemo来稳定access_token的引用
  const accessToken = useMemo(() => auth.user?.access_token, [auth.user?.access_token]);
  const isAuthenticated = useMemo(() => auth.isAuthenticated, [auth.isAuthenticated]);

  const fetchUserInfo = async (token: string) => {
    if (loading) return; // 防止重复请求
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching user info from context...');
      const userData = await GET<IUser>(`${API_ROOT}/me?sf_request_type=fetch`, token);
      setUserInfo(userData);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      setError('获取用户信息失败，请重试');
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    if (accessToken) {
      fetchUserInfo(accessToken);
    }
  };

  useEffect(() => {
    // 只在已认证且有token时获取用户信息
    if (isAuthenticated && accessToken && !userInfo && !loading) {
      fetchUserInfo(accessToken);
    }
    
    // 如果未认证，清除用户信息
    if (!isAuthenticated) {
      setUserInfo(null);
      setError(null);
    }
  }, [isAuthenticated, accessToken, userInfo, loading]);

  const value = useMemo(() => ({
    userInfo,
    loading,
    error,
    refetch
  }), [userInfo, loading, error]);

  return (
    <UserInfoContext.Provider value={value}>
      {children}
    </UserInfoContext.Provider>
  );
}; 