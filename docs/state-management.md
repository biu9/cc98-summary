# SummaryPage 状态管理架构

## 概述

SummaryPage 使用 Zustand 进行全局状态管理，采用分层设计模式实现状态与UI组件的解耦。

## 架构设计

### 1. Store 结构 (`src/store/summaryStore.ts`)

```typescript
interface SummaryState {
  // 基础状态
  feedback: string;
  question: string;
  loading: boolean;
  selectedTopics: IReferenceProps[];
  messages: IChatMessage[];
  
  // 知识库状态
  knowledgeBases: IKnowledgeBase[];
  selectedKnowledgeBase: IKnowledgeBase | null;
  
  // 操作方法
  setFeedback: (feedback: string) => void;
  clearFeedback: () => void;
  // ... 其他方法
  
  // 知识库操作
  createKnowledgeBase: (name: string, description: string, topics: IReferenceProps[]) => Promise<boolean>;
  updateKnowledgeBase: (kb: IKnowledgeBase) => Promise<boolean>;
  deleteKnowledgeBase: (id: string) => Promise<boolean>;
  
  // 业务逻辑
  submitQuestion: (accessToken: string) => Promise<void>;
}
```

### 2. 设计模式

#### 单一职责原则
- **Store**: 负责状态管理和业务逻辑
- **Components**: 负责UI渲染和用户交互
- **KnowledgeBaseManager**: 负责本地存储操作

#### 依赖倒置原则
- 组件依赖于抽象的Store接口，而不是具体的实现
- 业务逻辑与UI完全分离

#### 开闭原则
- 通过Zustand的中间件系统扩展功能（devtools, persist）
- 新增状态或操作无需修改现有代码

### 3. 组件层级

```
SummaryPage
├── SummaryPageContent (主要逻辑入口)
│   ├── ChatHeader
│   ├── ChatMessages
│   ├── KnowledgeBaseSelector (使用store)
│   ├── Reference
│   ├── SelectedTopics
│   └── ChatInput
└── KnowledgeBaseSidebar (使用store)
```

### 4. 数据流

1. **初始化**: `loadKnowledgeBases()` 从localStorage加载知识库
2. **用户操作**: 组件调用store方法
3. **状态更新**: Store更新状态并触发重渲染
4. **副作用**: 自动同步到localStorage（通过persist中间件）

### 5. 关键特性

#### 状态持久化
```typescript
persist(
  // store配置
  {
    name: 'summary-store',
    partialize: (state) => ({
      knowledgeBases: state.knowledgeBases,
      selectedKnowledgeBase: state.selectedKnowledgeBase
    })
  }
)
```

#### 开发工具集成
```typescript
devtools(
  // 启用Redux DevTools支持
)
```

#### 类型安全
- 完整的TypeScript类型定义
- 编译时类型检查
- IntelliSense支持

## 使用方式

### 在组件中使用Store

```typescript
import { useSummaryStore } from '@/store/summaryStore';

const MyComponent = () => {
  const { 
    question, 
    setQuestion, 
    submitQuestion 
  } = useSummaryStore();
  
  const handleSubmit = async () => {
    await submitQuestion(accessToken);
  };
  
  return (
    <input 
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
    />
  );
};
```

### 添加新的状态

1. 在 `SummaryState` 接口中添加新字段
2. 在store初始化中设置默认值
3. 添加相应的setter方法
4. 在组件中使用

### 添加新的业务逻辑

1. 在store中添加方法
2. 实现业务逻辑
3. 在组件中调用

## 优势

1. **集中化管理**: 所有状态集中在一个地方，便于维护
2. **类型安全**: 完整的TypeScript支持
3. **开发体验**: Redux DevTools支持，便于调试
4. **性能优化**: 精确的重渲染控制
5. **可测试性**: 业务逻辑与UI分离，便于单元测试
6. **扩展性**: 易于添加新功能和状态

## 最佳实践

1. **保持Store纯净**: 避免在store中直接操作DOM
2. **异步操作**: 使用async/await处理异步逻辑
3. **错误处理**: 在store中统一处理错误状态
4. **状态最小化**: 只存储必要的状态，计算值通过衍生获得
5. **命名规范**: 使用清晰的命名约定 