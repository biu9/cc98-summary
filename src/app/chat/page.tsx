'use client'

import { useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { AutoAwesomeRounded, SendRounded, SmartToyRounded } from '@mui/icons-material';
import { CsrPageFallback } from '@/components/CsrPageFallback';
import { SiteNav } from '@/components/SiteNav';

function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/llm/chat',
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const formatTime = (date?: Date) => {
    const timestamp = date || new Date();
    return timestamp.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page-root">
      <main className="page-container">
        <SiteNav current="chat" />

        <Box
          component="section"
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,1.15fr) 340px' },
          }}
        >
          <Paper className="mui-dark-panel" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Chip
                icon={<AutoAwesomeRounded />}
                label="AI 聊天"
                variant="outlined"
                sx={{
                  alignSelf: 'flex-start',
                  color: '#e4e4e7',
                  borderColor: 'rgba(255,255,255,0.14)',
                  bgcolor: 'rgba(255,255,255,0.04)',
                  '& .MuiChip-icon': { color: '#ffffff' },
                }}
              />
              <Box>
                <Typography
                  variant="h2"
                  fontWeight={700}
                  letterSpacing="-0.04em"
                  sx={{ fontSize: { xs: '2.2rem', md: '3rem' } }}
                >
                  一个更轻的通用聊天入口。
                </Typography>
                <Typography mt={2} maxWidth={620} color="rgba(255,255,255,0.72)">
                  不绑定知识库，直接开始对话。
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper className="mui-light-panel" sx={{ p: { xs: 3, md: 3.5 } }}>
            <Stack spacing={3}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: '0.24em', fontWeight: 700 }}
              >
                快速提示
              </Typography>
              <Stack spacing={1.5}>
                {[
                  '适合快速试模型回复。',
                  'Enter 发送，Shift + Enter 换行。',
                  '需要收藏上下文时改用问答页。',
                ].map((item, index) => (
                  <Paper
                    key={item}
                    variant="outlined"
                    sx={{ px: 2, py: 1.75, bgcolor: 'rgba(17,17,17,0.02)' }}
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
            </Stack>
          </Paper>
        </Box>

        <Paper className="mui-light-panel" sx={{ mt: 3, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: '1px solid rgba(17,17,17,0.08)', bgcolor: 'rgba(17,17,17,0.03)', px: { xs: 3, md: 4 }, py: 2.5 }}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#111111] text-white">
                  <SmartToyRounded />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    通用聊天工作台
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    当前状态：{isLoading ? '模型思考中' : '可以开始对话'}
                  </p>
                </div>
              </div>
              <div className="pill">
                {isLoading ? (
                  <>
                    <CircularProgress size={14} />
                    <span>正在回复</span>
                  </>
                ) : (
                  <span>在线</span>
                )}
              </div>
            </div>
          </Box>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-h-[560px] bg-white/60 px-4 py-5 md:px-6">
              {messages.length === 0 ? (
                <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[10px] bg-[#111111] text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
                    <SmartToyRounded className="text-[2rem]" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-slate-900">
                    从一个问题开始
                  </h3>
                  <p className="mt-3 max-w-xl text-sm text-slate-600">直接输入就行。</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isUser = message.role === 'user';

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-[12px] px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] ${
                            isUser
                              ? 'message-bubble-user text-white'
                              : 'message-bubble-bot text-slate-800'
                          }`}
                        >
                          {message.role === 'assistant' && !message.content && isLoading ? (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CircularProgress size={16} />
                              <span>正在思考中...</span>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap text-sm leading-8">
                              {message.content}
                            </p>
                          )}
                          <div
                            className={`mt-3 text-xs ${
                              isUser ? 'text-white/70' : 'text-slate-500'
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="border-l border-black/5 bg-[#fafafa] px-5 py-6">
              <form onSubmit={handleSubmit} className="flex h-full flex-col">
                <div className="rounded-[12px] border border-black/5 bg-white px-5 py-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
                  <p className="kicker">输入区</p>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">
                    直接开始对话
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">Enter 发送，Shift + Enter 换行。</p>
                </div>

                <div className="mt-5 flex flex-1 flex-col rounded-[12px] border border-black/5 bg-white px-4 py-4 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder="输入你的问题或想法..."
                    className="min-h-[220px] flex-1 resize-none rounded-[10px] border border-black/5 bg-[#fafafa] px-4 py-4 text-sm leading-7 text-slate-700 outline-none transition focus:border-black/20 focus:bg-white focus:ring-4 focus:ring-black/5"
                  />

                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    variant="contained"
                    className="mt-4 w-full"
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress size={16} sx={{ color: 'white' }} />
                        发送中
                      </>
                    ) : (
                      <>
                        <SendRounded className="text-[1rem]" />
                        发送消息
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Paper>
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ChatPage), {
  ssr: false,
  loading: () => <CsrPageFallback current="chat" title="正在加载聊天页" />,
});

