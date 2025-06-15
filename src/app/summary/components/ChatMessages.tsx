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
        className="flex-1 bg-white p-4 overflow-y-auto chat-messages custom-scrollbar"
        style={{ minHeight: '300px', maxHeight: 'calc(100vh - 350px)' }}
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