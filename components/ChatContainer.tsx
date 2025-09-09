"use client";

import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export interface Message {
  id: string | number;
  text: string;
  sender: 'user' | 'bot';
}

interface HistoryMessage {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Scroll to bottom when messages update, especially for streaming
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100); // Small delay to ensure DOM update
    
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // On initial load, try to get session ID from localStorage
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatSessionId');
    if (storedSessionId) {
      console.log('Found stored session ID:', storedSessionId);
      setSessionId(storedSessionId);
    } else {
      console.log('No stored session ID found, starting fresh');
      setMessages([]);
    }
  }, []);

  // Fetch history when session ID is available
  useEffect(() => {
    const fetchHistory = async () => {
      if (!sessionId) {
        console.log('No session ID available for history fetch');
        return;
      }

      console.log('Fetching history for session ID:', sessionId);
      try {
        const response = await fetch(`/api/history?sessionId=${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch chat history');
        }
        const history: HistoryMessage[] = await response.json();
        console.log('Fetched history:', history.length, 'messages');
        
        const formattedMessages: Message[] = history.map(item => ({
          id: item._id,
          text: item.content,
          sender: item.role === 'assistant' ? 'bot' : 'user',
        }));

        console.log('Setting formatted messages:', formattedMessages);
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching history:', error);
        setMessages([]);
      }
    };

    fetchHistory();
  }, [sessionId]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    const formData = new FormData();
    formData.append('message', text);
    if (sessionId) {
      formData.append('sessionId', sessionId);
    }

    let botMessageId: number | null = null;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok || !response.body) {
        throw new Error('Network response was not ok.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      const newSessionId = response.headers.get('x-session-id');
      if (newSessionId && !sessionId) {
        console.log('Received new session ID from server:', newSessionId);
        setSessionId(newSessionId);
        localStorage.setItem('chatSessionId', newSessionId);
        console.log('Session ID saved to localStorage');
      }

      botMessageId = Date.now() + 1;
      setMessages(prev => [...prev, { id: botMessageId as number, text: "", sender: 'bot' }]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: !done });
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: msg.text + chunk }
            : msg
        ));
        
        // Force scroll during streaming
        setTimeout(scrollToBottom, 50);
      }

    } catch (error) {
      console.error('Error fetching bot response:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: '죄송합니다. 응답을 가져오는 중 오류가 발생했습니다.',
        sender: 'bot',
      };
      setMessages(prev => {
        const messagesWithoutPlaceholder = botMessageId
          ? prev.filter(m => m.id !== botMessageId)
          : prev;
        return [...messagesWithoutPlaceholder, errorMessage];
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <div ref={messagesEndRef} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatContainer;
