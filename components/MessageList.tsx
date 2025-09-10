import React, { forwardRef, useState } from 'react';
import { Message } from './ChatContainer';

interface MessageListProps {
  messages: Message[];
}

const Toast = ({ message }: { message: string }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-20 right-1/2 translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm z-50">
      {message}
    </div>
  );
};

const MessageList = forwardRef<HTMLDivElement, MessageListProps>(({ messages }, ref) => {
  const [toastMessage, setToastMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState<Set<string | number>>(new Set());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('답변이 복사되었습니다!');
    }, (err) => {
      console.error('Could not copy text: ', err);
      showToast('복사에 실패했습니다.');
    });
  };

  const sendFeedback = async (message: Message, feedback: 'good' | 'bad') => {
    if (feedbackSent.has(message.id)) return; // Prevent double submission

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messageId: message.id,
          messageText: message.text,
          feedback 
        }),
      });
      if (res.ok) {
        setFeedbackSent(prev => new Set(prev).add(message.id));
        showToast('피드백 주셔서 감사합니다!');
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      showToast('피드백 제출에 실패했습니다.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
          <div className={`max-w-lg p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
            <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
          </div>
          {message.sender === 'bot' && (
            <div className="flex items-center space-x-3 mt-2">
              <button 
                onClick={() => copyToClipboard(message.text)}
                className="text-xs text-gray-500 hover:text-blue-500 font-semibold py-1 px-2 rounded"
              >
                📋 답변 복사
              </button>
              <div className="border-l h-4 border-gray-300"></div>
              {feedbackSent.has(message.id) ? (
                <span className="text-xs text-green-600 font-semibold py-1">피드백 주셔서 감사합니다!</span>
              ) : (
                <div className="flex items-center space-x-2">
                  <button onClick={() => sendFeedback(message, 'good')} className="text-xs hover:scale-125 transition-transform">👍</button>
                  <button onClick={() => sendFeedback(message, 'bad')} className="text-xs hover:scale-125 transition-transform">👎</button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      <div ref={ref} />
      <Toast message={toastMessage} />
    </div>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;