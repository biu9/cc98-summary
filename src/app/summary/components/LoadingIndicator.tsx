"use client"
import { Avatar, CircularProgress } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-4 chat-bubble">
      <div className="flex items-start">
        <Avatar
          className="mr-2 flex-shrink-0"
          sx={{
            width: 32,
            height: 32,
            backgroundColor: '#4a90e2'
          }}
        >
          <SmartToyIcon fontSize="small" />
        </Avatar>
        <div className="message-bubble-bot px-4 py-3 rounded-2xl rounded-bl-md typing-indicator">
          <div className="flex items-center space-x-2">
            <CircularProgress size={16} color="primary" />
            <span className="text-sm text-gray-600 loading-dots">正在思考</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator; 