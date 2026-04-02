"use client";

import { Alert, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { AutoAwesomeRounded, LibraryBooksRounded, VerifiedRounded } from "@mui/icons-material";
import { useSearchParams } from "next/navigation";
import { useAuth } from "react-oidc-context";
import { CsrPageFallback } from "@/components/CsrPageFallback";
import { SiteNav } from "@/components/SiteNav";
import { ChatHeader, ChatInput, KnowledgeBaseList, SelectedTopics } from "./components";
import StreamingChatMessages from "./components/StreamingChatMessages";
import { useSummaryChat } from "@/hooks/useSummaryChat";
import { useSummaryStore } from "@/store/summaryStore";

function SummaryPage() {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const requestedKnowledgeBaseId = searchParams.get("kb");
  const {
    feedback,
    question,
    selectedTopics,
    messages,
    knowledgeBases,
    selectedKnowledgeBase,
    setQuestion,
    clearFeedback,
    removeTopic,
    loadKnowledgeBases,
    selectKnowledgeBase,
  } = useSummaryStore();
  const { handleSubmit: handleAISubmit, isAILoading, aiMessages } = useSummaryChat();

  useEffect(() => {
    if (auth.user?.access_token) {
      void loadKnowledgeBases(auth.user.access_token);
    }
  }, [auth.user?.access_token, loadKnowledgeBases]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, isAILoading, messages]);

  useEffect(() => {
    if (!requestedKnowledgeBaseId || knowledgeBases.length === 0) {
      return;
    }

    const matchedKnowledgeBase = knowledgeBases.find(
      (knowledgeBase) => knowledgeBase.id === requestedKnowledgeBaseId
    );

    if (
      matchedKnowledgeBase &&
      selectedKnowledgeBase?.id !== matchedKnowledgeBase.id
    ) {
      selectKnowledgeBase(matchedKnowledgeBase);
    }
  }, [
    knowledgeBases,
    requestedKnowledgeBaseId,
    selectKnowledgeBase,
    selectedKnowledgeBase?.id,
  ]);

  const handleSubmit = async () => {
    if (question.trim()) {
      await handleAISubmit(question);
      setQuestion("");
    }
  };

  if (auth.isLoading) {
    return (
      <div className="page-root">
        <main className="page-container">
          <SiteNav current="summary" />
          <div className="panel mx-auto max-w-3xl px-8 py-16 text-center">
            <p className="kicker mx-auto w-fit">Summary</p>
            <h1 className="section-title text-slate-900">正在确认登录状态</h1>
            <p className="section-description mx-auto">稍后会自动读取你的收藏分组。</p>
          </div>
        </main>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="page-root">
        <main className="page-container">
          <SiteNav current="summary" />
          <div className="panel mx-auto max-w-3xl px-8 py-16 text-center">
            <p className="kicker mx-auto w-fit">Summary</p>
            <h1 className="section-title text-slate-900">登录后才能使用帖子问答</h1>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/auth" className="button-primary">
                前往认证页
              </Link>
              <Link href="/" className="button-secondary">
                返回首页
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-root">
      <main className="page-container">
        <SiteNav current="summary" />

        {feedback && (
          <Alert severity="info" onClose={clearFeedback} className="mb-6">
            {feedback}
          </Alert>
        )}

        <Box
          component="section"
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1.15fr) 340px" },
          }}
        >
          <Paper className="mui-dark-panel" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Chip
                icon={<AutoAwesomeRounded />}
                label="帖子问答"
                variant="outlined"
                sx={{
                  alignSelf: "flex-start",
                  color: "#e4e4e7",
                  borderColor: "rgba(255,255,255,0.14)",
                  bgcolor: "rgba(255,255,255,0.04)",
                  "& .MuiChip-icon": { color: "#ffffff" },
                }}
              />
              <Box>
                <Typography
                  variant="h2"
                  fontWeight={700}
                  letterSpacing="-0.04em"
                  sx={{ fontSize: { xs: "2.2rem", md: "3rem" } }}
                >
                  选一个收藏分组，直接开问。
                </Typography>
                <Typography mt={2} maxWidth={620} color="rgba(255,255,255,0.72)">
                  当前分组会直接作为问答上下文。
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0,1fr))",
                    xl: "repeat(4, minmax(0,1fr))",
                  },
                }}
              >
                {[
                  {
                    label: "知识库",
                    value: knowledgeBases.length,
                    hint: "来自收藏分组",
                  },
                  {
                    label: "当前引用",
                    value: selectedTopics.length,
                    hint: "已选参考帖子",
                  },
                  {
                    label: "当前模式",
                    value: selectedKnowledgeBase ? "知识库" : "待选择",
                    hint: selectedKnowledgeBase?.name ?? "先选择收藏分组",
                  },
                  {
                    label: "状态",
                    value: isAILoading ? "生成中" : "可提问",
                    hint: "支持连续追问",
                  },
                ].map((stat) => (
                  <Paper
                    key={stat.label}
                    variant="outlined"
                    sx={{
                      px: 2.25,
                      py: 2.5,
                      bgcolor: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.12)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: "0.24em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.58)",
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography mt={1.5} variant="h5" fontWeight={700} color="#ffffff">
                      {stat.value}
                    </Typography>
                    <Typography mt={1} color="rgba(255,255,255,0.58)">
                      {stat.hint}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Stack>
          </Paper>

          <Paper className="mui-light-panel" sx={{ p: { xs: 3, md: 3.5 } }}>
            <Stack spacing={3}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: "0.24em", fontWeight: 700 }}
              >
                快速操作
              </Typography>
              <Stack spacing={1.5}>
                {[
                  "先选分组，再提问。",
                  "问题越具体，回答越稳。",
                  "想先整理收藏，可去收藏页。",
                ].map((item, index) => (
                  <Paper
                    key={item}
                    variant="outlined"
                    sx={{ px: 2, py: 1.75, bgcolor: "rgba(17,17,17,0.02)" }}
                  >
                    <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
                      <span className="mono mr-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        0{index + 1}
                      </span>
                      {item}
                    </Typography>
                  </Paper>
                ))}
              </Stack>

              <Paper
                variant="outlined"
                sx={{ px: 2.5, py: 2.5, bgcolor: "rgba(17,17,17,0.03)" }}
              >
                <Stack spacing={2}>
                  <Typography fontWeight={700}>
                    <VerifiedRounded className="mr-2 align-[-4px]" />
                    当前分组可直接跳去整理
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1.5}>
                    <Button component={Link} href="/favorites" variant="outlined">
                      打开收藏整理
                    </Button>
                    <Button component={Link} href="/chat" variant="outlined">
                      打开聊天页
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </Paper>
        </Box>

        <section className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <Paper className="mui-light-panel" sx={{ overflow: "hidden" }}>
            <Box sx={{ borderBottom: "1px solid rgba(17,17,17,0.08)", bgcolor: "rgba(17,17,17,0.03)", px: 2.5, py: 2 }}>
              <div className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                <LibraryBooksRounded className="text-[1.15rem]" />
                收藏知识库
              </div>
            </Box>
            <KnowledgeBaseList />
          </Paper>

          <Paper className="mui-light-panel" sx={{ overflow: "hidden" }}>
            <ChatHeader
              knowledgeBaseName={selectedKnowledgeBase?.name ?? null}
              topicCount={selectedTopics.length}
              loading={isAILoading}
            />

            <div className="flex flex-col px-4 pb-4 md:px-6 md:pb-6">
              <StreamingChatMessages
                messages={messages}
                aiMessages={aiMessages}
                loading={isAILoading}
                ref={messagesEndRef}
              />

              <div className="chat-input-container mt-4 rounded-[12px] border border-black/5 px-4 py-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
                <SelectedTopics
                  selectedTopics={selectedTopics}
                  onRemoveTopic={removeTopic}
                  selectedKnowledgeBase={selectedKnowledgeBase}
                />
                <ChatInput
                  question={question}
                  setQuestion={setQuestion}
                  onSubmit={handleSubmit}
                  loading={isAILoading}
                  selectedTopics={selectedTopics}
                />
              </div>
            </div>
          </Paper>
        </section>
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(SummaryPage), {
  ssr: false,
  loading: () => (
    <CsrPageFallback current="summary" title="正在加载帖子问答页" />
  ),
});

