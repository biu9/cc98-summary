"use client";

import { Alert } from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import AuthenticatedApp from "@/components/AuthenticatedApp";
import { CsrPageFallback } from "@/components/CsrPageFallback";
import UnauthenticatedApp from "@/components/UnauthenticatedApp";
import { useFeedback, useUserInfo } from "@/store/globalStore";
import { getCurrentCount } from "@/utils/limitation";

function HomePage() {
  const auth = useAuth();
  const { feedback, clearFeedback, setFeedback } = useFeedback();
  const {
    userInfo,
    loading: userInfoLoading,
    error: userInfoError,
    fetchUserInfo,
    clearUserInfo,
  } = useUserInfo();
  const [currCount, setCurrCount] = useState(0);
  const accessToken = auth.user?.access_token;

  useEffect(() => {
    setCurrCount(getCurrentCount());
  }, []);

  useEffect(() => {
    // Fetch CC98 /me as soon as sign-in completes.
    if (
      auth.isAuthenticated &&
      accessToken &&
      !userInfo &&
      !userInfoLoading &&
      !userInfoError
    ) {
      void fetchUserInfo(accessToken);
    }
  }, [
    accessToken,
    auth.isAuthenticated,
    fetchUserInfo,
    userInfo,
    userInfoError,
    userInfoLoading,
  ]);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      clearUserInfo();
    }
  }, [auth.isAuthenticated, clearUserInfo]);

  useEffect(() => {
    if (userInfoError) {
      setFeedback(userInfoError);
    }
  }, [setFeedback, userInfoError]);

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <div className="w-full rounded-[14px] border border-black/10 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              CC98 Agent
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              正在确认登录状态
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              完成后会自动同步你的用户资料。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {(feedback || auth.error) && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex max-w-3xl flex-col gap-3 px-4">
          {feedback && (
            <Alert
              severity="error"
              onClose={clearFeedback}
              className="pointer-events-auto"
            >
              {feedback}
            </Alert>
          )}
          {auth.error && (
            <Alert severity="error" className="pointer-events-auto">
              {"\u767b\u5f55\u5931\u8d25\uff1a"}
              {auth.error.message}
            </Alert>
          )}
        </div>
      )}

      {auth.isAuthenticated ? (
        <AuthenticatedApp
          currCount={currCount}
          userInfo={userInfo}
          userInfoLoading={userInfoLoading}
        />
      ) : (
        <UnauthenticatedApp />
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(HomePage), {
  ssr: false,
  loading: () => (
    <CsrPageFallback current="home" title="正在加载首页" />
  ),
});

