"use client"
import { Paper, Input, Button, CircularProgress, Autocomplete, TextField, Alert } from "@mui/material";
import { SetStateAction, useCallback, useContext, useEffect, useState } from "react";
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

type ReferenceProps = {
  label: string;
  id: number;
  replyCount: number;
}

const Reference = ({ setSelectedTopic, accessToken }: { 
  setSelectedTopic: React.Dispatch<SetStateAction<ReferenceProps | null>>,
  accessToken?: string
}) => {
  const [reference, setReference] = useState<ReferenceProps[]>([]);
  const [composing, setComposing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const fetchOptions = async (value: string) => {
    if (!value || !accessToken) return;
    const res: ITopic[] = await GET(`${API_ROOT}/topic/search?keyword=${value}&size=20&from=0`, accessToken);
    setReference(res.map(item => {
      return {
        label: item.title,
        id: item.id,
        replyCount: item.replyCount
      }
    }));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(debounce(fetchOptions, 10000, true), []); // 如果不加useCallback,每次页面初始化的时候都会初始化一个新的debouce函数,让依赖于闭包的防抖失效

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
          label="请输入参考帖子" 
          variant="outlined"
          className="elegant-input"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px'
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

export default function SummaryPage() {
  const [feedback, setFeedback] = useState<string>('');
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<ReferenceProps | null>(null);

  const clearFeedback = () => {
    setFeedback('');
  }

  const setFeedbackFunc = (feedback: string) => {
    setFeedback(feedback);
  }

  const Content = () => {
    const auth = useAuth();

    const getTopic = async(token: string, topicId?: number, replyCount?: number) => {
      if(!topicId || !replyCount)  return '';
  
      let text = '';
      const PageSize = 10;
      const topicArr: (() => Promise<IPost[]>)[] = [];
      for(let i=0; i<Math.ceil(replyCount/PageSize); i++) {
        topicArr.push(async () => {
          const data = await GET<IPost[]>(`${API_ROOT}/Topic/${topicId}/post?from=${i*PageSize}&size=${PageSize}`,token);
          return data;
        })
      }
      const topicData = await requestQueue<IPost[]>(topicArr);
      topicData.forEach((post:IPost[]) => {
        text += post.map(item => item.userName + ':' + securityFilter(item.content)).join('\n\n') + '\n\n';
      })
  
      return text;
    }
  
    const generateQuestion = (topicContent: string, question: string) => {
      return `请根据给出的知识库回答对应的问题: 知识库${topicContent},问题: ${question}`
    }
  
    const handleSubmit = async () => {
      if(getCurrentCount() >= MAX_CALL_PER_USER) {
        setFeedback("今日测试次数已用完,请明日再试");
        return;
      }
      
      if(!selectedTopic) {
        setFeedback("请先选择一个参考帖子");
        return;
      }
      
      if(!question.trim()) {
        setFeedback("请输入问题");
        return;
      }
      
      setLoading(true);
      const topicContent = await getTopic(auth.user?.access_token!, selectedTopic?.id, selectedTopic?.replyCount);
      const res = await POST<ISummaryRequest, IGeneralResponse>("/api/summary", {
        text: generateQuestion(topicContent, question),
      });
      if (res.isOk) {
        setSummary(res.data);
        increaseCurrentCount();
      } else {
        setFeedback(res.msg);
      }
      setLoading(false);
    };
  
    if (!auth.isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="elegant-card p-8 text-center">
            <p className="mb-4">请先登录以使用文档总结功能</p>
            <Link href="/" className="elegant-button">返回登录</Link>
          </div>
        </div>
      )
    }
  
    return (
      <div className="min-h-screen p-4 md:p-8">
        {feedback && <Alert severity="error" onClose={clearFeedback} className="mb-4">{feedback}</Alert>}
        <div className="elegant-card mb-6">
          <div className="elegant-header">
            <Link href="/" className="text-2xl font-medium">CC98 Hub</Link>
            <div className="flex space-x-4">
              <Link href="/mbti" className="elegant-button">MBTI测试</Link>
              <Link href="/summary" className="elegant-button">文档总结</Link>
            </div>
          </div>
          
          <div className="p-8">
            <h2 className="text-2xl font-light mb-6 text-center">文档总结</h2>
            
            <div className="space-y-6 max-w-3xl mx-auto">
              <div>
                <p className="text-gray-500 mb-3">选择参考帖子</p>
                <Reference 
                  setSelectedTopic={setSelectedTopic} 
                  accessToken={auth.user?.access_token}
                />
              </div>
              
              <div>
                <p className="text-gray-500 mb-3">输入您的问题</p>
                <div className="relative">
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="请输入您想了解的内容..."
                    className="elegant-input"
                  />
                </div>
              </div>
              
              <div className="flex justify-center">
                <button 
                  onClick={handleSubmit}
                  className="elegant-button min-w-[120px]"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "生成总结"}
                </button>
              </div>
            </div>
            
            {summary && (
              <div className="elegant-card p-6 mt-8 max-w-3xl mx-auto">
                <h3 className="text-lg font-medium mb-4">总结结果</h3>
                <div className="text-gray-700 whitespace-pre-line">
                  {summary}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider {...OIDC_CONFIG}>
      <FeedbackContext.Provider value={{ feedback, setFeedback: setFeedbackFunc }}>
        <Content />
      </FeedbackContext.Provider>
    </AuthProvider>
  );
} 