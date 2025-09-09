"use client";

import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export interface Message {
  id: string | number; // Allow for DB IDs (string) and temporary IDs (number)
  text: string;
  sender: 'user' | 'bot';
}

// Define the shape of the history items from the API
interface HistoryMessage {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history');
        if (!response.ok) {
          throw new Error('Failed to fetch chat history');
        }
        const history: HistoryMessage[] = await response.json();
        
        const formattedMessages: Message[] = history.map(item => ({
          id: item._id,
          text: item.content,
          sender: item.role === 'assistant' ? 'bot' : 'user',
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching history:', error);
        // Optionally, show an error message in the chat
      }
    };

    fetchHistory();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now(), // Use a temporary ID for the optimistic update
      text,
      sender: 'user',
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    const formData = new FormData();
    formData.append('message', text);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botMessage: Message = {
        id: Date.now() + 1, // Temporary ID
        text: data.text,
        sender: 'bot',
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error fetching bot response:', error);
      const errorMessage: Message = {
        id: Date.now() + 1, // Temporary ID
        text: 'Sorry, something went wrong.',
        sender: 'bot',
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatContainer;
