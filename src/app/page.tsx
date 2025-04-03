"use client";
import { Button, Alert, Modal } from "@mui/material"
import { useEffect, useState } from "react"
import { AuthProvider, useAuth } from "react-oidc-context";
import { OIDC_CONFIG, MAX_CALL_PER_USER } from "../../config";
import { FeedbackContext } from "@/store/feedBackContext";
import { getCurrentCount } from "@/utils/limitation";
import Link from "next/link";

const UnauthenticatedApp = () => {
  const auth = useAuth()
  const today = new Date()
  const day = today.getDate()
  const suffix = getSuffix(day)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const month = monthNames[today.getMonth()]
  
  function getSuffix(day: number) {
    if (day > 3 && day < 21) return 'th'
    switch (day % 10) {
      case 1: return "st"
      case 2: return "nd"
      case 3: return "rd"
      default: return "th"
    }
  }

  return (
    <div className="min-h-screen p-8 flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full">
        {/* 登录卡片 */}
        <div className="elegant-card p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-medium mb-1">CC98 Hub</h1>
            <h2 className="text-lg text-gray-400 font-light">登录</h2>
          </div>
          
          <div className="space-y-6 mb-8">
            <button className="flex items-center justify-center w-full rounded-full bg-blue-50 py-3 text-blue-600 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
              </svg>
              CC98授权登录
            </button>
            
            <div className="relative">
              <input 
                type="email" 
                placeholder="电子邮箱" 
                className="elegant-input"
                disabled
              />
            </div>
            
            <div className="relative">
              <input 
                type="password" 
                placeholder="密码" 
                className="elegant-input"
                disabled
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">忘记密码?</span>
            </div>
          </div>
          
          <button 
            onClick={() => auth.signinRedirect()}
            className="elegant-button w-full"
          >
            登录
          </button>
          
          <p className="text-xs text-gray-400 mt-6">
            登录即表示您同意我们的使用条款和隐私政策。
          </p>
        </div>
        
        {/* 活动卡片 */}
        <div className="elegant-card flex flex-col">
          <div className="p-5 flex justify-between items-center">
            <span className="text-sm text-gray-400">功能预览</span>
            <span className="text-sm text-gray-400">CC98 Hub</span>
          </div>
          
          <div className="flex-1 event-card flex flex-col justify-between">
            <div>
              <div className="date-display">{month}</div>
              <div className="flex items-end">
                <span className="date-display">{day}</span>
                <span className="date-suffix">{suffix}</span>
              </div>
              <div className="mt-4 text-gray-500">登录后即可体验以下功能</div>
            </div>
            
            <div className="space-y-4 mt-8">
              <div className="flex justify-between items-center">
                <span>MBTI测试</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex justify-between items-center">
                <span>文档总结</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [feedback, setFeedback] = useState<string>('');
  const [showModal, setShowModal] = useState(true);
  const [currCount, setCurrCount] = useState(0);

  const setFeedbackFunc = (feedback: string) => {
    setFeedback(feedback);
  }

  const clearFeedback = () => {
    setFeedback('');
  }

  useEffect(() => {
    const count = getCurrentCount();
    setCurrCount(count);
  },[])

  return (
    <AuthProvider {...OIDC_CONFIG}>
      <FeedbackContext.Provider value={{ feedback: '', setFeedback: setFeedbackFunc }}>
      {
        feedback && <Alert severity="error" onClose={clearFeedback} className="m-4">{feedback}</Alert>
      }
      <App showModal={showModal} setShowModal={setShowModal} currCount={currCount} />
      </FeedbackContext.Provider>
    </AuthProvider>
  )
}

const App = ({ showModal, setShowModal, currCount }: { 
  showModal: boolean, 
  setShowModal: (show: boolean) => void,
  currCount: number
}) => {
  const auth = useAuth()

  if(auth.isAuthenticated) {
    return <AuthenticatedApp showModal={showModal} setShowModal={setShowModal} currCount={currCount} />
  }
  return <UnauthenticatedApp />
}

const AuthenticatedApp = ({ showModal, setShowModal, currCount }: { 
  showModal: boolean, 
  setShowModal: (show: boolean) => void,
  currCount: number
}) => {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="elegant-card mb-6">
        <div className="elegant-header">
          <h1 className="text-2xl font-medium">CC98 Hub</h1>
          <div className="flex space-x-4">
            <Link href="/mbti" className="elegant-button">MBTI测试</Link>
            <Link href="/summary" className="elegant-button">文档总结</Link>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <h2 className="text-2xl font-light mb-4">欢迎使用CC98 Hub</h2>
          <p className="text-gray-500 mb-6">请选择上方功能开始使用</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link href="/mbti" className="elegant-card p-6 hover:shadow-lg transform hover:-translate-y-1 transition duration-300">
              <h3 className="text-xl mb-2">MBTI测试</h3>
              <p className="text-gray-500 text-sm">基于您的发帖记录分析您的MBTI人格类型</p>
            </Link>
            
            <Link href="/summary" className="elegant-card p-6 hover:shadow-lg transform hover:-translate-y-1 transition duration-300">
              <h3 className="text-xl mb-2">文档总结</h3>
              <p className="text-gray-500 text-sm">对论坛帖子内容进行智能总结和问答</p>
            </Link>
          </div>
        </div>
      </div>
      
      <Modal
        open={showModal}
        onClose={(e) => setShowModal(false)}
      >
        <div className="elegant-card w-11/12 md:w-[450px] absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6">
          <h2 className="text-2xl font-bold mb-4">使用前须知</h2>
          <p className="mb-4">由于目前使用的是白嫖的Gemini 1.5模型，每分钟最多发起15次请求，一天最多发起1500次请求，所以目前做了单用户单日限次处理。</p>
          <p className="font-medium">当前限制：<span className="text-blue-600">每个用户每日最多调用次数: {MAX_CALL_PER_USER}</span></p>
          <p className="font-medium mt-2">您今日已调用次数: <span className="text-blue-600">{currCount}</span></p>
          <button 
            className="elegant-button w-full mt-6"
            onClick={() => setShowModal(false)}
          >
            我已了解
          </button>
        </div>
      </Modal>
    </div>
  )
}