"use client"
import { Alert } from "@mui/material";
import { useEffect, useRef } from "react";

import { OIDC_CONFIG } from "../../../config";
import { useAuth } from "react-oidc-context";
import Link from "next/link";
import { AuthProvider } from "react-oidc-context";

import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  ChatMessages,
  ChatHeader,
  Navigation,
  SelectedTopics,
  ChatInput,
  KnowledgeBaseList
} from "./components";
import { useSummaryStore } from "@/store/summaryStore";


const SummaryPageContent: React.FC = () => {
  const auth = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 使用 Zustand store
  const {
    feedback,
    question,
    loading,
    selectedTopics,
    messages,
    knowledgeBases,
    selectedKnowledgeBase,
    setQuestion,
    setSelectedTopics,
    clearFeedback,
    removeTopic,
    submitQuestion,
    loadKnowledgeBases
  } = useSummaryStore();

  // 初始化知识库（基于收藏帖子）
  useEffect(() => {
    if (auth.user?.access_token) {
      loadKnowledgeBases(auth.user.access_token);
    }
  }, [auth.user?.access_token, loadKnowledgeBases]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async () => {
    if (auth.user?.access_token) {
      await submitQuestion(auth.user.access_token);
    }
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="elegant-card p-8 text-center max-w-md">
          <SmartToyIcon sx={{ fontSize: 48, color: '#4a90e2', mb: 2 }} />
          <h2 className="text-xl font-medium mb-4">CC98 智能助手</h2>
          <p className="text-gray-600 mb-6">登录中，长时间没有跳转可点击重新登录...</p>
          <Link href="/" className="elegant-button">返回登录</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      {feedback && <Alert severity="error" onClose={clearFeedback} className="m-4">{feedback}</Alert>}

      <Navigation />

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧知识库列表 - 桌面端 */}
        <div className="hidden lg:block w-80 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto my-4 ml-4">
          <KnowledgeBaseList />
        </div>

        {/* 右侧聊天区域 */}
        <div className="flex-1 flex flex-col my-4 mr-4 ml-10">
          {/* 移动端知识库列表 */}
          <div className="lg:hidden bg-white border-b border-gray-200 max-h-48 overflow-y-auto mb-4">
            <KnowledgeBaseList />
          </div>

          {/* 聊天容器 - 使用flex-1占满剩余空间 */}
          <div className="chat-container flex flex-col flex-1">
            <ChatHeader />

            <ChatMessages
              messages={messages}
              loading={loading}
              ref={messagesEndRef}
            />

            <div className="chat-input-container rounded-b-xl p-4 shadow-lg border-t flex-shrink-0">
              <SelectedTopics
                selectedTopics={selectedTopics}
                onRemoveTopic={removeTopic}
                selectedKnowledgeBase={selectedKnowledgeBase}
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
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <AuthProvider {...OIDC_CONFIG}>
      <SummaryPageContent />
    </AuthProvider>
  );
} 