"use client"
import { Paper, Input, Button, CircularProgress, Autocomplete, TextField, Alert, Avatar, IconButton } from "@mui/material";
import { SetStateAction, useCallback, useContext, useEffect, useState, useRef, useMemo } from "react";
import { IGeneralResponse, ISummaryRequest } from "@request/api";
import { GET, POST } from "@/request";
import { FeedbackContext } from "@/store/feedBackContext";
import { debounce } from "@/utils/debounce";
import { API_ROOT, MAX_CALL_PER_USER, OIDC_CONFIG } from "../../../config";
import { useAuth } from "react-oidc-context";
import { IPost, ITopic } from "@cc98/api";
import { requestQueue } from "@/utils/requestQueue";
import { securityFilter } from "@/utils/securityFilter";
import { increaseCurrentCount, getCurrentCount } from "@/utils/limitation";
import Link from "next/link";
import { AuthProvider } from "react-oidc-context";
import { UserInfoProvider } from "@/store/userInfoContext";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import { IChatMessage, IReferenceProps, ISummaryPageContentProps } from "@page/summary";

const Reference = ({ setSelectedTopic, accessToken }: {
  setSelectedTopic: React.Dispatch<SetStateAction<IReferenceProps | null>>,
  accessToken?: string
}) => {
  const [reference, setReference] = useState<IReferenceProps[]>([]);
  const [composing, setComposing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const fetchOptions = useCallback(async (value: string) => {
    if (!value || !accessToken) return;
    const res: ITopic[] = await GET(`${API_ROOT}/topic/search?keyword=${value}&size=20&from=0&sf_request_type=fetch`, accessToken);
    setReference(res.map(item => {
      return {
        label: item.title,
        id: item.id,
        replyCount: item.replyCount
      }
    }));
  }, [accessToken]);

  const debouncedFetch = useMemo(() => debounce(fetchOptions, 500), [fetchOptions]);

  const handleInput = (event: React.SyntheticEvent, value: string) => {
    setInputValue(value);
    if (composing)
      return;
    debouncedFetch(value);
  }

  const onCompositionEnd = () => {
    setComposing(false);
    debouncedFetch(inputValue);
  }

  return (
    <Autocomplete
      options={reference}
      renderInput={(params) =>
        <TextField
          {...params}
          label="搜索参考帖子"
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              backgroundColor: '#f8f9fa'
            }
          }}
        />
      }
      onInputChange={handleInput}
      className="w-full"
      onCompositionStart={() => setComposing(true)}
      onCompositionEnd={onCompositionEnd}
      onChange={(e, value) => {
        setSelectedTopic(value);
      }}
    />
  )
}

const ChatBubble = ({ message }: { message: IChatMessage }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 chat-bubble`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%]`}>
        <Avatar
          className={`${isUser ? 'ml-2' : 'mr-2'} flex-shrink-0`}
          sx={{
            width: 32,
            height: 32,
            backgroundColor: isUser ? '#667eea' : isSystem ? '#48cae4' : '#4a90e2'
          }}
        >
          {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
        </Avatar>
        <div className={`px-4 py-3 rounded-2xl ${isUser
            ? 'message-bubble-user text-white rounded-br-md'
            : isSystem
              ? 'message-bubble-system text-white rounded-bl-md'
              : 'message-bubble-bot text-gray-800 rounded-bl-md'
          }`}>
          {message.topicTitle && (
            <div className="text-xs opacity-80 mb-2 p-2 bg-black bg-opacity-10 rounded-lg">
              📋 参考帖子: {message.topicTitle}
            </div>
          )}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          <div className={`text-xs mt-2 opacity-70`}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryPageContent: React.FC<ISummaryPageContentProps> = ({
  feedback,
  setFeedback,
  question,
  setQuestion,
  loading,
  setLoading,
  selectedTopic,
  setSelectedTopic,
  messages,
  addMessage,
  clearFeedback,
  messagesEndRef
}) => {
  const auth = useAuth();

  const getTopic = async (token: string, topicId?: number, replyCount?: number) => {
    if (!topicId || !replyCount) return '';

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

  const generateQuestion = (topicContent: string, question: string) => {
    return `请根据给出的知识库回答对应的问题: 知识库${topicContent},问题: ${question}`
  }

  const handleSubmit = async () => {
    if (getCurrentCount() >= MAX_CALL_PER_USER) {
      setFeedback("今日测试次数已用完,请明日再试");
      return;
    }

    if (!selectedTopic) {
      setFeedback("请先选择一个参考帖子");
      return;
    }

    if (!question.trim()) {
      setFeedback("请输入问题");
      return;
    }

    addMessage('user', question, selectedTopic.label);

    setLoading(true);
    setQuestion("");

    try {
      const topicContent = await getTopic(auth.user?.access_token!, selectedTopic?.id, selectedTopic?.replyCount);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
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

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-medium text-gray-800 hover:text-blue-600 transition-colors">
              CC98 Hub
            </Link>
            <div className="flex space-x-3">
              <Link href="/mbti" className="text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                MBTI测试
              </Link>
              <Link href="/summary" className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                智能问答
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 chat-container flex flex-col">
        <div className="chat-header rounded-t-xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <SmartToyIcon />
            </Avatar>
            <div>
              <h2 className="font-medium text-white">CC98 智能助手</h2>
              <p className="text-sm text-white opacity-80">基于帖子内容的智能问答</p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white p-4 overflow-y-auto chat-messages custom-scrollbar">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {loading && (
            <div className="flex justify-start mb-4 chat-bubble">
              <div className="flex items-start">
                <Avatar
                  className="mr-2 flex-shrink-0"
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: '#4a90e2'
                  }}
                >
                  <SmartToyIcon fontSize="small" />
                </Avatar>
                <div className="message-bubble-bot px-4 py-3 rounded-2xl rounded-bl-md typing-indicator">
                  <div className="flex items-center space-x-2">
                    <CircularProgress size={16} color="primary" />
                    <span className="text-sm text-gray-600 loading-dots">正在思考</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container rounded-b-xl p-4 shadow-lg border-t">
          <div className="mb-3">
            <Reference
              setSelectedTopic={setSelectedTopic}
              accessToken={auth.user?.access_token}
            />
          </div>

          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedTopic ? "输入您的问题... (按Enter发送)" : "请先选择参考帖子"}
                disabled={!selectedTopic}
                multiline
                maxRows={4}
                fullWidth
                className="w-full"
              />
            </div>
            <IconButton
              onClick={handleSubmit}
              disabled={loading || !selectedTopic || !question.trim()}
              sx={{
                backgroundColor: '#667eea',
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': {
                  backgroundColor: '#5a67d8',
                  transform: 'scale(1.05)',
                },
                '&:disabled': {
                  backgroundColor: '#e5e7eb',
                  color: '#9ca3af',
                  transform: 'none',
                },
                transition: 'all 0.2s ease'
              }}
            >
              <SendIcon />
            </IconButton>
          </div>

          {selectedTopic && (
            <div className="mt-2 text-xs text-gray-500">
              已选择参考帖子: {selectedTopic.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  const [feedback, setFeedback] = useState<string>('');
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<IReferenceProps | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: '您好！我是CC98智能助手，可以帮您基于论坛帖子内容回答问题。请先选择一个参考帖子，然后输入您的问题。',
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

  const addMessage = (type: 'user' | 'bot', content: string, topicTitle?: string) => {
    const newMessage: IChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      topicTitle
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
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
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