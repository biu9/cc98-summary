"use client"
import { useState, useContext, useEffect, useMemo, useCallback } from "react"
import LoadingButton from "@mui/lab/LoadingButton";
import { Paper, Alert } from "@mui/material"
import { FeedbackContext } from "@/store/feedBackContext"
import { useUserInfo } from "@/store/userInfoContext"
import { GET, POST } from "@/request"
import { IGeneralResponse, IMBTIRequest, IMBTIResponse } from "@request/api"
import { useAuth } from "react-oidc-context";
import { getTopicContent } from "@/utils/getTopicContent";
import { IUser } from "@cc98/api";
import { API_ROOT, MAX_CALL_PER_USER, OIDC_CONFIG } from "../../../config";
import { MBTIResultCard } from "@/components/mbti-result-card";
import { increaseCurrentCount, getCurrentCount } from "@/utils/limitation";
import Link from "next/link";
import { AuthProvider } from "react-oidc-context";

const handleMBTI = async (text: string, username: string): Promise<IGeneralResponse> => {
  const res = await POST<IMBTIRequest, IGeneralResponse>('/api/mbti', {
    text,
    username
  });
  return res;
} 

export default function MBTIPage() {
  const [feedback, setFeedback] = useState<string>('');
  const [mbti, setMBTI] = useState<IMBTIResponse | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const clearFeedback = () => {
    setFeedback('');
  }

  const setFeedbackFunc = (feedback: string) => {
    setFeedback(feedback);
  }

  const Content = () => {
    const auth = useAuth();
    const { userInfo, loading: userInfoLoading, error: userInfoError } = useUserInfo();
    
    // 使用useMemo来稳定access_token的引用
    const accessToken = useMemo(() => auth.user?.access_token, [auth.user?.access_token]);
    
    // 监听userInfo错误
    useEffect(() => {
      if (userInfoError) {
        setFeedback(userInfoError);
      }
    }, [userInfoError]);
  
    const handleClick = async () => {
      if(getCurrentCount() >= MAX_CALL_PER_USER) {
        setFeedback("今日测试次数已用完,请明日再试");
        return;
      }
      setLoading(true);
      if(!accessToken) {
        setFeedback("access_token is not defined");
        return;
      }
      if(!userInfo) {
        setFeedback("用户信息未加载完成，请稍后再试");
        setLoading(false);
        return;
      }
      
      try {
        const topicContent = await getTopicContent(accessToken);
        const res = await handleMBTI(`topic: ${topicContent}`, userInfo.name || '');
        if (res.isOk) {
          setMBTI(res.data);
          increaseCurrentCount();
        } else {
          setFeedback(res.msg);
        }
      } catch (error) {
        console.error('MBTI test error:', error);
        setFeedback("测试过程中发生错误，请重试");
      }
      setLoading(false);
    }
  
    if (!auth.isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="elegant-card p-8 text-center">
            <p className="mb-4">请先登录以使用MBTI测试功能</p>
            <Link href="/" className="elegant-button">返回登录</Link>
          </div>
        </div>
      )
    }

    // 如果用户信息正在加载中
    if (userInfoLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="elegant-card p-8 text-center">
            <p className="mb-4">正在加载用户信息...</p>
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
            <h2 className="text-2xl font-light mb-6 text-center">MBTI人格测试</h2>
            
            {!mbti ? (
              <div className="text-center p-6">
                <p className="text-gray-500 mb-8">
                  点击下方按钮，系统将基于您的发帖记录分析您的MBTI人格类型
                </p>
                <LoadingButton 
                  loading={loading} 
                  onClick={handleClick}
                  className="elegant-button"
                  disabled={!userInfo}
                >
                  开始测试
                </LoadingButton>
              </div>
            ) : (
              <div className="py-4">
                <div className="mb-8">
                  <MBTIResultCard results={mbti} userName={userInfo?.name} />
                </div>
                <div className="flex justify-center gap-4">
                  <LoadingButton 
                    loading={loading} 
                    onClick={handleClick}
                    className="elegant-button"
                    disabled={!userInfo}
                  >
                    重新测试
                  </LoadingButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider {...OIDC_CONFIG}>
      <FeedbackContext.Provider value={{ feedback, setFeedback: setFeedbackFunc }}>
        <Content />
      </FeedbackContext.Provider>
    </AuthProvider>
  )
} 