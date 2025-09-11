/**
 * @file hooks/useContextChat.ts
 * @description Custom hook for handling chat functionality with added context.
 *
 * This hook is responsible for sending user messages along with contextual information
 * (e.g., from a PDF viewer) to the backend chat API.
 */

import { useState, useCallback } from 'react';
import { ContextInfo } from '@/lib/context-manager';

// Assuming a basic message structure
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ContextChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: Error | null;
}

/**
 * A custom hook to manage sending chat messages with context.
 *
 * @param {ContextInfo | null} contextInfo - The contextual information to send with the message.
 * @returns An object for managing the chat state and sending messages.
 */
export const useContextChat = (contextInfo: ContextInfo | null) => {
  const [state, setState] = useState<ContextChatState>({
    messages: [],
    loading: false,
    error: null,
  });

  const setMessages = (messages: ChatMessage[]) => {
    setState(prev => ({ ...prev, messages }));
  };

  /**
   * Sends a message to the chat API, including any available context.
   * This function handles the API call and streams the response.
   */
  const sendMessage = useCallback(async (message: string) => {
    if (!message) return;

    const newMessages: ChatMessage[] = [...state.messages, { role: 'user', content: message }];
    setMessages(newMessages);
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          // The backend will handle the logic of generating the prompt
          contextInfo: contextInfo,
          // Session ID might be needed here in the future
          // sessionId: 'your-session-id',
        }),
      });

      if (!response.body) {
        throw new Error('Response body is empty.');
      }

      // Handle the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        assistantResponse += chunk;

        // Update the UI with the streaming content
        setMessages([
          ...newMessages,
          { role: 'assistant', content: assistantResponse },
        ]);
      }

    } catch (e: unknown) {
      const error = e as Error;
      setState(prev => ({ ...prev, error }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.messages, contextInfo]);

  return {
    ...state,
    sendMessage,
  };
};
