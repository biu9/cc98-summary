"use client"
import { Avatar } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import { IChatMessage } from "../types";

interface ChatBubbleProps {
  message: IChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 chat-bubble`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%]`}>
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
              📋 参考帖子: 
              <ul className="mt-1 pl-2">
                {message.topicTitles.map((title, index) => (
                  <li key={index} className="text-xs">• {title}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
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