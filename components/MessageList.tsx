import React from 'react';
import { Message } from './ChatContainer';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-2 my-2 rounded ${
            message.sender === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-300 text-black self-start'
          }`}
        >
          {message.text}
        </div>
      ))}
    </div>
  );
};

export default MessageList;