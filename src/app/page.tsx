"use client";
import { TabContext, TabList, TabPanel } from "@mui/lab"
import { Tab, Box, Button, Alert } from "@mui/material"
import { useState, useEffect, useContext, createContext } from "react"
import MBTI from "@/components/mbti";
import Summary from "@/components/summary";
import { AuthProvider, useAuth, AuthContextProps } from "react-oidc-context";
import { OIDC_CONFIG } from "../../config";
import { FeedbackContext } from "@/store/feedBackContext";

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

  return <AuthenticatedApp />

  if(auth.isAuthenticated) {
    return <AuthenticatedApp />
  }
  return <UnauthenticatedApp />
}

const AuthenticatedApp = () => {

  const [value, setValue] = useState("1")

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  return (
    <div className="py-10">
      <TabContext value={value}>
        <Box className="px-6" sx={{ borderBottom: 1, borderColor: 'divider', display: "flex", alignItems: 'center' }}>
          <div className="text-2xl mr-8">CC98 Agent</div>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="mbti测试" value="1" />
            <Tab label="文档总结" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1"><MBTI /></TabPanel>
        <TabPanel value="2"><Summary /></TabPanel>
      </TabContext>
    </div>
  )
}