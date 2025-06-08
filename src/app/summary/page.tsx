"use client"
import { Alert } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { IGeneralResponse, ISummaryRequest } from "@request/api";
import { GET, POST } from "@/request";
import { FeedbackContext } from "@/store/feedBackContext";
import { API_ROOT, MAX_CALL_PER_USER, OIDC_CONFIG } from "../../../config";
import { useAuth } from "react-oidc-context";
import { IPost } from "@cc98/api";
import { requestQueue } from "@/utils/requestQueue";
import { securityFilter } from "@/utils/securityFilter";
import { increaseCurrentCount, getCurrentCount } from "@/utils/limitation";
import Link from "next/link";
import { AuthProvider } from "react-oidc-context";
import { UserInfoProvider } from "@/store/userInfoContext";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { IChatMessage, IReferenceProps, ISummaryPageContentProps } from "./types";
import {
  Reference,
  ChatMessages,
  ChatHeader,
  Navigation,
  SelectedTopics,
  ChatInput
} from "./components";



const SummaryPageContent: React.FC<ISummaryPageContentProps> = ({
  feedback,
  setFeedback,
  question,
  setQuestion,
  loading,
  setLoading,
  selectedTopics,
  setSelectedTopics,
  messages,
  addMessage,
  clearFeedback,
  messagesEndRef
}) => {
  const auth = useAuth();

  const getTopic = async (token: string, topicId: number, replyCount: number) => {
    let text = '';
    const PageSize = 10;
    const topicArr: (() => Promise<IPost[]>)[] = [];
    for (let i = 0; i < Math.ceil(replyCount / PageSize); i++) {
      topicArr.push(async () => {
        const data = await GET<IPost[]>(`${API_ROOT}/Topic/${topicId}/post?from=${i * PageSize}&size=${PageSize}&sf_request_type=fetch`, token);
        return data;
      })
    }
    const topicData = await requestQueue<IPost[]>(topicArr);
    topicData.forEach((post: IPost[]) => {
      text += post.map(item => item.userName + ':' + securityFilter(item.content)).join('\n\n') + '\n\n';
    })

    return text;
  }

  const getMultipleTopics = async (token: string, topics: IReferenceProps[]) => {
    const topicsContent = await Promise.all(
      topics.map(async (topic) => {
        const content = await getTopic(token, topic.id, topic.replyCount);
        return `帖子标题: ${topic.label}\n内容: ${content}`;
      })
    );
    return topicsContent.join('\n\n=== 分隔线 ===\n\n');
  }

  const generateQuestion = (topicContent: string, question: string) => {
    return `请根据给出的知识库回答对应的问题: 知识库${topicContent},问题: ${question}`
  }

  const handleSubmit = async () => {
    if (getCurrentCount() >= MAX_CALL_PER_USER) {
      setFeedback("今日测试次数已用完,请明日再试");
      return;
    }

    if (selectedTopics.length === 0) {
      setFeedback("请先选择参考帖子");
      return;
    }

    if (!question.trim()) {
      setFeedback("请输入问题");
      return;
    }

    const topicTitles = selectedTopics.map(topic => topic.label);
    addMessage('user', question, topicTitles);

    setLoading(true);
    setQuestion("");

    try {
      const topicContent = await getMultipleTopics(auth.user?.access_token!, selectedTopics);
      const res = await POST<ISummaryRequest, IGeneralResponse>("/api/summary", {
        text: generateQuestion(topicContent, question),
      });

      if (res.isOk) {
        addMessage('bot', res.data);
        increaseCurrentCount();
      } else {
        setFeedback(res.msg);
      }
    } catch (error) {
      setFeedback("发生错误，请重试");
    }

    setLoading(false);
  };

  const handleRemoveTopic = (topicId: number) => {
    setSelectedTopics(prev => prev.filter(topic => topic.id !== topicId));
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="elegant-card p-8 text-center max-w-md">
          <SmartToyIcon sx={{ fontSize: 48, color: '#4a90e2', mb: 2 }} />
          <h2 className="text-xl font-medium mb-4">CC98 智能助手</h2>
          <p className="text-gray-600 mb-6">请先登录以使用智能问答功能</p>
          <Link href="/" className="elegant-button">返回登录</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {feedback && <Alert severity="error" onClose={clearFeedback} className="m-4">{feedback}</Alert>}

      <Navigation />

      <div className="max-w-4xl mx-auto p-4 chat-container flex flex-col">
        <ChatHeader />

        <ChatMessages
          messages={messages}
          loading={loading}
          ref={messagesEndRef}
        />

        <div className="chat-input-container rounded-b-xl p-4 shadow-lg border-t">
          <div className="mb-3">
            <Reference
              selectedTopics={selectedTopics}
              setSelectedTopics={setSelectedTopics}
              accessToken={auth.user?.access_token}
            />
          </div>

          <SelectedTopics
            selectedTopics={selectedTopics}
            onRemoveTopic={handleRemoveTopic}
          />

          <ChatInput
            question={question}
            setQuestion={setQuestion}
            onSubmit={handleSubmit}
            loading={loading}
            selectedTopics={selectedTopics}
          />
        </div>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  const [feedback, setFeedback] = useState<string>('');
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<IReferenceProps[]>([]);
  const [messages, setMessages] = useState<IChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: '您好！我是CC98智能助手，可以帮您基于论坛帖子内容回答问题。请先选择一个或多个参考帖子，然后输入您的问题。',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const clearFeedback = () => {
    setFeedback('');
  }

  const setFeedbackFunc = (feedback: string) => {
    setFeedback(feedback);
  }

  const addMessage = (type: 'user' | 'bot', content: string, topicTitles?: string[]) => {
    const newMessage: IChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      topicTitles
    };
    setMessages(prev => [...prev, newMessage]);
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <AuthProvider {...OIDC_CONFIG}>
      <UserInfoProvider>
        <FeedbackContext.Provider value={{ feedback, setFeedback: setFeedbackFunc }}>
          <SummaryPageContent
            feedback={feedback}
            setFeedback={setFeedbackFunc}
            question={question}
            setQuestion={setQuestion}
            loading={loading}
            setLoading={setLoading}
            selectedTopics={selectedTopics}
            setSelectedTopics={setSelectedTopics}
            messages={messages}
            addMessage={addMessage}
            clearFeedback={clearFeedback}
            messagesEndRef={messagesEndRef}
          />
        </FeedbackContext.Provider>
      </UserInfoProvider>
    </AuthProvider>
  );
} 