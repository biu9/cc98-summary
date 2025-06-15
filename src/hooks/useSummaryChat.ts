import { useChat } from 'ai/react';
import { useSummaryStore } from '@/store/summaryStore';
import { useAuth } from 'react-oidc-context';
import { getCurrentCount, increaseCurrentCount } from '@/utils/limitation';
import { MAX_CALL_PER_USER } from '../../config';

export function useSummaryChat() {
  const auth = useAuth();
  const {
    selectedTopics,
    selectedKnowledgeBase,
    aiMessages,
    knowledgeBaseContent,
    setFeedback,
    setAiMessages,
    getKnowledgeBaseForAI,
    addMessage
  } = useSummaryStore();

  const chat = useChat({
    api: '/api/summary/chat',
    
    // 自定义请求体，包含知识库内容
    body: {
      knowledgeBase: knowledgeBaseContent,
      contextDescription: selectedKnowledgeBase 
        ? `基于知识库"${selectedKnowledgeBase.name}"进行问答`
        : "基于选定的参考帖子进行问答"
    },
    
    // 错误处理
    onError: (error) => {
      console.error('Chat error:', error);
      setFeedback('聊天过程中发生错误，请重试');
    },
    
    // 消息完成时的回调
    onFinish: (message) => {
      // 增加调用次数
      increaseCurrentCount();
      
      // 为AI响应消息添加参考帖子信息
      const extendedMessage = {
        ...message,
        topicTitles: selectedTopics.map(topic => topic.label),
        knowledgeBaseName: selectedKnowledgeBase?.name,
      };
      
      // 更新消息列表以包含参考帖子信息
      chat.setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].id === message.id) {
          newMessages[lastIndex] = extendedMessage;
        }
        return newMessages;
      });
    },
    
    // 初始消息
    initialMessages: aiMessages
  });

  // 扩展的提交函数
  const handleSubmit = async (userMessage: string) => {
    // 检查调用限制
    if (getCurrentCount() >= MAX_CALL_PER_USER) {
      setFeedback("今日测试次数已用完,请明日再试");
      return;
    }

    // 验证输入
    if (selectedTopics.length === 0) {
      setFeedback("请先选择知识库");
      return;
    }

    if (!userMessage.trim()) {
      setFeedback("请输入问题");
      return;
    }

    // 获取最新的知识库内容
    if (auth.user?.access_token) {
      await getKnowledgeBaseForAI(auth.user.access_token);
    }

    // 不需要添加用户消息到传统列表，因为AI SDK会管理消息历史

    // 调用AI聊天，附加参考帖子信息
    const topicTitles = selectedTopics.map(topic => topic.label);
    const knowledgeBaseName = selectedKnowledgeBase?.name;
    
    chat.append({
      role: 'user',
      content: userMessage,
      // 将参考帖子信息存储在消息中
      topicTitles,
      knowledgeBaseName,
    } as any);
  };

  // 清空聊天记录
  const clearChat = () => {
    chat.setMessages([]);
    setAiMessages([]);
  };

  return {
    ...chat,
    handleSubmit,
    clearChat,
    // 重命名一些属性以避免混淆
    aiMessages: chat.messages,
    isAILoading: chat.isLoading,
  };
} 