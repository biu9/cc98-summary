"use client"
import { forwardRef } from "react";
import ChatBubble from "./ChatBubble";
import LoadingIndicator from "./LoadingIndicator";
import { IChatMessage } from "../types";

interface ChatMessagesProps {
  messages: IChatMessage[];
  loading: boolean;
}

const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, loading }, ref) => {
    return (
      <div 
        className="bg-white p-4 overflow-y-auto chat-messages custom-scrollbar"
        style={{ 
          flex: '1 1 auto',
          minHeight: '400px',
          maxHeight: 'none'
        }}
      >
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {loading && <LoadingIndicator />}
        <div ref={ref} />
      </div>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';

export default ChatMessages; 