"use client";
import { Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { getCurrentCount } from "@/utils/limitation";
import UnauthenticatedApp from "@/components/UnauthenticatedApp";
import AuthenticatedApp from "@/components/AuthenticatedApp";
import { useFeedback } from "@/store/globalStore";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [currCount, setCurrCount] = useState(0);

  useEffect(() => {
    const count = getCurrentCount();
    setCurrCount(count);
  },[])

  return (
    <Content showModal={showModal} setShowModal={setShowModal} currCount={currCount} />
  )
}

const Content = ({ showModal, setShowModal, currCount }: { 
  showModal: boolean, 
  setShowModal: (show: boolean) => void,
  currCount: number
}) => {
  const { feedback, clearFeedback } = useFeedback();

  return (
    <>
      {feedback && <Alert severity="error" onClose={clearFeedback} className="m-4">{feedback}</Alert>}
      <App showModal={showModal} setShowModal={setShowModal} currCount={currCount} />
    </>
  )
}

const App = ({ showModal, setShowModal, currCount }: { 
  showModal: boolean, 
  setShowModal: (show: boolean) => void,
  currCount: number
}) => {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <p className="text-gray-600">登录处理中…</p>
      </div>
    );
  }

  if (auth.error) {
    return (
      <>
        <Alert severity="error" className="m-4">
          登录失败：{auth.error.message}
        </Alert>
        <UnauthenticatedApp />
      </>
    );
  }

  if (auth.isAuthenticated) {
    return <AuthenticatedApp showModal={showModal} setShowModal={setShowModal} currCount={currCount} />;
  }
  return <UnauthenticatedApp />;
};