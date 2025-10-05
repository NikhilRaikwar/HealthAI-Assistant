import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Send, Sparkles, Copy, Check, X, RefreshCw, Mic, MicOff, Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { streamAIResponse, cancelCurrentRequest } from '../lib/gemini';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// Memoized Message Component for Performance
const MessageBubble = memo(({ 
  message, 
  onCopy,
  onEdit,
  onSaveEdit
}: { 
  message: Message; 
  onCopy: (text: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onSaveEdit?: (messageId: string, newContent: string) => void;
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = async () => {
    await onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(message.content);
    setTimeout(() => editTextareaRef.current?.focus(), 0);
  };

  const handleSave = () => {
    if (editedContent.trim() && onSaveEdit) {
      onSaveEdit(message.id, editedContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div
      className={`flex gap-3 animate-slide-up ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      {message.role === 'assistant' && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      <div
        className={`group relative max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${
          message.role === 'user'
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30'
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50'
        } rounded-2xl px-3 py-2 sm:px-5 sm:py-3 transition-all duration-300 hover:scale-[1.02]`}
      >
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={editTextareaRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-white/10 dark:bg-black/20 text-white placeholder-blue-100 border border-white/30 rounded-lg px-3 py-2 text-sm sm:text-[15px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-white/50"
              rows={3}
              style={{ minHeight: '60px' }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-xs sm:text-sm bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs sm:text-sm bg-white hover:bg-white/90 text-blue-600 rounded-lg transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-1.5 sm:w-2 h-4 sm:h-5 ml-1 bg-blue-500 animate-pulse"></span>
            )}
          </p>
        )}
        
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/20 dark:border-gray-700/50">
          <span className={`text-xs ${
            message.role === 'user' 
              ? 'text-blue-100' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>

          {message.role === 'assistant' && !message.isStreaming && (
            <button
              onClick={handleCopy}
              className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
              title="Copy"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          )}

          {message.role === 'user' && onEdit && !isEditing && (
            <button
              onClick={handleEdit}
              className="ml-auto p-1.5 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Edit message"
            >
              <Edit2 className="w-4 h-4 text-blue-100" />
            </button>
          )}
        </div>
      </div>

      {message.role === 'user' && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center shadow-lg">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">U</span>
          </div>
        </div>
      )}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

const HealthcareChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
    }, 100);
      return () => clearTimeout(scrollTimeout);
  }, [messages]);

  useEffect(() => {
    if(!messages.length || !isLoading){
      autoFocusOnTextArea()
    }
  },[isLoading ,messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Handle copy to clipboard
  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, []);

  // Handle save edited message
  const handleSaveEditedMessage = useCallback(async (messageId: string, newContent: string) => {
    // Update the message content
    setMessages(prev => {
      const messageIndex = prev.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) return prev;
      
      // Update the edited message and remove all messages after it
      const updatedMessages = prev.slice(0, messageIndex + 1);
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: newContent,
        timestamp: new Date(),
      };
      
      return updatedMessages;
    });

    // Regenerate AI response for the edited message
    setIsLoading(true);

    // Create AI message placeholder for streaming
    const aiMessageId = Date.now().toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      // Get conversation history up to the edited message
      const conversationHistory = messages.filter(msg => msg.id !== messageId);
      
      let fullResponse = '';
      
      for await (const chunk of streamAIResponse(newContent, conversationHistory)) {
        fullResponse += chunk;
        
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, content: fullResponse, isStreaming: true }
              : msg
          )
        );
      }

      // Mark streaming as complete
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (error: any) {
      console.error('AI Response Error:', error);
      
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const autoFocusOnTextArea = ()=>{
    textareaRef.current?.focus() 
    console.log("autofocus on textareaRef",textareaRef)
  }
  // Handle submit with streaming
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
  

    // Create AI message placeholder for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };


    setMessages(prev => [...prev, aiMessage]);

    try {
      // Stream the response
      let fullResponse = '';
      
      for await (const chunk of streamAIResponse(userMessage.content, messages)) {
        fullResponse += chunk;
        
        // Update message with accumulated content
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, content: fullResponse, isStreaming: true }
              : msg
          )
        );
      }

      // Mark streaming as complete
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (error: any) {
      console.error('AI Response Error:', error);
      
      // Remove placeholder and show error
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false)
    }
  };

  // Cancel current request
  const handleCancel = () => {
    cancelCurrentRequest();
    setIsLoading(false);
    
    // Mark the streaming message as cancelled
    setMessages(prev =>
      prev.map(msg =>
        msg.isStreaming
          ? { ...msg, content: msg.content || '❌ Response cancelled', isStreaming: false }
          : msg
      )
    );
  };

  // Start new session
  const handleNewSession = () => {
    if (messages.length > 0) {
      const confirmed = window.confirm('Start a new session? This will clear all messages.');
      if (confirmed) {
        setMessages([])
        setInput('')
      }
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Voice input functionality
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInput(prev => prev + transcript + ' ');
          } else {
            interimTranscript += transcript;
          }
        }
        setInterimText(interimTranscript);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Animated Header - Centered with New Session Button */}
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 animate-gradient-x"></div>
        <div className="relative px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-center">
            {/* New Session Button - Left Side */}
            {messages.length > 0 && !isLoading && (
              <button
                onClick={handleNewSession}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs sm:text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                title="Start New Session"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">New Session</span>
              </button>
            )}
            
            <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse-slow">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-[1.5px] border-white dark:border-gray-900 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  HealthAI Assistant
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="ml-1">Thinking...</span>
                    </span>
                  ) : (
                    'Always here to help'
                  )}
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Messages Container - Responsive */}
      <div className = {`flex-1 ${messages.length>0 && "overflow-y-auto"} px-2 sm:px-4 md:px-6 py-3 sm:py-6 space-y-3 sm:space-y-6 scroll-smooth`}>
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center px-4">
            <div className="text-center space-y-3 sm:space-y-4 max-w-md animate-fade-in">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-float">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                Welcome to HealthAI
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Ask me anything about health, symptoms, or wellness
              </p>
              
              {/* Quick Suggestions - Responsive */}
              <div className="flex flex-wrap gap-2 justify-center mt-4 sm:mt-6">
                {['Healthy diet tips', 'Exercise advice', 'Stress relief', 'Better sleep'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white dark:bg-gray-800 text-xs sm:text-sm text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border border-gray-200 dark:border-gray-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onCopy={handleCopy}
            onEdit={message.role === 'user' && !isLoading ? () => {} : undefined}
            onSaveEdit={message.role === 'user' && !isLoading ? handleSaveEditedMessage : undefined}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fully Responsive with Voice Input */}
      <div className="sticky bottom-20 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-2 sm:p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-1.5 sm:gap-2 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/50 p-1.5 sm:p-2 border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all duration-300">
            
            {/* Voice Input Button with Pulse Animation */}
            <button
              type="button"
              onClick={startVoiceInput}
              disabled={isLoading}
              className={`flex-shrink-0 p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
                isListening 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-110' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <div className="relative">
                  <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></span>
                </div>
              ) : (
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            <textarea
              ref={textareaRef}
              value={input + interimText}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about symptoms, medications..."
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none bg-transparent border-none outline-none px-2 py-2 sm:px-3 sm:py-2 text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 max-h-24 sm:max-h-32 disabled:opacity-50"
              style={{ minHeight: '40px' }}
            />
            
            {isLoading ? (
              <button
                type="button"
                onClick={handleCancel}
                className="flex-shrink-0 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
                title="Cancel"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex-shrink-0 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
          
          <p className="text-[10px] sm:text-xs text-center text-gray-500 dark:text-gray-400 mt-2 sm:mt-3 px-2">
            ⚕️ AI-powered information. Always consult healthcare professionals for medical advice.
          </p>
        </form>
      </div>
    </div>
  );
};

export default HealthcareChat;
