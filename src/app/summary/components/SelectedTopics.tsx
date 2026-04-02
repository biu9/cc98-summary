"use client";

import { useState } from "react";
import { ExpandLessRounded, ExpandMoreRounded } from "@mui/icons-material";
import { IKnowledgeBase, IReferenceProps } from "../types";

interface SelectedTopicsProps {
  selectedTopics: IReferenceProps[];
  onRemoveTopic: (topicId: number) => void;
  selectedKnowledgeBase?: IKnowledgeBase | null;
}

const DISPLAY_LIMIT = 8;

export default function SelectedTopics({
  selectedTopics,
  onRemoveTopic,
  selectedKnowledgeBase,
}: SelectedTopicsProps) {
  const [expanded, setExpanded] = useState(false);

  if (selectedTopics.length === 0) {
    return null;
  }

  const displayTopics = expanded
    ? selectedTopics
    : selectedTopics.slice(0, DISPLAY_LIMIT);
  const hasMore = selectedTopics.length > DISPLAY_LIMIT;

  return (
    <div className="mb-4 rounded-[12px] border border-black/5 bg-white/80 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {selectedKnowledgeBase
              ? `当前知识库：${selectedKnowledgeBase.name}`
              : "当前参考帖子"}
          </div>
          <p className="mt-1 text-xs leading-6 text-slate-500">
            已选择 {selectedTopics.length} 个帖子作为当前回答上下文。
          </p>
        </div>
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="pill text-xs"
          >
            {expanded ? (
              <>
                <ExpandLessRounded className="text-[1rem]" />
                收起
              </>
            ) : (
              <>
                <ExpandMoreRounded className="text-[1rem]" />
                展开全部
              </>
            )}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {displayTopics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => onRemoveTopic(topic.id)}
            className="inline-flex max-w-full items-center gap-2 rounded-[8px] border border-black/10 bg-black/[0.03] px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:border-black/15 hover:bg-black/[0.05] hover:text-slate-900"
            title="点击移除此帖子"
          >
            <span className="line-clamp-1 max-w-[220px]">{topic.label}</span>
            <span className="mono text-[10px] opacity-70">{topic.replyCount}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

