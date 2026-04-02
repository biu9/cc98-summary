"use client";

import { CircularProgress } from "@mui/material";
import { AutoAwesomeRounded, SmartToyRounded } from "@mui/icons-material";

interface ChatHeaderProps {
  knowledgeBaseName: string | null;
  topicCount: number;
  loading: boolean;
}

export default function ChatHeader({
  knowledgeBaseName,
  topicCount,
  loading,
}: ChatHeaderProps) {
  return (
    <div className="chat-header px-5 py-5 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-white/10 text-white">
            <SmartToyRounded />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              收藏帖子问答
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {knowledgeBaseName
                ? `当前知识库：${knowledgeBaseName}`
                : "先选一个收藏分组"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-[8px] border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            已选帖子 {topicCount}
          </div>
          <div className="rounded-[8px] border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <CircularProgress size={14} sx={{ color: "white" }} />
                生成中
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <AutoAwesomeRounded className="text-[1rem]" />
                可提问
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

