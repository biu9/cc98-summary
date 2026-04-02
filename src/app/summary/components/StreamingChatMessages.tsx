"use client";

import { forwardRef, useState } from "react";
import { ExpandLessRounded, ExpandMoreRounded, PersonRounded, SmartToyRounded } from "@mui/icons-material";
import { Message } from "ai";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import ChatBubble from "./ChatBubble";
import LoadingIndicator from "./LoadingIndicator";
import { IChatMessage } from "../types";

interface StreamingChatMessagesProps {
  messages: IChatMessage[];
  aiMessages: Message[];
  loading: boolean;
}

interface ExtendedMessage extends Message {
  topicTitles?: string[];
  knowledgeBaseName?: string;
}

function StreamingChatBubble({ message }: { message: Message }) {
  const [topicsExpanded, setTopicsExpanded] = useState(false);
  const isUser = message.role === "user";
  const extendedMessage = message as ExtendedMessage;
  const topicTitles = extendedMessage.topicTitles || [];
  const knowledgeBaseName = extendedMessage.knowledgeBaseName;
  const hasMoreTopics = topicTitles.length > 5;
  const displayTopics = topicsExpanded ? topicTitles : topicTitles.slice(0, 5);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} chat-bubble`}>
      <div
        className={`flex max-w-[88%] items-start gap-3 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] ${
            isUser ? "bg-[#111111] text-white" : "bg-[#111111] text-white"
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
            isUser ? "message-bubble-user text-white" : "message-bubble-bot text-slate-800"
          }`}
        >
          {topicTitles.length > 0 && (
            <div className="mb-3 rounded-[10px] bg-black/10 px-3 py-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {isUser ? "当前提问引用" : "本轮回答参考"}
                  {knowledgeBaseName ? ` · ${knowledgeBaseName}` : ""}
                </span>
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
                {displayTopics.map((title, index) => (
                  <li key={`${title}-${index}`} className="leading-6 opacity-90">
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            className={`prose prose-sm max-w-none text-sm leading-7 ${
              isUser ? "prose-invert" : "prose-slate"
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
            {message.createdAt
              ? new Date(message.createdAt).toLocaleTimeString("zh-CN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : new Date().toLocaleTimeString("zh-CN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
          </div>
        </div>
      </div>
    </div>
  );
}

const StreamingChatMessages = forwardRef<HTMLDivElement, StreamingChatMessagesProps>(
  ({ messages, aiMessages, loading }, ref) => {
    const systemMessages = messages.filter((message) => message.type === "system");

    return (
      <div className="chat-messages custom-scrollbar mt-4 min-h-[420px] rounded-[14px] border border-black/5 bg-white/70 px-4 py-4 md:px-5">
        <div className="space-y-4">
          {systemMessages.map((message) => (
            <ChatBubble key={`system-${message.id}`} message={message} />
          ))}

          {aiMessages.map((message, index) => (
            <StreamingChatBubble key={`ai-${message.id || index}`} message={message} />
          ))}

          {loading && <LoadingIndicator />}
          <div ref={ref} />
        </div>
      </div>
    );
  }
);

StreamingChatMessages.displayName = "StreamingChatMessages";

export default StreamingChatMessages;

