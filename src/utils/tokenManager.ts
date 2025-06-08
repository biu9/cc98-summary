import { useAuth } from 'react-oidc-context';

/**
 * Token管理工具类
 * 处理access token的获取和自动刷新
 */
export class TokenManager {
  private static instance: TokenManager;
  private auth: any;

  private constructor(auth: any) {
    this.auth = auth;
  }

  public static getInstance(auth: any): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager(auth);
    } else {
      TokenManager.instance.auth = auth;
    }
    return TokenManager.instance;
  }

  /**
   * 获取有效的access token
   * 如果token即将过期或已过期，会自动刷新
   */
  public async getValidAccessToken(): Promise<string | null> {
    if (!this.auth.user) {
      throw new Error('用户未登录');
    }

    // 检查token是否即将过期（提前5分钟刷新）
    const expiresAt = this.auth.user.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const shouldRefresh = expiresAt && (expiresAt - now) < 300; // 5分钟

    if (shouldRefresh) {
      try {
        console.log('Token即将过期，尝试刷新...');
        await this.auth.signinSilent();
        console.log('Token刷新成功');
      } catch (error) {
        console.error('Token刷新失败:', error);
        // 如果静默刷新失败，尝试重新登录
        await this.auth.signinRedirect();
        return null;
      }
    }

    return this.auth.user?.access_token || null;
  }

  /**
   * 检查是否有refresh token
   */
  public hasRefreshToken(): boolean {
    return !!this.auth.user?.refresh_token;
  }

  /**
   * 获取token过期时间
   */
  public getTokenExpirationTime(): Date | null {
    if (!this.auth.user?.expires_at) return null;
    return new Date(this.auth.user.expires_at * 1000);
  }

  /**
   * 检查token是否即将过期
   */
  public isTokenExpiringSoon(minutesBefore: number = 5): boolean {
    const expiresAt = this.auth.user?.expires_at;
    if (!expiresAt) return false;
    
    const now = Math.floor(Date.now() / 1000);
    return (expiresAt - now) < (minutesBefore * 60);
  }
}

/**
 * React Hook: 获取token管理器实例
 */
export const useTokenManager = () => {
  const auth = useAuth();
  return TokenManager.getInstance(auth);
};

/**
 * 带有自动token刷新的API调用包装器
 */
export const withTokenRefresh = async <T>(
  apiCall: (token: string) => Promise<T>,
  auth: any
): Promise<T> => {
  const tokenManager = TokenManager.getInstance(auth);
  
  try {
    const token = await tokenManager.getValidAccessToken();
    if (!token) {
      throw new Error('无法获取有效的访问令牌');
    }
    
    return await apiCall(token);
  } catch (error: any) {
    // 如果是401错误，尝试刷新token后重试
    if (error.message?.includes('401') || error.status === 401) {
      console.log('检测到401错误，尝试刷新token后重试...');
      
      try {
        await auth.signinSilent();
        const newToken = await tokenManager.getValidAccessToken();
        
        if (!newToken) {
          throw new Error('刷新token后仍无法获取有效令牌');
        }
        
        return await apiCall(newToken);
      } catch (refreshError) {
        console.error('Token刷新失败:', refreshError);
        throw new Error('身份验证已过期，请重新登录');
      }
    }
    
    throw error;
  }
}; 