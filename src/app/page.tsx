"use client";
import { Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "react-oidc-context";
import { OIDC_CONFIG } from "../../config";
import { FeedbackContext } from "@/store/feedBackContext";
import { UserInfoProvider } from "@/store/userInfoContext";
import { getCurrentCount } from "@/utils/limitation";
import UnauthenticatedApp from "@/components/UnauthenticatedApp";
import AuthenticatedApp from "@/components/AuthenticatedApp";

export default function Home() {
  const [feedback, setFeedback] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
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
      <UserInfoProvider>
        <FeedbackContext.Provider value={{ feedback: '', setFeedback: setFeedbackFunc }}>
        {
          feedback && <Alert severity="error" onClose={clearFeedback} className="m-4">{feedback}</Alert>
        }
        <App showModal={showModal} setShowModal={setShowModal} currCount={currCount} />
        </FeedbackContext.Provider>
      </UserInfoProvider>
    </AuthProvider>
  )
}

const App = ({ showModal, setShowModal, currCount }: { 
  showModal: boolean, 
  setShowModal: (show: boolean) => void,
  currCount: number
}) => {
  const auth = useAuth()

  // if(process.env.NODE_ENV === "development") {
  //   return <AuthenticatedApp showModal={showModal} setShowModal={setShowModal} currCount={currCount} />
  // }

  if(auth.isAuthenticated) {
    return <AuthenticatedApp showModal={showModal} setShowModal={setShowModal} currCount={currCount} />
  }
  return <UnauthenticatedApp />
}