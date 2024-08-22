"use client"
import { useState, useContext } from "react"
import LoadingButton from "@mui/lab/LoadingButton";
import { Paper } from "@mui/material"
import { FeedbackContext } from "@/store/feedBackContext"
import { POST } from "@/request"
import { IGeneralResponse, IMBTIRequest } from "@request/api"

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

  const setFeedback = feedbackContext?.setFeedback;

  const handleClick = async () => {
    setLoading(true);
    const res = await handleMBTI('你好,现在是什么时候?');
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