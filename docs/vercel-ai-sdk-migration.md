# Vercel AI SDK 迁移文档

## 迁移概述

本文档记录了将CC98 Summary页面从传统的AI API调用迁移到Vercel AI SDK的完整过程，实现了流式响应和更好的用户体验。

## 迁移前后对比

### 迁移前（传统方式）

**API端点**: `/api/summary`
- 使用Google Generative AI SDK直接调用
- 非流式响应，一次性返回完整结果
- 用户需要等待完整响应才能看到结果
- 手动处理loading状态

**前端实现**:
```typescript
// 原有submitQuestion方法
const res = await POST<ISummaryRequest, IGeneralResponse>("/api/summary", {
  text: fullPrompt,
});

if (res.isOk) {
  addMessage('bot', res.data);
}
```

### 迁移后（Vercel AI SDK）

**API端点**: `/api/summary/chat`
- 使用Vercel AI SDK的streamText
- 流式响应，实时显示AI生成内容
- 用户可以实时看到回答过程
- 自动处理loading和错误状态

**前端实现**:
```typescript
// 新的useSummaryChat hook
const { handleSubmit, isAILoading, aiMessages } = useSummaryChat();

// 流式消息自动更新
await handleSubmit(userMessage);
```

## 新增文件

### 1. API路由: `/src/app/api/summary/chat/route.ts`

**功能**: 处理基于知识库的流式问答

**关键特性**:
- 支持流式响应
- 自动构建包含知识库的系统消息
- 降低temperature获得更准确回答
- 完整的错误处理和CORS支持

**API接口**:
```typescript
POST /api/summary/chat
{
  messages: Message[],           // 对话消息列表
  knowledgeBase: string,         // 知识库内容
  contextDescription: string     // 上下文描述
}
```

### 2. Hook: `/src/hooks/useSummaryChat.ts`

**功能**: 封装Vercel AI SDK的useChat，提供summary页面专用的聊天功能

**关键特性**:
- 自动处理调用次数限制
- 集成知识库内容获取
- 同步传统消息显示
- 自定义请求体构建
- 完整的错误处理

**使用方式**:
```typescript
const { 
  handleSubmit,      // 提交消息函数
  isAILoading,       // 加载状态
  aiMessages,        // AI消息列表
  clearChat          // 清空聊天
} = useSummaryChat();
```

### 3. 组件: `/src/app/summary/components/StreamingChatMessages.tsx`

**功能**: 支持传统消息和流式AI消息的混合显示

**关键特性**:
- 合并显示IChatMessage和Message类型
- 按时间排序所有消息
- 流式消息实时更新
- 保持markdown渲染功能
- 响应式设计

## 修改的文件

### 1. Store更新: `/src/store/summaryStore.ts`

**新增状态**:
```typescript
// Vercel AI SDK相关状态
aiMessages: Message[];
knowledgeBaseContent: string;
```

**新增方法**:
```typescript
setAiMessages: (messages: Message[]) => void;
setKnowledgeBaseContent: (content: string) => void;
getKnowledgeBaseForAI: (accessToken: string) => Promise<string>;
```

### 2. 页面更新: `/src/app/summary/page.tsx`

**主要变化**:
- 导入`useSummaryChat` hook
- 替换`submitQuestion`为`handleAISubmit`
- 使用`StreamingChatMessages`组件
- 更新loading状态为`isAILoading`

### 3. 组件导出: `/src/app/summary/components/index.ts`

**变化**:
- 移除`ChatMessages`导出
- 新增`StreamingChatMessages`导出

## 流程对比

### 原有流程

1. 用户输入问题
2. 验证调用限制和输入
3. 获取知识库内容
4. 构建完整prompt
5. 调用`/api/summary`
6. 等待完整响应
7. 一次性显示结果

### 新流程

1. 用户输入问题
2. `useSummaryChat`验证限制和输入
3. 自动获取最新知识库内容
4. 调用`/api/summary/chat`开始流式响应
5. **实时显示AI生成内容**
6. 完成后同步到传统消息列表

## 技术优势

### 1. 用户体验提升
- **实时反馈**: 用户可以实时看到AI的回答过程
- **减少等待感**: 无需等待完整响应
- **更自然的对话**: 类似真实聊天体验

### 2. 技术架构改进
- **状态管理**: 利用Vercel AI SDK的内置状态管理
- **错误处理**: 自动处理网络错误和重试
- **类型安全**: 更好的TypeScript支持

### 3. 可维护性
- **代码简化**: 减少手动状态管理代码
- **标准化**: 使用业界标准的AI SDK
- **扩展性**: 容易添加新功能（如工具调用）

## 兼容性保证

### 1. 功能完整性
- ✅ 保持所有原有功能
- ✅ 调用次数限制
- ✅ 知识库选择
- ✅ 参考帖子显示
- ✅ Markdown渲染

### 2. 数据一致性
- ✅ 传统消息和AI消息混合显示
- ✅ 时间排序正确
- ✅ 参考帖子信息保留

### 3. 样式一致性
- ✅ 保持原有聊天界面设计
- ✅ 消息气泡样式统一
- ✅ 响应式布局

## 性能优化

### 1. 流式响应
- 减少首字延迟
- 提高用户感知性能
- 降低页面阻塞时间

### 2. 智能缓存
- 知识库内容缓存到store
- 避免重复获取帖子数据
- 减少API调用次数

### 3. 组件优化
- 使用React.memo优化渲染
- 分离流式和传统消息渲染
- 减少不必要的重新渲染

## 后续优化建议

### 1. 工具集成
- 添加搜索工具调用
- 集成图片生成工具
- 支持代码执行工具

### 2. 更多AI功能
- 支持多轮对话上下文
- 添加对话记忆功能
- 实现对话分支管理

### 3. 性能优化
- 实现消息虚拟滚动
- 添加消息压缩功能
- 优化大量消息的渲染性能

## 相关文件总结

**新增文件**:
- `src/app/api/summary/chat/route.ts` - 流式API端点
- `src/hooks/useSummaryChat.ts` - AI聊天Hook
- `src/app/summary/components/StreamingChatMessages.tsx` - 流式消息组件
- `docs/legacy-ai-integration.md` - 原有逻辑文档
- `docs/vercel-ai-sdk-migration.md` - 本迁移文档

**修改文件**:
- `src/store/summaryStore.ts` - 添加AI相关状态和方法
- `src/app/summary/page.tsx` - 使用新的Hook和组件
- `src/app/summary/components/index.ts` - 更新组件导出

**保留文件**:
- `src/app/api/summary/route.ts` - 保留原有API（向后兼容）
- `src/app/summary/components/ChatMessages.tsx` - 保留原组件
- 所有业务逻辑工具函数（getTopic, generateQuestion等） 