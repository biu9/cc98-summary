# Token自动刷新功能使用指南

## 概述

项目已配置了基于refresh token的自动token刷新机制。当access token即将过期时，系统会自动使用refresh token获取新的access token，无需用户重新登录。

## 当前配置

### OIDC配置 (config.ts)
```typescript
const OIDC_CONFIG: UserManagerSettings = {
  client_id: "acce963f-2ee5-4e94-a9c2-08db7f014b10",
  response_type: "code",
  scope: "openid cc98-api offline_access", // ✅ 包含 offline_access
  authority: OPENID_ROOT,
  redirect_uri: CURRENT_ROOT,
  silent_redirect_uri: CURRENT_ROOT,
  automaticSilentRenew: true,  // ✅ 启用自动静默刷新
  validateSubOnSilentRenew: true,
  includeIdTokenInSilentRenew: false,
  loadUserInfo: false,
};
```

### 关键配置说明
- `scope: "offline_access"` - 获取refresh token的权限
- `automaticSilentRenew: true` - 启用自动静默刷新
- `silent_redirect_uri` - 静默刷新的回调地址

## 实现的工具

### 1. TokenManager 类 (`src/utils/tokenManager.ts`)
提供以下功能：
- `getValidAccessToken()` - 获取有效的access token，自动检查过期并刷新
- `hasRefreshToken()` - 检查是否有refresh token
- `isTokenExpiringSoon()` - 检查token是否即将过期
- `withTokenRefresh()` - API调用包装器，自动处理token刷新

### 2. API调用Hooks (`src/hooks/useApiCall.ts`)
提供以下hooks：
- `useApiCall()` - 通用API调用hook，自动处理token刷新
- `useApiGet()` - GET请求专用hook
- `useApiPost()` - POST请求专用hook

## 使用方式

### 方式1: 使用TokenManager（推荐）
```typescript
import { useAuth } from 'react-oidc-context';
import { withTokenRefresh } from '@/utils/tokenManager';
import { GET } from '@/request';

const MyComponent = () => {
  const auth = useAuth();

  const fetchData = async () => {
    try {
      const result = await withTokenRefresh(
        (token: string) => GET('/api/some-endpoint', token),
        auth
      );
      console.log(result);
    } catch (error) {
      console.error('API调用失败:', error);
    }
  };

  return <button onClick={fetchData}>获取数据</button>;
};
```

### 方式2: 使用API Hooks
```typescript
import { useApiGet } from '@/hooks/useApiCall';

const MyComponent = () => {
  const { get } = useApiGet();

  const fetchData = async () => {
    try {
      const result = await get('/api/some-endpoint');
      console.log(result);
    } catch (error) {
      console.error('API调用失败:', error);
    }
  };

  return <button onClick={fetchData}>获取数据</button>;
};
```

### 方式3: 直接使用TokenManager
```typescript
import { useTokenManager } from '@/utils/tokenManager';

const MyComponent = () => {
  const tokenManager = useTokenManager();

  const fetchData = async () => {
    try {
      const token = await tokenManager.getValidAccessToken();
      if (!token) {
        throw new Error('无法获取访问令牌');
      }
      
      const response = await fetch('/api/some-endpoint', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('API调用失败:', error);
    }
  };

  return <button onClick={fetchData}>获取数据</button>;
};
```

## 自动刷新机制

### 触发条件
1. **主动检查**: TokenManager在获取token时会检查是否即将过期（默认提前5分钟）
2. **401错误**: API返回401时，会自动尝试刷新token并重试
3. **oidc-client-ts自动**: 库本身的automaticSilentRenew机制

### 刷新流程
1. 检测到token即将过期或API返回401
2. 调用 `auth.signinSilent()` 进行静默刷新
3. 如果成功，使用新token重试API调用
4. 如果失败，引导用户重新登录

### 错误处理
```typescript
try {
  const result = await withTokenRefresh(apiCall, auth);
} catch (error) {
  if (error.message === '身份验证已过期，请重新登录') {
    // 引导用户重新登录
    auth.signinRedirect();
  } else {
    // 处理其他错误
    console.error('API错误:', error);
  }
}
```

## 最佳实践

### 1. 统一使用包装器
所有API调用都应该使用TokenManager或API hooks，避免直接使用原始token。

### 2. 错误处理
```typescript
const handleApiCall = async () => {
  try {
    const result = await withTokenRefresh(myApiCall, auth);
    // 处理成功结果
  } catch (error) {
    if (error.message.includes('身份验证已过期')) {
      // 自动引导重新登录
      auth.signinRedirect();
    } else {
      // 显示错误消息给用户
      setErrorMessage(error.message);
    }
  }
};
```

### 3. 监听token事件
```typescript
import { useAuth } from 'react-oidc-context';

const App = () => {
  const auth = useAuth();

  useEffect(() => {
    // 监听token刷新事件
    if (auth.events) {
      auth.events.addAccessTokenExpiring(() => {
        console.log('Access token即将过期');
      });

      auth.events.addAccessTokenExpired(() => {
        console.log('Access token已过期');
      });

      auth.events.addSilentRenewError((error) => {
        console.error('静默刷新失败:', error);
      });
    }

    return () => {
      // 清理事件监听器
      if (auth.events) {
        auth.events.removeAccessTokenExpiring();
        auth.events.removeAccessTokenExpired();
        auth.events.removeSilentRenewError();
      }
    };
  }, [auth.events]);

  return <div>App Content</div>;
};
```

## 调试

### 检查token状态
```typescript
const tokenManager = useTokenManager();

// 检查是否有refresh token
console.log('Has refresh token:', tokenManager.hasRefreshToken());

// 检查token过期时间
console.log('Token expires at:', tokenManager.getTokenExpirationTime());

// 检查是否即将过期
console.log('Token expiring soon:', tokenManager.isTokenExpiringSoon());
```

### 控制台日志
TokenManager会输出详细的日志信息：
- "Token即将过期，尝试刷新..."
- "Token刷新成功"
- "检测到401错误，尝试刷新token后重试..."

## 注意事项

1. **静默刷新需要iframe**: 确保应用可以创建iframe进行静默刷新
2. **CORS配置**: 确保OIDC提供商允许你的域名进行静默刷新
3. **Refresh token过期**: Refresh token也会过期，过期后需要用户重新登录
4. **网络问题**: 网络问题可能导致刷新失败，需要适当的错误处理

## 迁移现有代码

将现有的API调用从：
```typescript
// 旧方式
const result = await GET('/api/endpoint', auth.user?.access_token);
```

改为：
```typescript
// 新方式
const result = await withTokenRefresh(
  (token) => GET('/api/endpoint', token),
  auth
);
```

这样就能自动获得token刷新功能。 