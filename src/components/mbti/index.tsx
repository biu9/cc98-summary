"use client"
import { useState, useContext, useEffect } from "react"
import LoadingButton from "@mui/lab/LoadingButton";
import { Paper } from "@mui/material"
import { FeedbackContext } from "@/store/feedBackContext"
import { GET, POST } from "@/request"
import { IGeneralResponse, IMBTIRequest, IMBTIResponse } from "@request/api"
import { useAuth } from "react-oidc-context";
import { getTopicContent } from "@/utils/getTopicContent";
import { IUser } from "@cc98/api";
import { API_ROOT, MAX_CALL_PER_USER } from "../../../config";
import { MBTIResultCard } from "../mbti-result-card";
import { increaseCurrentCount, getCurrentCount } from "@/utils/limitation";

const handleMBTI = async (text: string, username: string): Promise<IGeneralResponse> => {
  const res = await POST<IMBTIRequest, IGeneralResponse>('/api/mbti', {
    text,
    username
  });
  return res;
} 

export default function MBTI() {
  const feedbackContext = useContext(FeedbackContext);
  const [mbti, setMBTI] = useState<IMBTIResponse | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<IUser>();

  const setFeedback = feedbackContext?.setFeedback;
  const auth = useAuth();

  useEffect(() => {
    (async () => {
      if(auth.user?.access_token) {
        const profile = await GET<IUser>(`${API_ROOT}/me?sf_request_type=fetch`,auth.user?.access_token);
        setProfile(profile);
      }
    })();
  }, [auth.user?.access_token]);

  const handleClick = async () => {
    if(getCurrentCount() >= MAX_CALL_PER_USER) {
      setFeedback && setFeedback("今日测试次数已用完,请明日再试");
    }
    setLoading(true);
    if(!auth.user?.access_token) {
      setFeedback && setFeedback("access_token is not defined");
      return;
    }
    const topicContent = await getTopicContent(auth.user?.access_token);
    const res = await handleMBTI(`topic: ${topicContent}`, profile?.name || ''); // FIXME
    if (res.isOk) {
      setMBTI(res.data);
      increaseCurrentCount();
    } else {
      setFeedback && setFeedback(res.msg);
    }
    setLoading(false);
  }

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