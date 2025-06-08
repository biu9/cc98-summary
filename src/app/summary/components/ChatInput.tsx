"use client"
import { Input, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { IReferenceProps } from "../types";

interface ChatInputProps {
  question: string;
  setQuestion: (question: string) => void;
  onSubmit: () => void;
  loading: boolean;
  selectedTopics: IReferenceProps[];
}

const ChatInput: React.FC<ChatInputProps> = ({
  question,
  setQuestion,
  onSubmit,
  loading,
  selectedTopics
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const isDisabled = loading || selectedTopics.length === 0 || !question.trim();

  return (
    <div className="flex items-end space-x-3">
      <div className="flex-1">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={selectedTopics.length > 0 ? "输入您的问题... (按Enter发送)" : "请先选择参考帖子"}
          disabled={selectedTopics.length === 0}
          multiline
          maxRows={4}
          fullWidth
          className="w-full"
        />
      </div>
      <IconButton
        onClick={onSubmit}
        disabled={isDisabled}
        sx={{
          backgroundColor: '#667eea',
          color: 'white',
          width: 48,
          height: 48,
          '&:hover': {
            backgroundColor: '#5a67d8',
            transform: 'scale(1.05)',
          },
          '&:disabled': {
            backgroundColor: '#e5e7eb',
            color: '#9ca3af',
            transform: 'none',
          },
          transition: 'all 0.2s ease'
        }}
      >
        <SendIcon />
      </IconButton>
    </div>
  );
};

export default ChatInput; 