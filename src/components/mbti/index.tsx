"use client"
import { useEffect } from "react"
import LoadingButton from "@mui/lab/LoadingButton";
import { Paper } from "@mui/material"
import { useAuth } from "react-oidc-context";
import { MBTIResultCard } from "../mbti-result-card";
import { useMBTIStore } from "@/store/mbtiStore";
import { useFeedback } from "@/store/globalStore";

export default function MBTI() {
  const { setFeedback } = useFeedback();
  const { 
    mbti, 
    loading, 
    profile, 
    fetchProfile, 
    handleMBTITest 
  } = useMBTIStore();
  const auth = useAuth();

  // 获取用户资料（CC98 API 使用 access_token）
  useEffect(() => {
    if (auth.user?.access_token) {
      fetchProfile(auth.user.access_token);
    }
  }, [auth.user?.access_token, fetchProfile]);

  const handleClick = async () => {
    if (!auth.user?.access_token) {
      setFeedback("访问令牌无效，请重新登录后再试");
      return;
    }

    await handleMBTITest(auth.user.access_token, setFeedback);
  };

  if (!mbti) {
    return (
      <Paper sx={{ display: 'inline-block' }}>
        <LoadingButton loading={loading} onClick={handleClick}>开始测试</LoadingButton>
      </Paper>
    )
  }

  return (
    <Paper sx={{ padding: 4 }}>
      <div className="py-4">
        {<MBTIResultCard results={mbti} userName={profile?.name} />}
      </div>
      <div className="flex justify-center gap-4">
        {/* <LoadingButton variant="contained" loading={loading} onClick={handleClick}>生成海报</LoadingButton> */}
        <LoadingButton loading={loading} onClick={handleClick}>重新测试</LoadingButton>
      </div>
    </Paper>
  )
}