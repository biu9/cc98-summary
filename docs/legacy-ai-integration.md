# 原有大模型集成逻辑文档

## 概述

本文档记录了在迁移到Vercel AI SDK之前的大模型交互逻辑，包括API接口设计、前端实现和数据流程。

## 原有API接口

### 1. Summary API (`/api/summary`)

**用途**: 基于知识库内容回答用户问题

**请求格式**:
```typescript
interface ISummaryRequest {
  text: string; // 包含知识库内容和问题的完整prompt
}
```

**响应格式**:
```typescript
interface IGeneralResponse {
  isOk: boolean;
  data: string;  // AI生成的回答文本
  msg: string;   // 状态消息
}
```

**实现逻辑**:
```typescript
// 使用Google Generative AI SDK
const genAi = new GoogleGenerativeAI(process.env.API_KEY!);
const model = genAi.getGenerativeModel({
  model: "gemini-1.5-flash", 
  generationConfig: { temperature: 0 }
});

const result = await model.generateContent(text);
const response = result.response;
const resultText = response.text();
```

**特点**:
- 非流式响应
- 一次性返回完整结果
- 固定的模型配置

### 2. MBTI分析API (`/api/mbti`)

**用途**: 基于用户发帖内容分析MBTI人格类型

**请求格式**:
```typescript
interface IMBTIRequest {
  text: string;     // 用户发帖内容
  username: string; // 用户名
}
```

**响应格式**:
```typescript
interface IMBTIResponse {
  first: { type: "E" | "I", explanation: string };
  second: { type: "S" | "N", explanation: string };
  third: { type: "T" | "F", explanation: string };
  fourth: { type: "J" | "P", explanation: string };
  // ...其他字段
}
```

**特点**:
- 使用JSON Schema强制结构化输出
- 复杂的类型定义和解释生成

### 3. 聊天API (`/api/llm/chat`)

**用途**: 通用AI聊天对话

**实现**:
```typescript
import { streamText, tool } from "ai";
import { google } from "@/lib/models";

const result = streamText({
  model: google("gemini-2.0-flash-exp"),
  messages,
  tools: { /* tool definitions */ }
});

return result.toDataStreamResponse();
```

**特点**:
- 已使用Vercel AI SDK
- 支持流式响应
- 包含工具调用功能

## 前端实现逻辑

### SummaryStore中的submitQuestion方法

**核心流程**:
1. 验证用户调用次数限制
2. 检查知识库选择和问题输入
3. 构建用户消息
4. 获取多个帖子内容
5. 生成包含知识库的完整prompt
6. 调用Summary API
7. 处理响应并添加机器人消息

**关键代码**:
```typescript
submitQuestion: async (accessToken) => {
  // 1. 检查调用限制
  if (getCurrentCount() >= MAX_CALL_PER_USER) {
    setFeedback("今日测试次数已用完,请明日再试");
    return;
  }

  // 2. 验证输入
  if (selectedTopics.length === 0) {
    setFeedback("请先选择知识库");
    return;
  }

  // 3. 添加用户消息
  const topicTitles = selectedTopics.map(topic => topic.label);
  addMessage('user', question, topicTitles);

  // 4. 获取知识库内容
  const topicContent = await getMultipleTopics(accessToken, selectedTopics);
  
  // 5. 构建完整prompt
  const contextDescription = selectedKnowledgeBase 
    ? `基于知识库"${selectedKnowledgeBase.name}"`
    : "基于选定的参考帖子";
  
  const fullPrompt = generateQuestion(
    topicContent, 
    `${contextDescription}回答问题: ${question}`
  );

  // 6. 调用API
  const res = await POST<ISummaryRequest, IGeneralResponse>("/api/summary", {
    text: fullPrompt,
  });

  // 7. 处理响应
  if (res.isOk) {
    addMessage('bot', res.data);
    increaseCurrentCount();
  }
}
```

### 知识库内容构建

**getMultipleTopics函数**:
```typescript
const getMultipleTopics = async (token: string, topics: IReferenceProps[]): Promise<string> => {
  const topicsContent = await Promise.all(
    topics.map(topic => getTopic(token, topic.id, topic.replyCount))
  );
  return topicsContent.join('\n\n==================\n\n');
};
```

**getTopic函数**:
```typescript
const getTopic = async (token: string, topicId: number, replyCount: number): Promise<string> => {
  const PageSize = 10;
  const pages = Math.ceil(replyCount / PageSize);
  
  const topicArr = [];
  for(let i = 0; i < pages; i++) {
    topicArr.push(async () => {
      return await GET<IPost[]>(`${API_ROOT}/Topic/${topicId}/post?from=${i*PageSize}&size=${PageSize}`, token);
    });
  }
  
  const topicData = await requestQueue<IPost[]>(topicArr);
  
  let text = '';
  topicData.forEach((posts: IPost[]) => {
    text += posts.map(post => 
      `${post.userName}: ${securityFilter(post.content)}`
    ).join('\n\n') + '\n\n';
  });
  
  return text;
};
```

### Prompt生成逻辑

**generateQuestion函数**:
```typescript
const generateQuestion = (topicContent: string, question: string): string => {
  return `请根据给出的知识库回答对应的问题: 知识库${topicContent},问题: ${question}`;
};
```

## 限制和特点

### 调用限制
- 单用户单日最多调用次数：`MAX_CALL_PER_USER`
- 使用`getCurrentCount()`和`increaseCurrentCount()`管理

### 请求队列
- 使用`requestQueue`工具避免并发请求过多
- 支持批量获取帖子数据

### 安全过滤
- 使用`securityFilter`过滤帖子内容
- 防止恶意内容注入

### 非流式特性
- 所有响应都是一次性返回
- 用户需要等待完整响应
- 没有实时反馈

## 迁移考虑点

1. **流式响应**: 新方案应支持实时流式返回
2. **状态管理**: 需要处理流式数据的状态更新
3. **错误处理**: 流式响应的错误处理机制
4. **兼容性**: 保持相同的功能和用户体验
5. **工具集成**: 可能需要集成工具调用功能

## 相关文件

- `src/app/api/summary/route.ts` - Summary API实现
- `src/app/api/mbti/route.ts` - MBTI分析API
- `src/app/api/llm/chat/route.ts` - 聊天API（已使用Vercel AI SDK）
- `src/store/summaryStore.ts` - 前端状态管理和业务逻辑
- `src/utils/limitation.ts` - 调用次数限制工具
- `src/utils/requestQueue.ts` - 请求队列工具
- `src/utils/securityFilter.ts` - 安全过滤工具 