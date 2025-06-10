"use client";
import { Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "react-oidc-context";
import { OIDC_CONFIG } from "../../config";
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
    <AuthProvider {...OIDC_CONFIG}>
      <Content showModal={showModal} setShowModal={setShowModal} currCount={currCount} />
    </AuthProvider>
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
  const auth = useAuth()

  // if(process.env.NODE_ENV === "development") {
  //   return <AuthenticatedApp showModal={showModal} setShowModal={setShowModal} currCount={currCount} />
  // }

  if(auth.isAuthenticated) {
    return <AuthenticatedApp showModal={showModal} setShowModal={setShowModal} currCount={currCount} />
  }
  return <UnauthenticatedApp />
}