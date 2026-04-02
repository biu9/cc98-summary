"use client";

import { CircularProgress } from "@mui/material";
import { SmartToyRounded } from "@mui/icons-material";

export default function LoadingIndicator() {
  return (
    <div className="flex justify-start chat-bubble">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-[#0f172a] text-white">
          <SmartToyRounded className="text-[1.1rem]" />
        </div>
        <div className="message-bubble-bot rounded-[12px] px-4 py-3 typing-indicator">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CircularProgress size={16} />
            <span className="loading-dots">正在整理回答</span>
          </div>
        </div>
      </div>
    </div>
  );
}

