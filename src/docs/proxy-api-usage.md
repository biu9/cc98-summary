# CC98 API代理使用指南

## 概述

为了解决校外访问CC98 API时的CORS问题，我们实现了一个基于Next.js的API代理系统。该系统会自动将前端请求转发到WebVPN代理地址，避免了直接跨域请求的问题。

## 代理API路由

### 地址格式
```
/api/proxy/[...path]
```

### 示例
- 原始API: `https://api.cc98.org/me/recent-topic?from=0&size=20`
- 代理API: `/api/proxy/me/recent-topic?from=0&size=20`

## 使用方法

### 1. 使用封装的工具函数（推荐）

```typescript
import { callCC98Api, getUserRecentTopics, getUserInfo } from '@/utils/apiProxy';

// 获取用户最近话题
const result = await getUserRecentTopics(refreshToken, 0, 20);
if (result.error) {
  console.error('API Error:', result.error);
} else {
  console.log('Data:', result.data);
}

// 获取用户信息
const userInfo = await getUserInfo(refreshToken);

// 通用API调用
const customResult = await callCC98Api('me/favorite-board', refreshToken);
```

### 2. 使用更新后的GET/POST函数

```typescript
import { GET, POST } from '@/request';

// GET请求会自动转换为代理路径
const topics = await GET('https://api.cc98.org/me/recent-topic?from=0&size=20', refreshToken);

// POST请求也会自动处理
const result = await POST('/api/some-endpoint', data, refreshToken);
```

### 3. 直接调用代理API

```typescript
const response = await fetch('/api/proxy/me/recent-topic?from=0&size=20', {
  headers: {
    'Authorization': `Bearer ${refreshToken}`,
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
```

## 支持的HTTP方法

- GET
- POST  
- PUT
- DELETE

## 错误处理

代理API会返回结构化的错误信息：

```typescript
{
  error: string;        // 错误描述
  details?: string;     // 详细错误信息（开发环境下可用）
}
```

常见错误：
- `401`: 缺少Authorization header
- `400`: API路径错误
- `503`: WebVPN服务不可用
- `500`: 内部代理错误

## 开发调试

### 查看代理请求日志
代理API会在控制台输出请求日志：
```
[Proxy] GET https://api-cc98-org-s.webvpn.zju.edu.cn:8001/me/recent-topic?from=0&size=20
```

### 环境配置
确保config.ts中的WebVPN地址配置正确：
```typescript
const API_ROOT = process.env.NODE_ENV === "development"
  ? "https://api-cc98-org-s.webvpn.zju.edu.cn:8001"
  : "https://api.cc98.org";
```

## 注意事项

1. **Token传递**: 必须在请求头中包含`Authorization: Bearer <token>`
2. **路径转换**: 系统会自动将完整URL转换为代理路径
3. **CORS处理**: 代理API解决了前端直接访问WebVPN的CORS问题
4. **性能**: 代理会增加一次请求转发，但延迟通常很小

## 故障排除

### 请求失败
1. 检查Authorization header是否正确
2. 确认WebVPN服务是否可访问
3. 查看浏览器控制台和服务端日志

### CORS错误
如果仍然遇到CORS错误，可能是：
1. 直接调用了原始API而非代理API
2. WebVPN服务配置问题

### 连接超时
1. 检查网络连接
2. 确认WebVPN服务状态
3. 考虑增加请求超时时间 