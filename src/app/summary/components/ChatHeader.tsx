"use client"
import { Avatar } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const ChatHeader: React.FC = () => {
  return (
    <div className="chat-header rounded-t-xl p-4 shadow-lg">
      <div className="flex items-center space-x-3">
        <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <SmartToyIcon />
        </Avatar>
        <div>
          <h2 className="font-medium text-white">CC98 智能助手</h2>
          <p className="text-sm text-white opacity-80">基于收藏帖子的智能问答</p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader; 