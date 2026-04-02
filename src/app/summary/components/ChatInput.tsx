"use client";

import { CircularProgress } from "@mui/material";
import { SendRounded } from "@mui/icons-material";
import { IReferenceProps } from "../types";

interface ChatInputProps {
  question: string;
  setQuestion: (question: string) => void;
  onSubmit: () => void;
  loading: boolean;
  selectedTopics: IReferenceProps[];
}

export default function ChatInput({
  question,
  setQuestion,
  onSubmit,
  loading,
  selectedTopics,
}: ChatInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  const isDisabled = loading || selectedTopics.length === 0 || !question.trim();

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end">
      <div className="flex-1">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={selectedTopics.length === 0}
          placeholder={
            selectedTopics.length > 0
              ? "输入你的问题，按 Enter 发送，Shift + Enter 换行..."
              : "请先选择一个知识库，再输入问题"
          }
          className="min-h-[120px] w-full resize-none rounded-[10px] border border-black/5 bg-white px-4 py-4 text-sm leading-7 text-slate-700 outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/5 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isDisabled}
        className="button-dark h-[52px] min-w-[144px] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <CircularProgress size={16} sx={{ color: "white" }} />
            发送中
          </>
        ) : (
          <>
            <SendRounded className="text-[1rem]" />
            发送问题
          </>
        )}
      </button>
    </div>
  );
}

