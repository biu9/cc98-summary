"use client"
import { useState, useContext, useEffect } from "react"
import LoadingButton from "@mui/lab/LoadingButton";
import { Divider, Paper } from "@mui/material"
import { FeedbackContext } from "@/store/feedBackContext"
import { GET, POST } from "@/request"
import { IGeneralResponse, IMBTIRequest, IMBTIResponse } from "@request/api"
import { useAuth } from "react-oidc-context";
import { getTopicContent } from "@/utils/getTopicContent";
import { IUser } from "@cc98/api";
import { API_ROOT } from "../../../config";

const handleMBTI = async (text: string, username: string): Promise<IGeneralResponse> => {
  const res = await POST<IMBTIRequest, IGeneralResponse>('/api/mbti', {
    text,
    username
  });
  return res;
} 

const MBTIRender = ({ mbti }: { mbti: IMBTIResponse }) => {
  
  const OneDimensionRender = ({ dimension }: {dimension: IMBTIResponse['first']}) => {
    return (
      <div>
        <div>{dimension.type}</div>
        <div>{dimension.explanation}</div>
      </div>
    )
  }

  const PotentialRender = ({ potential }:{ potential: IMBTIResponse['potential'] }) => {
    return (
      <div>
        <div>{potential.type}</div>
        <div>{potential.explanation}</div>
      </div>
    )
  }
  
  
  return (
    <div>
      <div>
        <OneDimensionRender dimension={mbti.first} />
        <OneDimensionRender dimension={mbti.second} />
        <OneDimensionRender dimension={mbti.third} />
        <OneDimensionRender dimension={mbti.fourth} />
        <PotentialRender potential={mbti.potential} />
      </div>
    </div>
  )
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
    setLoading(true);
    if(!auth.user?.access_token) {
      setFeedback && setFeedback("access_token is not defined");
      return;
    }
    const topicContent = await getTopicContent(auth.user?.access_token);
    const res = await handleMBTI(`topic: ${topicContent}`, profile?.name || ''); // FIXME
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
      <div>{profile?.name}的测试结果:</div>
      <div className="py-4">
        {mbti && <MBTIRender mbti={mbti} />}
      </div>
      <div>
        <LoadingButton variant="contained" loading={loading} onClick={handleClick}>生成海报</LoadingButton>
        <LoadingButton loading={loading} onClick={handleClick}>重新测试</LoadingButton>
      </div>
    </Paper>
  )
}