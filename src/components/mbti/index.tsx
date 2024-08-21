"use client"
import { useState, useContext } from "react"
import { Button, Paper } from "@mui/material"
import { handleMBTI } from "@/utils/handleMBTI"
import { FeedbackContext } from "@/app/page"

export default function MBTI() {
  const feedbackContext = useContext(FeedbackContext);
  const setFeedback = feedbackContext?.setFeedback;
  const [mbti, setMBTI] = useState("");

  const handleClick = async () => {
    const res = await handleMBTI(mbti);
    if(res.isOk) {
      setMBTI(res.data);
    } else {
      setFeedback && setFeedback(res.msg);
    }
  }

  if(!mbti) {
    return (
      <Paper sx={{ display: 'inline-block' }}>
        <Button onClick={handleClick}>开始测试</Button>
      </Paper>
    )
  }

  return (
    <Paper sx={{ padding: 4 }}>
      <div>xxx的测试结果:</div>
      <div>{mbti}</div>
      <div>
        <Button variant="contained">生成海报</Button>
        <Button >重新测试</Button>
      </div>
    </Paper>
  )
}