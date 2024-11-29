import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader } from 'lucide-react';
import { getAIResponse } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { ChatInput } from './ui/ChatInput';
import { MessageList } from './ui/MessageList';
import { PageContainer } from './ui/PageContainer';

export default function HealthcareChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Add typing indicator message
    const typingMessage: ChatMessage = {
      type: 'bot',
      content: '...',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await getAIResponse(userMessage.content);
      // Remove typing indicator and add actual response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, {
          type: 'bot',
          content: response,
          timestamp: new Date(),
        }];
      });
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, {
          type: 'bot',
          content: 'I apologize, but I encountered an error. Please try again.',
          timestamp: new Date(),
        }];
      });
    }

    setLoading(false);
  };

  return (
    <PageContainer
      icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
      title="Healthcare Chat Assistant"
    >
      <div className="flex flex-col h-[calc(100vh-16rem)] max-h-[600px] bg-gray-50 rounded-lg border border-gray-200">
        <MessageList messages={messages} messagesEndRef={messagesEndRef} />
        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </PageContainer>
  );
}