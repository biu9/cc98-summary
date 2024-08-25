"use client"
import { useState, useContext, useEffect } from "react"
import LoadingButton from "@mui/lab/LoadingButton";
import { Paper } from "@mui/material"
import { FeedbackContext } from "@/store/feedBackContext"
import { GET, POST } from "@/request"
import { IGeneralResponse, IMBTIRequest } from "@request/api"
import { useAuth } from "react-oidc-context";
import { getTopicContent } from "@/utils/getTopicContent";
import { IUser } from "@cc98/api";
import { API_ROOT } from "../../../config";

const handleMBTI = async (text: string): Promise<IGeneralResponse> => {
  const res = await POST<IMBTIRequest, IGeneralResponse>('/api/mbti', {
    text
  });
  return res;
}

export default function MBTI() {
  const feedbackContext = useContext(FeedbackContext);
  const [mbti, setMBTI] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<IUser>();

  const setFeedback = feedbackContext?.setFeedback;
  const auth = useAuth();

  useEffect(() => {
    (async () => {
      if(auth.user?.access_token) {
        const profile = await GET<IUser>(`${API_ROOT}/me?sf_request_type=fetch`,auth.user?.access_token);
        setProfile(profile);
        console.log(profile);
      }
    })();
  }, [auth.user?.access_token]);

  const handleClick = async () => {
    setLoading(true);
    if(!auth.user?.access_token) {
      setFeedback && setFeedback("access_token is not defined");
      return;
    }
    const topicContent = await getTopicContent(auth.user?.access_token);
    const res = await handleMBTI(`请根据给出的用户发帖总结该用户的mbti，并给出对应的解释: ${topicContent}`);
    if (res.isOk) {
      setMBTI(res.data);
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
      <div>xxx的测试结果:</div>
      <div className="py-4">{mbti}</div>
      <div>
        <LoadingButton variant="contained" loading={loading} onClick={handleClick}>生成海报</LoadingButton>
        <LoadingButton loading={loading} onClick={handleClick}>重新测试</LoadingButton>
      </div>
    </Paper>
  )
}