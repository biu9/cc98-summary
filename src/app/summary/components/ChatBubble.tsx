"use client"
import { Avatar, Button, Box, Collapse } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import { useState } from "react";
import { IChatMessage } from "../types";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

interface ChatBubbleProps {
  message: IChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const [topicsExpanded, setTopicsExpanded] = useState(false);
  
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  
  // 参考帖子展示逻辑
  const TOPICS_DISPLAY_LIMIT = 5;
  const hasMoreTopics = message.topicTitles && message.topicTitles.length > TOPICS_DISPLAY_LIMIT;
  const displayTopics = topicsExpanded 
    ? message.topicTitles 
    : message.topicTitles?.slice(0, TOPICS_DISPLAY_LIMIT);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 chat-bubble`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[85%]`}>
        <Avatar
          className={`${isUser ? 'ml-2' : 'mr-2'} flex-shrink-0`}
          sx={{
            width: 32,
            height: 32,
            backgroundColor: isUser ? '#667eea' : isSystem ? '#48cae4' : '#4a90e2'
          }}
        >
          {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
        </Avatar>
        <div className={`px-4 py-3 rounded-2xl ${isUser
            ? 'message-bubble-user text-white rounded-br-md'
            : isSystem
              ? 'message-bubble-system text-white rounded-bl-md'
              : 'message-bubble-bot text-gray-800 rounded-bl-md'
          }`}>
          {message.topicTitles && message.topicTitles.length > 0 && (
            <div className="text-xs opacity-80 mb-2 p-2 bg-black bg-opacity-10 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span>📋 参考帖子:</span>
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
                    {topicsExpanded ? '收起' : `展开全部 (${message.topicTitles.length})`}
                  </Button>
                )}
              </div>
              <Box sx={{ 
                maxHeight: topicsExpanded ? 'none' : '100px',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-in-out'
              }}>
                <ul className="mt-1 pl-2">
                  {displayTopics?.map((title, index) => (
                    <li key={index} className="text-xs mb-1">
                      • {title.length > 40 ? `${title.substring(0, 40)}...` : title}
                    </li>
                  ))}
                </ul>
              </Box>
              {hasMoreTopics && !topicsExpanded && (
                <div className="text-center mt-1 opacity-70">
                  <span className="text-xs">
                    还有 {message.topicTitles.length - TOPICS_DISPLAY_LIMIT} 个帖子...
                  </span>
                </div>
              )}
            </div>
          )}
          <div className={`text-sm leading-relaxed prose prose-sm max-w-none ${
            isUser || isSystem ? 'prose-invert' : 'prose-slate'
          }`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          <div className={`text-xs mt-2 opacity-70`}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble; 