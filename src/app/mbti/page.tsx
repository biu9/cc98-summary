"use client"
import { useEffect, useMemo } from "react"
import LoadingButton from "@mui/lab/LoadingButton";
import { Alert } from "@mui/material"
import { useAuth } from "react-oidc-context";
import { MBTIResultCard } from "@/components/mbti-result-card";
import Link from "next/link";
import { AuthProvider } from "react-oidc-context";
import { OIDC_CONFIG } from "../../../config";
import { useFeedback, useUserInfo } from "@/store/globalStore";
import { useMBTIStore } from "@/store/mbtiStore";

export default function MBTIPage() {
  const Content = () => {
    const auth = useAuth();
    const { feedback, setFeedback, clearFeedback } = useFeedback();
    const { userInfo, loading: userInfoLoading, error: userInfoError, fetchUserInfo } = useUserInfo();
    const { mbti, loading, handleMBTITest } = useMBTIStore();
    
    // 使用useMemo来稳定refresh_token的引用
    const refreshToken = useMemo(() => auth.user?.refresh_token, [auth.user?.refresh_token]);
    
    // 获取用户信息
    useEffect(() => {
      if (auth.isAuthenticated && refreshToken && !userInfo && !userInfoLoading) {
        fetchUserInfo(refreshToken);
      }
    }, [auth.isAuthenticated, refreshToken, userInfo, userInfoLoading, fetchUserInfo]);
    
    // 监听userInfo错误
    useEffect(() => {
      if (userInfoError) {
        setFeedback(userInfoError);
      }
    }, [userInfoError, setFeedback]);
  
    const handleClick = async () => {
      if (!refreshToken) {
        setFeedback("refresh_token is not defined");
        return;
      }
      if (!userInfo) {
        setFeedback("用户信息未加载完成，请稍后再试");
        return;
      }
      
      await handleMBTITest(refreshToken, setFeedback);
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
      <Content />
    </AuthProvider>
  )
} 