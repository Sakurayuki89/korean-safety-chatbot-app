'use client';

import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useContextChat } from '@/hooks/useContextChat';
import { ContextInfo } from '@/lib/context-manager';

export interface Message {
  id: string | number;
  text: string;
  sender: 'user' | 'bot';
}

interface ChatContainerProps {
  contextInfo: ContextInfo | null;
}

const LoadingIndicator = () => (
  <div className="flex items-center space-x-2 p-4 self-start">
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
    <span className="text-gray-500 text-sm">안전이가 답변을 준비 중입니다...</span>
  </div>
);

const ChatContainer: React.FC<ChatContainerProps> = ({ contextInfo }) => {
  const { messages: hookMessages, sendMessage, loading } = useContextChat(contextInfo);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const formattedMessages: Message[] = hookMessages.map((msg, index) => ({
      id: `msg-${index}`,
      text: msg.content,
      sender: msg.role === 'assistant' ? 'bot' : 'user',
    }));
    setMessages(formattedMessages);
  }, [hookMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    await sendMessage(text);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <MessageList messages={messages} ref={messagesEndRef} />
      {loading && <LoadingIndicator />}
      <MessageInput onSendMessage={handleSendMessage} disabled={loading} />
    </div>
  );
};

export default ChatContainer;