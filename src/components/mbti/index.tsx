"use client"
import { useState } from "react"
import { Button, Paper } from "@mui/material"
import { handleMBTI } from "@/utils/handleMBTI"

export default function MBTI() {
  
  const [mbti, setMBTI] = useState("");

  const handleClick = async () => {
    const res = await handleMBTI(mbti);
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