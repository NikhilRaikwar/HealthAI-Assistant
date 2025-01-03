import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../../types';
import { Bot, User, Loader } from 'lucide-react';

interface MessageListProps {
  messages: ChatMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({ messages, messagesEndRef }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          <Bot className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <p className="text-lg font-medium">Hello! I'm your healthcare assistant.</p>
          <p className="mt-2">Ask me anything about health, medical conditions, or wellness!</p>
        </div>
      )}
      
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`flex items-start space-x-2 max-w-[80%] ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'user' ? 'bg-blue-100' : 'bg-gray-200'
            }`}>
              {message.type === 'user' ? (
                <User className="w-5 h-5 text-blue-600" />
              ) : (
                <Bot className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div
              className={`p-4 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {message.isTyping ? (
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-gray-500">Thinking...</span>
                </div>
              ) : (
                <>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}