'use client'

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { 
  Container, 
  Paper, 
  TextField, 
  IconButton, 
  Box, 
  Typography, 
  Avatar,
  Chip,
  Fade,
  CircularProgress
} from '@mui/material';
import { Send, SmartToy, Person } from '@mui/icons-material';

export default function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/llm/chat',
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (date?: Date) => {
    const timestamp = date || new Date();
    return timestamp.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 2 }}>
      {/* 顶部标题 */}
      <Paper elevation={1} sx={{ p: 2, mb: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <SmartToy sx={{ color: 'white', fontSize: 28 }} />
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
            AI 聊天助手
          </Typography>
          <Chip 
            label={isLoading ? "思考中..." : "在线"} 
            size="small" 
            sx={{ 
              backgroundColor: isLoading ? '#ff9800' : '#4caf50', 
              color: 'white',
              ml: 'auto'
            }} 
            icon={isLoading ? <CircularProgress size={12} sx={{ color: 'white' }} /> : undefined}
          />
        </Box>
      </Paper>

      {/* 消息区域 */}
      <Paper 
        elevation={2} 
        sx={{ 
          flex: 1, 
          p: 2, 
          mb: 2, 
          overflow: 'auto',
          backgroundColor: '#fafafa',
          borderRadius: 2
        }}
      >
        {messages.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            height="100%"
            sx={{ opacity: 0.6 }}
          >
            <SmartToy sx={{ fontSize: 64, color: 'gray', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              开始与AI助手对话吧！
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              输入您的问题，我会尽力为您解答
            </Typography>
          </Box>
        ) : (
          <Box>
            {messages.map((message) => (
              <Fade in={true} timeout={300} key={message.id}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    mb: 2,
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      gap: 1,
                      maxWidth: '75%',
                      flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36,
                        backgroundColor: message.role === 'user' ? '#1976d2' : '#f57c00'
                      }}
                    >
                      {message.role === 'user' ? <Person /> : <SmartToy />}
                    </Avatar>
                    
                    <Box>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          backgroundColor: message.role === 'user' ? '#e3f2fd' : 'white',
                          borderRadius: message.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          border: message.role === 'assistant' ? '1px solid #e0e0e0' : 'none',
                          minHeight: message.role === 'assistant' && !message.content ? '40px' : 'auto',
                          display: 'flex',
                          alignItems: message.role === 'assistant' && !message.content ? 'center' : 'flex-start'
                        }}
                      >
                        {message.role === 'assistant' && !message.content && isLoading ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress size={16} />
                            <Typography variant="body2" color="text.secondary">
                              正在思考...
                            </Typography>
                          </Box>
                        ) : (
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              whiteSpace: 'pre-wrap',
                              lineHeight: 1.6
                            }}
                          >
                            {message.content}
                          </Typography>
                        )}
                      </Paper>
                      
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          display: 'block', 
                          mt: 0.5,
                          textAlign: message.role === 'user' ? 'right' : 'left',
                          px: 1
                        }}
                      >
                        {formatTime(message.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Paper>

      {/* 输入区域 */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          display="flex" 
          gap={1} 
          alignItems="flex-end"
        >
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            placeholder="输入您的消息..."
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px',
                backgroundColor: '#f5f5f5',
                '&:hover': {
                  backgroundColor: '#eeeeee',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                }
              }
            }}
          />
          <IconButton
            type="submit"
            disabled={!input.trim() || isLoading}
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              width: 48,
              height: 48,
              '&:hover': {
                backgroundColor: '#1565c0',
              },
              '&:disabled': {
                backgroundColor: '#ccc',
                color: '#999'
              }
            }}
          >
            {isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Send />}
          </IconButton>
        </Box>
        
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            display: 'block', 
            mt: 1, 
            textAlign: 'center',
            opacity: 0.7
          }}
        >
          按 Enter 发送，Shift + Enter 换行 {isLoading && "• AI正在回复中..."}
        </Typography>
      </Paper>
    </Container>
  );
}