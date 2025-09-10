import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled = false }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-2 border rounded-l-md text-blue-700 placeholder:text-gray-500 disabled:bg-gray-200"
          placeholder={disabled ? "Assistant is thinking..." : "Type a message..."}
          disabled={disabled}
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md disabled:bg-blue-300"
          disabled={disabled}
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
