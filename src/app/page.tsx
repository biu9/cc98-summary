"use client";
import { TabContext, TabList, TabPanel } from "@mui/lab"
import { Tabs, Tab, Box } from "@mui/material"
import { useState } from "react"
import MBTI from "@/components/mbti";
import Summary from "@/components/summary";

export default function Home() {

  const [value, setValue] = useState("1")

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  return (
    <div className="py-10">
      <TabContext value={value}>
        <Box className="px-6" sx={{ borderBottom: 1, borderColor: 'divider', display: "flex", alignItems: 'center' }}>
          <div className="text-2xl mr-8">CC98 Agent</div>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="mbti测试" value="1" />
            <Tab label="文档总结" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1"><MBTI /></TabPanel>
        <TabPanel value="2"><Summary /></TabPanel>
      </TabContext>
    </div>
  )
}