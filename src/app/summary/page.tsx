"use client"
import { Alert } from "@mui/material";
import { useEffect, useRef } from "react";

import { OIDC_CONFIG } from "../../../config";
import { useAuth } from "react-oidc-context";
import Link from "next/link";
import { AuthProvider } from "react-oidc-context";

import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  Reference,
  ChatMessages,
  ChatHeader,
  Navigation,
  SelectedTopics,
  ChatInput,
  KnowledgeBaseSidebar,
  KnowledgeBaseSelector
} from "./components";
import { useSummaryStore } from "@/store/summaryStore";
import { getFavouriteTopicGroup, getFavouriteTopicContent } from "@/utils/getFavouriteTopic";


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

  // 初始化知识库
  useEffect(() => {
    loadKnowledgeBases();
  }, [loadKnowledgeBases]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (auth.user?.access_token) {
      getFavouriteTopicGroup(auth.user.access_token).then(res => {
        console.log(res);
      });
    }
  }, [auth.user?.access_token]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {feedback && <Alert severity="error" onClose={clearFeedback} className="m-4">{feedback}</Alert>}

      <Navigation />

      <div className="max-w-7xl mx-auto p-4 flex gap-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {/* 主聊天区域 */}
        <div className="flex-1 chat-container flex flex-col" style={{ minWidth: 0 }}>
          <ChatHeader />

          <ChatMessages
            messages={messages}
            loading={loading}
            ref={messagesEndRef}
          />

          <div className="chat-input-container rounded-b-xl p-4 shadow-lg border-t">
            <KnowledgeBaseSelector />

            <div className="mb-3">
              <Reference
                selectedTopics={selectedTopics}
                setSelectedTopics={setSelectedTopics}
                accessToken={auth.user?.access_token}
              />
            </div>

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

        {/* 知识库管理侧边栏 */}
        <div className="w-80 flex-shrink-0">
          <KnowledgeBaseSidebar
            accessToken={auth.user?.access_token}
          />
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