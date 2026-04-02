import { useChat } from "ai/react";
import { useAuth } from "react-oidc-context";
import { useSummaryStore } from "@/store/summaryStore";
import { getCurrentCount, increaseCurrentCount } from "@/utils/limitation";
import { MAX_CALL_PER_USER } from "../../config";

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
  } = useSummaryStore();

  const chat = useChat({
    api: "/api/summary/chat",
    body: {
      knowledgeBase: knowledgeBaseContent,
      contextDescription: selectedKnowledgeBase
        ? `基于知识库“${selectedKnowledgeBase.name}”进行问答`
        : "基于当前选中的参考帖子进行问答",
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setFeedback("聊天过程中发生错误，请稍后重试。");
    },
    onFinish: (message) => {
      increaseCurrentCount();

      const extendedMessage = {
        ...message,
        topicTitles: selectedTopics.map((topic) => topic.label),
        knowledgeBaseName: selectedKnowledgeBase?.name,
      };

      chat.setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].id === message.id) {
          newMessages[lastIndex] = extendedMessage;
        }
        return newMessages;
      });
    },
    initialMessages: aiMessages,
  });

  const handleSubmit = async (userMessage: string) => {
    if (getCurrentCount() >= MAX_CALL_PER_USER) {
      setFeedback("今日调用次数已用完，请明天再试。");
      return;
    }

    if (selectedTopics.length === 0) {
      setFeedback("请先选择一个知识库。");
      return;
    }

    if (!userMessage.trim()) {
      setFeedback("请输入一个问题。");
      return;
    }

    if (auth.user?.access_token) {
      await getKnowledgeBaseForAI(auth.user.access_token);
    }

    chat.append({
      role: "user",
      content: userMessage,
      topicTitles: selectedTopics.map((topic) => topic.label),
      knowledgeBaseName: selectedKnowledgeBase?.name,
    } as any);
  };

  const clearChat = () => {
    chat.setMessages([]);
    setAiMessages([]);
  };

  return {
    ...chat,
    handleSubmit,
    clearChat,
    aiMessages: chat.messages,
    isAILoading: chat.isLoading,
  };
}
