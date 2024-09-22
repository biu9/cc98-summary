"use client";
import { TabContext, TabList, TabPanel } from "@mui/lab"
import { Tab, Box, Button, Alert, Modal } from "@mui/material"
import { useEffect, useState } from "react"
import MBTI from "@/components/mbti";
import Summary from "@/components/summary";
import { AuthProvider, useAuth } from "react-oidc-context";
import { OIDC_CONFIG, MAX_CALL_PER_USER } from "../../config";
import { FeedbackContext } from "@/store/feedBackContext";
import { getCurrentCount } from "@/utils/limitation";

const UnauthenticatedApp = () => {
  const auth = useAuth()

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div>未登录, </div>
      <Button onClick={() => auth.signinRedirect()}>点击跳转cc98登录中心授权</Button>
    </div>
  )
}

export default function Home() {

  const [feedback, setFeedback] = useState<string>('');

  const setFeedbackFunc = (feedback: string) => {
    setFeedback(feedback);
  }

  const clearFeedback = () => {
    setFeedback('');
  }

  return (
    <AuthProvider {...OIDC_CONFIG}>
      <FeedbackContext.Provider value={{ feedback: '', setFeedback: setFeedbackFunc }}>
      {
        feedback && <Alert severity="error" onClose={clearFeedback}>{feedback}</Alert>
      }
      <App />
      </FeedbackContext.Provider>
    </AuthProvider>
  )
}

const App = () => {
  const auth = useAuth()

  if(auth.isAuthenticated) {
    return <AuthenticatedApp />
  }
  return <UnauthenticatedApp />
}

const AuthenticatedApp = () => {

  const [value, setValue] = useState("1");
  const [showModal, setShowModal] = useState(true);
  const [currCount, setCurrCount] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue)
  };

  useEffect(() => {
    const count = getCurrentCount();
    setCurrCount(count);
  },[])

  return (
    <div className="py-10">
      <TabContext value={value}>
        <Box className="px-6" sx={{ borderBottom: 1, borderColor: 'divider', display: "flex", alignItems: 'center' }}>
          <div className="text-2xl mr-8">CC98 Agent</div>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="mbti测试" value="1" />
            <Tab label="文档总结" value="2" />
          </TabList>
          <Modal
            open={showModal}
            onClose={(e) => setShowModal(false)}
          >
            <div
              className="bg-white w-96 h-96 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 border-none outline-none rounded-lg"
            >
              <div className="font-bold text-3xl">使用前须知</div>
              <div>由于目前使用的是白嫖的Gemini 1.5模型,每分钟最多发起15次请求,一天最多发起1500次请求,所以目前做了单用户单日限次处理</div>
              <br />
              <div>当前限制每个用户每日最多总结mbti 或 调用帖子总结次数: {MAX_CALL_PER_USER}; 您今日已调用次数: {currCount}</div>
            </div>
          </Modal>
        </Box>
        <TabPanel value="1"><MBTI /></TabPanel>
        <TabPanel value="2"><Summary /></TabPanel>
      </TabContext>
    </div>
  )
}