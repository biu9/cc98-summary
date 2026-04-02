"use client";

import { useState } from "react";
import { ExpandLessRounded, ExpandMoreRounded, PersonRounded, SmartToyRounded } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { IChatMessage } from "../types";

interface ChatBubbleProps {
  message: IChatMessage;
}

const TOPICS_DISPLAY_LIMIT = 5;

export default function ChatBubble({ message }: ChatBubbleProps) {
  const [topicsExpanded, setTopicsExpanded] = useState(false);
  const isUser = message.type === "user";
  const isSystem = message.type === "system";
  const hasTopics =
    Array.isArray(message.topicTitles) && message.topicTitles.length > 0;
  const hasMoreTopics =
    hasTopics && message.topicTitles!.length > TOPICS_DISPLAY_LIMIT;
  const displayTopics = topicsExpanded
    ? message.topicTitles
    : message.topicTitles?.slice(0, TOPICS_DISPLAY_LIMIT);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} chat-bubble`}>
      <div
        className={`flex max-w-[88%] items-start gap-3 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] ${
            isUser
              ? "bg-[#111111] text-white"
              : isSystem
                ? "bg-[#52525b] text-white"
                : "bg-[#111111] text-white"
          }`}
        >
          {isUser ? (
            <PersonRounded className="text-[1.1rem]" />
          ) : (
            <SmartToyRounded className="text-[1.1rem]" />
          )}
        </div>

        <div
          className={`rounded-[12px] px-5 py-4 ${
            isUser
              ? "message-bubble-user text-white"
              : isSystem
                ? "message-bubble-system text-white"
                : "message-bubble-bot text-slate-800"
          }`}
        >
          {hasTopics && (
            <div className="mb-3 rounded-[10px] bg-black/10 px-3 py-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>参考帖子</span>
                {hasMoreTopics && (
                  <button
                    type="button"
                    onClick={() => setTopicsExpanded((value) => !value)}
                    className="inline-flex items-center gap-1 rounded-[8px] border border-white/15 px-2 py-1 text-[11px] transition hover:bg-white/10"
                  >
                    {topicsExpanded ? (
                      <>
                        <ExpandLessRounded className="text-[0.9rem]" />
                        收起
                      </>
                    ) : (
                      <>
                        <ExpandMoreRounded className="text-[0.9rem]" />
                        全部
                      </>
                    )}
                  </button>
                )}
              </div>

              <ul className="mt-2 space-y-1">
                {displayTopics?.map((title, index) => (
                  <li key={`${title}-${index}`} className="leading-6 opacity-90">
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            className={`prose prose-sm max-w-none text-sm leading-7 ${
              isUser || isSystem ? "prose-invert" : "prose-slate"
            }`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          <div className="mt-3 text-xs opacity-70">
            {message.timestamp.toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

