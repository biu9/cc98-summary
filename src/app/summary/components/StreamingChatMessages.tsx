"use client"
import { forwardRef } from "react";
import ChatBubble from "./ChatBubble";
import LoadingIndicator from "./LoadingIndicator";
import { IChatMessage } from "../types";
import { Message } from "ai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Avatar, Button, Box } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import { useState } from "react";
import { useSummaryStore } from '@/store/summaryStore';

interface StreamingChatMessagesProps {
  messages: IChatMessage[];
  aiMessages: Message[];
  loading: boolean;
}

const StreamingChatBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  const [topicsExpanded, setTopicsExpanded] = useState(false);
  const { selectedTopics, selectedKnowledgeBase } = useSummaryStore();
  
  // 对于用户和AI消息，都显示当前选中的知识库帖子信息
  const shouldShowTopics = selectedTopics && selectedTopics.length > 0;
  const TOPICS_DISPLAY_LIMIT = 5;
  const hasMoreTopics = shouldShowTopics && selectedTopics.length > TOPICS_DISPLAY_LIMIT;
  const displayTopics = topicsExpanded 
    ? selectedTopics 
    : selectedTopics?.slice(0, TOPICS_DISPLAY_LIMIT);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 chat-bubble`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[85%]`}>
        <Avatar
          className={`${isUser ? 'ml-2' : 'mr-2'} flex-shrink-0`}
          sx={{
            width: 32,
            height: 32,
            backgroundColor: isUser ? '#667eea' : '#4a90e2'
          }}
        >
          {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
        </Avatar>
        <div className={`px-4 py-3 rounded-2xl ${isUser
          ? 'message-bubble-user text-white rounded-br-md'
          : 'message-bubble-bot text-gray-800 rounded-bl-md'
          }`}>
          {shouldShowTopics && (
            <div className="text-xs opacity-80 mb-2 p-2 bg-black bg-opacity-10 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span>📋 {isUser ? '选择的' : '参考'}帖子{selectedKnowledgeBase ? ` (来自知识库: ${selectedKnowledgeBase.name})` : ''}:</span>
                {hasMoreTopics && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setTopicsExpanded(!topicsExpanded)}
                    startIcon={topicsExpanded ? <ExpandLess /> : <ExpandMore />}
                    sx={{ 
                      fontSize: '0.65rem',
                      minWidth: 'auto',
                      padding: '1px 4px',
                      color: 'inherit',
                      opacity: 0.8,
                      '&:hover': {
                        opacity: 1
                      }
                    }}
                  >
                    {topicsExpanded ? '收起' : `展开全部 (${selectedTopics.length})`}
                  </Button>
                )}
              </div>
              <Box sx={{ 
                maxHeight: topicsExpanded ? 'none' : '100px',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-in-out'
              }}>
                <ul className="mt-1 pl-2">
                  {displayTopics?.map((topic, index) => (
                    <li key={index} className="text-xs mb-1">
                      • {topic.label.length > 40 ? `${topic.label.substring(0, 40)}...` : topic.label}
                    </li>
                  ))}
                </ul>
              </Box>
              {hasMoreTopics && !topicsExpanded && (
                <div className="text-center mt-1 opacity-70">
                  <span className="text-xs">
                    还有 {selectedTopics.length - TOPICS_DISPLAY_LIMIT} 个帖子...
                  </span>
                </div>
              )}
            </div>
          )}
          <div className={`text-sm leading-relaxed prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'prose-slate'
            }`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          <div className={`text-xs mt-2 opacity-70`}>
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

const StreamingChatMessages = forwardRef<HTMLDivElement, StreamingChatMessagesProps>(
  ({ messages, aiMessages, loading }, ref) => {
    // 主要显示AI消息历史，传统消息作为备用（系统消息等）
    const systemMessages = messages.filter(msg => msg.type === 'system');
    
    return (
      <div 
        className="bg-white p-4 overflow-y-auto chat-messages custom-scrollbar"
        style={{ 
          flex: '1 1 auto',
          minHeight: '400px',
          maxHeight: 'none'
        }}
      >
        {/* 显示系统消息 */}
        {systemMessages.map((message) => (
          <ChatBubble key={`system-${message.id}`} message={message} />
        ))}
        
        {/* 显示AI消息历史 */}
        {aiMessages.map((message, index) => (
          <StreamingChatBubble key={`ai-${message.id || index}`} message={message} />
        ))}
        
        {loading && <LoadingIndicator />}
        <div ref={ref} />
      </div>
    );
  }
);

StreamingChatMessages.displayName = 'StreamingChatMessages';

export default StreamingChatMessages; 